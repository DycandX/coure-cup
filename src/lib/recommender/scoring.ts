import type {
  FoodFrequency,
  ModuleId,
  ModuleScores,
  NoticeCode,
  ReasonCode,
  ScreeningInput,
} from "./types";
import { computeBmi, meanBloodPressure } from "./safety";

/**
 * Provisional scoring rules (DECISIONS.md D-005, D-006). Adopted on the owner's
 * instruction from the team's answer sheet; the clinical numbers are still
 * DRAFTS pending confirmation by the supervising physician (dr. Enny).
 * Sources: WHO 2021 hypertension guideline; WHO Expert Consultation (Lancet
 * 2004) Asian BMI action points; WHO 2011 / WHO-IASO-IOTF 2000 Asian waist;
 * WHO/IDF 2006 glucose; NCEP ATP III lipid classes (WHO sets no lipid cut-offs).
 */
export const THRESHOLDS = {
  /** Neutral minimum for the best module; below it no module is suggested. */
  minPriority: 0.25,
  /** Hypertension only; no intermediate tier (WHO 2021 uses 130 only for high-risk patients). */
  bp: { hypertension: [140, 90] },
  /** Asian-population waist circumference (WHO Expert Consultation 2011; WHO/IASO/IOTF 2000), DECISIONS D-005. */
  waistCm: { male: 90, female: 80 },
  /** Asian public-health action points: 23.0-27.4 partial, 27.5+ full (WHO international cut-offs are 25 and 30). */
  bmi: { asiaIncreased: 23, asiaHigh: 27.5 },
  glucose: { diabetesRange: 126, impairedFasting: 110 },
  ldl: { high: 160, borderline: 130, nearOptimal: 100 },
  triglycerides: { high: 200, borderline: 150 },
  /** NCEP ATP III: HDL below 40 mg/dL is low, for both sexes. */
  hdlLow: 40,
  /** Complaints may add at most this much to a module score and are never the only reason given. */
  symptomWeightMax: 0.1,
} as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const hi = (f: number) => f / 3; // risk-type item: more frequent -> higher
const lo = (f: number) => (3 - f) / 3; // protective item: less frequent -> higher
const flag = (b: boolean) => (b ? 1 : 0);

export function bloodPressureScore(input: ScreeningInput): number {
  const m = meanBloodPressure(input);
  if (!m) return 0; // optional input: absent means no contribution
  const T = THRESHOLDS.bp;
  return m.systolic >= T.hypertension[0] || m.diastolic >= T.hypertension[1] ? 1 : 0;
}

export function adiposityScore(input: ScreeningInput): number {
  const parts: number[] = [];
  if (input.waistCm !== undefined && input.sex) {
    parts.push(input.waistCm >= THRESHOLDS.waistCm[input.sex] ? 1 : 0);
  }
  const bmi = computeBmi(input.heightCm, input.weightKg);
  if (bmi !== undefined) {
    const B = THRESHOLDS.bmi;
    parts.push(bmi >= B.asiaHigh ? 1 : bmi >= B.asiaIncreased ? 0.5 : 0);
  }
  return parts.length ? Math.max(...parts) : 0;
}

export function lipidScore(input: ScreeningInput): number | null {
  const t = input.tier2;
  if (!t) return null;
  const T = THRESHOLDS;
  const parts: number[] = [];
  if (t.ldl !== undefined)
    parts.push(t.ldl >= T.ldl.high ? 1 : t.ldl >= T.ldl.borderline ? 0.7 : t.ldl >= T.ldl.nearOptimal ? 0.3 : 0);
  if (t.triglycerides !== undefined)
    parts.push(t.triglycerides >= T.triglycerides.high ? 1 : t.triglycerides >= T.triglycerides.borderline ? 0.7 : 0);
  if (t.hdl !== undefined) parts.push(t.hdl < T.hdlLow ? 0.7 : 0);
  return parts.length ? Math.max(...parts) : null;
}

export function glucoseScore(input: ScreeningInput): number | null {
  const g = input.tier2?.fastingGlucose;
  if (g === undefined) return null;
  const T = THRESHOLDS.glucose;
  return g >= T.diabetesRange ? 1 : g >= T.impairedFasting ? 0.6 : 0;
}

export interface ScoreDetail {
  scores: ModuleScores;
  /** Factor contributions per module, used to pick the 1-2 reasons. */
  factors: Record<ModuleId, { code: ReasonCode; value: number }[]>;
  tier: 1 | 2;
  notices: NoticeCode[];
}

