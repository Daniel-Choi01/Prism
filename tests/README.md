# Prism tests

An end-to-end **smoke suite** that opens the real `index.html` in a headless
browser (Playwright) and exercises every major surface, asserting there are no
runtime errors and that each feature actually works.

It runs against the static file over `file://`, so the `/api/*` calls fall back
to **example mode** — the exact offline experience a first-time visitor sees.
That means the suite needs no keys, no server, and no network.

## What it covers
- Welcome / login gate (guest, Google, anonymous present) and clean boot
- The core reflective conversation (reflect → reply → save), example mode
- Distress detection escalating to the crisis care panel
- All five tabs (Talk, Check-in, Journal, Encouragement, Wisdom)
- Journal reflection + the prompt library
- Daily check-in saving + persistence
- Patterns: mood-over-time chart, per-reflection dots, theme bars, trend read
- Settings (text size + reduced motion) persisting across reload with no flash
- Calm tools: breathing orb animation + 5-4-3-2-1 grounding
- The "Why Prism" reviewer page + comparison table
- Voice input — hidden when unsupported, present when supported
- Responsive header (no horizontal overflow at 360 / 390 / 768 px)
- Onboarding tour showing exactly once

## Run it
Playwright is intentionally **not** a project dependency (it would bloat the
deploy and isn't needed at runtime), so install it just for testing:
```bash
npm i -D playwright
npx playwright install chromium
npm test
```

`npm test` exits non-zero if any assertion fails, so it drops straight into CI.

If you cache the Chromium binary separately (some CI images do), you can point
the suite at it without the full `playwright` package:
```bash
PRISM_CHROMIUM=/path/to/chrome npm test   # uses playwright-core + this binary
```
