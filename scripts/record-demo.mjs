// Records a step-by-step walkthrough of the CUORE web app with Playwright, with a caption on
// screen for every step, one screenshot per step and a steps.json with approximate timestamps.
//
// Usage:  npm run build && npm run demo            (phone, 390x780, portrait)
//         npm run build && npm run demo -- desktop (1280x720, landscape, for a projector)
//
// Output (deliverables/ is git-ignored):
//   deliverables/CUORE_demo_<mode>.webm and .mp4 (mp4 only when ffmpeg is on the PATH)
//   deliverables/demo-steps-<mode>/NN-<slug>.png and steps.json
//
// The last step really goes offline: it stops the server it started, so nothing can answer.
import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const MODE = process.argv[2] === "desktop" ? "desktop" : "phone";
const SIZE = MODE === "desktop" ? { width: 1280, height: 720 } : { width: 390, height: 780 };
const TOUCH = MODE === "phone";
const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve("deliverables");
const STEPS_DIR = path.join(OUT_DIR, `demo-steps-${MODE}`);
const TMP_DIR = path.join(OUT_DIR, ".video-tmp");
const CAPTION_H = MODE === "desktop" ? 64 : 92;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Do not record some other server that happens to be on the port.
try {
  await fetch(BASE);
  console.error(`Port ${PORT} is already in use; stop that server first.`);
  process.exit(2);
} catch {}

mkdirSync(STEPS_DIR, { recursive: true });
rmSync(TMP_DIR, { recursive: true, force: true });

const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  shell: process.platform === "win32",
});
const stopServer = () => {
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
};
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await sleep(500);
}

// ---- the steps ---------------------------------------------------------------------------
// Each step has a short title and one line of explanation shown on the video.
const STEPS = [
  ["Scan the QR code on the cup", "Every cup carries a QR code. Scanning it opens this page, straight into the screening."],
  ["Consent and safety check", "Six yes/no safety questions. Any \"Yes\" ends with: consult a health professional."],
  ["Body data and history", "Waist OR height and weight is enough. Blood pressure is optional: two readings."],
  ["Complaints and eating pattern", "Ten short questions about what you eat. Answers stay on the device."],
  ["The result", "A priority module with 1-2 reasons. Rule-based, ML-ready. A decision aid, not a diagnosis."],
  ["Product information", "One tap from the result to the cup: ingredients, estimated nutrition and points to note."],
  ["English and Indonesian", "The whole app switches language with one button."],
  ["Safety comes first", "A \"Yes\" on a safety question stops the screening: no module is suggested."],
  ["Ask CUORE on the cup page", "Rule-based Q&A, no free-form AI. It knows which cup was scanned. Claims get a fixed answer."],
  ["Emergency messages", "Words like \"chest pain\" always get the emergency message (119 / 112), never product talk."],
  ["What is a CUORE cup?", "35 g Universal Base + one 20 g module = 55 g. Three modules: S, M and L."],
  ["Learn and Products", "Short education cards and the three cups, each with its own colour."],
  ["Ask CUORE from anywhere", "The floating button opens the same Q&A on every page, with quick questions."],
  ["About, poster and model card", "The scientific poster, and a one-page model card: what the rules are, and what does not exist yet."],
  ["Works offline", "Server stopped and network off: after one visit the app still opens and the screening still works."],
];
const TOTAL = STEPS.length;

