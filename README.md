# PRISM — see what you can't

> A reflection instrument. Tell Prism what's weighing on you, the way you'd tell a person who
> actually listens. It doesn't hand you an answer — it reflects what it hears, notices the thread
> underneath, and asks the one question that moves you. Like white light through glass, it takes
> the single viewpoint you're stuck inside and refracts it into something you can finally see whole.

Built for the **SMG Bubble Cohort 001 “Reflection” Hackathon.**

---

## Why it's different
Most "AI advice" tools collapse your situation into a single verdict — *their* verdict. Prism is
built to do the opposite, and to do the one thing a stateless chat with any other model **cannot**:

- **It remembers you.** Every reply is grounded in your own earlier reflections and the themes that
  keep recurring for you. A fresh ChatGPT window answers the question; Prism answers *you* — and can
  name the thread running across weeks. That continuity is the core, structural difference.
- **It refuses to decide for you.** No "you should." It reflects the feeling, names the belief
  underneath, gently flags the distortion if there is one, and ends with a real question — the way
  reflection actually works, not the way an advice machine works.
- **It's honest about what it is.** Prism never pretends to be human or to "know how you feel." What
  it genuinely offers instead is a private, patient, judgment-free space with no social risk and no
  clock — and it says so. (Documented AI failure modes — hollow flattery, false empathy, unsafe
  crisis responses — are exactly what Prism is prompted *against*.)
- **It's a conversation, not a transaction.** You type freely; it replies in one warm voice that has
  privately weighed several angles, and it builds on what came before instead of resetting each turn.

## What it does
- **Talk** — the heart of Prism. Say what's on your mind in your own words; get back one grounded,
  personal reflection and one sharp question. Keep going — it's a real multi-turn conversation. Save
  any reflection to a **private link** you can reopen on any device.
- **Journal** — a private daily writing space (on-device, confidential). Opt in and Prism reflects
  back with a therapist-grade method: **The Mirror** (names the emotion + the belief underneath),
  **Pattern Recognition** (gently flags CBT cognitive distortions — catastrophizing, all-or-nothing,
  mind-reading…), and **The Shift** (one Socratic reframing question). It validates the *feeling*,
  never a distorted belief — and softens entirely on signs of distress.
- **Encouragement** — one piece of *honest* encouragement, the opposite of AI sycophancy: no
  "you've got this," no toxic positivity. Quietly shaped by what you've actually been carrying.
- **Wisdom** — one grounded idea to sit with, drawn from a real tradition (Stoicism, Frankl, IFS,
  Rogers, mindfulness), plus a reflective question. Never a fortune-cookie platitude.
- **Check-in** — a ten-second daily pulse: how today feels (five levels), one word, and one thing
  you're grateful for. Builds a private two-week mood trend and a gentle streak — your own weather,
  over time.
- **Patterns** — looks *across* your reflections: a **mood-over-time chart** (care-coloured), the
  themes that keep surfacing (proportional bars), an AI "what keeps surfacing" read, and **a letter
  from Prism** reflecting back the threads it has noticed — something a stateless chat could never
  write. New reflections that echo an old one say so. Search your whole history, too.
- **Calm tools, anywhere** — a floating **Breathe** button on every screen opens guided breathing
  (Box 4-4-4-4, 4-7-8, or 4-6) and a **5-4-3-2-1 grounding** exercise, for the moments before you can
  even put it into words.
- **Make it yours** — a Settings panel with **reduced motion**, **larger text**, and four calm
  **appearance themes** (Ink, Ember, Tide, Moss) — layered on top of your OS preferences, remembered
  on-device. Plus keyboard shortcuts (press <kbd>?</kbd>) and **download/print** any reflection.
- **Cares when it counts** — both the AI and a client-side check watch for genuine distress. If
  someone's struggling, Prism drops all challenge, becomes purely validating, and surfaces real
  crisis resources (988, Crisis Text Line, findahelpline.com).
- **Sign in your way** — Google, anonymous (one-tap, no details), or stay a guest. Auth is optional;
  with no keys configured, Prism still runs fully in guest mode.
- **Syncs across devices (when signed in)** — your private bundle (reflections, journal, check-ins)
  follows your account, so "Prism remembers you" is true on your phone *and* your laptop. It syncs
  directly from the browser under Row-Level Security (you can only ever touch your own row), so
  "remembers you" finally works everywhere. Guests stay strictly on-device — that's the whole point
  of guest mode.
- **Private by design** — opt-in only (nothing is used to improve Prism unless you say so), export
  or delete your data anytime, and no provider key ever touches the browser.
- **Listens back** — a gentle end-of-session feedback prompt; the rating + optional note (never your
  reflection content) help Prism improve.

## Grounded in real psychology
Prism's method isn't improvised — the AI prompts are built on established frameworks so the
responses are sound, not generic advice:
- **Unconditional positive regard** (Carl Rogers) — accept the person; never judge or shame.
- **Internal Family Systems** (R. Schwartz) — the angles Prism weighs are *parts* of you with good
  intent; "no bad parts," so even the honest one is never cruel.
