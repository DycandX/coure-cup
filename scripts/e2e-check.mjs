// Browser check of the QR-first screening flow against a production build.
// Usage: npm run build && node scripts/e2e-check.mjs
// Against a deployed site instead: BASE_URL=https://cuorecup.vercel.app node scripts/e2e-check.mjs
import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";

const PORT = 3101;
// Usage: VIEWPORT=1440x900 node scripts/e2e-check.mjs   (default 390x780, a phone)
const [VW, VH] = (process.env.VIEWPORT ?? "390x780").split("x").map(Number);
const PHONE = VW < 768;
const REMOTE = process.env.BASE_URL?.replace(/\/$/, "");
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
};

// Refuse to run against a stale server left on the port: it would test some other build.
if (!REMOTE) {
  try {
    await fetch(BASE);
    console.error(`Port ${PORT} is already in use; stop that server first so this build is the one under test.`);
    process.exit(2);
  } catch {}
}

const server = REMOTE
  ? null
  : spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", String(PORT)], {
      stdio: "ignore",
      shell: process.platform === "win32",
    });
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await sleep(500);
}

// Wait for taskkill: process.exit() would otherwise leave next start running on the port.
const stopServer = () => {
  if (!server) return; // remote run: nothing was started here
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
};

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  stopServer(); // e.g. Playwright browsers not installed: do not leave the server behind
  throw err;
}
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

  // 6b. Body size: waist alone is enough; height without weight is not (team answer A7)
  page = await newPage();
  await page.goto(`${BASE}/cup/s`);
  await sleep(1200);
  await step1(page);
  await type(page, 0, "45");
  await main(page).getByRole("radio", { name: "Female" }).click();
  await type(page, 3, "82");
  await next(page);
  check("waist without height/weight -> step 3", /Step 3 of 3/.test(await text(page)));

  page = await newPage();
  await page.goto(`${BASE}/cup/s`);
  await sleep(1200);
  await step1(page);
  await type(page, 0, "45");
  await main(page).getByRole("radio", { name: "Female" }).click();
  await type(page, 1, "160");
  await next(page);
  check("height without weight -> asks for both", /height and weight together/i.test(await text(page)));

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

  // 9b. Model card: reachable from /about, shows the draft status and the rule numbers, fits the screen
  page = await newPage();
  await page.goto(`${BASE}/about`);
  await sleep(1200);
  await click(page, main(page).getByRole("link", { name: /View the model card/ }));
  await page.waitForURL(/\/model$/);
  await sleep(600);
  t = await main(page).innerText();
  check("/about links to the model card", /model card/i.test(t), t.slice(0, 120));
  check("model card shows draft status and Stage B", /draft/i.test(t) && /Stage B/.test(t));
  check("model card shows the blood pressure and BMI numbers", /140\/90 mmHg/.test(t) && /27\.5/.test(t) && /23\.0/.test(t));
  check("model card says no ML model has been trained", /No machine learning model has been trained/.test(t));
  check("no horizontal scroll on /model", await noOverflow(page));
  check("model card shows the disclaimer", /Decision-support tool, not a diagnosis\./.test(await page.locator("body").innerText()));

  // 10. About link is hidden during the wizard (leaving would drop answers)
  page = await newPage();
  await page.goto(BASE);
  await sleep(1200);
  check("About link visible on landing", (await page.getByRole("link", { name: "About" }).count()) === 1);
  await click(page, page.getByRole("button", { name: "Start" }));
  await click(page, main(page).getByRole("button", { name: /Check module priority/ }));
  check("About link hidden in the wizard", (await page.getByRole("link", { name: "About" }).count()) === 0);

  // 10b. Chat (T-04, T-05): rule-based Q&A, emergency reply, claim guard, no network, nothing kept
  {
    const chatPage = await newPage();
    await chatPage.goto(BASE);
    await sleep(2000); // let link prefetching settle so only the chat's own requests are counted
    const calls = [];
    chatPage.on("request", (r) => {
      if (["fetch", "xhr", "websocket", "ping", "eventsource"].includes(r.resourceType())) calls.push(r.url());
    });
    const dlg = chatPage.getByRole("dialog", { name: "Product Q&A" });
    const reply = () => dlg.getByRole("log").innerText();
    const ask = async (q) => {
      await dlg.getByLabel("Your question").fill(q);
      await click(chatPage, dlg.getByRole("button", { name: "Send", exact: true }));
    };

    check("floating chat button on the start page", (await chatPage.getByRole("button", { name: "Ask CUORE" }).count()) === 1);
    await click(chatPage, chatPage.getByRole("button", { name: "Ask CUORE" }));
    check("chat opens as a dialog with the five quick topics", (await dlg.count()) === 1 && (await dlg.getByRole("group", { name: "Quick questions" }).getByRole("button").count()) === 5);
    check("no horizontal scroll with the chat open", await noOverflow(chatPage));

    await click(chatPage, dlg.getByRole("button", { name: "How to prepare" }));
    t = await reply();
    check("chip: brew answer, amounts marked as still being tested", /Pour the 35 g Universal Base/.test(t) && /still being tested/.test(t), t.slice(-200));

    await ask("is there soy in it");
    t = await reply();
    check("typed question reaches the allergen answer", /soy/i.test(t) && /Allergens and points to note/.test(t), t.slice(-200));

    await ask("does it lower cholesterol");
    t = await reply();
    check("claim question gets the fixed non-claim answer", /CUORE is a food, not a medicine/.test(t), t.slice(-200));

    await ask("asdfgh");
    t = await reply();
    check("unrelated text: says it is not sure", /I am not sure what you mean/.test(t), t.slice(-200));

    await ask("I am pregnant, can I eat it");
    t = await reply();
    check("pregnancy question goes to a health professional", /needs to be answered by a health professional/.test(t), t.slice(-200));

    await ask("chest pain");
    t = await reply();
    check("emergency message names 119 and 112", /119/.test(t) && /112/.test(t), t.slice(-300));
    await sleep(700); // smooth scroll
    const startVisible = await dlg.getByRole("log").evaluate((el) => el.lastElementChild.getBoundingClientRect().top >= el.getBoundingClientRect().top - 1);
    check("the emergency message is shown from its first line", startVisible);
    const lastBubble = (await dlg.getByRole("log").locator("> div").last().innerText());
    check("emergency reply has no product talk", !/CUORE|S-CUP|M-CUP|L-CUP/.test(lastBubble), lastBubble);
    check("emergency reply offers no follow-up chips", (await dlg.getByRole("group", { name: "Quick questions" }).count()) === 0);

    check("no network request was made while using the chat", calls.length === 0, calls.join(", "));

    await ask("who is this module for");
    check("screening button shown after a who-is-it-for answer", (await dlg.getByRole("button", { name: "Check my priority" }).count()) === 1);
    await click(chatPage, dlg.getByRole("button", { name: "Check my priority" }));
    await sleep(500);
    check("screening button closes the chat and opens the wizard", (await dlg.count()) === 0 && /Data consent/.test(await main(chatPage).innerText()));

    // Reopen: the earlier conversation is gone
    await click(chatPage, chatPage.getByRole("button", { name: "Ask CUORE" }));
    t = await reply();
    check("closing the chat erased the conversation", !/chest pain|not a medicine/i.test(t), t.slice(0, 160));
    await chatPage.keyboard.press("Escape");
    await sleep(500);
    check("Escape closes the chat and focus returns to its button", (await dlg.count()) === 0 && (await chatPage.evaluate(() => document.activeElement?.textContent?.trim())) === "Ask CUORE");

    // From another page the screening button goes to the home page wizard
    await chatPage.goto(`${BASE}/about`);
    await sleep(1200);
    await click(chatPage, chatPage.getByRole("button", { name: "Ask CUORE" }));
    await ask("who is this module for");
    await click(chatPage, dlg.getByRole("button", { name: "Check my priority" }));
    await chatPage.waitForURL((u) => u.pathname === "/");
    await sleep(900);
    check("from /about the screening button opens the wizard on the home page", /Data consent/.test(await main(chatPage).innerText()));

    // QR page: Ask tab knows the scanned cup; no floating button there
    const cupPage = await newPage();
    await cupPage.goto(`${BASE}/cup/l`);
    await sleep(1200);
    check("no floating chat button on /cup/l", (await cupPage.getByRole("button", { name: "Ask CUORE" }).count()) === 0);
    await click(cupPage, cupPage.getByRole("tab", { name: "Ask" }));
    await click(cupPage, main(cupPage).getByRole("button", { name: "Allergens and points to note" }));
    t = await main(cupPage).innerText();
    check("Ask tab uses the scanned cup as context (L-CUP cautions)", /swells/i.test(t) && /L-CUP/.test(t), t.slice(0, 200));
    check("no horizontal scroll on the Ask tab", await noOverflow(cupPage));
    await main(cupPage).getByLabel("Your question").fill("dada saya sakit");
    await click(cupPage, main(cupPage).getByRole("button", { name: "Send", exact: true }));
    check("Ask tab: emergency message also works there", /119/.test(await main(cupPage).innerText()));

    // Indonesian: chips and answers follow the app language
    const idPage = await newPage();
    await idPage.goto(BASE);
    await sleep(1200);
    await click(idPage, idPage.getByRole("button", { name: /Ganti ke Bahasa Indonesia/ }));
    await click(idPage, idPage.getByRole("button", { name: "Tanya CUORE" }));
    const idDlg = idPage.getByRole("dialog", { name: "Tanya jawab produk" });
    await click(idPage, idDlg.getByRole("button", { name: "Cara menyeduh" }));
    t = await idDlg.getByRole("log").innerText();
    check("Indonesian: chip answers in Indonesian", /Cara menyiapkan/.test(t) && /Tuang Universal Base/.test(t), t.slice(-200));
    check("Indonesian: footer says rule-based, not free-form AI", /berbasis aturan, bukan AI bebas/.test(await idDlg.innerText()));
  }

  // 11. Offline (T-06): after one visit, the QR page, the wizard and the other pages work with no network.
  // Keep this last: for a local run it stops the server, so nothing can answer and the test is real.
  {
    const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, isMobile: PHONE, hasTouch: PHONE });
    const op = await ctx.newPage();
    await op.goto(`${BASE}/cup/s`);
    await sleep(800);
    let cached = 0;
    for (let i = 0; i < 40 && cached < 6; i++) {
      cached = await op.evaluate(async () => {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (!reg?.active) return 0; // active only after the install step finished storing the pages
        const names = (await caches.keys()).filter((k) => k.startsWith("cuore-"));
        return names.length ? (await (await caches.open(names[0])).keys()).length : 0;
      });
      if (cached < 6) await sleep(500);
    }
    check("service worker is active and has cached the pages", cached >= 6, `cached entries: ${cached}`);
    await sleep(1500); // let the page report the files it loaded (exact image sizes)

    const cdp = await ctx.newCDPSession(op);
    const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
    check("installable: no installability errors", installabilityErrors.length === 0, JSON.stringify(installabilityErrors));

    if (!REMOTE) {
      stopServer();
      let dead = false;
      try {
        await fetch(BASE);
      } catch {
        dead = true;
      }
      check("server stopped, so the next checks are truly offline", dead);
    }
    await ctx.setOffline(true);

    await op.reload();
    await sleep(1200);
    check("offline: /cup/s opens from the cache", /You scanned S-CUP/.test(await op.locator("header").innerText()));
    await step1(op);
    await step2(op);
    await step3(op, saltyFoods);
    t = await text(op);
    check("offline: wizard completes and shows a result", /S-CUP/.test(t) && /Rule-based \(WHO thresholds\), ML-ready/.test(t), t.slice(0, 200));
    check(
      "offline: disclaimer still shown",
      /Decision-support tool, not a diagnosis\./.test(await op.locator("body").innerText()),
    );
    const imageOk = await op.evaluate(async () => {
      const exact = await fetch("/img/cups/s.webp");
      // A size the browser never asked for: the worker falls back to the original file.
      const resized = await fetch("/_next/image?url=%2Fimg%2Fcups%2Fs.webp&w=640&q=75");
      return exact.ok && resized.ok;
    });
    check("offline: cup images are served from the cache", imageOk);

    await op.goto(BASE);
    await sleep(1200);
    check("offline: start page opens", (await op.getByRole("button", { name: "Start" }).count()) === 1);
    await click(op, op.getByRole("button", { name: "Ask CUORE" }));
    const offDlg = op.getByRole("dialog", { name: "Product Q&A" });
    await click(op, offDlg.getByRole("button", { name: "Allergens and points to note" }));
    await offDlg.getByLabel("Your question").fill("chest pain");
    await click(op, offDlg.getByRole("button", { name: "Send", exact: true }));
    t = await offDlg.getByRole("log").innerText();
    check("offline: chat answers a chip and shows the emergency message", /Soy|soy/.test(t) && /119/.test(t), t.slice(-200));
    await op.keyboard.press("Escape");
    await sleep(500);
    await click(op, op.getByRole("link", { name: "About" }));
    await sleep(800);
    t = await main(op).innerText();
    check("offline: About opens by link", /ML model has not been trained yet/.test(t), t.slice(0, 120));
    await click(op, main(op).getByRole("link", { name: /View the model card/ }));
    await sleep(800);
    t = await main(op).innerText();
    check("offline: model card opens by link", /Stage B/.test(t), t.slice(0, 120));
    for (const cup of ["m", "l"]) {
      await op.goto(`${BASE}/cup/${cup}`);
      await sleep(900);
      check(`offline: /cup/${cup} opens`, new RegExp(`You scanned ${cup.toUpperCase()}-CUP`).test(await op.locator("header").innerText()));
    }
    await ctx.setOffline(false);
    await ctx.close();
  }
} finally {
  await browser.close();
  stopServer();
}
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

