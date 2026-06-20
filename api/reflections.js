// /api/reflections
//   POST  -> save a reflection to Supabase, returns { id }
//   GET ?id=<uuid> -> fetch a saved reflection
// Talks to Supabase via its REST (PostgREST) API using the SERVICE ROLE key,
// which stays server-side only. Reflections are private: the only way to read
// one is to know its (random UUID) id, i.e. to hold the share link.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Persistence not configured — frontend falls back to on-device saving.
    return res.status(501).json({ error: "Reflection storage is not configured on the server." });
  }
  const base = url.replace(/\/+$/, "") + "/rest/v1/reflections";
  const sbHeaders = {
    "apikey": key,
    "authorization": `Bearer ${key}`,
    "content-type": "application/json"
  };

  // ---------------- GET: fetch by id ----------------
  if (req.method === "GET") {
    const id = (req.query?.id || "").toString();
    if (!UUID_RE.test(id)) return res.status(400).json({ error: "Invalid reflection id." });
    try {
      const r = await fetch(`${base}?id=eq.${encodeURIComponent(id)}&select=*`, { headers: sbHeaders });
      if (!r.ok) return res.status(502).json({ error: "Storage read failed." });
      const rows = await r.json();
      if (!rows.length) return res.status(404).json({ error: "Not found." });
      const row = rows[0];
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(toClient(row));
    } catch (err) {
      return res.status(502).json({ error: "Storage unreachable. " + (err.message || "") });
    }
  }

  // ---------------- POST: save ----------------
  if (req.method === "POST") {
    const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
    const situation = (body.situation || "").toString().trim();
    const lenses = Array.isArray(body.lenses) ? body.lenses : null;
    const synthesis = (body.synthesis || "").toString().trim();
    const lensIds = Array.isArray(body.lensIds) ? body.lensIds.map(String) : [];
    const careLevel = ["none","struggling","crisis"].includes(body.careLevel) ? body.careLevel : "none";
    const allowImprovement = body.allowImprovement === true;   // opt-in only

    if (!situation || !lenses || !synthesis) {
      return res.status(400).json({ error: "Missing situation, lenses, or synthesis." });
    }
    if (situation.length > 2000 || synthesis.length > 2000 || lenses.length > 6) {
      return res.status(400).json({ error: "Payload too large." });
    }
    // sanitize lens entries (incl. an optional capped go-deeper thread)
    const cleanLenses = lenses.slice(0, 6).map(l => {
      const out = {
        id: String(l.id || ""),
        reflection: String(l.reflection || "").slice(0, 800),
        question: String(l.question || "").slice(0, 800)
      };
      if (Array.isArray(l.thread)) {
        out.thread = l.thread.slice(0, 8).map(t => {
          const turn = {
            role: t.role === "you" ? "you" : "part",
            text: String(t.text || "").slice(0, 1000)
          };
          if (t.question) turn.question = String(t.question).slice(0, 800);
          if (t.care && ["none", "struggling", "crisis"].includes(t.care.level)) {
            turn.care = { level: t.care.level, message: String(t.care.message || "").slice(0, 400) };
          }
          return turn;
        });
      }
      return out;
    });

    try {
      const r = await fetch(base, {
        method: "POST",
        headers: { ...sbHeaders, "prefer": "return=representation" },
        body: JSON.stringify({
          situation,
          lenses: cleanLenses,
          synthesis,
          lens_ids: lensIds.slice(0, 6),
          care_level: careLevel,
          allow_improvement: allowImprovement
        })
      });
      if (!r.ok) {
        let detail = ""; try { detail = (await r.json())?.message || ""; } catch (_) {}
        return res.status(502).json({ error: "Storage write failed. " + detail });
      }
      const rows = await r.json();
      return res.status(200).json({ id: rows[0]?.id });
    } catch (err) {
      return res.status(502).json({ error: "Storage unreachable. " + (err.message || "") });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

function toClient(row) {
  return {
    id: row.id,
    situation: row.situation,
    lenses: row.lenses,
    synthesis: row.synthesis,
    lensIds: row.lens_ids || [],
    when: row.created_at ? Date.parse(row.created_at) : Date.now()
  };
}
function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
