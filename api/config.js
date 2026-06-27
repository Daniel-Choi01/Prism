// GET /api/config
// Serves the PUBLIC client config the browser needs for Supabase Auth.
// The anon/publishable key is designed to be public (Row-Level Security protects
// the data) — this is NOT the service-role key, which never leaves the server.
// If these env vars aren't set, the app falls back to guest-only mode.

// Normalize to the bare project URL. People often paste the "RESTful endpoint"
// (…supabase.co/rest/v1) instead of the Project URL; supabase-js needs the base,
// or auth requests hit the data path and fail with "No API key found in request."
function baseSupabaseUrl(raw) {
  return String(raw || "").trim().replace(/\/+$/, "").replace(/\/(rest|auth|storage|realtime)\/v1$/i, "").replace(/\/+$/, "");
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    supabaseUrl: baseSupabaseUrl(process.env.SUPABASE_URL),
    supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || "").trim()
  });
}
