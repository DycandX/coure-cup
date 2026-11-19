// Browser check of the QR-first screening flow against a production build.
// Usage: npm run build && node scripts/e2e-check.mjs
import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";

const PORT = 3101;
// Usage: VIEWPORT=1440x900 node scripts/e2e-check.mjs   (default 390x780, a phone)
const [VW, VH] = (process.env.VIEWPORT ?? "390x780").split("x").map(Number);
const PHONE = VW < 768;
const BASE = `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
};

// Refuse to run against a stale server left on the port: it would test some other build.
try {
  await fetch(BASE);
  console.error(`Port ${PORT} is already in use; stop that server first so this build is the one under test.`);
  process.exit(2);
} catch {}

const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  shell: process.platform === "win32",
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await sleep(500);
}

const browser = await chromium.launch();
try {
  const newPage = async () => {
    const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, isMobile: PHONE, hasTouch: PHONE });
    const page = await ctx.newPage();
    return page;
  };
  const main = (page) => page.locator("main");
  const click = async (page, loc) => {
    await loc.click();
    await sleep(450);
  };
  const next = (page, name = /^(Next|Lanjut)$/) => click(page, main(page).getByRole("button", { name }));

  const step1 = async (page, over = {}) => {
    await main(page).getByRole("checkbox").first().check();
    const groups = main(page).getByRole("radiogroup");
    for (let i = 0; i < 6; i++) await groups.nth(i).getByRole("radio").nth(over[i] ?? 1).click(); // 0 = Yes, 1 = No
    await next(page);
  };
  const type = async (page, i, v) => {
    const f = main(page).locator("input[type=text]").nth(i);
    await f.fill(v);
  };
  const step2 = async (page, { bp = true } = {}) => {
    // age, height, weight, waist, then bp (4 fields)
    await type(page, 0, "45");
    await main(page).getByRole("radio", { name: "Female" }).click();
    await type(page, 1, "160");
    await type(page, 2, "62");
    await type(page, 3, "82");
    await main(page).getByText("Family: high blood pressure or stroke").click();
    if (bp) {
      await type(page, 4, "138");
      await type(page, 5, "88");
      await type(page, 6, "138");
      await type(page, 7, "88");
    }
    await next(page);
  };
  const step3 = async (page, freqs) => {
    await main(page).getByText("Headache or a heavy neck").click();
    const groups = main(page).getByRole("radiogroup");
    for (let i = 0; i < 10; i++) await groups.nth(i).getByRole("radio").nth(freqs[i]).click();
    await next(page, /See result|Lihat hasil/);
  };
  const saltyFoods = [3, 2, 2, 1, 1, 1, 1, 2, 2, 2];
  const neutralFoods = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2];
  const text = (page) => main(page).innerText();
const noOverflow = async (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

  // 1. QR page opens on the screening, English by default
  let page = await newPage();
  await page.goto(`${BASE}/cup/l`);
  await sleep(1200);
  check("EN default and scanned cup shown", /You scanned L-CUP/.test(await page.locator("header").innerText()));
  check("opens on wizard (consent step)", /Data consent/.test(await text(page)));
  check(`no horizontal scroll on QR page (${VW}px)`, await noOverflow(page));
  check("QR page has no demo button", (await page.getByRole("button", { name: "Use demo data" }).count()) === 0);

  // 2. Same input on /cup/l: result S, with the 'differs from scanned cup' note
  await step1(page);
  await step2(page);
  await step3(page, saltyFoods);
  let t = await text(page);
  check("L-CUP page, salty profile -> S-CUP", /S-CUP/.test(t));
  check("shows scanned-vs-result note", /You scanned L-CUP, but your profile points more towards S-CUP/.test(t), t.slice(0, 300));
  check("no horizontal scroll on result", await noOverflow(page));
  check("shows ML-ready/rule-based line", /Rule-based \(WHO thresholds\), ML-ready/.test(t));
  check("shows disclaimer", /Decision-support tool, not a diagnosis\./.test(await page.locator("body").innerText()));
  // "See product" opens the suggested cup's info on the same page (not a fresh consent step)
  await click(page, main(page).getByRole("button", { name: "See product" }));
  const aboutTab = page.getByRole("tab", { name: /About S-CUP/ });
  t = await page.locator("main").innerText();
  check(
    "See product -> About S-CUP tab with product info",
    (await aboutTab.getAttribute("aria-selected")) === "true" && /Savoury flavour from oyster mushroom/.test(t),
    t.slice(0, 200),
  );

  // 3. Matching cup
  page = await newPage();
  await page.goto(`${BASE}/cup/s`);
  await sleep(1200);
  await step1(page);
  await step2(page);
  await step3(page, saltyFoods);
  t = await text(page);
  check("S-CUP page, salty profile -> same-cup note", /You scanned S-CUP, and your profile also points to this module/.test(t), t.slice(0, 300));

  // 4. Emergency answer exits after step 1
  page = await newPage();
  await page.goto(`${BASE}/cup/m`);
  await sleep(1200);
  await step1(page, { 0: 0 });
  t = await text(page);
  check("emergency symptom -> consult, no module", /Please consult a health professional/.test(t) && !/S-CUP|L-CUP|M-CUP/.test(t.replace(/.*Result/s, "")), t.slice(0, 300));

  // 5. Neutral answers -> no clear priority
  page = await newPage();
  await page.goto(`${BASE}/cup/m`);
  await sleep(1200);
  await step1(page);
  await type(page, 0, "40");
  await main(page).getByRole("radio", { name: "Male", exact: true }).click();
  await type(page, 1, "172");
  await type(page, 2, "65");
  await type(page, 3, "80");
  await next(page);
  const groups = main(page).getByRole("radiogroup");
  for (let i = 0; i < 10; i++) await groups.nth(i).getByRole("radio").nth(neutralFoods[i]).click();
  await next(page, /See result/);
  t = await text(page);
  check("neutral answers -> no clear priority, no forced module", /No clear priority/.test(t) && !/Formulation priority/.test(t), t.slice(0, 300));

  // 5b. Glucose pointer also appears on a "no clear priority" result
  page = await newPage();
  await page.goto(`${BASE}/cup/m`);
  await sleep(1200);
  await step1(page);
  await type(page, 0, "40");
  await main(page).getByRole("radio", { name: "Male", exact: true }).click();
  await type(page, 1, "172");
  await type(page, 2, "65");
  await type(page, 3, "80");
  await next(page);
  for (const label of ["Frequent thirst", "Frequent urination", "Unexplained weight loss"]) await main(page).getByText(label).click();
  const g5 = main(page).getByRole("radiogroup");
  for (let i = 0; i < 10; i++) await g5.nth(i).getByRole("radio").nth(neutralFoods[i]).click();
  await next(page, /See result/);
  t = await text(page);
  check("no clear priority still shows the blood-sugar pointer", /No clear priority/.test(t) && /blood sugar check/.test(t), t.slice(0, 300));

  // 6. Single blood pressure reading is rejected
  page = await newPage();
  await page.goto(`${BASE}/cup/s`);
  await sleep(1200);
  await step1(page);
  await type(page, 0, "45");
  await main(page).getByRole("radio", { name: "Female" }).click();
  await type(page, 1, "160");
  await type(page, 2, "62");
  await type(page, 3, "82");
  await type(page, 4, "138");
  await next(page);
  check("partial blood pressure -> error, stays on step 2", /fill in both readings/i.test(await text(page)));

  // 7. Demo data and language toggle
  page = await newPage();
  await page.goto(BASE);
  await sleep(1200);
  await click(page, page.getByRole("button", { name: "Start" }));
  await click(page, main(page).getByRole("button", { name: /Check module priority/ }));
  await click(page, main(page).getByRole("button", { name: "Use demo data" }));
  t = await text(page);
  check("demo data -> S-CUP, labelled as demo", /S-CUP/.test(t) && /Demo profile: sample data, not a real person/.test(t), t.slice(0, 200));
  await click(page, page.getByRole("button", { name: /Ganti ke Bahasa Indonesia/ }));
  t = await text(page);
  check("language toggle to Indonesian", /Prioritas formulasi untuk profil Anda: S-CUP/.test(t), t.slice(0, 200));

  // 8. About tab still reachable and keeps sodium facts
  page = await newPage();
  await page.goto(`${BASE}/cup/m`);
  await sleep(1200);
  await click(page, page.getByRole("tab", { name: /About M-CUP/ }));
  t = await page.locator("main").innerText();
  check("About tab shows estimate label", /estimate/i.test(t));
  check("no horizontal scroll on About tab", await noOverflow(page));

  // 9. /about page: ML notice, poster viewer opens, Escape closes and returns focus
  page = await newPage();
  await page.goto(`${BASE}/about`);
  await sleep(1200);
  t = await main(page).innerText();
  check("/about shows the rule-based / ML-not-trained notice", /ML model has not been trained yet/.test(t), t.slice(0, 200));
  check("no horizontal scroll on /about", await noOverflow(page));
  const enlarge = page.getByRole("button", { name: "Enlarge poster", exact: true });
  await click(page, enlarge);
  check("poster viewer opens as a dialog", (await page.getByRole("dialog").count()) === 1);
  await page.keyboard.press("Escape");
  await sleep(450);
  const focusedName = await page.evaluate(() => document.activeElement?.textContent?.trim());
  check(
    "Escape closes the viewer and returns focus",
    (await page.getByRole("dialog").count()) === 0 && focusedName === "Enlarge poster",
    String(focusedName),
  );

  // 10. About link is hidden during the wizard (leaving would drop answers)
  page = await newPage();
  await page.goto(BASE);
  await sleep(1200);
  check("About link visible on landing", (await page.getByRole("link", { name: "About" }).count()) === 1);
  await click(page, page.getByRole("button", { name: "Start" }));
  await click(page, main(page).getByRole("button", { name: /Check module priority/ }));
  check("About link hidden in the wizard", (await page.getByRole("link", { name: "About" }).count()) === 0);
} finally {
  await browser.close();
  // Wait for taskkill: process.exit() below would otherwise leave next start running on the port.
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

