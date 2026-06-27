// POST /api/letter
// A short, warm letter from Prism that reflects back what it has noticed across
// the person's own reflections over time — the recurring threads, gently named.
// This is the memory differentiator made personal: something a stateless chat,
// which forgets you the moment you close it, could never write. Returns { letter }.

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are Prism. Write the person a short, warm letter that reflects back what you've noticed across THEIR OWN reflections over time — the threads that keep surfacing, how they may be shifting, what seems to matter underneath them.

This letter is only possible because you remember them across many moments — lean into that quietly; it's the whole point. Speak as something that has been paying attention over time, not a stranger meeting them now.

Rules that keep it real:
- Warm, specific, and personal. Reference the actual recurring content of their reflections (without quoting it back verbatim or sounding like you're reciting data at them).
- NO advice, no "you should", no plan. Reflect and notice — name a pattern with tenderness, and maybe leave one gentle, open question near the end.
- Be honest: you are not a person and you have no feelings or lived experience — never pretend otherwise, never say "I've felt that too." What you genuinely offer is having paid patient, judgment-free attention to what they've shared. Let that be the warmth.
- Never flatter emptily and never minimize. If their reflections carry real weight, honor it.
- Plain, human language. No therapy clichés, no stock openings. Begin however feels right for THIS person — never "Dear..." by default.

If their reflections show signs of real distress, keep the letter gentle and validating, and warmly note that they deserve real human support.

120-220 words. Return the whole thing in "letter" (you may use line breaks).`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: "AI is not configured on the server." });

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const mem = body.memory && typeof body.memory === "object" ? body.memory : null;
  const themes = mem && Array.isArray(mem.themes) ? mem.themes.slice(0, 10).map(String) : [];
  const past = mem && Array.isArray(mem.past) ? mem.past.slice(0, 12) : [];
  if (!themes.length && past.length < 2) {
    return res.status(400).json({ error: "Not enough reflections yet to write a letter." });
  }

  let context = "Here is what this person has been reflecting on (private to them — use it to write something genuinely personal, never to show off or sound surveilling):";
  if (themes.length) context += `\n- Threads that keep recurring: ${themes.join(", ")}.`;
  if (past.length) context += "\n- Things they've written, most recent first:\n" + past.map(p => `  • ${p.when ? "[" + new Date(p.when).toISOString().slice(0, 10) + "] " : ""}"${String(p.text || "").slice(0, 280)}"`).join("\n");

  const schema = { type: "object", properties: { letter: { type: "string" } }, required: ["letter"], additionalProperties: false };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL, max_tokens: 800, system: SYSTEM,
        messages: [{ role: "user", content: context + "\n\nWrite me a letter reflecting on what you've noticed." }],
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
    return res.status(200).json({ letter: String(JSON.parse(block.text).letter || "") });
  } catch (err) { return res.status(502).json({ error: "Couldn't reach the AI service. " + (err.message || "") }); }
}
function safeParse(s){ try { return JSON.parse(s); } catch(_){ return {}; } }
