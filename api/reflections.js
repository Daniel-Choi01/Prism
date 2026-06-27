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
  // tolerate a pasted "…/rest/v1" endpoint by normalizing back to the base project URL
  const root = url.trim().replace(/\/+$/, "").replace(/\/(rest|auth|storage|realtime)\/v1$/i, "").replace(/\/+$/, "");
  const base = root + "/rest/v1/reflections";
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
    const turns = Array.isArray(body.turns) ? body.turns : null;
    const careLevel = ["none","struggling","crisis"].includes(body.careLevel) ? body.careLevel : "none";
    const allowImprovement = body.allowImprovement === true;   // opt-in only

    if (!situation || !turns || !turns.length) {
      return res.status(400).json({ error: "Missing situation or conversation." });
    }
    if (situation.length > 2000 || turns.length > 40) {
      return res.status(400).json({ error: "Payload too large." });
    }
    // sanitize the conversation turns (stored in the flexible jsonb column)
    const cleanTurns = turns.slice(0, 40).map(t => {
      const turn = {
        role: t.role === "prism" ? "prism" : "you",
        text: String(t.text || "").slice(0, 4000)
      };
      if (t.question) turn.question = String(t.question).slice(0, 2000);
      if (t.care && ["none", "struggling", "crisis"].includes(t.care.level)) {
        turn.care = { level: t.care.level, message: String(t.care.message || "").slice(0, 400) };
      }
      return turn;
    });

    try {
      const r = await fetch(base, {
        method: "POST",
        headers: { ...sbHeaders, "prefer": "return=representation" },
        body: JSON.stringify({
          situation,
          lenses: cleanTurns,        // the jsonb column holds the full conversation now
          synthesis: "",
          lens_ids: [],
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
    turns: Array.isArray(row.lenses) ? row.lenses : [],   // conversation lives in the jsonb column
    care: { level: row.care_level || "none", message: "" },
    when: row.created_at ? Date.parse(row.created_at) : Date.now()
  };
}
function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
