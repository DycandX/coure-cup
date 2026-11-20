import { describe, expect, it } from "vitest";
import { buildAboutCuore, PORTION } from "./about-cuore";
import { FORBIDDEN, stripNegatedDisclaimer, strings } from "./compliance-rules";
import { BASE_COMPOSITION, PRODUCT_LIST, PRODUCTS } from "./products";
import type { Lang } from "./recommender/types";
import { answer } from "./chat/engine";

const LANGS: Lang[] = ["id", "en"];
const sum = (items: { grams: number }[]) => items.reduce((n, i) => n + i.grams, 0);

describe("What is a CUORE cup? content", () => {
  it("computes the portion from the product data: base + module = portion", () => {
    expect(PORTION.baseGrams).toBe(sum(BASE_COMPOSITION));
    for (const p of PRODUCT_LIST) expect(sum(p.composition), p.name).toBe(PORTION.moduleGrams);
    expect(PORTION.totalGrams).toBe(PORTION.baseGrams + PORTION.moduleGrams);
    expect(PORTION.totalGrams).toBe(55); // the documented 35 g + 20 g portion
  });

  it.each(LANGS)("states the portion with the numbers from the data (%s)", (lang) => {
    const a = buildAboutCuore(lang);
    for (const n of [PORTION.totalGrams, PORTION.baseGrams, PORTION.moduleGrams]) expect(a.portion).toContain(String(n));
    expect(a.portionParts.map((p) => p.grams)).toEqual([PORTION.baseGrams, PORTION.moduleGrams, PORTION.totalGrams]);
  });

  it.each(LANGS)("names all three modules, with the focus text from the product data (%s)", (lang) => {
    const a = buildAboutCuore(lang);
    expect(a.modules.map((m) => m.id)).toEqual(["S", "M", "L"]);
    for (const m of a.modules) expect(m.focus).toBe(PRODUCTS[m.id].focus[lang]);
  });

  it.each(LANGS)("says it is a food, not a medicine, and carries the soy, L-CUP and estimate notes (%s)", (lang) => {
    const notes = buildAboutCuore(lang).notes.join(" ");
    expect(notes).toMatch(lang === "id" ? /pangan, bukan obat/ : /food, not a medicine/);
    expect(notes).toContain(PRODUCTS.S.allergens[lang][0]);
    expect(notes).toContain(PRODUCTS.L.allergens[lang][1]);
    expect(notes).toMatch(lang === "id" ? /estimasi/i : /estimate/i);
  });

  it("has the same structure in both languages", () => {
    const [id, en] = LANGS.map((l) => buildAboutCuore(l));
    expect(id.steps.length).toBe(en.steps.length);
    expect(id.notes.length).toBe(en.notes.length);
    expect(id.modules.length).toBe(en.modules.length);
  });

  it.each(FORBIDDEN)("contains no %s", (_name, re) => {
    for (const lang of LANGS) {
      for (const s of strings(buildAboutCuore(lang))) expect(stripNegatedDisclaimer(s), s).not.toMatch(re);
    }
  });

  it("is also what the chat answers to 'what is a CUORE cup?'", () => {
    for (const lang of LANGS) {
      const text = answer(lang === "id" ? "apa itu CUORE cup?" : "what is a CUORE cup?", lang).lines.join(" ");
      expect(text).toContain(buildAboutCuore(lang).intro);
      expect(text).toContain(buildAboutCuore(lang).portion);
    }
  });
});
