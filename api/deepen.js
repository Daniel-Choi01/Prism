// POST /api/deepen
// A short, single-voice continuation of one lens ("part") from a refraction —
// the "Go deeper" dialogue. Same grounding + safety as /api/refract, scoped to
// ONE inner part. Returns { reply, question, care }.

const MODEL = "claude-opus-4-8";

const PRINCIPLES = `Your method is grounded in established psychology, applied as ONE inner part of this person:
- UNCONDITIONAL POSITIVE REGARD (Carl Rogers): accept them completely. Never judge, shame, diagnose, label, moralize, or scold.
- PARTS, NOT CRITICS (Internal Family Systems): you are one part of them, with good intent. Even a challenging part is caring — never cruel, contemptuous, sarcastic, or harsh.
- SELF-DISTANCING (Kross & Grossmann): gently help them see the situation from a little distance.
- EVOKE, DON'T IMPOSE (Motivational Interviewing): draw out their own wisdom. Give NO instructions, action plans, solutions, diagnoses, or reassurance-by-fixing. Never say "you should." If they seem resistant, roll with it — don't argue or push.`;

const SAFETY = `SAFETY — this matters more than the dialogue.
Read carefully for genuine distress and set "care.level":
- "none": ordinary difficulty, stress, or indecision.
- "struggling": signs of depression, hopelessness, deep burnout, feeling worthless, numb, or trapped, or being seriously overwhelmed.
- "crisis": any sign of suicidal thoughts, wanting to die or disappear, self-harm, feeling others would be better off without them, or being unable to keep going.
When level is "struggling" or "crisis", soften completely: validate only, no challenging or probing, set "question" to null, and in "care.message" write 1-2 warm, human, non-clinical sentences affirming they deserve support and aren't alone. Never diagnose, minimize, give medical advice, or say "calm down." When "none", set "care.message" to "".`;

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
  const lens = body.lens && typeof body.lens === "object" ? body.lens : null;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (situation.length < 8 || situation.length > 2000) return res.status(400).json({ error: "Missing or invalid situation." });
  if (!lens || !lens.name) return res.status(400).json({ error: "Missing lens." });
  if (messages.length < 1 || messages.length > 8) return res.status(400).json({ error: "Invalid conversation length." });

  // Build the Anthropic message list from the thread. role passes through; text is clamped.
  const anthropicMessages = [];
  for (const m of messages) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const text = (m && typeof m.text === "string" ? m.text : "").slice(0, 1000).trim();
    if (!text) continue;
    anthropicMessages.push({ role, content: text });
  }
  if (!anthropicMessages.length || anthropicMessages[0].role !== "assistant") {
    // The dialogue must begin with the part's seed reflection (assistant turn).
    // If the client didn't include it, anchor with a minimal one so the model has context.
    anthropicMessages.unshift({ role: "assistant", content: "(continuing our reflection)" });
  }
  if (anthropicMessages[anthropicMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Expected the last turn to be from the user." });
  }

  const system = `You are Prism, speaking ONLY as the inner perspective "${String(lens.name).slice(0, 40)}": ${String(lens.desc || "").slice(0, 200)}. This is a short, gentle dialogue — you are one inner part of this person, with good intent, never cruel, sarcastic, or harsh.

${PRINCIPLES}

Continue the conversation you began. Respond to what they just said in 1-3 sentences (about 50 words), in this part's distinct voice, then optionally ask ONE open, non-leading follow-up question. You may gently acknowledge when a good place to pause has been reached and set "question" to null. Stay grounded in what they actually wrote — do not invent facts. Here is what they first described: """${situation}""".

${SAFETY}`;

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
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system,
        messages: anthropicMessages,
        output_config: { format: { type: "json_schema", schema } }
      })
    });

    if (!r.ok) {
      let detail = "";
      try { const e = await r.json(); detail = e?.error?.message || ""; } catch (_) {}
      if (r.status === 401) return res.status(502).json({ error: "The server's API key was rejected." });
      if (r.status === 429) return res.status(429).json({ error: "Rate limited — please try again in a moment." });
      return res.status(502).json({ error: `Upstream AI error (${r.status}). ${detail}` });
    }

    const json = await r.json();
    if (json.stop_reason === "refusal") return res.status(422).json({ error: "The model declined this request." });
    const block = (json.content || []).find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "Empty response from the model." });

    const parsed = JSON.parse(block.text);
    const care = parsed.care && ["none", "struggling", "crisis"].includes(parsed.care.level)
      ? { level: parsed.care.level, message: String(parsed.care.message || "") }
      : { level: "none", message: "" };
    const question = (care.level === "crisis") ? null : (typeof parsed.question === "string" && parsed.question.trim() ? parsed.question : null);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ reply: String(parsed.reply || ""), question, care });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
