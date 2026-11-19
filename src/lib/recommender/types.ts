/**
 * Types for the CUORE rule-based dietary-priority recommender (v2).
 *
 * Pipeline: consent -> safety rule layer -> Tier 1/Tier 2 priority scoring ->
 * non-claim template output. Everything here is a pure function so the scoring
 * engine can later be swapped for a trained model without touching the UI.
 *
 * Decision-support only. NOT a diagnosis.
 */

export type ModuleId = "S" | "L" | "M";
export type Lang = "id" | "en";
export type Sex = "female" | "male";

/**
 * Food-frequency answer:
 * 0 = rarely/never (< 1x per week), 1 = sometimes (1-3x per week),
 * 2 = often (4-6x per week), 3 = almost daily.
 */
export type Freq = 0 | 1 | 2 | 3;

export const FOOD_KEYS = [
  "saltyPackaged",
  "instantNoodle",
  "addedSalt",
  "sugaryDrinks",
  "sweetSnacks",
  "fried",
  "fattyMeat",
  "vegetables", // protective item: higher frequency = lower priority
  "legumesNuts", // protective item
  "mealRegularity", // protective item
] as const;
export type FoodKey = (typeof FOOD_KEYS)[number];
export type FoodFrequency = Record<FoodKey, Freq>;

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

/** Self-reported history (own and family). */
export interface HistoryAnswers {
  hypertension: boolean;
  highCholesterol: boolean;
  diabetes: boolean; // diabetes or prediabetes
  familyHypertensionStroke: boolean;
  familyEarlyHeartDisease: boolean;
  familyDiabetes: boolean;
}

/** Self-reported complaints. */
export interface SymptomAnswers {
  headacheNeck: boolean; // headache or heavy neck
  dizziness: boolean;
  thirst: boolean; // frequent thirst
  urination: boolean; // frequent urination
  hunger: boolean; // gets hungry quickly
  tiredAfterMeals: boolean;
  weightLoss: boolean; // unexplained weight loss
}

export interface SafetyAnswers {
  pregnant: boolean;
  kidneyDisease: boolean;
  soyAllergy: boolean;
  swallowingDifficulty: boolean;
  /** Regular medication for blood pressure, sugar, cholesterol, heart or kidney. */
  takesMedication: boolean;
  /** Chest pain, shortness of breath, fainting or sudden weakness right now. */
  emergencySymptoms: boolean;
}

export interface Tier2Values {
  ldl?: number; // mg/dL
  hdl?: number; // mg/dL
  triglycerides?: number; // mg/dL
  fastingGlucose?: number; // mg/dL
}

export interface ScreeningInput {
  consent: boolean;
  age?: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
  /** Optional. Either empty (not provided) or at least two readings. */
  bloodPressure: BloodPressure[];
  history: HistoryAnswers;
  symptoms: SymptomAnswers;
  food: Partial<FoodFrequency>;
  safety: SafetyAnswers;
  tier2?: Tier2Values;
}

export type ExclusionCode =
  | "no_consent"
  | "under_age"
  | "emergency_symptoms"
  | "pregnant"
  | "kidney_disease"
  | "soy_allergy"
  | "swallowing_difficulty"
  | "medication"
  | "missing_data"
  | "implausible_values"
  | "markedly_elevated";

export type ReasonCode =
  | "salty_foods"
  | "blood_pressure"
  | "hypertension_history"
  | "sodium_symptoms"
  | "fatty_foods"
  | "low_fiber_foods"
  | "adiposity"
  | "cholesterol_history"
  | "lipid_values"
  | "sugary_foods"
  | "irregular_meals"
  | "diabetes_history"
  | "metabolic_symptoms"
  | "glucose_value";

/** Extra notes shown next to a module result. */
export type NoticeCode = "check_glucose";

export interface ModuleScores {
  S: number;
  L: number;
  M: number;
}

export type SafetyResult =
  | { ok: true }
  | { ok: false; exclusions: ExclusionCode[] };

export type Recommendation =
  | { kind: "consult"; exclusions: ExclusionCode[] }
  /** Safe to score, but no module stands out: do not force one. */
  | { kind: "none"; scores: ModuleScores; tier: 1 | 2; notices: NoticeCode[] }
  | {
      kind: "module";
      module: ModuleId;
      scores: ModuleScores;
      reasons: ReasonCode[]; // 1-2 items
      notices: NoticeCode[];
      tier: 1 | 2;
    };

export interface RecommendationText {
  headline: string;
  reasons: string[];
  notices: string[];
  disclaimer: string;
}
