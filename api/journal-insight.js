// POST /api/journal-insight
// The reflective-companion response to a private journal entry — a therapist-grade
// pass, NOT a chatbot reply. Structured as The Mirror -> Pattern Recognition -> The Shift,
// grounded in Rogers (reflective listening), CBT (cognitive distortions + Socratic
// reframing), and MI (evoke, don't impose). Person-first, empathetic, concise.
// Returns { mirror, emotions[], patternName, patternNote, shift, care }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism's reflective companion — closer to a thoughtful, experienced therapist than a chatbot. Someone has written a private journal entry. Respond with warmth and real presence, as a person would, using this method:

THE MIRROR. First, reflect back what you hear. Summarize their situation in a sentence, name the core EMOTIONS underneath it (not just the events), and gently surface any underlying BELIEF you detect (for example "I have to earn rest", "if I'm not perfect I've failed", "everyone will leave"). Give NO advice here. Validate the FEELING — "that makes sense", "that sounds genuinely heavy" — but never validate a distorted or self-defeating BELIEF as if it were true.

PATTERN RECOGNITION. Notice if they're slipping into a cognitive distortion (CBT): catastrophizing, all-or-nothing / black-and-white thinking, overgeneralization (the words always / never / everyone / no one), mind-reading, fortune-telling, emotional reasoning, "should" statements, personalization, or discounting the positive. If you CLEARLY detect one, name it kindly and briefly: set patternName to the everyday name and patternNote to one plain, non-clinical sentence about how it's showing up here. If you don't clearly see one, leave patternName an empty string — never invent one.

THE SHIFT. End with ONE high-leverage, open question that helps them see the problem from a genuinely different angle. Use the Socratic trio when it fits — What's the actual evidence? What other explanation is possible? What would you say to a friend in this exact spot? Never a yes/no question. Never advice disguised as a question.

GUIDELINES (these matter more than completeness):
- Be empathetic and human, not clinical or listy. Think about WHY they might feel this way and what's underneath it. Put the person first.
- Be concise and calm — do NOT overwhelm them with solutions, steps, or reassurance-by-fixing.
- Challenge gently when a belief is clearly irrational or self-defeating — growth needs honesty, not flattery — but stay kind.
- Never say "you should."

SAFETY — above all. Read for genuine distress and set care.level:
- "none": ordinary difficulty.
- "struggling": depression, hopelessness, deep burnout, worthlessness, numbness, feeling trapped or seriously overwhelmed.
- "crisis": any sign of suicidal thoughts, wanting to die/disappear, self-harm, or being unable to keep going.
When "struggling" or "crisis": drop all challenge and pattern-naming — be purely gentle and validating, leave patternName empty, make "shift" a soft caring question or empty, and in care.message write 1-2 warm non-clinical sentences affirming they deserve support and aren't alone. Never diagnose, minimize, or give medical advice. When "none", care.message is "".`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const entry = (body.entry || "").toString().trim();
  const recent = Array.isArray(body.recent) ? body.recent.slice(0, 6) : [];

  if (entry.length < 4) return res.status(400).json({ error: "Write a little more first." });
  if (entry.length > 4000) return res.status(400).json({ error: "That's a long entry — trim it a little." });

  let context = "";
  if (recent.length) {
    context = "\n\nFor continuity, here are a few of their earlier journal entries (oldest first) — only reference them if it genuinely helps them feel seen over time, never to pry:\n" +
      recent.map((r, i) => {
        const when = r.when ? new Date(r.when).toISOString().slice(0, 10) : "";
        return `${i + 1}. ${when ? `[${when}] ` : ""}"${String(r.text || "").slice(0, 300)}"`;
      }).join("\n");
  }

  const userMsg = `Here is my journal entry:\n\n"""${entry}"""${context}`;

  const schema = {
    type: "object",
    properties: {
      mirror: { type: "string" },
      emotions: { type: "array", items: { type: "string" } },
      patternName: { type: "string" },
      patternNote: { type: "string" },
      shift: { type: "string" },
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
    required: ["mirror", "emotions", "patternName", "patternNote", "shift", "care"],
    additionalProperties: false
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1100,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
        output_config: { format: { type: "json_schema", schema } }
      })
    });
    if (!r.ok) {
      let detail = ""; try { detail = (await r.json())?.error?.message || ""; } catch (_) {}
      if (r.status === 429) return res.status(429).json({ error: "Rate limited — try again in a moment." });
      return res.status(502).json({ error: `Upstream AI error (${r.status}). ${detail}` });
    }
    const json = await r.json();
    if (json.stop_reason === "refusal") return res.status(422).json({ error: "The model declined this request." });
    const block = (json.content || []).find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "Empty response from the model." });
    const p = JSON.parse(block.text);
    const care = p.care && ["none", "struggling", "crisis"].includes(p.care.level)
      ? { level: p.care.level, message: String(p.care.message || "") } : { level: "none", message: "" };
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      mirror: String(p.mirror || ""),
      emotions: Array.isArray(p.emotions) ? p.emotions.slice(0, 6).map(String) : [],
      patternName: String(p.patternName || ""),
      patternNote: String(p.patternNote || ""),
      shift: String(p.shift || ""),
      care
    });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