// ---- recording ---------------------------------------------------------------------------
let browser;
const log = [];
try {
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 2,
    isMobile: TOUCH,
    hasTouch: TOUCH,
    recordVideo: { dir: TMP_DIR, size: SIZE },
  });
  const t0 = Date.now();
  const page = await context.newPage();
  const main = page.locator("main");
  const dialog = () => page.getByRole("dialog");
  let current = 0;

  // Caption bar on top of the page; the page is pushed down so the bar never covers the app.
  const caption = async () => {
    const [title, note] = STEPS[current - 1];
    await page.evaluate(
      ({ n, total, title, note, h }) => {
        let el = document.getElementById("demo-caption");
        if (!el) {
          const style = document.createElement("style");
          style.textContent =
            `html{padding-top:${h}px !important}` +
            // Dialogs are fixed to the window: keep them below the caption bar instead of under it.
            `[role="dialog"]{margin-top:${h}px !important}` +
            // The full-screen poster viewer already fills the window, so only panels get a height limit.
            `[role="dialog"]:not([aria-label*="poster" i]){max-height:calc(100dvh - ${h + 16}px) !important}` +
            "#demo-caption{position:fixed;top:0;left:0;right:0;z-index:2147483647;box-sizing:border-box;" +
            `height:${h}px;padding:8px 14px;background:#1d1417;color:#fff;font:600 14px/1.3 system-ui,sans-serif;` +
            "pointer-events:none;overflow:hidden}" +
            "#demo-caption small{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#f0b8c0}" +
            "#demo-caption span{display:block;font-weight:400;font-size:12px;opacity:.92;margin-top:2px}";
          document.head.appendChild(style);
          el = document.createElement("div");
          el.id = "demo-caption";
          document.documentElement.appendChild(el);
        }
        el.textContent = "";
        const s = document.createElement("small");
        s.textContent = `Step ${n} of ${total}`;
        const b = document.createElement("div");
        b.textContent = title;
        const sp = document.createElement("span");
        sp.textContent = note;
        el.append(s, b, sp);
      },
      { n: current, total: TOTAL, title, note, h: CAPTION_H },
    );
  };
  const begin = async (n) => {
    current = n;
    log.push({ step: n, title: STEPS[n - 1][0], note: STEPS[n - 1][1], at: Math.round((Date.now() - t0) / 1000) });
    await caption();
  };
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const snap = async (suffix = "") => {
    const file = `${String(current).padStart(2, "0")}-${slug(STEPS[current - 1][0])}${suffix}.png`;
    await page.screenshot({ path: path.join(STEPS_DIR, file) });
    log[log.length - 1].screenshot = log[log.length - 1].screenshot ?? file;
  };
  const go = async (url) => {
    await page.goto(url);
    await sleep(1800);
    await caption();
  };
  const tap = async (locator, pause = 1100) => {
    await locator.scrollIntoViewIfNeeded();
    if (TOUCH) await locator.tap();
    else await locator.click();
    await sleep(pause);
  };
  const typeInto = async (locator, value) => {
    await locator.scrollIntoViewIfNeeded();
    if (TOUCH) await locator.tap();
    else await locator.click();
    await page.keyboard.type(value, { delay: 60 });
  };
  const field = (i) => main.locator("input[type=text]").nth(i);
  const scroll = async (dy, pause = 1500) => {
    await page.mouse.wheel(0, dy);
    await sleep(pause);
  };

  // 1 ----------------------------------------------------------------------------------
  await begin(1);
  await go(`${BASE}/cup/m`);
  await sleep(2200);
  await snap();

  // 2 ----------------------------------------------------------------------------------
  await begin(2);
  await tap(main.getByRole("checkbox").first(), 900);
  const safety = main.getByRole("radiogroup");
  for (let i = 0; i < 6; i++) await tap(safety.nth(i).getByRole("radio").nth(1), 300);
  await snap();
  await tap(main.getByRole("button", { name: "Next" }));

  // 3 ----------------------------------------------------------------------------------
  await begin(3);
  await typeInto(field(0), "45");
  await tap(main.getByRole("radio", { name: "Female" }), 500);
  await typeInto(field(1), "160");
  await typeInto(field(2), "62");
  await typeInto(field(3), "82");
  await sleep(1300); // BMI appears
  await tap(main.getByText("Family: high blood pressure or stroke"), 800);
  await typeInto(field(4), "138");
  await typeInto(field(5), "88");
  await typeInto(field(6), "138");
  await typeInto(field(7), "88");
  await snap();
  await tap(main.getByRole("button", { name: "Next" }));

  // 4 ----------------------------------------------------------------------------------
  await begin(4);
  await tap(main.getByText("Headache or a heavy neck"), 700);
  const food = main.getByRole("radiogroup");
  const answers = [3, 2, 2, 1, 1, 1, 1, 2, 2, 2];
  for (let i = 0; i < answers.length; i++) await tap(food.nth(i).getByRole("radio").nth(answers[i]), 280);
  await snap();
  await tap(main.getByRole("button", { name: "See result" }), 2600);

  // 5 ----------------------------------------------------------------------------------
  await begin(5);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(1800);
  await snap();
  await scroll(450, 2200);
  await snap("-reasons");
  await scroll(500, 2000);

  // 6 ----------------------------------------------------------------------------------
  await begin(6);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(600);
  await tap(main.getByRole("button", { name: "See product" }), 1600);
  await snap();
  await scroll(500, 1800);
  await scroll(600, 1800);

  // 7 ----------------------------------------------------------------------------------
  await begin(7);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(500);
  await tap(page.getByRole("button", { name: /Ganti ke Bahasa Indonesia/ }), 2400);
  await snap();
  await tap(page.getByRole("button", { name: /Switch to English/ }), 1500);

  // 8 ----------------------------------------------------------------------------------
  await begin(8);
  await go(`${BASE}/cup/s`);
  await tap(main.getByRole("checkbox").first(), 700);
  // All six questions must be answered: "Yes" to the first (symptoms needing urgent care), "No" to the rest.
  const unsafe = main.getByRole("radiogroup");
  await tap(unsafe.first().getByRole("radio").first(), 900);
  for (let i = 1; i < 6; i++) await tap(unsafe.nth(i).getByRole("radio").nth(1), 250);
  await tap(main.getByRole("button", { name: "Next" }), 2600);
  await snap();

  // 9 ----------------------------------------------------------------------------------
  await begin(9);
  await go(`${BASE}/cup/l`);
  await tap(page.getByRole("tab", { name: "Ask" }), 1200);
  await tap(main.getByRole("button", { name: "Allergens and points to note" }), 2600);
  await snap();
  await typeInto(main.getByLabel("Your question"), "does it lower cholesterol");
  await sleep(600);
  await tap(main.getByRole("button", { name: "Send", exact: true }), 2800);
  await snap("-claim");

  // 10 ---------------------------------------------------------------------------------
  await begin(10);
  await typeInto(main.getByLabel("Your question"), "my chest hurts");
  await sleep(600);
  await tap(main.getByRole("button", { name: "Send", exact: true }), 3200);
  await snap();

  // 11 ---------------------------------------------------------------------------------
  await begin(11);
  await go(BASE);
  await tap(page.getByRole("button", { name: "Start" }), 1200);
  await tap(main.getByRole("button", { name: /What is a CUORE cup/ }), 2200);
  await snap();
  await dialog().evaluate((d) => d.querySelector(".overflow-y-auto")?.scrollTo({ top: 450, behavior: "smooth" }));
  await sleep(2200);
  await dialog().evaluate((d) => d.querySelector(".overflow-y-auto")?.scrollTo({ top: 1100, behavior: "smooth" }));
  await sleep(2200);
  await snap("-modules");
  await tap(dialog().getByRole("button", { name: "Close" }), 800);

  // 12 ---------------------------------------------------------------------------------
  await begin(12);
  await tap(main.getByRole("button", { name: /Learn/ }), 1500);
  await tap(main.getByRole("button", { name: /Sodium/ }), 2400);
  await snap();
  await tap(dialog().getByRole("button", { name: "Close" }), 600);
  await page.goBack();
  await sleep(1000);
  await caption();
  await tap(main.getByRole("button", { name: /Products/ }), 1500);
  await tap(main.getByRole("button", { name: /S-CUP/ }), 2400);
  await snap("-products");
  await tap(dialog().getByRole("button", { name: "Close" }), 600);
  await page.goBack();
  await sleep(800);
  await caption();

  // 13 ---------------------------------------------------------------------------------
  await begin(13);
  await tap(page.getByRole("button", { name: "Ask CUORE" }), 1500);
  await tap(dialog().getByRole("button", { name: "How to prepare" }), 2800);
  await snap();
  await tap(dialog().getByRole("button", { name: "Close" }), 700);

  // 14 ---------------------------------------------------------------------------------
  await begin(14);
  await go(`${BASE}/about`);
  await scroll(700, 1600);
  await scroll(700, 1400);
  await snap();
  await tap(page.getByRole("button", { name: "Enlarge poster", exact: true }), 2200);
  await snap("-poster");
  await page.keyboard.press("Escape");
  await sleep(700);
  await tap(main.getByRole("link", { name: /View the model card/ }), 1800);
  await caption();
  await scroll(600, 1800);
  await scroll(700, 1800);
  await snap("-model-card");

  // 15 ---------------------------------------------------------------------------------
  await begin(15);
  await go(`${BASE}/cup/s`);
  // Wait until the service worker has stored the pages, then take the network away for real.
  for (let i = 0; i < 40; i++) {
    const ready = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (!reg?.active) return false;
      const names = (await caches.keys()).filter((k) => k.startsWith("cuore-"));
      return names.length > 0 && (await (await caches.open(names[0])).keys()).length >= 6;
    });
    if (ready) break;
    await sleep(500);
  }
  await sleep(1500);
  stopServer();
  await context.setOffline(true);
  await page.reload();
  await sleep(2000);
  await caption();
  await snap();
  await tap(main.getByRole("checkbox").first(), 800);
  const offSafety = main.getByRole("radiogroup");
  for (let i = 0; i < 6; i++) await tap(offSafety.nth(i).getByRole("radio").nth(1), 250);
  await tap(main.getByRole("button", { name: "Next" }), 1500);
  await snap("-wizard");
  // On a cup page the chat is the "Ask" tab (there is no floating button there).
  await tap(page.getByRole("tab", { name: "Ask" }), 1200);
  await tap(main.getByRole("button", { name: "Allergens and points to note" }), 2800);
  await snap("-chat");

  const video = page.video();
  await context.close(); // flushes the video
  const tmpPath = await video.path();
  const base = path.join(OUT_DIR, `CUORE_demo_${MODE}`);
  rmSync(`${base}.webm`, { force: true });
  renameSync(tmpPath, `${base}.webm`);
  console.log("saved", `${base}.webm`);

  writeFileSync(
    path.join(STEPS_DIR, "steps.json"),
    JSON.stringify({ mode: MODE, viewport: SIZE, note: "`at` is seconds from the start of the recording, approximate.", steps: log }, null, 2),
  );

  const ff = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${base}.webm`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", `${base}.mp4`]);
  console.log(ff.status === 0 ? `saved ${base}.mp4` : "ffmpeg not available: kept the .webm only");
} finally {
  await browser?.close();
  stopServer();
  // Windows can keep the video file locked for a moment; never let cleanup hide the real error.
  try {
    rmSync(TMP_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
  } catch (err) {
    console.warn(`could not remove ${TMP_DIR}: ${err.code}`);
  }
}
