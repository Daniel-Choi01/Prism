// POST /api/feedback
// Stores VOLUNTARY end-of-session feedback in Supabase (service-role, server-side).
// Privacy by design: we store only what the person chooses to send — a thumbs
// up/down, an optional 1-5 rating, and an optional note. We deliberately do NOT
// accept or store any reflection content here.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Not configured — caller falls back to storing the preference locally.
    return res.status(501).json({ error: "Feedback storage is not configured on the server." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});

  // Whitelist + sanitize. Anything not in this shape is dropped.
  const helpful = typeof body.helpful === "boolean" ? body.helpful : null;
  let rating = Number.isInteger(body.rating) ? body.rating : null;
  if (rating !== null && (rating < 1 || rating > 5)) rating = null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : null;
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 40) : "session_end";

  if (helpful === null && rating === null && !message) {
    return res.status(400).json({ error: "Nothing to record." });
  }

  try {
    const r = await fetch(url.replace(/\/+$/, "") + "/rest/v1/feedback", {
      method: "POST",
      headers: {
        "apikey": key,
        "authorization": `Bearer ${key}`,
        "content-type": "application/json",
        "prefer": "return=minimal"
      },
      body: JSON.stringify({ helpful, rating, message, context })
    });
    if (!r.ok) {
      let detail = ""; try { detail = (await r.json())?.message || ""; } catch (_) {}
      return res.status(502).json({ error: "Couldn't record feedback. " + detail });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: "Storage unreachable. " + (err.message || "") });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
