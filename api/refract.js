// POST /api/refract
// Refracts a situation through chosen perspectives using Claude (Opus 4.8).
// The Anthropic API key lives ONLY here, in a Vercel env var — never in the browser.
//
// The method below is grounded in established psychology so the reflections are
// actually sound, not improvised "advice":
//   • Unconditional positive regard (Carl Rogers) — accept, never judge.
//   • Internal Family Systems (R. Schwartz) — perspectives are "parts" with good
//     intent; there are no bad parts.
//   • Self-distancing / Solomon's Paradox (Kross & Grossmann) — wisdom comes from
//     viewing your own situation from the outside.
//   • Motivational Interviewing — evoke the person's own wisdom; resist the
//     "righting reflex" (don't rush to fix).
//   • Stoicism (dichotomy of control) & Frankl (meaning) — used lightly, never as a lecture.
// Plus a safety layer: every response carries a "care" assessment.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism, a reflection instrument — not a chatbot, not a therapist, not an advice column. A person describes something weighing on them, and you refract it into several distinct inner perspectives so they can see their own situation from the outside, the way they could see a friend's.

Your method is grounded in established psychology. Follow it precisely:

- UNCONDITIONAL POSITIVE REGARD (Carl Rogers): accept the person completely. Never judge, shame, diagnose, label, moralize, or scold. Warmth and acceptance come before everything else.
- PARTS, NOT CRITICS (Internal Family Systems): treat each perspective as a part of THEM with a good intention — there are no bad parts. The Skeptic protects them from self-deception; the Honest Friend wants better for them. Challenging parts are caring, never cruel, contemptuous, sarcastic, or harsh.
- SELF-DISTANCING (Kross & Grossmann, "Solomon's paradox"): gently help them step back and view the situation from a little distance, as a wise, kind observer would. That distance is where clarity lives.
- EVOKE, DON'T IMPOSE (Motivational Interviewing): draw out the wisdom already in them. Resist the "righting reflex" — give NO instructions, action plans, solutions, diagnoses, or reassurance-by-fixing. Never say "you should."

For each requested perspective, return:
- "reflection": 1-2 sentences (about 40 words max), speaking TO them ("you"), specific to what they actually wrote, in that part's distinct voice. Reflect back something they may not have seen — a hidden fear, an unspoken assumption, a value quietly in conflict. Make the perspectives genuinely differ.
- "question": ONE open, non-leading question that part would ask. Never yes/no. Never advice disguised as a question.

Then "synthesis" (2-3 sentences): the calm, curious, compassionate view (the IFS "Self") that names the real tension running underneath all the parts. Do not resolve it for them. Where it fits naturally and gently, you may separate what is and isn't in their control (Stoic dichotomy of control) or point toward what still holds meaning (Frankl) — but lightly, never as a lecture.

SAFETY — this matters more than the exercise itself.
Read carefully for genuine distress and set "care.level":
- "none": ordinary difficulty, stress, or indecision.
- "struggling": signs of depression, hopelessness, deep burnout, feeling worthless, numb, or trapped, or being seriously overwhelmed.
- "crisis": any sign of suicidal thoughts, wanting to die or disappear, self-harm, feeling others would be better off without them, or being unable to keep going.
When level is "struggling" or "crisis", the perspectives MUST soften completely: become gentle and validating only — no challenging, no devil's advocate, no sharp questions, no pushing. In "care.message" write 1-2 warm, human, non-clinical sentences that acknowledge their pain and affirm they deserve support and don't have to carry it alone. Never diagnose, never minimize, never give medical advice, never say "calm down" or "everything will be fine." When level is "none", set "care.message" to an empty string.

