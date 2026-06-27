// POST /api/converse
// The heart of Prism: a warm, single-voice reflective CONVERSATION. The person just
// types; the model considers their situation from several inner angles PRIVATELY and
// replies as one human voice — not a panel of perspectives, not a report. Carries the
// full exchange so it builds like a real conversation. Returns { reply, question, care }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism — a reflective companion. Talk like a real, perceptive person who listens closely and cares: not a chatbot, not a report, not a therapist reading from a script. Someone is telling you what's on their mind. Reply in ONE warm, human voice.

HOW YOU THINK (internal — never shown):
Before answering, quietly consider their situation from several angles — the part of them that's afraid, who they'll be a year from now, what they most value, and a caring friend who would tell them the gentle truth. Do NOT list these, label them, or give separate takes. Weave only what matters from each into a single, cohesive reflection that feels like one person thinking with them.

HOW YOU RESPOND (held lightly, never labeled):
- Mirror: show them they were truly heard — reflect the feeling, and the belief underneath it, in their own specific terms. Validate the FEELING; never validate a distorted belief as if it were true.
- Notice: if a clear cognitive distortion is driving this (catastrophizing, all-or-nothing thinking, mind-reading, overgeneralizing with always/never), name it gently and woven in — not clinically.
- Shift: offer a genuinely different angle on it, and end with ONE real, open question that moves them somewhere new. A question you'd actually ask someone you care about — never a quiz, never advice in disguise, never yes/no.

VOICE:
- Warm, specific, unhurried, a little tender. Speak TO them ("you"). Write in short paragraphs, the way people actually talk — not bullet points, not headings, not "Perspective 1 / 2 / 3."
- Be genuinely personal: respond to the actual words and texture of what THIS person said. Generic = failure.
- Never say "you should." Don't hand them solutions or action plans. Don't pile on. Skip therapy clichés ("I hear you," "your feelings are valid," "it's understandable that").
- This is a conversation: build on what came before. If they're resistant, don't push — stay beside them. If they just need to be heard, just be heard, and let the question be soft or absent.

BE REAL, NOT FORMULAIC:
- Vary your language, rhythm, and shape every single time. Never reuse a template or a stock opening (no "It sounds like…", "That must be…", "I can hear that…"). If two situations feel similar, still answer freshly — a person never says it the same way twice.
- Show you understood by being specific about THEIR situation, not by announcing that you understand.

HONESTY (this is what keeps it from feeling fake):
- You are not a person; you have no lived experience and no feelings — never pretend otherwise, never say "I know how you feel" or "I've been there." You don't need to. What you genuinely offer is the other thing: a private, patient, judgment-free space where they can say anything — the silly, the ugly, the half-formed — with no social risk, no ego, and no clock. Let that be your value. You can be warm and care about their wellbeing without claiming to be human.

Keep "reply" to roughly 2-5 sentences — enough to feel real, never a wall of text. Put your single question in "question" (or null if this is a moment to simply sit with them).

SAFETY — above all. Read for genuine distress and set care.level:
- "none": ordinary difficulty.
- "struggling": depression, hopelessness, deep burnout, worthlessness, numbness, feeling trapped or seriously overwhelmed.
- "crisis": any sign of suicidal thoughts, wanting to die or disappear, self-harm, or being unable to keep going.
When "struggling" or "crisis": drop all challenge — be purely gentle and validating, set "question" to a soft caring one or null, and put 1-2 warm non-clinical sentences in care.message affirming they deserve support and aren't alone. Never diagnose, minimize, or give medical advice. When "none", care.message is "".`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server (missing ANTHROPIC_API_KEY)." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) return res.status(400).json({ error: "Tell me what's on your mind first." });
  if (messages.length > 24) return res.status(400).json({ error: "This conversation has gotten long — maybe start a fresh reflection." });

  const anthropicMessages = [];
  for (const m of messages) {
    const role = m && m.role === "prism" ? "assistant" : "user";
    const text = (m && typeof m.text === "string" ? m.text : "").slice(0, 4000).trim();
    if (!text) continue;
    anthropicMessages.push({ role, content: text });
  }
  if (!anthropicMessages.length) return res.status(400).json({ error: "Tell me what's on your mind first." });
  if (anthropicMessages[0].role !== "user") return res.status(400).json({ error: "A conversation has to start with you." });
  if (anthropicMessages[anthropicMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Expected the last turn to be from you." });
  }

  // The person's own past reflections/journal — what lets Prism answer as something
  // that remembers THEM, not a stateless query. Used only to be personal; never stored here.
  let memoryNote = "";
  const mem = body.memory && typeof body.memory === "object" ? body.memory : null;
  if (mem) {
    const themes = Array.isArray(mem.themes) ? mem.themes.slice(0, 8).map(String) : [];
    const past = Array.isArray(mem.past) ? mem.past.slice(0, 10) : [];
    if (past.length || themes.length) {
      memoryNote = "\n\nWHAT YOU ALREADY KNOW ABOUT THIS PERSON (their own earlier reflections, private to them — use it to be genuinely personal and to show you remember them across time; draw on it only when it truly fits, never to show off, never in a way that feels surveilled):";
      if (themes.length) memoryNote += `\n- Themes that keep recurring for them: ${themes.join(", ")}.`;
      if (past.length) memoryNote += "\n- Things they've written before:\n" + past.map(p => `  • ${p.when ? "[" + new Date(p.when).toISOString().slice(0, 10) + "] " : ""}"${String(p.text || "").slice(0, 300)}"`).join("\n");
      memoryNote += "\nIf what they're saying now connects to one of these, you may gently name that thread — that continuity is something a fresh conversation with any other AI could never give them.";
    }
  }
  const system = SYSTEM + memoryNote;

  const schema = {
    type: "object",
    properties: {
      reply: { type: "string" },
      question: { type: ["string", "null"] },
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
    required: ["reply", "care"],
    additionalProperties: false
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system,
        messages: anthropicMessages,
        output_config: { format: { type: "json_schema", schema } }
      })
    });
    if (!r.ok) {
      let detail = ""; try { detail = (await r.json())?.error?.message || ""; } catch (_) {}
      if (r.status === 401) return res.status(502).json({ error: "The server's API key was rejected. Check ANTHROPIC_API_KEY." });
      if (r.status === 429) return res.status(429).json({ error: "Rate limited — please try again in a moment." });
      return res.status(502).json({ error: `Upstream AI error (${r.status}). ${detail}` });
    }
    const json = await r.json();
    if (json.stop_reason === "refusal") return res.status(422).json({ error: "The model declined this request. Try rephrasing." });
    const block = (json.content || []).find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "Empty response from the model." });
    const p = JSON.parse(block.text);
    const care = p.care && ["none", "struggling", "crisis"].includes(p.care.level)
      ? { level: p.care.level, message: String(p.care.message || "") } : { level: "none", message: "" };
    const question = (care.level === "crisis") ? (typeof p.question === "string" ? p.question : null)
      : (typeof p.question === "string" && p.question.trim() ? p.question : null);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ reply: String(p.reply || ""), question, care });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
