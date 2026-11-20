import fs from "node:fs";
import path from "node:path";
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
import { buildModelCard } from "./model-card";
import { buildAboutCuore } from "./about-cuore";
import { FORBIDDEN, stripNegatedDisclaimer, strings } from "./compliance-rules";
import {
  BASE_COMPOSITION,
  ESTIMATE_NOTE,
  GENERAL_NOTE,
  PRODUCTS,
  PRODUCT_LIST,
  PREP_STEPS,
} from "./products";

/** Width and height from a WebP file header (VP8, VP8L or VP8X). */
function webpSize(buf: Buffer): { width: number; height: number } {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("not a WebP file");
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  if (chunk === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`unknown WebP chunk ${chunk}`);
}

const userFacingCopy = () => [
  ...strings(DISCLAIMER),
  ...strings(CONSULT_HEADLINE),
  ...strings(EXCLUSION_TEXT),
  ...strings(NOTICE_TEXT),
  ...strings(NONE_HEADLINE),
  ...strings(NONE_BODY),
  ...strings(MODULE_HEADLINE),
  ...strings(REASON_TEXT),
  ...strings(PRODUCT_LIST.map((p) => [p.tagline, p.focus, p.priorityFor, p.benefit, p.allergens, p.image?.alt])),
  ...strings(PREP_STEPS),
  ...strings(GENERAL_NOTE),
  ...strings(ESTIMATE_NOTE),
  ...strings(COPY),
  ...strings(buildModelCard("id")),
  ...strings(buildModelCard("en")),
  ...strings(buildAboutCuore("id")),
  ...strings(buildAboutCuore("en")),
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

  it("carries the extra estimated values of essay Table 8 (Base + module, team answer C3)", () => {
    const pick = (p: (typeof PRODUCT_LIST)[number]) => [
      p.nutrition.saturatedFat,
      p.nutrition.potassiumMg,
      p.nutrition.calciumMg,
      p.nutrition.ironMg,
    ];
    expect(pick(PRODUCTS.S)).toEqual([0.6, 380, 45, 2.1]);
    expect(pick(PRODUCTS.L)).toEqual([0.8, 310, 88, 3.4]);
    expect(pick(PRODUCTS.M)).toEqual([0.7, 340, 62, 2.8]);
  });

  it("L-CUP tells people to drink water afterwards and stop if uncomfortable (team answer C2)", () => {
    expect(PRODUCTS.L.allergens.id.join(" ")).toMatch(/segelas air setelahnya.*hentikan bila/);
    expect(PRODUCTS.L.allergens.en.join(" ")).toMatch(/glass of water afterwards.*stop if/);
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

  it("provides bilingual alt text and <200 KB sleeve images whose declared size matches the file", () => {
    for (const p of PRODUCT_LIST) {
      expect(p.image).toBeDefined();
      expect(p.image?.alt.id.trim().length).toBeGreaterThan(0);
      expect(p.image?.alt.en.trim().length).toBeGreaterThan(0);
      const filePath = path.join(process.cwd(), "public", p.image!.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), filePath).toBe(true);
      const buf = fs.readFileSync(filePath);
      expect(buf.length).toBeLessThan(200 * 1024);
      // width/height feed next/image; a mismatch distorts the aspect ratio or shifts layout.
      expect(webpSize(buf), filePath).toEqual({ width: p.image!.width, height: p.image!.height });
    }
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
