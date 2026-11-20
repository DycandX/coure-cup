import { describe, expect, it } from "vitest";
import { FORBIDDEN, stripNegatedDisclaimer } from "../compliance-rules";
import { PRODUCT_LIST, PRODUCTS, PREP_STEPS } from "../products";
import type { Lang } from "../recommender/types";
import { EMERGENCY_CALL, EXCLUSION_TEXT } from "../recommender/templates";
import { HEART_LIMITS, HEART_SOURCES } from "./heart-info";
import { ALL_CONTEXTS, BREW_DETAILS, KNOWLEDGE, PRIMARY_CHIPS, brewLines, renderAnswer } from "./knowledge";
import { INTENT_IDS, type IntentId } from "./types";

const LANGS: Lang[] = ["id", "en"];

/** Every (intent, language, module context) the chat can show. */
const rendered = INTENT_IDS.flatMap((id) =>
  LANGS.flatMap((lang) =>
    ALL_CONTEXTS.map((module) => ({ id, lang, module, text: renderAnswer(id, lang, { module }).lines.join("\n") })),
  ),
);

// Chat-only rules on top of the shared language rules.
const CHAT_FORBIDDEN: [string, RegExp][] = [
  ["the word 'indikasi'", /indikasi|indication/i],
  [
    "diagnosing the user",
    /\b(anda|you)\s+(terkena|menderita|sedang mengalami serangan|are having a|likely have|probably have|have (a |an )?(heart|stroke|hypertension|diabetes|high))/i,
  ],
  ["'heart friendly' style claim", /heart[- ]friendly|ramah jantung|sehat(kan)? jantung|good for your heart/i],
  ["a foreign emergency number", /\b(911|999|000)\b/],
];

describe("knowledge base coverage", () => {
  it("has exactly one entry per intent, with chips and follow-ups that exist", () => {
    for (const id of INTENT_IDS) {
      const e = KNOWLEDGE[id];
      expect(e, id).toBeDefined();
      expect(e.id).toBe(id);
      for (const lang of LANGS) expect(e.chip[lang].trim().length, `${id} chip ${lang}`).toBeGreaterThan(0);
      for (const f of e.followUps) expect(INTENT_IDS, `${id} -> ${f}`).toContain(f);
      expect(e.followUps).not.toContain(id);
    }
  });

  it("answers every intent in both languages, for no module and for S, L, M", () => {
    // 15 intents x 2 languages x 4 contexts: guards against the scan below going vacuous.
    expect(rendered.length).toBe(INTENT_IDS.length * 2 * 4);
    for (const r of rendered) expect(r.text.trim().length, `${r.id}/${r.lang}/${r.module}`).toBeGreaterThan(20);
  });

  it("covers the five topics the team asked for with primary chips", () => {
    expect(PRIMARY_CHIPS).toEqual(["brew.how", "allergens", "who.can", "who.priority", "heart.symptoms"]);
    for (const id of PRIMARY_CHIPS) expect(KNOWLEDGE[id]).toBeDefined();
  });

  it("returns the same answer for the same input (pure)", () => {
    for (const id of INTENT_IDS) {
      expect(renderAnswer(id, "id", { module: "L" })).toEqual(renderAnswer(id, "id", { module: "L" }));
    }
  });
});

describe("compliance of every rendered answer", () => {
  it.each(FORBIDDEN)("contains no %s", (_name, re) => {
    for (const r of rendered) expect(stripNegatedDisclaimer(r.text), `${r.id}/${r.lang}`).not.toMatch(re);
  });

  it.each(CHAT_FORBIDDEN)("contains no %s", (_name, re) => {
    for (const r of rendered) {
      const text = [r.text, KNOWLEDGE[r.id].chip[r.lang]].join("\n");
      expect(stripNegatedDisclaimer(text), `${r.id}/${r.lang}`).not.toMatch(re);
    }
  });

  it("every answer that names nutrition numbers labels them as estimates", () => {
    for (const r of rendered.filter((x) => /\b\d+(\.\d+)?\s*(kcal|kkal|mg)\b/.test(x.text))) {
      expect(r.text, `${r.id}/${r.lang}`).toMatch(r.lang === "id" ? /estimasi/i : /estimate/i);
    }
  });
});

