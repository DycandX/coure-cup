import { describe, expect, it } from "vitest";
import {
  CONSULT_HEADLINE,
  DISCLAIMER,
  EXCLUSION_TEXT,
  MODULE_HEADLINE,
  NONE_BODY,
  NONE_HEADLINE,
  NOTICE_TEXT,
  REASON_TEXT,
} from "./recommender";
import { COPY } from "./copy";
import {
  BASE_COMPOSITION,
  ESTIMATE_NOTE,
  GENERAL_NOTE,
  PRODUCTS,
  PRODUCT_LIST,
  PREP_STEPS,
} from "./products";

/** Collect every string reachable inside a value. */
function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

// Negated disclaimers ("does not diagnose, treat or prevent") are required copy.
const stripNegatedDisclaimer = (s: string) =>
  s
    .replace(/tidak mendiagnosis, mengobati, atau mencegah penyakit/gi, "")
    .replace(/does not diagnose, treat or prevent disease/gi, "");

const FORBIDDEN: [string, RegExp][] = [
  ["cure claim", /menyembuhkan|\bcure[sd]?\b|\bheal(s|ing)?\b/i],
  ["cholesterol-lowering claim", /menurunkan\s+(kadar\s+)?kolesterol|lower(s|ing)?\s+(your\s+)?cholesterol|reduce[sd]?\s+cholesterol/i],
  ["disease-prevention claim", /mencegah\s+penyakit|prevent(s|ing)?\s+(heart\s+)?disease|mencegah\s+hipertensi/i],
  ["'side effect' wording", /efek samping|side effects?/i],
  ["sodium superiority", /lebih rendah natrium|rendah natrium|lower sodium|low[- ]sodium|less sodium|kurangi natrium|reduc\w* (your )?sodium/i],
  ["treatment wording", /terapi|therapy|obat untuk menyembuhkan|treats? (high|hypertension|diabetes)/i],
];

const userFacingCopy = () => [
  ...strings(DISCLAIMER),
  ...strings(CONSULT_HEADLINE),
  ...strings(EXCLUSION_TEXT),
  ...strings(NOTICE_TEXT),
  ...strings(NONE_HEADLINE),
  ...strings(NONE_BODY),
  ...strings(MODULE_HEADLINE),
  ...strings(REASON_TEXT),
  ...strings(PRODUCT_LIST.map((p) => [p.tagline, p.focus, p.priorityFor, p.benefit, p.allergens])),
  ...strings(PREP_STEPS),
  ...strings(GENERAL_NOTE),
  ...strings(ESTIMATE_NOTE),
  ...strings(COPY),
];

describe("language compliance", () => {
  it.each(FORBIDDEN)("contains no %s", (_name, re) => {
    for (const s of userFacingCopy()) {
      expect(stripNegatedDisclaimer(s), s).not.toMatch(re);
    }
  });

  it("uses the required disclaimer text", () => {
    expect(DISCLAIMER.id).toBe("Alat bantu keputusan, bukan diagnosis.");
  });

  it("uses 'Perlu diperhatikan' wording for cautions", () => {
    expect(EXCLUSION_TEXT.soy_allergy.id).toMatch(/Perlu diperhatikan/);
  });

  it("labels nutrition values as estimates", () => {
    expect(ESTIMATE_NOTE.id).toMatch(/estimasi/i);
    expect(ESTIMATE_NOTE.en).toMatch(/estimate/i);
    expect(GENERAL_NOTE.id).toMatch(/estimasi/i);
  });
});

describe("product data (docs/Brief_Web_CUORE.md)", () => {
  it("keeps the sodium values: S = 17 mg, L = M = 8 mg", () => {
    expect(PRODUCTS.S.nutrition.sodiumMg).toBe(17);
    expect(PRODUCTS.L.nutrition.sodiumMg).toBe(8);
    expect(PRODUCTS.M.nutrition.sodiumMg).toBe(8);
  });

  it("matches the brief's energy and fibre table", () => {
    expect([PRODUCTS.S, PRODUCTS.L, PRODUCTS.M].map((p) => p.nutrition.energyKcal)).toEqual([203, 218, 208]);
    expect([PRODUCTS.S, PRODUCTS.L, PRODUCTS.M].map((p) => p.nutrition.fibre)).toEqual([5.5, 8.8, 7.5]);
  });

  it("modules are 20 g and the base is 35 g", () => {
    const sum = (xs: { grams: number }[]) => xs.reduce((a, b) => a + b.grams, 0);
    expect(sum(BASE_COMPOSITION)).toBe(35);
    for (const p of PRODUCT_LIST) expect(sum(p.composition)).toBe(20);
  });

  it("maps theme colours: S pink, M green, L purple", () => {
    expect(PRODUCTS.S.theme).toBe("pink");
    expect(PRODUCTS.M.theme).toBe("green");
    expect(PRODUCTS.L.theme).toBe("purple");
  });

  it("declares soy on every cup and the swelling-fibre / oxalate cautions on L", () => {
    for (const p of PRODUCT_LIST) expect(p.allergens.id.join(" ")).toMatch(/kedelai/);
    const l = PRODUCTS.L.allergens.id.join(" ");
    expect(l).toMatch(/kesulitan menelan/);
    expect(l).toMatch(/kalsium oksalat/);
  });
});

describe("about poster copy", () => {
  it("provides 4 to 6 summary bullets in both ID and EN covering core poster facts", () => {
    for (const lang of ["id", "en"] as const) {
      const { bullets, posterAlt } = COPY[lang].about;
      expect(bullets.length).toBeGreaterThanOrEqual(4);
      expect(bullets.length).toBeLessThanOrEqual(6);
      const joined = bullets.join(" ");
      expect(joined).toMatch(/35 g/);
      expect(joined).toMatch(/20 g/);
      expect(joined).toMatch(/55 g/);
      expect(joined).toMatch(/S-CUP/);
      expect(joined).toMatch(/L-CUP/);
      expect(joined).toMatch(/M-CUP/);
      expect(posterAlt.length).toBeGreaterThan(80);
    }
  });

  it("about nutrition bullet matches products.ts and is labelled as an estimate", () => {
    const words = { id: { kcal: "kkal", sodium: "natrium", est: /estimasi/ }, en: { kcal: "kcal", sodium: "sodium", est: /estimates/ } };
    for (const lang of ["id", "en"] as const) {
      const w = words[lang];
      const bullet = COPY[lang].about.bullets.find((b) => b.includes(w.sodium));
      expect(bullet, lang).toBeDefined();
      expect(bullet).toMatch(w.est);
      for (const p of PRODUCT_LIST) {
        expect(bullet).toContain(`${p.name} ${p.nutrition.energyKcal} ${w.kcal}, ${w.sodium} ${p.nutrition.sodiumMg} mg`);
      }
    }
    // Same wording strength in both languages for the data-protection sentence.
    expect(COPY.en.about.bullets.join(" ")).not.toMatch(/in line with Indonesia's PDP Law/);
  });

  it("clarifies that the current web version is rule-based, ML-ready, and the ML model is not trained yet", () => {
    expect(COPY.id.about.mlNotice).toMatch(/berbasis aturan, model ML belum dilatih/i);
    expect(COPY.en.about.mlNotice).toMatch(/rule-based \(WHO thresholds\)/i);
    expect(COPY.en.about.mlNotice).toMatch(/ML-ready/i);
    expect(COPY.en.about.mlNotice).toMatch(/ML model has not been trained yet/i);
  });
});