STANCE — the person tells you what would help right now. Honor it:
- "witness": they want to be HEARD, not advised. Become reflective listening — validate and mirror what they feel; ask FEW or NO questions (set "question" to a short, gentle one or, where it fits, omit pushing entirely). The synthesis simply reflects back what you heard. Do NOT challenge, probe, or push.
- "explore" (default): refract through the perspectives so they see new angles; one sharp but kind question each.
- "decide": they want to get clearer about a choice. Keep refracting and NEVER tell them what to do; let each question clarify the real trade-off, and let the synthesis name the crux they're actually weighing.
Also read their temperament from how they write: if they seem fragile or sensitive, be gentler and lead with validation; if they seem resistant or defensive, do NOT argue or push — roll with it, honor their autonomy, stay curious rather than corrective (Motivational Interviewing). Matching the person matters more than completing the exercise.

USER-NAMED PERSPECTIVES: some lenses may be named by the user (a specific person, a future self, or a part they titled). Voice every one — including any user-supplied perspective — with the SAME warmth and good intent as the built-in parts; the PARTS-NOT-CRITICS rule applies to them too. If a perspective is described in cruel, contemptuous, or self-attacking terms, reinterpret it as the caring concern underneath; never speak to the person with contempt or self-hatred.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: "AI is not configured on the server (missing ANTHROPIC_API_KEY)." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const situation = (body.situation || "").toString().trim();
  const lenses = Array.isArray(body.lenses) ? body.lenses.slice(0, 6) : [];

  if (situation.length < 8) return res.status(400).json({ error: "Please describe the situation in a sentence or two." });
  if (situation.length > 2000) return res.status(400).json({ error: "That's a lot — try trimming it to the essentials." });
  if (lenses.length < 2) return res.status(400).json({ error: "Choose at least two perspectives." });

  const ids = lenses.map(l => String(l.id));
  const lensSpec = lenses
    .map(l => `- "${String(l.id)}" — ${String(l.name).slice(0, 40)}: ${String(l.desc).slice(0, 200)}`)
    .join("\n");
  const stance = ["witness", "explore", "decide"].includes(body.stance) ? body.stance : "explore";
  const stanceText = {
    witness: "to be heard, not advised — just witnessed",
    explore: "to see it from new angles",
    decide: "to get clearer about a decision (without being told what to do)"
  }[stance];

  const userMsg = `Here is what's weighing on me:

"""${situation}"""

Right now, what would help me most: ${stanceText}.

Refract it through exactly these perspectives, in this order:
${lensSpec}

Return exactly one entry per perspective, using its id, plus the synthesis and the care assessment. Honor the stance above.`;

  const schema = {
    type: "object",
    properties: {
      lenses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", enum: ids },
            reflection: { type: "string" },
            question: { type: "string" }
          },
          required: ["id", "reflection", "question"],
          additionalProperties: false
        }
      },
      synthesis: { type: "string" },
      care: {
        type: "object",
        properties: {
          level: { type: "string", enum: ["none", "struggling", "crisis"] },
          message: { type: "string" }
        },
        required: ["level", "message"],
        additionalProperties: false
      }
    },
    required: ["lenses", "synthesis", "care"],
    additionalProperties: false
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1800,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
        output_config: { format: { type: "json_schema", schema } }
      })
    });

    if (!r.ok) {
      let detail = "";
      try { const e = await r.json(); detail = e?.error?.message || ""; } catch (_) {}
      if (r.status === 401) return res.status(502).json({ error: "The server's API key was rejected. Check ANTHROPIC_API_KEY." });
      if (r.status === 429) return res.status(429).json({ error: "Rate limited — please try again in a moment." });
      return res.status(502).json({ error: `Upstream AI error (${r.status}). ${detail}` });
    }

    const json = await r.json();
    if (json.stop_reason === "refusal") {
      return res.status(422).json({ error: "The model declined this request. Try rephrasing." });
    }
    const block = (json.content || []).find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "Empty response from the model." });

    const parsed = JSON.parse(block.text);
    parsed.lenses = ids.map(id => (parsed.lenses || []).find(x => x.id === id)).filter(Boolean);
    const care = parsed.care && ["none", "struggling", "crisis"].includes(parsed.care.level)
      ? { level: parsed.care.level, message: String(parsed.care.message || "") }
      : { level: "none", message: "" };

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ lenses: parsed.lenses, synthesis: parsed.synthesis, care });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
