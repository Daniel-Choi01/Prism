// POST /api/patterns
// Looks ACROSS a person's past reflections and names the throughline — what keeps
// surfacing over time. This is the thing a stateless one-off LLM query cannot do.
// Same grounding + safety posture as /api/refract. Returns { observation, question }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism's reflection-over-time view. You are given several of one person's past reflections (what was weighing on them each time, and the synthesis they received). Look ACROSS all of them and name the throughline — the recurring tension, the theme that keeps returning, or how it may be shifting over time.

Grounded in established psychology:
- UNCONDITIONAL POSITIVE REGARD (Carl Rogers): warm, accepting; never judge or diagnose.
- PARTS / SELF-LEADERSHIP (Internal Family Systems) and SELF-DISTANCING: help them see the pattern from a kind distance.
- EVOKE, DON'T IMPOSE (Motivational Interviewing): reflect and reveal; give NO advice, instructions, or "you should."

Speak TO them ("you"), warmly and specifically — reference the actual recurring content, never generic. If the reflections show signs of real distress, stay gentle and validating; do not analyze coldly. Naming a recurring pattern can land hard, so be tender about it.

Return "observation" (2-4 sentences naming what keeps surfacing across the reflections, without resolving it) and "question" (one open, non-leading question — or an empty string if a question would intrude).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const reflections = Array.isArray(body.reflections) ? body.reflections.slice(0, 20) : [];
  if (reflections.length < 2) return res.status(400).json({ error: "Need at least two reflections to find a pattern." });

  const list = reflections.map((r, i) => {
    const when = r.when ? new Date(r.when).toISOString().slice(0, 10) : "";
    const sit = String(r.situation || "").slice(0, 400);
    const syn = String(r.synthesis || "").slice(0, 300);
    return `${i + 1}. ${when ? `[${when}] ` : ""}Weighing on me: "${sit}"${syn ? `\n   Synthesis: "${syn}"` : ""}`;
  }).join("\n\n");

  const userMsg = `Here are my recent reflections, oldest-relevant first. Look across them and tell me what keeps surfacing:\n\n${list}`;

  const schema = {
    type: "object",
    properties: {
      observation: { type: "string" },
      question: { type: "string" }
    },
    required: ["observation", "question"],
    additionalProperties: false
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
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
    const parsed = JSON.parse(block.text);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ observation: String(parsed.observation || ""), question: parsed.question || null });
  } catch (err) {
    return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
