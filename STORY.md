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
The product is literally the metaphor: your situation is the white light; the perspectives are the
spectrum it hides.

**Why this matters to me** *(drafted from your answer — "reflecting is how I think" + "seen, not judged." Make it yours.)*:

> Reflection is just how my mind works. When something's weighing on me I don't have one
> reaction — I have an argument. A part of me that's scared, a part that's already decided, a
> part that sounds like someone who believes in me, a part that calls my own excuses. I've always
> done this — in my head, in my notes at 1am. Prism is that argument, given names and made visible.
> I built it because the thing I've always needed in those moments isn't to be told what to do —
> it's to feel *seen* without being judged for the mess of it, and then asked a better question.

>> SHARPEN IT (do this — it's the difference between a good score and a great one):
>> add ONE concrete scene. A specific night, a specific thing you talked yourself in circles
>> about, the actual voices that showed up. Judges reward a real moment over a general pattern.

**How the product embodies the purpose (keep/trim):**
> I didn't want to build another AI that hands you an answer — that just trades your single
> viewpoint for the machine's single viewpoint. Reflection isn't being told what to do; it's
> seeing your own situation from the outside. So Prism is built to *refuse* to decide for you.
> It splits, it asks, and it hands the decision back. The whole interface — light entering a
> prism, fanning into colors — is the purpose made visible.

---

## 2 · Problem & Insight — 20%
*Judges ask: Is this a real problem? Is the problem clear? Is there an insight beyond the obvious?*

**The problem (clear, one line):**
> When something weighs on us, we're trapped inside a single point of view — our own, in the
> middle of the feeling — exactly when we most need distance from it.

**Why existing options fall short:**
> Friends and advice columns and "what should I do" AI prompts all collapse the problem into
> *one* recommendation. That can feel like relief, but it skips the part that actually helps:
> seeing the situation whole, from angles you can't reach on your own.

**The insight (this is the part that scores — go beyond the obvious):**
> The perspectives you need are usually *already inside you* — your future self knows, your values
> know, the honest-friend voice knows — they're just drowned out by the loudest one. You don't need
> new information; you need the same situation **refracted**. And the most useful output isn't an
> answer, it's a better *question*.

**My version of the insight** *(drafted — keep or rephrase)*:
> Every time I reflect, I'm already running these voices — the scared one, the honest one, the
> one from the future. I didn't need new advice; I needed those voices *separated and named*, so
> I could actually hear each one instead of letting the loudest win. That's all Prism does.

**Grounded, not improvised** *(this is the depth that scores)*:
> Prism's responses aren't vibes — the AI follows established psychology. **Carl Rogers'**
> unconditional positive regard (accept, never judge). **Internal Family Systems** — the lenses
> are *parts* of you with good intent, so even the Skeptic is never cruel ("no bad parts").
> **Kross & Grossmann's self-distancing** (we reason more wisely about our own problems from the
> outside — the literal science behind "refraction"). **Motivational Interviewing** (evoke your
> wisdom, don't fix). When someone's in real pain, it stops challenging entirely and points them
> to a person who can help — because a reflection tool that can't recognize a crisis isn't safe.

---

## 3 · Functionality — 20%  (✅ built — describe it plainly)
*Judges ask: Does it work? Could someone use it for real? Is the main feature complete?*

- **Main feature, complete:** type a real situation → pick 2–4 perspectives → get a tailored
  reflection + a sharp question from each, plus a synthesis naming the underlying tension.
- **Real AI:** powered by **Claude Opus 4.8** through a secure serverless function (the API key
  lives on the server, never the browser), with structured output driving the refraction reveal.
- **Real and usable:** deployed on Vercel; reflections save to a Supabase database and get a
  **private share link you can open on any device** — so it's a tool you'd actually return to,
  not a one-off demo.
- **Cares when it counts:** detects genuine distress and, instead of pushing, softens every voice
  to validation and surfaces real crisis resources (988, Crisis Text Line, findahelpline.com).
- **Private by design:** opt-in only (off by default — never used unless you say yes), export or
  delete your data anytime, secrets stay server-side, and Row-Level Security keeps one person's
  reflections from ever reaching another.
- **Listens back:** a gentle end-of-session feedback loop (a rating + optional note — never your
  reflection content) that's how Prism keeps improving.
- **Degrades gracefully:** open the file with no backend and it runs in example mode, so the
  experience is never broken.

**Demo path to show live (≈60s):**
1. Open the site. Read the one-line promise.
2. Paste a real (or the example) situation. Keep the 4 default lenses.
3. Hit **Refract** — watch the light split; read two opposing lenses out loud (Skeptic vs. Mentor).
4. Read the synthesis ("what the light reveals").
5. **Save & copy link**, open it in a second tab/phone — show it persists.

---

## 4 · Creativity & Originality — 15%  (✅ built — name what's original)
*Judges ask: Is the idea/execution original and tied to your story? A creative angle? Does it stand out?*

- **The refusal to advise.** Almost every AI product races to give you the answer. Prism's entire
  premise is *not* doing that — it's an AI deliberately designed to withhold the verdict and widen
  the view instead. That inversion is the original idea.
- **The metaphor is the mechanic.** "Reflection/refraction" isn't decoration bolted on top — the
  literal prism (white light → spectrum) *is* the feature (one situation → many perspectives).
- **Voices that disagree.** The lenses are prompted to genuinely conflict, then a synthesis names
  the tension — rather than averaging everything into bland positivity.

**How the idea ties to my story** *(drafted)*:
> The idea is just the inside of my own head, turned outward: I think by arguing with myself in
> different voices, so I built a tool that does exactly that — and, unlike me at 1am, refuses to
> let the loudest voice flatten the others into one rushed answer.

---

## 5 · Storytelling & Presentation — 15%
*Judges ask: Can you walk us through it clearly? Do you explain your process and what you hit?*

**Pitch arc (≈90s spoken):**
1. **Hook (how you think):** open with §1 — "When something's weighing on me, I don't have one
   reaction, I have an argument in my head." Name the voices. (Drop in your one concrete scene.)
2. **Reframe to the problem (§2):** "We get trapped in one viewpoint exactly when we need distance —
   and most tools, human or AI, just hand us one more verdict."
3. **The idea (§4):** "So I built the opposite of an advice machine. It refracts instead of decides."
4. **Live demo (§3):** do the 60-second path. Let the product talk.
5. **Insight + theme tie-back (§1–2):** "Reflection isn't getting an answer. It's seeing yourself
   from the outside. That's the theme, and that's literally what the prism does."
6. **Close:** what you learned building it (below).

**Process & what you ran into (judges explicitly ask for this — be honest):**
>> YOUR TRUTH (3–5 bullets). Real candidates from this build:
>>  • Started as "AI journaling," realized that was generic — pivoted to *refraction through
>>    perspectives*, which made the theme literal.
>>  • Hardest design call: making the AI *not* give advice. Took specific prompt rules
>>    (no "you should", reflect-and-question only) to stop it from collapsing into a single answer.
>>  • Security: moved the API key off the browser into a serverless function so it's actually
>>    deployable, not just a demo.
>>  • The voices had to sound like *me reflecting*, not a chatbot. The rule that mattered most
>>    ended up being "reflect and question — never judge, never instruct" (so it feels *seen, not
>>    judged*). Getting four lenses to genuinely disagree instead of agreeing politely was the hard part.
>>  • [add ONE real thing: a bug you hit, a dead-end you backed out of, or what you'd build next.]

---

### One-paragraph version (for a submission form, ~120 words)
> Prism is a reflection tool that does the opposite of an advice app. You describe what's weighing
> on you, and instead of handing back one answer, it refracts your situation — like white light
> through a prism — into several honest perspectives: your future self, a mentor, a skeptic, your
> own values. Each gives you a short reflection and one sharp question, and a synthesis names the
> tension running underneath them. It never tells you what to do. I built it because reflection is
> how I've always thought — when something weighs on me I argue with myself in different voices —
> and I wanted a tool that gives those voices names and reflects me back without judging me for the
> mess of it. The theme is "reflection," and Prism means it both ways at once:
> light refracting through glass, and the act of finally seeing yourself from the outside. Built
> with Claude Opus 4.8, Vercel, and Supabase.
