# Changelog

A record of how Prism came together — useful for the "process & what you ran
into" part of the pitch. Newest first.

## The build, in order

### Foundations
- **Single-voice reflective conversation** — the core. You type freely; Prism considers several
  inner angles privately and replies as one warm voice, then asks one real question. Replaced an
  earlier "pick 2–4 perspectives → read separate cards" design that tested as *robotic* — the pivot
  to one synthesized voice is what made it feel like a conversation instead of a form.
- **Memory grounding** — every reply is grounded in the person's own past reflections + recurring
  themes. This is the structural differentiator from a stateless chat.
- **Safety/care layer** — a client-side distress check *and* the model both watch for crisis; on
  signs of distress Prism drops all challenge, validates, and surfaces real human help.
- **Login gate** — Google, anonymous, or guest (guest always works with no backend).
- **Privacy** — opt-in improvement consent (off by default), export/delete, secrets server-side,
  strict CSP/HSTS headers, Row-Level Security.

### Surfaces
- **Journal** — private daily writing; opt-in Mirror → Pattern → Shift reflection; a curated prompt
  library (36 grounded prompts).
- **Check-in** — a 10-second daily mood + gratitude pulse → a private two-week trend + streak.
- **Encouragement** — honest, anti-sycophantic (no "you've got this").
- **Wisdom** — one grounded idea from a real tradition + a question to carry (20-entry bank).
- **Patterns** — mood-over-time chart, theme bars, an AI "what keeps surfacing" read, and **a letter
  from Prism** reflecting the threads across your reflections. Plus full-text search.

### Care & comfort
- **Calm tools on every screen** — guided breathing (Box 4-4-4-4 / 4-7-8 / 4-6) and a 5-4-3-2-1
  grounding exercise.
- **Settings** — reduced motion, larger text, four appearance themes (Ink/Ember/Tide/Moss), and a
  film-grain toggle — layered on top of OS preferences, applied before first paint, persisted.
- **Keyboard shortcuts** (`?` for the list) and **download/print** any reflection as Markdown.
- **Onboarding** — a gentle 4-step first-visit tour, shown once.
- **Resume** — pick a recent unfinished reflection back up from the intake.
- **Voice input** — dictate into any field (hidden where unsupported).
- **Kept words** — save the wisdom/encouragement that lands, revisit any time.

### Cross-device & quality
- **Per-user cloud sync** — signed-in users' private bundle (reflections, journal, check-ins) syncs
  across devices via Supabase under Row-Level Security; guests stay strictly on-device.
- **Committed test suite** — `tests/smoke.mjs`, 64 headless-browser checks across every surface,
  CI-ready, run with `npm test`.
- **Take it with you** — export everything as JSON *or* a readable Markdown journal; "delete
  everything" truly clears all of it (reflections, journal, check-ins, kept words, settings).

## Things we ran into (the honest part)
- **First "perspectives" design felt like a committee report.** Rebuilt to a single voice that has
  weighed the angles — the change that made it feel human.
- **Making the AI *not* give advice** took explicit prompt rules (no "you should", reflect-and-ask
  only, never reuse a stock opening) to stop it collapsing into one tidy answer.
- **Security to make it deployable, not just a demo** — moved every key server-side, added opt-in
  consent and RLS.
- **An IDE stale-buffer save** once reverted on-disk edits; caught it, re-applied, and added the
  smoke suite partly to guard against silent regressions.
- **"Delete everything" once didn't.** A privacy audit found Export/Delete predated the Check-in and
  Kept Words features and were leaving that data behind — fixed so both truly cover everything.

---

_Every change above was verified in a headless browser before shipping (`npm test` → 64 checks), and
the privacy guarantees — opt-in consent, true delete, Row-Level Security, on-device guest data — were
treated as load-bearing, not footnotes._
