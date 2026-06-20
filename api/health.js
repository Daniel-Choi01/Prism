// GET /api/health
// A connectivity check you can hit after deploy to confirm wiring — WITHOUT exposing
// any secret. Reports only whether each env var is present (booleans), never its value.
// Open https://YOUR-SITE.vercel.app/api/health after deploying.

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  return res.status(200).json({
    ok: true,
    service: "prism",
    checks: {
      anthropic_key: Boolean(process.env.ANTHROPIC_API_KEY),
      supabase_url: Boolean(process.env.SUPABASE_URL),
      supabase_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    },
    ready: Boolean(process.env.ANTHROPIC_API_KEY) &&
           Boolean(process.env.SUPABASE_URL) &&
           Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    time: new Date().toISOString()
  });
}
