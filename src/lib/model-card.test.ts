import { describe, expect, it } from "vitest";
import { EXCLUSION_LABEL, buildModelCard } from "./model-card";
import { THRESHOLDS } from "./recommender/scoring";
import { SAFETY_LIMITS } from "./recommender/safety";
import { FORBIDDEN, stripNegatedDisclaimer, strings } from "./compliance-rules";
import type { Lang } from "./recommender/types";

const LANGS: Lang[] = ["id", "en"];
const section = (lang: Lang, id: string) => {
  const s = buildModelCard(lang).sections.find((x) => x.id === id);
  if (!s) throw new Error(`missing section ${id}`);
  return s.items.join(" ");
};
/** Same formatting the card uses: decimal comma in Indonesian. */
const f = (n: number, lang: Lang, digits = 0) => (lang === "id" ? n.toFixed(digits).replace(".", ",") : n.toFixed(digits));

describe.each(LANGS)("model card numbers match the rules (%s)", (lang) => {
  const rules = () => section(lang, "rules");
  const T = THRESHOLDS;

  it("blood pressure, waist, BMI and glucose", () => {
    const r = rules();
    expect(r).toContain(`${T.bp.hypertension[0]}/${T.bp.hypertension[1]} mmHg`);
    expect(r).toContain(`${T.waistCm.male} cm`);
    expect(r).toContain(`${T.waistCm.female} cm`);
    expect(r).toContain(f(T.bmi.asiaIncreased, lang, 1));
    expect(r).toContain(f(T.bmi.asiaHigh, lang, 1));
    expect(r).toContain(`${T.glucose.impairedFasting} mg/dL`);
    expect(r).toContain(`${T.glucose.diabetesRange} mg/dL`);
  });

  it("lipids, minimum priority and complaint weight", () => {
    const r = rules();
    expect(r).toContain(`${T.ldl.nearOptimal} / ${T.ldl.borderline} / ${T.ldl.high} mg/dL`);
    expect(r).toContain(`${T.triglycerides.borderline} / ${T.triglycerides.high} mg/dL`);
    expect(r).toContain(`${T.hdlLow} mg/dL`);
    expect(r).toContain(f(T.minPriority, lang, 2));
    expect(r).toContain(f(T.symptomWeightMax, lang, 1));
  });

  it("safety limits: minimum age, readings and markedly-high values", () => {
    const k = SAFETY_LIMITS.markedly;
    const s = section(lang, "safety");
    expect(section(lang, "purpose")).toContain(String(SAFETY_LIMITS.minAge));
    expect(section(lang, "inputs")).toContain(String(SAFETY_LIMITS.minBpReadings));
    for (const v of [k.systolic, k.diastolic, k.ldl, k.triglycerides, k.fastingGlucose]) {
      expect(s).toContain(String(v));
    }
  });

  it("lists every safety exclusion", () => {
    const s = section(lang, "safety");
    for (const label of Object.values(EXCLUSION_LABEL)) expect(s).toContain(label[lang]);
  });
});

describe("model card honesty and compliance", () => {
  it("has the same structure in both languages", () => {
    const [id, en] = LANGS.map((l) => buildModelCard(l));
    expect(id.sections.map((s) => s.id)).toEqual(en.sections.map((s) => s.id));
    id.sections.forEach((s, i) => expect(s.items.length).toBe(en.sections[i].items.length));
  });

  it.each(LANGS)("says draft, waiting for the three experts (Stage B) (%s)", (lang) => {
    expect(buildModelCard(lang).status).toMatch(/Stage B/);
    expect(buildModelCard(lang).status).toMatch(lang === "id" ? /draf/i : /draft/i);
  });

  it.each(LANGS)("states what does not exist yet and makes no accuracy claim (%s)", (lang) => {
    const missing = section(lang, "missing");
    expect(missing).toMatch(lang === "id" ? /belum dilatih/ : /No machine learning model has been trained/);
    expect(missing).toMatch(lang === "id" ? /belum ada audit/i : /no fairness audit/i);
    const all = strings(buildModelCard(lang)).join(" ");
    expect(all).not.toMatch(/\d\s?%/); // no accuracy, sensitivity or similar percentages
    expect(all).not.toMatch(/akurasi \d|accuracy (of|is|was) \d|telah divalidasi|has been validated|is validated/i);
  });

  it.each(LANGS)("keeps the privacy and estimate statements (%s)", (lang) => {
    expect(section(lang, "privacy")).toMatch(lang === "id" ? /tidak dikirim ke server/i : /not sent to a server/i);
    expect(section(lang, "missing")).toMatch(lang === "id" ? /estimasi/ : /estimates/);
  });

  it.each(FORBIDDEN)("contains no %s", (_name, re) => {
    for (const lang of LANGS) {
      for (const s of strings(buildModelCard(lang))) expect(stripNegatedDisclaimer(s), s).not.toMatch(re);
    }
  });
});
