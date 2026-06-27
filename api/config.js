// GET /api/config
// Serves the PUBLIC client config the browser needs for Supabase Auth.
// The anon/publishable key is designed to be public (Row-Level Security protects
// the data) — this is NOT the service-role key, which never leaves the server.
// If these env vars aren't set, the app falls back to guest-only mode.

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  });
}
