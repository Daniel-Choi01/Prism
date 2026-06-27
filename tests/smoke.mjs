/**
 * Prism — end-to-end smoke suite.
 *
 * Opens the real index.html in a headless browser and exercises every major
 * surface, asserting there are no runtime errors and that each feature behaves.
 * Runs against the static file (file://), so the /api/* calls fall back to
 * example mode — exactly the offline experience a first-time visitor sees.
 *
 *   npm install            # installs playwright (dev dep)
 *   npx playwright install chromium
 *   npm test               # runs this suite
 *
 * Exit code is non-zero if any assertion fails, so it drops cleanly into CI.
 */

import { pathToFileURL } from "url";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = join(__dirname, "..", "index.html");
const URL = pathToFileURL(INDEX).href;

// Resolve a browser: prefer the full `playwright` (manages its own browser);
// fall back to `playwright-core` + PRISM_CHROMIUM=<path-to-chrome> for CI images
// that cache the binary separately.
let chromium, launchOpts = { headless: true };
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import("playwright-core"));
  if (process.env.PRISM_CHROMIUM) launchOpts.executablePath = process.env.PRISM_CHROMIUM;
}

/* ---------- tiny test harness ---------- */
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
  const tag = pass ? "  ok  " : " FAIL ";
  console.log(`[${tag}] ${name}${pass || detail == null ? "" : "  → " + detail}`);
}
// Errors that are inherent to running from file:// (no backend) — not real bugs.
const IGNORABLE = /\/api\/|ERR_FAILED|CORS|Access to fetch|Failed to load resource/i;

const browser = await chromium.launch(launchOpts);

async function freshPage(asGuest = true) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(["microphone"]).catch(() => {});
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !IGNORABLE.test(m.text())) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  if (asGuest) {
    await page.evaluate(() => localStorage.setItem("prism_identity", JSON.stringify({ mode: "guest", since: Date.now() })));
    await page.evaluate(() => localStorage.setItem("prism_onboarded", "1"));
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  await page.waitForTimeout(350);
  return { ctx, page, errors };
}