export function scoreModules(input: ScreeningInput): ScoreDetail {
  const f = input.food as FoodFrequency;
  const h = input.history;
  const s = input.symptoms;
  const bp = bloodPressureScore(input);
  const adip = adiposityScore(input);
  const lipid = lipidScore(input);
  const glu = glucoseScore(input);

  // Module S (sodium-conscious): salty diet, blood pressure, history, complaints.
  // Complaints capped at 0.1 (high blood pressure often has no symptoms); the freed
  // 0.1 went to the salty-diet item (agent's choice, D-006, pending dr. Enny).
  const salty = avg([hi(f.saltyPackaged), hi(f.instantNoodle), hi(f.addedSalt)]);
  const sHist = h.hypertension ? 1 : h.familyHypertensionStroke ? 0.5 : 0;
  const sSymp = avg([flag(s.headacheNeck), flag(s.dizziness)]);
  const S = 0.45 * salty + 0.2 * bp + 0.25 * sHist + THRESHOLDS.symptomWeightMax * sSymp;

  // Module L (lipid-oriented): Tier 1 infers from diet, waist/BMI and history; Tier 2 refines.
  // High cholesterol usually has no typical complaint, so no symptom term.
  const fatty = avg([hi(f.fried), hi(f.fattyMeat)]);
  const lowFiber = avg([lo(f.vegetables), lo(f.legumesNuts)]);
  const lHist = h.highCholesterol ? 1 : h.familyEarlyHeartDisease ? 0.5 : 0;
  const L1 = 0.3 * fatty + 0.1 * lowFiber + 0.3 * adip + 0.3 * lHist;
  const wL = lipid === null ? 1 : 0.5;
  const L = lipid === null ? L1 : 0.5 * L1 + 0.5 * lipid;

  // Module M (metabolic): sugary diet, meal regularity, waist/BMI, history, complaints.
  const sugary = avg([hi(f.sugaryDrinks), hi(f.sweetSnacks)]);
  const irregular = lo(f.mealRegularity);
  const mHist = h.diabetes ? 1 : h.familyDiabetes ? 0.5 : 0;
  const mSymp = avg([flag(s.thirst), flag(s.urination), flag(s.hunger), flag(s.tiredAfterMeals)]);
  const M1 = 0.3 * sugary + 0.1 * irregular + 0.25 * adip + 0.25 * mHist + 0.1 * mSymp;
  const wM = glu === null ? 1 : 0.5;
  const M = glu === null ? M1 : 0.5 * M1 + 0.5 * glu;

  const factors: ScoreDetail["factors"] = {
    S: [
      { code: "salty_foods", value: 0.45 * salty },
      { code: "blood_pressure", value: 0.2 * bp },
      { code: "hypertension_history", value: 0.25 * sHist },
      { code: "sodium_symptoms", value: THRESHOLDS.symptomWeightMax * sSymp },
    ],
    L: [
      { code: "fatty_foods", value: 0.3 * fatty * wL },
      { code: "low_fiber_foods", value: 0.1 * lowFiber * wL },
      { code: "adiposity", value: 0.3 * adip * wL },
      { code: "cholesterol_history", value: 0.3 * lHist * wL },
      { code: "lipid_values", value: lipid === null ? 0 : 0.5 * lipid },
    ],
    M: [
      { code: "sugary_foods", value: 0.3 * sugary * wM },
      { code: "irregular_meals", value: 0.1 * irregular * wM },
      { code: "adiposity", value: 0.25 * adip * wM },
      { code: "diabetes_history", value: 0.25 * mHist * wM },
      { code: "metabolic_symptoms", value: 0.1 * mSymp * wM },
      { code: "glucose_value", value: glu === null ? 0 : 0.5 * glu },
    ],
  };

  // Thirst + frequent urination + unexplained weight loss: point to a glucose check, besides the module.
  const notices: NoticeCode[] = s.thirst && s.urination && s.weightLoss ? ["check_glucose"] : [];

  return {
    scores: { S: clamp01(S), L: clamp01(L), M: clamp01(M) },
    factors,
    tier: lipid !== null || glu !== null ? 2 : 1,
    notices,
  };
}

/** Tie-break order when scores are equal: S, then L, then M. */
export const TIE_ORDER: ModuleId[] = ["S", "L", "M"];

/** The highest-scoring module, or null when nothing reaches the minimum priority. */
export function pickModule(scores: ModuleScores): ModuleId | null {
  const eps = 1e-9;
  const best = TIE_ORDER.reduce((b, id) => (scores[id] > scores[b] + eps ? id : b), TIE_ORDER[0]);
  return scores[best] >= THRESHOLDS.minPriority - eps ? best : null;
}

/** Complaint-based reasons: allowed next to another reason, never on their own. */
const SYMPTOM_REASONS: ReadonlySet<ReasonCode> = new Set<ReasonCode>(["sodium_symptoms", "metabolic_symptoms"]);

export function pickReasons(detail: ScoreDetail, module: ModuleId): ReasonCode[] {
  const sorted = [...detail.factors[module]].sort((a, b) => b.value - a.value);
  const ranked = sorted.filter((x) => x.value > 0.05).slice(0, 2).map((x) => x.code);
  if (ranked.length && ranked.some((c) => !SYMPTOM_REASONS.has(c))) return ranked;
  // Only complaints (or nothing) cleared the bar: lead with the strongest non-complaint factor.
  const lead = sorted.find((x) => !SYMPTOM_REASONS.has(x.code))!.code;
  return ranked.length ? [lead, ranked[0]] : [lead];
}
