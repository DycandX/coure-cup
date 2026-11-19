// Records a scripted walkthrough of the CUORE web app with Playwright.
// Flow: scan QR on a cup (/cup/m) -> consent -> body & history -> complaints & eating -> result,
// then the cup info tab, language switch, and the in-app home (education + products).
// Usage: npm run build && npm run demo   (starts `next start` itself on port 3100)
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve("deliverables");
const TMP_DIR = path.resolve("deliverables/.video-tmp");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error("server did not start");
}

mkdirSync(OUT_DIR, { recursive: true });
rmSync(TMP_DIR, { recursive: true, force: true });

const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  shell: process.platform === "win32",
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 780 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: TMP_DIR, size: { width: 390, height: 780 } },
  });
  const page = await context.newPage();
  const main = page.locator("main");
  const tap = async (locator, pause = 1300) => {
    await locator.scrollIntoViewIfNeeded();
    await locator.tap();
    await sleep(pause);
  };
  const typeInto = async (i, value) => {
    const f = main.locator("input[type=text]").nth(i);
    await f.scrollIntoViewIfNeeded();
    await f.tap();
    await page.keyboard.type(value, { delay: 70 });
  };

  // 1. "Scan" the M-CUP QR code: the page opens straight into the screening
  await page.goto(`${BASE}/cup/m`);
  await sleep(2200);

  // Step 1: consent + safety (all "No")
  await tap(main.getByRole("checkbox").first(), 900);
  const safety = main.getByRole("radiogroup");
  for (let i = 0; i < 6; i++) await tap(safety.nth(i).getByRole("radio").nth(1), 250);
  await tap(main.getByRole("button", { name: "Next" }));

  // Step 2: body data, history, optional blood pressure
  await typeInto(0, "45");
  await tap(main.getByRole("radio", { name: "Female" }), 500);
  await typeInto(1, "160");
  await typeInto(2, "62");
  await typeInto(3, "82");
  await sleep(1200); // BMI appears automatically
  await tap(main.getByText("Family: high blood pressure or stroke"), 800);
  await typeInto(4, "138");
  await typeInto(5, "88");
  await typeInto(6, "138");
  await typeInto(7, "88");
  await tap(main.getByRole("button", { name: "Next" }));

  // Step 3: complaints + eating pattern (salty / packaged heavy)
  await tap(main.getByText("Headache or a heavy neck"), 700);
  const answers = [3, 2, 2, 1, 1, 1, 1, 2, 2, 2];
  const food = main.getByRole("radiogroup");
  for (let i = 0; i < answers.length; i++) await tap(food.nth(i).getByRole("radio").nth(answers[i]), 260);
  await tap(main.getByRole("button", { name: "See result" }), 3200);

  // Result differs from the scanned cup; switch language
  await tap(page.getByRole("button", { name: /Ganti ke Bahasa Indonesia/ }), 2500);
  await tap(page.getByRole("button", { name: /Switch to English/ }), 1200);

  // Cup info tab
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(900);
  await tap(page.getByRole("tab", { name: /About M-CUP/ }), 1500);
  await page.mouse.wheel(0, 900);
  await sleep(1800);

  // 2. In-app home: education sheet and products
  await page.goto(BASE);
  await sleep(1500);
  await tap(page.getByRole("button", { name: "Start" }));
  await tap(main.getByRole("button", { name: /Learn/ }));
  await tap(main.getByRole("button", { name: /Sodium/ }), 2200);
  await tap(page.getByRole("dialog").getByRole("button", { name: "Close" }));
  await page.goBack();
  await sleep(1000);
  await tap(main.getByRole("button", { name: /Products/ }));
  await sleep(1800);

  const video = page.video();
  await context.close(); // flushes the video
  const tmpPath = await video.path();
  const finalPath = path.join(OUT_DIR, "CUORE_demo.webm");
  rmSync(finalPath, { force: true });
  renameSync(tmpPath, finalPath);
  console.log("saved", finalPath);
} finally {
  await browser?.close();
  if (process.platform === "win32") spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
  rmSync(TMP_DIR, { recursive: true, force: true });
}