try {
  /* ===== 1. Welcome / login gate ===== */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    check("welcome gate shows on first load", await page.locator("#welcome").evaluate((el) => el.classList.contains("show")));
    check("guest + google + anon buttons present",
      (await page.locator("#wcGuest").count()) === 1 &&
      (await page.locator("#wcGoogle").count()) === 1 &&
      (await page.locator("#wcAnon").count()) === 1);
    await page.locator("#wcGuest").click();
    await page.waitForTimeout(300);
    check("guest entry dismisses the gate", await page.locator("#welcome").evaluate((el) => !el.classList.contains("show")));
    check("no page errors at boot", errs.length === 0, errs.join("; "));
    await ctx.close();
  }

  /* ===== 2. Core conversation (example mode) ===== */
  {
    const { ctx, page, errors } = await freshPage();
    await page.locator("#situation").fill("I keep saying yes to things I do not want to do and I am exhausted.");
    await page.locator("#refractBtn").click();
    await page.waitForSelector("#result.show", { timeout: 8000 });
    await page.waitForTimeout(300);
    check("reflect produces a conversation", (await page.locator("#convo .turn").count()) === 2);
    await page.locator("#replyText").fill("I think I'm scared people will be disappointed in me.");
    await page.locator("#replySend").click();
    await page.waitForTimeout(1600);
    check("reply extends the conversation", (await page.locator("#convo .turn").count()) === 4);
    await page.locator("#deeperBtn").click();
    await page.waitForTimeout(400);
    check("save reports success", /saved/i.test(await page.locator("#deeperBtn").textContent()));
    await page.locator("#exportBtn").click();
    await page.waitForTimeout(200);
    check("download reflection as markdown", /downloaded/i.test(await page.locator("#exportBtn").textContent()));
    check("conversation flow: no errors", errors.length === 0, errors.join("; "));
    await ctx.close();
  }

  /* ===== 3. Distress detection escalates ===== */
  {
    const { ctx, page } = await freshPage();
    await page.locator("#situation").fill("I don't want to be alive anymore.");
    await page.locator("#refractBtn").click();
    await page.waitForSelector("#result.show", { timeout: 8000 });
    await page.waitForTimeout(300);
    check("distress surfaces the crisis care panel",
      await page.locator("#carePanel").evaluate((el) => el.classList.contains("show") && el.classList.contains("crisis")));
    await ctx.close();
  }

  /* ===== 4. Tabs + journal + check-in ===== */
  {
    const { ctx, page, errors } = await freshPage();
    for (const v of ["checkin", "journal", "encourage", "wisdom", "reflect"]) {
      await page.locator(`#tabs .tab[data-view="${v}"]`).click();
      await page.waitForTimeout(120);
    }
    check("all five tabs switch without error", errors.length === 0, errors.join("; "));

    // journal reflect (example mode)
    await page.locator(`#tabs .tab[data-view="journal"]`).click();
    await page.waitForTimeout(150);
    await page.locator("#jrConsent").click();
    await page.locator("#jrText").fill("Today felt heavy. I was overwhelmed but I kept going.");
    await page.locator("#jrReflect").click();
    await page.waitForTimeout(1500);
    check("journal reflection renders the mirror", (await page.locator("#jrInsight .jr-mirror").count()) > 0);

    // journal prompt library
    await page.locator("#jrPromptBtn").click();
    await page.waitForTimeout(80);
    const p1 = await page.locator("#jrPromptText").textContent();
    await page.locator("#jrPromptNext").click();
    await page.waitForTimeout(60);
    const p2 = await page.locator("#jrPromptText").textContent();
    check("journal prompts reveal and cycle", p1 && p2 && p1 !== p2);

    // check-in
    await page.locator(`#tabs .tab[data-view="checkin"]`).click();
    await page.waitForTimeout(150);
    await page.locator('#moodPicker .mood-opt[data-mood="3"]').click();
    await page.locator("#ciWord").fill("steady");
    await page.locator("#ciSave").click();
    await page.waitForTimeout(200);
    check("check-in saves to localStorage",
      (await page.evaluate(() => JSON.parse(localStorage.getItem("prism_checkins") || "[]").length)) === 1);
    check("tabs/journal/check-in: no errors", errors.length === 0, errors.join("; "));
    await ctx.close();
  }

  /* ===== 4c. Check-in streak summary (seeded) ===== */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const day = 86400000, now = Date.now();
      localStorage.setItem("prism_identity", JSON.stringify({ mode: "guest", since: now }));
      localStorage.setItem("prism_onboarded", "1");
      localStorage.setItem("prism_checkins", JSON.stringify([
        { when: now, mood: 3, word: "", grateful: "" },
        { when: now - day, mood: 2, word: "", grateful: "" },
        { when: now - 2 * day, mood: 4, word: "", grateful: "" },
      ]));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.locator('#tabs .tab[data-view="checkin"]').click();
    await page.waitForTimeout(200);
    check("check-in streak + average summary renders", /streak|averaged/i.test(await page.locator("#ciSummary").textContent()));
    await ctx.close();
  }

  /* ===== 5. Patterns mood-over-time (seeded history) ===== */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const day = 86400000, now = Date.now();
      localStorage.setItem("prism_identity", JSON.stringify({ mode: "guest", since: now }));
      localStorage.setItem("prism_onboarded", "1");
      const mk = (o, s, l) => ({ id: "local-" + o, when: now - o * day, situation: s, turns: [{ role: "you", text: s }], care: { level: l } });
      localStorage.setItem("prism_history", JSON.stringify([
        mk(1, "work feels lighter now, I feel proud and connected", "none"),
        mk(6, "a calm, grateful day — hopeful about things", "none"),
        mk(13, "work is hard but I am trying to cope", "none"),
        mk(22, "so anxious and overwhelmed and lost lately", "struggling"),
      ]));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.locator("#historyBtn").click();
    await page.waitForTimeout(300);
    check("patterns: mood chart renders", (await page.locator("#patternsBox .pat-mood svg").count()) === 1);
    check("patterns: one dot per reflection", (await page.locator("#patternsBox .pat-mood circle").count()) === 4);
    check("patterns: theme bars render", (await page.locator("#patternsBox .pat-bar").count()) >= 1);
    check("patterns: trend read present", (await page.locator("#patternsBox .pat-mood-read").textContent()).length > 10);
    await page.locator("#writeLetter").click();
    await page.waitForTimeout(1500);   // example fallback when offline
    check("patterns: a letter renders", (await page.locator("#letterBox .letter-body").count()) > 0);
    await ctx.close();
  }

  /* ===== 5b. Reflections search ===== */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const day = 86400000, now = Date.now();
      localStorage.setItem("prism_identity", JSON.stringify({ mode: "guest", since: now }));
      localStorage.setItem("prism_onboarded", "1");
      const mk = (o, s) => ({ id: "local-" + o, when: now - o * day, situation: s, turns: [{ role: "you", text: s }], care: { level: "none" } });
      localStorage.setItem("prism_history", JSON.stringify([
        mk(1, "work deadline stress"), mk(2, "a fight with my brother"), mk(3, "work feels better"),
        mk(4, "sleep has been rough"), mk(5, "thinking about work again"),
      ]));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.locator("#historyBtn").click();
    await page.waitForTimeout(300);
    const total = await page.locator("#histList .hist-item").count();
    check("reflections search appears once there's history", await page.locator("#histSearch").isVisible());
    await page.locator("#histSearch").fill("work");
    await page.waitForTimeout(150);
    const filtered = await page.locator("#histList .hist-item").count();
    check("reflections search filters", total === 5 && filtered === 3, `total ${total}, filtered ${filtered}`);
    await ctx.close();
  }

  /* ===== 6. Settings persist across reload (no flash) ===== */
  {
    const { ctx, page } = await freshPage();
    await page.locator("#settingsBtn").click();
    await page.waitForTimeout(150);
    await page.locator('#setText button[data-text="large"]').click();
    await page.locator('#setMotion button[data-motion="reduce"]').click();
    await page.locator('#setTheme button[data-theme="ember"]').click();
    check("appearance theme applies live",
      (await page.evaluate(() => document.documentElement.getAttribute("data-theme"))) === "ember");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    check("text-size setting persists",
      (await page.evaluate(() => document.documentElement.getAttribute("data-text"))) === "large");
    check("reduce-motion setting persists",
      (await page.evaluate(() => document.documentElement.getAttribute("data-motion"))) === "reduce");
    check("appearance theme persists",
      (await page.evaluate(() => document.documentElement.getAttribute("data-theme"))) === "ember");
    await ctx.close();
  }

  /* ===== 7. Calm tools: breathing + grounding ===== */
  {
    const { ctx, page, errors } = await freshPage();
    await page.locator("#breatheFab").click();
    await page.waitForTimeout(150);
    const s1 = await page.locator("#bxOrb").evaluate((el) => el.style.transform);
    await page.waitForTimeout(800);
    const s2 = await page.locator("#bxOrb").evaluate((el) => el.style.transform);
    check("breathing orb animates", s1 !== s2, `${s1} -> ${s2}`);
    await page.locator("#calmTabGround").click();
    await page.waitForTimeout(120);
    check("grounding tab shows 5-4-3-2-1", (await page.locator("#grNum").textContent()) === "5");
    await page.locator("#grNext").click();
    await page.waitForTimeout(80);
    check("grounding advances", (await page.locator("#grNum").textContent()) === "4");
    await page.locator("#calmTabBreathe").click();
    await page.waitForTimeout(80);
    await page.locator('#bxPattern button[data-pat="relax"]').click();
    check("breathing rhythm switches", (await page.locator('#bxPattern button[data-pat="relax"]').getAttribute("aria-pressed")) === "true");
    await page.keyboard.press("Escape");
    check("calm tools: no errors", errors.length === 0, errors.join("; "));
    await ctx.close();
  }

  /* ===== 8. "Why Prism" reviewer page ===== */
  {
    const { ctx, page } = await freshPage();
    await page.locator("#whyBtn").click();
    await page.waitForTimeout(150);
    check("why modal opens", await page.locator("#whyModal").evaluate((el) => el.classList.contains("show")));
    check("why modal renders the comparison table", (await page.locator("#whyModal .cmp .cmp-c").count()) === 10);
    await ctx.close();
  }

  /* ===== 8b. Keyboard shortcuts ===== */
  {
    const { ctx, page } = await freshPage();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("?");
    await page.waitForTimeout(150);
    check("'?' opens the shortcuts help", await page.locator("#shortcutsModal").evaluate((el) => el.classList.contains("show")));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
    await page.keyboard.press("c");
    await page.waitForTimeout(150);
    check("'c' jumps to Check-in", await page.locator("#checkin").evaluate((el) => el.classList.contains("show")));
    await page.keyboard.press("b");
    await page.waitForTimeout(150);
    check("'b' opens breathe", await page.locator("#breatheModal").evaluate((el) => el.classList.contains("show")));
    await ctx.close();
  }

  /* ===== 9. Voice input (graceful both ways) ===== */
  {
    // unsupported: API removed before load -> buttons hidden
    const ctxA = await browser.newContext();
    const pa = await ctxA.newPage();
    await pa.addInitScript(() => {
      Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });
    });
    await pa.goto(URL, { waitUntil: "domcontentloaded" });
    await pa.evaluate(() => { localStorage.setItem("prism_identity", JSON.stringify({ mode: "guest", since: Date.now() })); localStorage.setItem("prism_onboarded", "1"); });
    await pa.reload({ waitUntil: "domcontentloaded" });
    await pa.waitForTimeout(350);
    check("voice buttons hidden when unsupported",
      await pa.locator("#micSituation").evaluate((el) => getComputedStyle(el).display === "none"));
    await ctxA.close();

    const { ctx, page } = await freshPage();
    check("voice buttons present when supported", (await page.locator(".voice-btn").count()) === 3);
    await ctx.close();
  }

  /* ===== 10. Responsive header (no overflow on mobile) ===== */
  {
    const { ctx, page } = await freshPage();
    for (const w of [360, 390, 768]) {
      await page.setViewportSize({ width: w, height: 840 });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => {
        const h = document.querySelector("header");
        return h.scrollWidth > h.clientWidth + 1 || document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      check(`no horizontal overflow @ ${w}px`, !overflow);
    }
    await ctx.close();
  }

  /* ===== 11. Onboarding shows once ===== */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    await page.locator("#wcGuest").click();
    await page.waitForTimeout(900);
    check("onboarding tour shows for new users", await page.locator("#onboardModal").evaluate((el) => el.classList.contains("show")));
    await page.locator("#tourSkip").click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    check("onboarding does not repeat", await page.locator("#onboardModal").evaluate((el) => !el.classList.contains("show")));
    await ctx.close();
  }
} catch (err) {
  check("suite ran to completion", false, err.message);
} finally {
  await browser.close();
}

/* ---------- summary ---------- */
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log("FAILED:\n" + failed.map((f) => "  - " + f.name + (f.detail ? " (" + f.detail + ")" : "")).join("\n"));
  process.exit(1);
}
console.log("All Prism smoke checks passed. ✦");