describe("product facts come from products.ts", () => {
  it("states sodium S = 17 mg and L = M = 8 mg without calling S lower", () => {
    for (const lang of LANGS) {
      const text = renderAnswer("compare.modules", lang).lines.join(" ");
      expect(text).toContain(`S-CUP ${PRODUCTS.S.nutrition.sodiumMg} mg`);
      expect(text).toContain(`M-CUP ${PRODUCTS.M.nutrition.sodiumMg} mg`);
      expect(text).toContain(`L-CUP ${PRODUCTS.L.nutrition.sodiumMg} mg`);
    }
    expect([PRODUCTS.S, PRODUCTS.L, PRODUCTS.M].map((p) => p.nutrition.sodiumMg)).toEqual([17, 8, 8]);
  });

  it("nutrition answer carries every number of the module in context", () => {
    for (const p of PRODUCT_LIST) {
      const text = renderAnswer("nutrition.estimate", "en", { module: p.id }).lines.join(" ");
      expect(text).toContain(`${p.nutrition.energyKcal} kcal`);
      expect(text).toContain(`${p.nutrition.protein} g`);
      expect(text).toContain(`${p.nutrition.sodiumMg} mg`);
      expect(text).not.toMatch(new RegExp(PRODUCT_LIST.filter((o) => o.id !== p.id).map((o) => o.name).join("|")));
    }
  });

  it("allergen answers name soy for every module and the L-CUP cautions for L", () => {
    for (const p of PRODUCT_LIST) {
      expect(renderAnswer("allergens", "id", { module: p.id }).lines.join(" ")).toMatch(/kedelai/);
      expect(renderAnswer("allergens", "en", { module: p.id }).lines.join(" ")).toMatch(/soy/);
    }
    const l = renderAnswer("caution.l", "id").lines.join(" ");
    expect(l).toMatch(/kesulitan menelan/);
    expect(l).toMatch(/kalsium oksalat/);
    expect(renderAnswer("allergens", "id").lines.join(" ")).toMatch(/kalsium oksalat/);
  });

  it("'who is this module for' uses the formulation-priority wording and never says indication", () => {
    const s = renderAnswer("who.priority", "id", { module: "S" }).lines.join(" ");
    expect(s).toContain(PRODUCTS.S.priorityFor.id);
    expect(s).not.toMatch(/indikasi/i);
    expect(renderAnswer("who.priority", "id").lines.join(" ")).toContain(PRODUCTS.L.priorityFor.id);
  });

  it("who-can and who-consult reuse the existing consult wording", () => {
    const consult = renderAnswer("who.consult", "id").lines;
    for (const code of ["pregnant", "kidney_disease", "soy_allergy", "swallowing_difficulty", "medication"] as const) {
      expect(consult).toContain(EXCLUSION_TEXT[code].id);
    }
    expect(renderAnswer("who.can", "en").lines.join(" ")).toMatch(/18/);
  });

  it("health-claim question gets the fixed non-claim answer", () => {
    expect(renderAnswer("claims.health", "id").lines.join(" ")).toMatch(/tidak mendiagnosis, mengobati, atau mencegah penyakit/);
    expect(renderAnswer("claims.health", "en").lines.join(" ")).toMatch(/does not diagnose, treat or prevent disease/);
  });
});

describe("brew answer", () => {
  it("has the four steps and says the amounts are not set yet while BREW_DETAILS is empty", () => {
    expect(BREW_DETAILS).toEqual({});
    for (const lang of LANGS) {
      const lines = renderAnswer("brew.how", lang).lines;
      PREP_STEPS[lang].forEach((step) => expect(lines.join(" ")).toContain(step));
      expect(lines.join(" ")).toMatch(lang === "id" ? /petunjuk pada kemasan/ : /instructions on the pack/);
      expect(lines.join(" ")).not.toMatch(/\d+\s*(mL|ml|°C|menit|minutes)/);
    }
    expect(KNOWLEDGE["brew.how"].status).toBe("pending-data");
  });

  it("uses real amounts only when all three are provided", () => {
    const partial = brewLines("en", { waterMl: 1 }).join(" ");
    expect(partial).toMatch(/instructions on the pack/);
    const full = brewLines("id", { waterMl: 1, temperatureC: 2, waitMinutes: 3 }).join(" ");
    expect(full).toContain("1 mL");
    expect(full).toContain("2 °C");
    expect(full).toContain("3 menit");
    expect(full).not.toMatch(/petunjuk pada kemasan/);
  });
});

describe("heart information (draft, referral only)", () => {
  const heart: IntentId[] = ["heart.symptoms", "heart.emergency"];

  it("is marked as draft and cites its sources", () => {
    for (const id of heart) {
      expect(KNOWLEDGE[id].status).toBe("draft");
      expect(KNOWLEDGE[id].source).toBe("who-kemenkes");
    }
    expect(HEART_SOURCES.map((s) => s.url).join(" ")).toMatch(/who\.int/);
    expect(HEART_SOURCES.map((s) => s.url).join(" ")).toMatch(/kemkes\.go\.id/);
  });

  it("every heart answer carries the shared emergency call and the 'not a diagnosis' limits, in both languages", () => {
    for (const r of rendered.filter((x) => heart.includes(x.id))) {
      expect(r.text, `${r.id}/${r.lang}`).toContain(EMERGENCY_CALL[r.lang]);
      expect(r.text, `${r.id}/${r.lang}`).toContain(HEART_LIMITS[r.lang]);
    }
  });

  it("119 and 112 appear only inside the shared emergency sentence (wizard and chat say the same)", () => {
    expect(EXCLUSION_TEXT.emergency_symptoms.id).toContain(EMERGENCY_CALL.id);
    expect(EXCLUSION_TEXT.emergency_symptoms.en).toContain(EMERGENCY_CALL.en);
    let calls = 0;
    for (const r of rendered) {
      if (r.text.includes(EMERGENCY_CALL[r.lang])) calls++;
      const rest = r.text.split(EMERGENCY_CALL[r.lang]).join("");
      expect(rest, `${r.id}/${r.lang}`).not.toMatch(/\b(119|112)\b/);
    }
    expect(calls).toBeGreaterThan(0);
  });

  it("mentions the warning signs of the sources and never links CUORE to them or gives diet advice", () => {
    const id = renderAnswer("heart.symptoms", "id").lines.join(" ");
    for (const w of [/nyeri/i, /sesak napas/i, /keringat dingin/i, /kelemahan mendadak/i]) expect(id).toMatch(w);
    const en = renderAnswer("heart.symptoms", "en").lines.join(" ");
    for (const w of [/chest/i, /shortness of breath/i, /cold sweat/i, /sudden weakness/i]) expect(en).toMatch(w);
    for (const text of [id, en]) {
      expect(text).not.toMatch(/\b(garam|salt|sodium|natrium|serat|fibre|diet|makan|eat|eating)\b/i);
      expect(text).not.toMatch(/S-CUP|M-CUP|L-CUP/);
    }
  });

  it("heart answers offer no product recommendation as a follow-up", () => {
    for (const id of heart) {
      for (const f of KNOWLEDGE[id].followUps) {
        expect(["heart.symptoms", "heart.emergency", "out.of.scope", "claims.health"]).toContain(f);
      }
    }
  });
});
