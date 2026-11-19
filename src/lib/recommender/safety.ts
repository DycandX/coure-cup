import type { ExclusionCode, SafetyResult, ScreeningInput } from "./types";
import { FOOD_KEYS } from "./types";

/**
 * DRAFT limits. The team decided to follow WHO and have the supervising
 * nutrition physician confirm the numbers; lipid limits are not set by WHO and
 * stay provisional (see DECISIONS.md D-002 and D-003).
 */
export const SAFETY_LIMITS = {
  minAge: 18,
  minBpReadings: 2,
  plausible: {
    age: [0, 120],
    heightCm: [100, 250],
    weightKg: [25, 300],
    bmi: [12, 70],
    systolic: [70, 260],
    diastolic: [40, 150],
    waistCm: [40, 200],
    ldl: [20, 500],
    hdl: [10, 150],
    triglycerides: [20, 3000],
    fastingGlucose: [30, 600],
  },
  /** Markedly elevated -> professional advice instead of a module. */
  markedly: {
    systolic: 180,
    diastolic: 110,
    ldl: 190,
    triglycerides: 500,
    fastingGlucose: 200,
  },
} as const;

const inRange = (v: number, [lo, hi]: readonly [number, number]) =>
  Number.isFinite(v) && v >= lo && v <= hi;

export function computeBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (heightCm === undefined || weightKg === undefined || heightCm <= 0) return undefined;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function meanBloodPressure(input: ScreeningInput) {
  const n = input.bloodPressure.length;
  if (n === 0) return null;
  const sum = input.bloodPressure.reduce(
    (a, r) => ({ s: a.s + r.systolic, d: a.d + r.diastolic }),
    { s: 0, d: 0 },
  );
  return { systolic: sum.s / n, diastolic: sum.d / n };
}

/** Exclusions decidable from consent + the safety answers alone (wizard step 1). */
export function checkSafetyAnswers(consent: boolean, safety: ScreeningInput["safety"]): ExclusionCode[] {
  if (!consent) return ["no_consent"];
  const ex: ExclusionCode[] = [];
  if (safety.emergencySymptoms) ex.push("emergency_symptoms");
  if (safety.pregnant) ex.push("pregnant");
  if (safety.kidneyDisease) ex.push("kidney_disease");
  if (safety.soyAllergy) ex.push("soy_allergy");
  if (safety.swallowingDifficulty) ex.push("swallowing_difficulty");
  if (safety.takesMedication) ex.push("medication");
  return ex;
}

/** Safety Rule Layer. Returns every exclusion that applies (deterministic order). */
export function checkSafety(input: ScreeningInput): SafetyResult {
  const ex: ExclusionCode[] = [];
  const L = SAFETY_LIMITS;
  const p = L.plausible;

  if (!input.consent) {
    // Without consent nothing else is evaluated.
    return { ok: false, exclusions: ["no_consent"] };
  }

  if (input.age !== undefined && input.age < L.minAge) ex.push("under_age");
  ex.push(...checkSafetyAnswers(true, input.safety));

  // Missing key data. Blood pressure is optional, but a single reading is incomplete.
  const foodComplete = FOOD_KEYS.every((k) => input.food[k] !== undefined);
  if (
    input.age === undefined ||
    input.sex === undefined ||
    input.heightCm === undefined ||
    input.weightKg === undefined ||
    input.waistCm === undefined ||
    !foodComplete ||
    (input.bloodPressure.length > 0 && input.bloodPressure.length < L.minBpReadings)
  ) {
    ex.push("missing_data");
  }

  // Implausible values
  const bmi = computeBmi(input.heightCm, input.weightKg);
  const t2 = input.tier2 ?? {};
  const bad = (v: number | undefined, r: readonly [number, number]) => v !== undefined && !inRange(v, r);
  const implausible =
    input.bloodPressure.some(
      (r) =>
        !inRange(r.systolic, p.systolic) ||
        !inRange(r.diastolic, p.diastolic) ||
        r.diastolic >= r.systolic,
    ) ||
    bad(input.age, p.age) ||
    bad(input.heightCm, p.heightCm) ||
    bad(input.weightKg, p.weightKg) ||
    bad(bmi, p.bmi) ||
    bad(input.waistCm, p.waistCm) ||
    bad(t2.ldl, p.ldl) ||
    bad(t2.hdl, p.hdl) ||
    bad(t2.triglycerides, p.triglycerides) ||
    bad(t2.fastingGlucose, p.fastingGlucose);
  if (implausible) ex.push("implausible_values");

  // Markedly elevated readings (only meaningful when values are plausible)
  if (!implausible) {
    const m = meanBloodPressure(input);
    const k = L.markedly;
    const high =
      (m !== null && (m.systolic >= k.systolic || m.diastolic >= k.diastolic)) ||
      (t2.ldl !== undefined && t2.ldl >= k.ldl) ||
      (t2.triglycerides !== undefined && t2.triglycerides >= k.triglycerides) ||
      (t2.fastingGlucose !== undefined && t2.fastingGlucose >= k.fastingGlucose);
    if (high) ex.push("markedly_elevated");
  }

  return ex.length ? { ok: false, exclusions: ex } : { ok: true };
}
