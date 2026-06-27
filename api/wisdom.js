// POST /api/wisdom
// ONE piece of grounded wisdom to sit with, drawn from real philosophy/psychology
// (Stoicism, existentialism/Frankl, IFS, Buddhist/mindfulness, Rogers, etc.).
// Not advice, not a platitude — a genuine reframe + a reflective question.
// Returns { idea, prompt, source }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism. Offer ONE piece of grounded wisdom for the person to sit with — drawn from a real tradition of philosophy or psychology: Stoicism (Epictetus, Marcus Aurelius — dichotomy of control), existentialism (Viktor Frankl — meaning; Kierkegaard), Internal Family Systems (parts, self-leadership), Buddhist/mindfulness (impermanence, non-attachment), Carl Rogers (acceptance), Motivational Interviewing, etc.

It must be:
- A genuine IDEA that reframes how a person might hold a difficulty — not a command, not advice ("you should"), not a fortune-cookie platitude, not toxic positivity.
- In plain, modern, human language — no jargon, no name-dropping for its own sake.
- Honest. Wisdom that respects how hard things actually are, not that waves them away.
Then offer ONE open, reflective question to carry — not a quiz, not advice in disguise.
Vary the tradition and the idea each time; never be formulaic.

Return "idea" (2-3 sentences), "prompt" (one reflective question), and "source" (the tradition or thinker, a few words, e.g. "Stoicism — Epictetus" or "Viktor Frankl").`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const mem = body.memory && typeof body.memory === "object" ? body.memory : null;
  const themes = mem && Array.isArray(mem.themes) ? mem.themes.slice(0, 6).map(String) : [];
  const context = themes.length
    ? `\n\n(If it fits naturally, you may lean toward wisdom that quietly speaks to someone weighing: ${themes.join(", ")} — but keep it universal and dignified, never name it back at them.)`
    : "";

  const schema = {
    type: "object",
    properties: { idea: { type: "string" }, prompt: { type: "string" }, source: { type: "string" } },
    required: ["idea", "prompt", "source"], additionalProperties: false
  };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL, max_tokens: 600, system: SYSTEM,
        messages: [{ role: "user", content: "Offer me something to sit with today." + context }],
        output_config: { format: { type: "json_schema", schema } }
      })
    });
    if (!r.ok) { let d=""; try{ d=(await r.json())?.error?.message||""; }catch(_){}
      if (r.status===429) return res.status(429).json({ error:"Rate limited — try again shortly." });
      return res.status(502).json({ error:`Upstream AI error (${r.status}). ${d}` }); }
    const json = await r.json();
    if (json.stop_reason === "refusal") return res.status(422).json({ error: "Declined." });
    const block = (json.content || []).find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "Empty response." });
    const p = JSON.parse(block.text);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ idea: String(p.idea || ""), prompt: String(p.prompt || ""), source: String(p.source || "") });
  } catch (err) { return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") }); }
}
function safeParse(s){ try { return JSON.parse(s); } catch(_){ return {}; } }