- **Self-distancing / Solomon's Paradox** (Kross & Grossmann) — we reason more wisely about our own
  situation from the outside. This is literally what reflection does.
- **Motivational Interviewing** — evoke the person's own wisdom; resist the urge to fix.
- **CBT** — name cognitive distortions kindly; reframe with Socratic questions, never lectures.
- **Stoicism** (dichotomy of control) & **Frankl** (meaning) — applied lightly, never preached.

## Tech
- **Frontend** — a single self-contained `index.html` (HTML/CSS + vanilla JS). No build step.
- **AI** — [Claude **Opus 4.8**](https://www.anthropic.com) via Vercel serverless functions, using
  **structured JSON output** so every response is well-shaped and safe to render.
- **Auth & storage** — [Supabase](https://supabase.com) (Postgres + Auth). The service-role key is
  used **server-side only**; the browser gets just the public anon key (RLS-protected) via
  `/api/config`.
- **Hosting** — [Vercel](https://vercel.com) (static frontend + serverless API).

```
prism/
├─ index.html              ← the whole app (UI + client logic)
├─ api/
│  ├─ converse.js          ← Claude Opus 4.8 — the single-voice reflective conversation + safety
│  ├─ journal-insight.js   ← Mirror / Pattern / Shift response to a journal entry
│  ├─ patterns.js          ← "what keeps surfacing" across your reflections over time
│  ├─ encourage.js         ← one piece of honest, non-sycophantic encouragement
│  ├─ wisdom.js            ← one grounded idea from real philosophy/psychology
│  ├─ letter.js            ← a warm letter reflecting on the threads across your reflections
│  ├─ reflections.js       ← save / load reflections in Supabase (service-role)
│  ├─ feedback.js          ← store voluntary feedback (no reflection content)
│  ├─ config.js            ← serves the PUBLIC Supabase anon key for browser-side Auth
│  └─ health.js            ← post-deploy connectivity check (exposes no secrets)
├─ tests/
│  ├─ smoke.mjs            ← end-to-end smoke suite (44 checks, headless Playwright)
│  └─ README.md            ← how to run the tests
├─ supabase/schema.sql     ← tables + Row-Level Security (anon shares now; per-user cloud sync ready)
├─ vercel.json             ← security headers (CSP, HSTS, no-store on /api, …)
├─ .env.example            ← required environment variables
├─ SECURITY.md             ← the privacy & security model
└─ package.json
```

---

## Run / deploy

### 1. Set up Supabase (saves, share links & sign-in)
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. In **Project Settings → API**, copy your **Project URL**, the **`service_role`** key, and the
   public **`anon`** key.
4. *(For sign-in)* In **Authentication → Providers**, turn **Anonymous** on; for Google, add an
   OAuth client and your Vercel URL as a redirect.

### 2. Deploy to Vercel
1. Push this `prism/` folder to a GitHub repo (or run `vercel` from the CLI).
2. Import it at [vercel.com](https://vercel.com) — it's zero-config (static site + `/api` functions).
   Framework preset **Other**, root directory `./`.
3. Add **Environment Variables** (Settings → Environment Variables), per [`.env.example`](.env.example):
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY` — the **public** anon key (enables Google/anonymous sign-in). Without it,
     the app runs guest-only.
4. Deploy. Done.

**Verify the wiring:** open `https://YOUR-SITE.vercel.app/api/health` — it reports (without exposing
any secret) whether the Anthropic key and Supabase vars are present. `"ready": true` means you're
fully connected.

### Local development
```bash
npm i -g vercel
vercel dev          # serves index.html + /api with your .env values
```
Or just **open `index.html` directly** in a browser — with no backend reachable, Prism runs in
**example mode** (hand-written sample responses) so you can see the full experience offline.

---

## Privacy, safety & security
Full detail in [SECURITY.md](SECURITY.md). In short:
- **Reflection, not treatment.** Prism never diagnoses or decides, and it says so. On signs of
  distress it stops challenging, validates, and routes to real human help.
- **Opt-in only.** Nothing you write is used to improve Prism unless you explicitly turn it on in
  **Privacy & your data**. Off by default — and off means off.
- **You own your data.** Export everything as JSON or delete it, any time, from the privacy panel.
- **Secrets stay server-side.** The Anthropic and Supabase service keys live only in Vercel env vars
  and are read only inside `/api/*`. The browser never holds a privileged secret.
- **No leaking between people.** Reflections have no public list or feed; a saved one is reachable
  only by its random link. Row-Level Security is enabled, and Phase 2 (accounts) isolates every
  user's rows to `auth.uid()`.
- **Hardened transport.** `vercel.json` sets a strict Content-Security-Policy, HSTS, `X-Frame-Options`,
  a tight `Permissions-Policy`, and `no-store` on all API responses.
- **Minimal feedback.** Feedback stores only a thumbs and an optional note — never your reflection.
