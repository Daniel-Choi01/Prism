# Prism — the written response & pitch

> This is the part the judges weight most. The rubric is **65% writing/telling**:
> Purpose & Theme Fit (30%) + Problem & Insight (20%) + Storytelling & Presentation (15%).
> The product (Functionality 20% + Creativity 15%) is built — this doc wins the other 65%.
>
> Fill the **`>> YOUR TRUTH:`** lines with your own words. The draft prose around them is a
> starting point you can keep, cut, or rewrite — but the personal lines must be *yours*. Judges
> can smell a generic story. Specifics (a real moment, a real person, a real feeling) score.

---

## 1 · Purpose & Theme Fit — 30%
*Judges ask: What inspired this, and why does it matter to YOU? Is there real depth? Does the
product connect back to that purpose?*

**The theme is "Reflection."** Prism takes it in two senses at once: *reflection* as light
bouncing/refracting through a prism, and *reflection* as the act of looking honestly at yourself.
The product is literally the metaphor: the situation you're tangled inside is the white light, and
Prism refracts it — separates what's really in there — so you can finally see it clearly.

**Why this matters to me** *(drafted from your answer — "reflecting is how I think" + "seen, not judged." Make it yours.)*:

> Reflection is just how my mind works. When something's weighing on me I don't have one
> reaction — I have an argument. A part of me that's scared, a part that's already decided, a
> part that sounds like someone who believes in me, a part that calls my own excuses. I've always
> done this — in my head, in my notes at 1am. Prism is that argument, made into something that
> listens back. I built it because the thing I've always needed in those moments isn't to be told
> what to do — it's to feel *seen* without being judged for the mess of it, and then asked a better
> question.

