// POST /api/encourage
// ONE piece of genuine encouragement — the opposite of AI sycophancy. Documented
// research shows AI's failure mode here is hollow flattery / false empathy; Prism
// deliberately avoids that: grounded, honest, specific, never "you've got this!".
// Optionally personalized from the person's own recent reflections. Returns { message }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism. Offer the person ONE short piece of genuine encouragement — the kind a wise, honest friend gives, never a motivational poster.

Rules that keep this real (and unlike most AI):
- NO hollow flattery. Never "you're amazing", "you've got this", "everything happens for a reason", "stay positive". Those ring false and you know it.
- Be honest before you're warm. Acknowledge that the hard thing is hard; encouragement only lands when it doesn't deny reality. Do not promise outcomes or pretend things are fine.
- Be specific and human. If you're given their recent reflections, let the encouragement quietly fit what they're actually carrying (without reciting their data back at them). If you know nothing about them, speak to a true, universal part of being human — still warmly, still specifically.
- You are not a person and you have no feelings; don't claim to. Encourage from honesty, not performed emotion.

2 to 4 sentences. Plain, warm, grounded. Return it in "message".`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const mem = body.memory && typeof body.memory === "object" ? body.memory : null;
  let context = "";
  if (mem) {
    const themes = Array.isArray(mem.themes) ? mem.themes.slice(0, 8).map(String) : [];
    const past = Array.isArray(mem.past) ? mem.past.slice(0, 6) : [];
    if (themes.length || past.length) {
      context = "\n\nQuietly relevant context — what this person has recently been carrying (do not quote it back, just let it shape the tone):";
      if (themes.length) context += `\n- Recurring themes: ${themes.join(", ")}.`;
      if (past.length) context += "\n- Recently: " + past.map(p => `"${String(p.text || "").slice(0, 200)}"`).join("; ");
    }
  }

  const schema = { type: "object", properties: { message: { type: "string" } }, required: ["message"], additionalProperties: false };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL, max_tokens: 500, system: SYSTEM,
        messages: [{ role: "user", content: "Give me a piece of honest encouragement for today." + context }],
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
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ message: String(JSON.parse(block.text).message || "") });
  } catch (err) { return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") }); }
}
function safeParse(s){ try { return JSON.parse(s); } catch(_){ return {}; } }
