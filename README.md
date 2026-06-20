# PRISM — see what you can't

> A reflection instrument. Describe what's weighing on you, and Prism refracts it — like white
> light through glass — into distinct perspectives (your future self, a mentor, a skeptic, your
> values) so you can see the angles you're too close to notice. It never tells you what to do.
> It reflects, and it asks.

Built for the **SMG Bubble Cohort 001 “Reflection” Hackathon.**

---

## Why it's different
Most "AI advice" tools collapse your situation into a single answer — *their* answer. Prism does
the opposite: it **splits** your situation into several honest voices that genuinely disagree, then
names the tension underneath all of them. The decision stays yours; you just get to see it whole
first. Reflection, not resolution.

## What it does
- **Refract** — write what's on your mind, pick the perspectives, and get one tight reflection +
  one sharp question from each, plus a synthesis of the tension they share.
- **Six lenses** — Future You, The Mentor, The Skeptic, Your Values, Younger You, The Honest Friend
  (choose 2–4). Treated as *parts of you* with good intent (IFS) — even the challenging ones are
  never cruel.
- **Cares when it counts** — both the AI and a client-side check watch for genuine distress. If
  someone's struggling, the voices soften to pure validation and a warm panel surfaces real crisis
  resources (988, Crisis Text Line, findahelpline.com).
- **Save & revisit** — every reflection can be saved to a private link you can open on any device.
- **Private by design** — opt-in only (nothing is used to improve Prism unless you say so), export
  or delete your data anytime, and the AI key never touches the browser.
- **Remembers you** — reflections are journaled privately on your device, and a **Patterns** view
  surfaces what keeps surfacing across them (recurring themes, the lenses you reach for, an AI
  "what keeps surfacing" read). New reflections that echo an old one say so. This is the core
  difference from a one-off chat: a stateless LLM can answer once, but it can't see *you over time*.
- **Listens back** — a gentle end-of-session feedback prompt; the rating + optional note (never your
  reflection content) help Prism improve.

## Grounded in real psychology
Prism's method isn't improvised — the AI prompt is built on established frameworks so the responses
are sound, not generic advice:
- **Unconditional positive regard** (Carl Rogers) — accept the person; never judge or shame.
- **Internal Family Systems** (R. Schwartz) — perspectives are *parts* with good intent; "no bad parts."
- **Self-distancing / Solomon's Paradox** (Kross & Grossmann) — we reason more wisely about our
  situation from the outside. This is literally what refraction does.
- **Motivational Interviewing** — evoke the person's own wisdom; resist the urge to fix.
- **Stoicism** (dichotomy of control) & **Frankl** (meaning) — applied lightly in the synthesis.

## Tech
- **Frontend** — a single self-contained `index.html` (HTML/CSS + vanilla JS). No build step.
- **AI** — [Claude **Opus 4.8**](https://www.anthropic.com) via a Vercel serverless function
  (`/api/refract`), using **structured JSON output** so the refraction animation is fully driven
  by the model's response.
- **Storage** — [Supabase](https://supabase.com) (Postgres) via `/api/reflections`, accessed with
  the service-role key **server-side only**.
- **Hosting** — [Vercel](https://vercel.com) (static frontend + serverless API).

```
prism/
├─ index.html            ← the whole app (UI + client logic)
├─ api/
│  ├─ refract.js         ← Claude Opus 4.8 proxy + safety/care assessment (holds ANTHROPIC_API_KEY)
│  ├─ reflections.js     ← save / load reflections in Supabase
│  └─ feedback.js        ← store voluntary feedback (no reflection content)
├─ supabase/schema.sql   ← tables + Row-Level Security (Phase 1 now, Phase 2 auth ready)
├─ vercel.json           ← security headers (CSP, HSTS, no-store on /api, …)
├─ .env.example          ← required environment variables
├─ SECURITY.md           ← the privacy & security model
└─ package.json
```

---

## Run / deploy

### 1. Set up Supabase (saves & share links)
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. In **Project Settings → API**, copy your **Project URL** and the **`service_role`** key.

### 2. Deploy to Vercel
1. Push this `prism/` folder to a GitHub repo (or run `vercel` from the CLI).
2. Import it at [vercel.com](https://vercel.com) — it's zero-config (static site + `/api` functions).
3. Add **Environment Variables** (Settings → Environment Variables), per [`.env.example`](.env.example):
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. Done.

**Verify the wiring:** open `https://YOUR-SITE.vercel.app/api/health` — it reports (without exposing any secret) whether the Anthropic key and Supabase vars are present. `"ready": true` means you're fully connected.

### Local development
```bash
npm i -g vercel
vercel dev          # serves index.html + /api with your .env values
```
Or just **open `index.html` directly** in a browser — with no backend reachable, Prism runs in
**example mode** (hand-written sample reflections) so you can see the full experience offline.

---

## Privacy, safety & security
Full detail in [SECURITY.md](SECURITY.md). In short:
- **Reflection, not treatment.** Prism never diagnoses or decides, and it says so. On signs of
  distress it stops challenging, validates, and routes to real human help.
- **Opt-in only.** Nothing you write is used to improve Prism unless you explicitly turn it on in
  **Privacy & your data**. Off by default — and off means off.
- **You own your data.** Export everything as JSON or delete it, any time, from the privacy panel.
- **Secrets stay server-side.** The Anthropic and Supabase keys live only in Vercel env vars and
  are read only inside `/api/*`. The browser never holds a secret.
- **No leaking between people.** Reflections have no public list or feed; a saved one is reachable
  only by its random link. Row-Level Security is enabled, and Phase 2 (accounts) isolates every
  user's rows to `auth.uid()`.
- **Hardened transport.** `vercel.json` sets a strict Content-Security-Policy, HSTS, `X-Frame-Options`,
  a tight `Permissions-Policy`, and `no-store` on all API responses.
- **Minimal feedback.** Feedback stores only a thumbs and an optional note — never your reflection.