>> SHARPEN IT (do this — it's the difference between a good score and a great one):
>> add ONE concrete scene. A specific night, a specific thing you talked yourself in circles
>> about, the actual voices that showed up. Judges reward a real moment over a general pattern.

**How the product embodies the purpose (keep/trim):**
> I didn't want to build another AI that hands you an answer — that just trades your single
> viewpoint for the machine's single viewpoint. Reflection isn't being told what to do; it's
> seeing your own situation from the outside. So Prism is built to *refuse* to decide for you.
> It reflects what it hears, notices the thread you can't see from inside it, and asks — then
> hands the decision back to you. The whole interface — light entering a prism, fanning into
> color — is the purpose made visible.

---

## 2 · Problem & Insight — 20%
*Judges ask: Is this a real problem? Is the problem clear? Is there an insight beyond the obvious?*

**The problem (clear, one line):**
> When something weighs on us, we're trapped inside a single point of view — our own, in the
> middle of the feeling — exactly when we most need distance from it.

**Why existing options fall short:**
> Friends and advice columns and "what should I do" AI prompts all collapse the problem into
> *one* recommendation. That can feel like relief, but it skips the part that actually helps:
> being truly heard, and seeing the situation from angles you can't reach on your own. And every
> one of those AI answers starts from zero — it doesn't know you, and it forgets you the moment
> you close the tab.

**The insight (this is the part that scores — go beyond the obvious):**
> The perspective you need is usually *already inside you* — your future self knows, your values
> know, the honest-friend voice knows — it's just drowned out by the loudest one. You don't need
> new information; you need the same situation **refracted**, reflected back by something that
> actually heard you. And the most useful output isn't an answer, it's a better *question* — asked
> by something that remembers what you said last time.

**My version of the insight** *(drafted — keep or rephrase)*:
> Every time I reflect, I'm already running these voices — the scared one, the honest one, the
> one from the future. I didn't need new advice. I needed something that would hold all of them at
> once, reflect me back without judging me, and remember the thread — so the loudest voice doesn't
> win just because it's loudest. That's all Prism does.

**Grounded, not improvised** *(this is the depth that scores)*:
> Prism's responses aren't vibes — the AI follows established psychology. **Carl Rogers'**
> unconditional positive regard (accept, never judge). **Internal Family Systems** — the angles it
> weighs are *parts* of you with good intent, so even the honest one is never cruel ("no bad
> parts"). **Kross & Grossmann's self-distancing** (we reason more wisely about our own problems
> from the outside — the literal science behind "refraction"). **Motivational Interviewing** (evoke
> your wisdom, don't fix). **CBT** — it names cognitive distortions kindly and reframes with a
> Socratic question instead of a lecture. When someone's in real pain, it stops challenging
> entirely and points them to a person who can help — because a reflection tool that can't
> recognize a crisis isn't safe.

---

## 3 · Functionality — 20%  (✅ built — describe it plainly)
*Judges ask: Does it work? Could someone use it for real? Is the main feature complete?*

- **Main feature, complete:** you just *talk*. Type what's weighing on you in your own words and
  Prism replies in one warm, grounded voice — reflecting the feeling, naming the belief underneath,
  and asking one real question. Keep replying; it's a genuine multi-turn **conversation** that
  builds, not a one-shot answer box.
- **It remembers you.** Every reply is grounded in your own past reflections and recurring themes,
  and a **Patterns** view names what keeps surfacing across them over time — a mood-over-time chart,
  the recurring themes, and even **a letter from Prism** reflecting the threads it has noticed. This
  is the thing a fresh chat with any other model structurally *cannot* do — and it's the heart of
  why Prism isn't interchangeable with ChatGPT. When you sign in, all of it **syncs across your
  devices** under Row-Level Security; guests stay strictly on-device.
- **More than one way in:** a private **Journal** (Mirror → Pattern → Shift, with a curated prompt
  library), a 10-second daily **Check-in** (mood + gratitude → a two-week trend), **Encouragement**
  (honest, never hollow flattery), and **Wisdom** (one grounded idea + a question to carry).
- **It meets you where you are:** when words won't come, **calm tools** on every screen — guided
  breathing (three rhythms) and a 5-4-3-2-1 grounding exercise. And it adapts to *you*: reduced
  motion, larger text, four calm themes, keyboard shortcuts, and download/print of any reflection.
- **Real AI:** powered by **Claude Opus 4.8** through secure serverless functions (the API key lives
  on the server, never the browser), with structured output so every response is well-shaped.
- **Real and usable:** deployed on Vercel; sign in with Google, anonymously, or stay a guest.
  Reflections save to a Supabase database and get a **private link you can open on any device** —
  so it's a tool you'd actually return to, not a one-off demo.
- **Cares when it counts:** detects genuine distress and, instead of pushing, softens completely to
  validation and surfaces real crisis resources (988, Crisis Text Line, findahelpline.com).
- **Private by design:** opt-in only (off by default — never used unless you say yes), export or
  delete your data anytime, secrets stay server-side, and Row-Level Security keeps one person's
  reflections from ever reaching another.
- **Listens back:** a gentle end-of-session feedback loop (a rating + optional note — never your
  reflection content) that's how Prism keeps improving.
- **Degrades gracefully:** open the file with no backend and it runs in example mode, so the
  experience is never broken.
- **Tested, not hand-wavy:** a committed end-to-end suite (44 headless-browser checks) exercises
  every surface — conversation, distress→crisis, all the tabs, calm tools, patterns, settings,
  search, accessibility, the lot — and guards against regressions.

**Demo path to show live (≈60s):**
1. Open the site. Read the one-line promise; sign in (or "continue as guest").
2. Type a real (or the example) situation — a few honest sentences.
3. Read Prism's reflection out loud, then the question. Note it never says "you should."
4. **Reply to it** — show it builds on what you said, like a conversation, not a reset.
5. Open **Patterns** (or point to the "this echoes something you said before" note) — show it
   *remembers you*. That's the line that kills "why not just use ChatGPT."
6. **Save & copy link**, open it in a second tab/phone — show it persists.

---

## 4 · Creativity & Originality — 15%  (✅ built — name what's original)
*Judges ask: Is the idea/execution original and tied to your story? A creative angle? Does it stand out?*

- **The refusal to advise.** Almost every AI product races to give you the answer. Prism's entire
  premise is *not* doing that — an AI deliberately designed to withhold the verdict and widen the
  view instead. That inversion is the original idea.
- **Memory as the differentiator.** Most "AI chat" is stateless and amnesiac. Prism is built around
  the opposite: it grounds every reply in your own history and names the patterns across it. The
  product isn't "a smarter answer," it's *continuity* — being known over time.
- **The metaphor is the mechanic.** "Reflection/refraction" isn't decoration bolted on top — the
  literal prism (white light → spectrum) *is* the function (one tangled situation → seen clearly,
  from angles you couldn't reach inside it).
- **Honest about being a machine.** Instead of faking empathy (the documented, dangerous AI failure
  mode), Prism names what it actually is — a private, patient, judgment-free space with no social
  risk — and makes *that* the value. Refusing to pretend is itself the creative stance.

**How the idea ties to my story** *(drafted)*:
> The idea is just the inside of my own head, turned outward: I think by arguing with myself in
> different voices, so I built a tool that holds all of them — and, unlike me at 1am, refuses to
> let the loudest voice flatten the rest into one rushed answer.

---

## 5 · Storytelling & Presentation — 15%
*Judges ask: Can you walk us through it clearly? Do you explain your process and what you hit?*

**Pitch arc (≈90s spoken):**
1. **Hook (how you think):** open with §1 — "When something's weighing on me, I don't have one
   reaction, I have an argument in my head." Name the voices. (Drop in your one concrete scene.)
2. **Reframe to the problem (§2):** "We get trapped in one viewpoint exactly when we need distance —
   and most tools, human or AI, just hand us one more verdict and then forget us."
3. **The idea (§4):** "So I built the opposite of an advice machine — one that reflects instead of
   decides, and that actually *remembers* me."
4. **Live demo (§3):** do the 60-second path. Let the product talk — especially the "it remembers
   you" beat.
5. **Insight + theme tie-back (§1–2):** "Reflection isn't getting an answer. It's being heard, and
   seeing yourself from the outside. That's the theme, and that's literally what the prism does."
6. **Close:** what you learned building it (below).

**Process & what you ran into (judges explicitly ask for this — be honest):**
>> YOUR TRUTH (3–5 bullets). Real candidates from this build:
>>  • Started as "AI journaling," realized that was generic — pivoted to *reflection that refracts
>>    and refuses to advise*, which made the theme literal.
>>  • **The pivot that mattered:** my first version showed you four separate "perspective" boxes —
>>    future self, skeptic, mentor, values — fanned out like a panel. It looked clever and felt
>>    *robotic*: a committee handing in a report, not reflection. So I rebuilt it to do what I
>>    actually do in my head — weigh all those voices privately and speak back in the single,
>>    understanding voice you reach once you've finally heard yourself out. That one change is what
>>    made it feel like a conversation instead of a form.
>>  • Hardest design call: making the AI *not* give advice. Took specific prompt rules
>>    (no "you should", reflect-and-question only, never reuse a stock opening) to stop it from
>>    collapsing into a single tidy answer.
>>  • Security: moved the API key off the browser into serverless functions, added consent that's
>>    opt-in and absolute, and Row-Level Security — so it's actually deployable and private, not
>>    just a demo.
>>  • A privacy audit caught that "Delete everything" had quietly stopped covering newer data
>>    (check-ins, kept words) — fixed so it truly wipes everything. Built a 52-check end-to-end test
>>    suite partly so regressions like that can't sneak back in.

**What I'd build next (be honest about the horizon):**
> - **Gentle, opt-in reminders** — a once-a-day nudge to check in, never nagging, fully off by default.
> - **Shared reflection with a trusted person** — hand a single reflection to a friend or therapist,
>   with consent on both sides, without making anything public.
> - **Longer-arc letters** — the "letter from Prism" expanded into a monthly read of how a season went.
> - **On-device models** for the most sensitive entries, so even the server never sees them.

**Why these and not "more features":** every one deepens the two things Prism is actually about —
being *known over time* and staying *private and safe*. That's the line I'd hold against scope creep.

---

### One-paragraph version (for a submission form, ~120 words)
> Prism is a reflection tool that does the opposite of an advice app. You tell it what's weighing on
> you, the way you'd tell a person who actually listens — and instead of handing back one verdict,
> it reflects the feeling, names the thread underneath, and asks the one question that moves you. It
> never tells you what to do, and — unlike a fresh chat with any other AI — it remembers you,
> grounding every reply in what you've reflected on before and naming the patterns across it. I
> built it because reflection is how I've always thought: when something weighs on me I argue with
> myself in different voices, and I wanted something that would hold all of them at once and reflect
> me back without judging me for the mess of it. The theme is "reflection," and Prism means it both
> ways at once: light refracting through glass, and the act of finally seeing yourself from the
> outside. Built with Claude Opus 4.8, Vercel, and Supabase.
