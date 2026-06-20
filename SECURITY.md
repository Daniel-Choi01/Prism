# Prism — privacy & security model

Prism handles some of the most private things a person can write. The whole system is designed
around one rule: **only do with someone's words what they've allowed.** Here's how that's enforced,
layer by layer.

## 1. Secrets never reach the browser
- `ANTHROPIC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` live only in Vercel
  environment variables and are read only inside the `/api/*` serverless functions.
- The browser calls *our* endpoints (`/api/refract`, `/api/reflections`, `/api/feedback`); it never
  sees a provider key and never calls Anthropic or the database directly with a privileged key.

## 2. Consent is opt-in, and opt-out is absolute
- The "Help improve Prism with my reflections" toggle is **off by default**.
- When off, the saved reflection is flagged `allow_improvement = false` and is never reviewed for
  improvement — period.
- Turning it on only flags *future* saves; it is never retroactive and can be turned back off anytime.

## 3. You can take it or wipe it
- **Export my data** downloads everything stored for you as a JSON file.
- **Delete everything** clears your on-device reflections and settings immediately.
- (Phase 2, with accounts) account deletion cascades to every row you own via
  `on delete cascade`.

## 4. No leaking between people
- There is **no public list, feed, or search** of reflections. You cannot browse anyone else's.
- A saved reflection is reachable only by its **random UUID share link** — unguessable, and shared
  only if/when you choose to share it.
- **Row-Level Security (RLS)** is enabled on every table. In Phase 1, no broad public policies exist,
  so the public anon key can't read or write directly — only the server-side service role can.
- In **Phase 2** (Supabase Auth — Google + anonymous), policies restrict every row to its owner via
  `auth.uid() = user_id`, so a signed-in user can *only ever* read their own reflections, with a
  single narrow exception for explicitly-shared links.

## 5. Minimal collection
- Feedback stores only a thumbs up/down, an optional 1–5 rating, and an optional note — **never the
  content of the reflection**. The server whitelists and length-caps these fields.
- API responses set `Cache-Control: no-store` so personal content isn't cached at the edge or by
  intermediaries, and `X-Robots-Tag: noindex` keeps endpoints out of search engines.

## 6. Hardened transport (`vercel.json`)
- **Content-Security-Policy** — restricts scripts/styles/connections to known origins
  (self, Google Fonts, Supabase); blocks framing and arbitrary object/embed sources.
- **Strict-Transport-Security** (HSTS) — forces HTTPS.
- **X-Frame-Options: DENY** + `frame-ancestors 'none'` — prevents clickjacking.
- **X-Content-Type-Options: nosniff**, strict **Referrer-Policy**, and a tight **Permissions-Policy**
  (geolocation/camera off; microphone limited to self for the future voice feature).

## 7. Honest limits
- Prism is a student project and a thinking tool — **not** a medical device or a crisis service. It
  surfaces real resources but cannot contact anyone on your behalf, and it says so plainly.
- Best-effort input validation and length limits are in place. A production deployment should add
  durable rate-limiting (e.g. Upstash) in front of `/api/*`; the current functions are
  single-instance and not a substitute for that at scale.
