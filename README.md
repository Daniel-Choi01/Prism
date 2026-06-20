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
  (choose 2–4). Each is a real, distinct voice.
- **Save & revisit** — every reflection can be saved to a private link you can open on any device.
  Coming back to what you wrote is part of the practice.
- **Private by design** — reflections are personal. The AI key never touches the browser, and a
  saved reflection is reachable only by its random link.

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
│  ├─ refract.js         ← Claude Opus 4.8 proxy (holds ANTHROPIC_API_KEY)
│  └─ reflections.js     ← save / load reflections in Supabase
├─ supabase/schema.sql   ← the one table to create
├─ .env.example          ← required environment variables
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

### Local development
```bash
npm i -g vercel
vercel dev          # serves index.html + /api with your .env values
```
Or just **open `index.html` directly** in a browser — with no backend reachable, Prism runs in
**example mode** (hand-written sample reflections) so you can see the full experience offline.

---

## Notes on honesty & safety
- Prism is a tool for reflection, not a substitute for professional support. It says so, and it
  never pretends to diagnose or decide.
- The Anthropic key is read only inside `/api/refract` (server-side env var). It is never sent to,
  or readable from, the browser.
- Saved reflections have no index and no listing endpoint — the random-UUID link is the only key.
  Row-Level Security is on with no public policies, so only the server (service role) can read them.
