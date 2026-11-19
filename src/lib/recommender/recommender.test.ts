import { describe, expect, it } from "vitest";
import {
  checkSafety,
  checkSafetyAnswers,
  computeBmi,
  recommend,
  renderRecommendation,
  scoreModules,
  type ExclusionCode,
  type FoodFrequency,
  type ScreeningInput,
} from "./index";
import { bloodPressureScore, pickModule } from "./scoring";
import { DEMO_INPUT } from "../demo";

/** "Sometimes" everywhere: nothing stands out. */
const neutralFood: FoodFrequency = {
  saltyPackaged: 1,
  instantNoodle: 1,
  addedSalt: 1,
  sugaryDrinks: 1,
  sweetSnacks: 1,
  fried: 1,
  fattyMeat: 1,
  vegetables: 2,
  legumesNuts: 2,
  mealRegularity: 2,
};

const noHistory = {
  hypertension: false,
  highCholesterol: false,
  diabetes: false,
  familyHypertensionStroke: false,
  familyEarlyHeartDisease: false,
  familyDiabetes: false,
};
const noSymptoms = {
  headacheNeck: false,
  dizziness: false,
  thirst: false,
  urination: false,
  hunger: false,
  tiredAfterMeals: false,
  weightLoss: false,
};
const noSafety = {
  pregnant: false,
  kidneyDisease: false,
  soyAllergy: false,
  swallowingDifficulty: false,
  takesMedication: false,
  emergencySymptoms: false,
};

function base(over: Partial<ScreeningInput> = {}): ScreeningInput {
  return {
    consent: true,
    age: 40,
    sex: "female",
    heightCm: 165,
    weightKg: 60, // BMI 22
    waistCm: 70,
    bloodPressure: [
      { systolic: 118, diastolic: 76 },
      { systolic: 120, diastolic: 78 },
    ],
    history: { ...noHistory },
    symptoms: { ...noSymptoms },
    food: { ...neutralFood },
    safety: { ...noSafety },
    ...over,
  };
}

const exclusionsOf = (i: ScreeningInput): ExclusionCode[] => {
  const r = checkSafety(i);
  return r.ok ? [] : r.exclusions;
};
const factor = (i: ScreeningInput, mod: "S" | "L" | "M", code: string) =>
  scoreModules(i).factors[mod].find((f) => f.code === code)!.value;

describe("safety rule layer", () => {
  it("passes a complete, plausible, non-excluded profile", () => {
    expect(checkSafety(base()).ok).toBe(true);
  });

  it("stops at missing consent and evaluates nothing else", () => {
    const r = checkSafety(base({ consent: false, safety: { ...noSafety, pregnant: true } }));
    expect(r).toEqual({ ok: false, exclusions: ["no_consent"] });
    expect(recommend(base({ consent: false })).kind).toBe("consult");
  });

  it.each([
    ["emergencySymptoms", "emergency_symptoms"],
    ["pregnant", "pregnant"],
    ["kidneyDisease", "kidney_disease"],
    ["soyAllergy", "soy_allergy"],
    ["swallowingDifficulty", "swallowing_difficulty"],
    ["takesMedication", "medication"],
  ] as const)("excludes when %s is true", (flag, code) => {
    const i = base({ safety: { ...noSafety, [flag]: true } });
    expect(exclusionsOf(i)).toEqual([code]);
    expect(recommend(i).kind).toBe("consult");
  });

  it("excludes under 18 but not 18", () => {
    expect(exclusionsOf(base({ age: 17 }))).toContain("under_age");
    expect(exclusionsOf(base({ age: 18 }))).toEqual([]);
  });

  it("collects every exclusion that applies", () => {
    const i = base({ safety: { ...noSafety, pregnant: true, soyAllergy: true } });
    expect(exclusionsOf(i)).toEqual(["pregnant", "soy_allergy"]);
  });

  describe("missing key data", () => {
    it.each([
      ["age", { age: undefined }],
      ["sex", { sex: undefined }],
      ["height", { heightCm: undefined }],
      ["weight", { weightKg: undefined }],
      ["waist", { waistCm: undefined }],
    ] as [string, Partial<ScreeningInput>][])("needs %s", (_n, over) => {
      expect(exclusionsOf(base(over))).toContain("missing_data");
    });
    it("needs all food-frequency answers", () => {
      const food: Partial<FoodFrequency> = { ...neutralFood };
      delete food.fried;
      expect(exclusionsOf(base({ food }))).toContain("missing_data");
    });
    it("blood pressure is optional, but one reading alone is incomplete", () => {
      expect(exclusionsOf(base({ bloodPressure: [] }))).toEqual([]);
      expect(exclusionsOf(base({ bloodPressure: [{ systolic: 120, diastolic: 80 }] }))).toContain("missing_data");
    });
  });

  describe("implausible values", () => {
    it.each([
      ["systolic too high", { bloodPressure: [{ systolic: 400, diastolic: 80 }, { systolic: 120, diastolic: 80 }] }],
      ["diastolic >= systolic", { bloodPressure: [{ systolic: 80, diastolic: 90 }, { systolic: 120, diastolic: 80 }] }],
      ["NaN reading", { bloodPressure: [{ systolic: NaN, diastolic: 80 }, { systolic: 120, diastolic: 80 }] }],
      ["height 20 cm", { heightCm: 20 }],
      ["weight 900 kg", { weightKg: 900 }],
      ["derived BMI 4", { heightCm: 250, weightKg: 25 }],
      ["waist 5 cm", { waistCm: 5 }],
      ["LDL 5", { tier2: { ldl: 5 } }],
      ["glucose 900", { tier2: { fastingGlucose: 900 } }],
    ] as [string, Partial<ScreeningInput>][])("flags %s", (_n, over) => {
      expect(exclusionsOf(base(over))).toContain("implausible_values");
    });
  });

  describe("markedly elevated readings", () => {
    it("flags mean BP >= 180 systolic or >= 110 diastolic", () => {
      const sys = base({ bloodPressure: [{ systolic: 185, diastolic: 100 }, { systolic: 181, diastolic: 100 }] });
      const dia = base({ bloodPressure: [{ systolic: 150, diastolic: 112 }, { systolic: 150, diastolic: 110 }] });
      expect(exclusionsOf(sys)).toContain("markedly_elevated");
      expect(exclusionsOf(dia)).toContain("markedly_elevated");
    });
    it("does not flag just below the boundary", () => {
      expect(exclusionsOf(base({ bloodPressure: [{ systolic: 179, diastolic: 109 }, { systolic: 179, diastolic: 109 }] }))).toEqual([]);
    });
    it("flags very high LDL, triglycerides, and fasting glucose", () => {
      expect(exclusionsOf(base({ tier2: { ldl: 190 } }))).toContain("markedly_elevated");
      expect(exclusionsOf(base({ tier2: { triglycerides: 500 } }))).toContain("markedly_elevated");
      expect(exclusionsOf(base({ tier2: { fastingGlucose: 200 } }))).toContain("markedly_elevated");
      expect(exclusionsOf(base({ tier2: { ldl: 189, triglycerides: 499, fastingGlucose: 199 } }))).toEqual([]);
    });
  });

  it("answer-only check (wizard step 1) lists answer-based exclusions, never missing_data", () => {
    expect(checkSafetyAnswers(true, { ...noSafety, emergencySymptoms: true, takesMedication: true })).toEqual([
      "emergency_symptoms",
      "medication",
    ]);
    expect(checkSafetyAnswers(true, noSafety)).toEqual([]);
    expect(checkSafetyAnswers(false, noSafety)).toEqual(["no_consent"]);
  });
});

describe("WHO-based draft thresholds", () => {
  it("BMI is computed from height and weight", () => {
    expect(computeBmi(170, 72)!).toBeCloseTo(24.91, 1);
    expect(computeBmi(undefined, 70)).toBeUndefined();
  });

  it("BMI >= 25 counts, 24.9 does not", () => {
    expect(factor(base({ heightCm: 170, weightKg: 72 }), "M", "adiposity")).toBe(0);
    expect(factor(base({ heightCm: 170, weightKg: 72.5 }), "M", "adiposity")).toBeGreaterThan(0);
  });

  it("waist counts from 94 cm (male) and 80 cm (female)", () => {
    expect(factor(base({ sex: "male", waistCm: 93 }), "M", "adiposity")).toBe(0);
    expect(factor(base({ sex: "male", waistCm: 94 }), "M", "adiposity")).toBeGreaterThan(0);
    expect(factor(base({ sex: "female", waistCm: 79 }), "M", "adiposity")).toBe(0);
    expect(factor(base({ sex: "female", waistCm: 80 }), "M", "adiposity")).toBeGreaterThan(0);
  });

  it("blood pressure: 140/90 full score, 130-139/85-89 partial, below none, absent none", () => {
    const bp = (s: number, d: number) => base({ bloodPressure: [{ systolic: s, diastolic: d }, { systolic: s, diastolic: d }] });
    expect(bloodPressureScore(bp(140, 80))).toBe(1);
    expect(bloodPressureScore(bp(120, 90))).toBe(1);
    expect(bloodPressureScore(bp(138, 88))).toBe(0.4);
    expect(bloodPressureScore(bp(129, 84))).toBe(0);
    expect(bloodPressureScore(base({ bloodPressure: [] }))).toBe(0);
  });

  it("fasting glucose: 126+ full, 110-125 partial", () => {
    const g = (v: number) => factor(base({ tier2: { fastingGlucose: v } }), "M", "glucose_value");
    expect(g(126)).toBe(0.5);
    expect(g(110)).toBeCloseTo(0.3);
    expect(g(109)).toBe(0);
  });
});

describe("module scoring", () => {
  it("recommends S for salty diet, hypertension history and BP >= 140/90", () => {
    const rec = recommend(
      base({
        bloodPressure: [{ systolic: 146, diastolic: 92 }, { systolic: 144, diastolic: 90 }],
        history: { ...noHistory, hypertension: true },
        food: { ...neutralFood, saltyPackaged: 3, instantNoodle: 3, addedSalt: 3 },
      }),
    );
    expect(rec.kind === "module" && rec.module).toBe("S");
    expect(rec.kind === "module" && rec.reasons.length).toBeLessThanOrEqual(2);
  });

  it("S is reachable without any blood pressure input", () => {
    const rec = recommend(
      base({
        bloodPressure: [],
        history: { ...noHistory, hypertension: true },
        symptoms: { ...noSymptoms, headacheNeck: true },
        food: { ...neutralFood, saltyPackaged: 3, instantNoodle: 2, addedSalt: 2 },
      }),
    );
    expect(rec.kind === "module" && rec.module).toBe("S");
  });

  it("recommends L for fatty diet, large waist and cholesterol history (Tier 1)", () => {
    const rec = recommend(
      base({
        sex: "male",
        waistCm: 99,
        history: { ...noHistory, highCholesterol: true },
        food: { ...neutralFood, fried: 3, fattyMeat: 3, vegetables: 0, legumesNuts: 0 },
      }),
    );
    expect(rec.kind === "module" && rec.module).toBe("L");
    expect(rec.kind === "module" && rec.tier).toBe(1);
  });

  it("L does not rely on complaints: symptoms alone never add to L", () => {
    const a = scoreModules(base());
    const b = scoreModules(base({ symptoms: { ...noSymptoms, headacheNeck: true, thirst: true, hunger: true } }));
    expect(b.scores.L).toBe(a.scores.L);
  });

  it("recommends M for sugary diet, diabetes history, thirst and high BMI", () => {
    const rec = recommend(
      base({
        heightCm: 160,
        weightKg: 75,
        history: { ...noHistory, diabetes: true },
        symptoms: { ...noSymptoms, thirst: true, tiredAfterMeals: true },
        food: { ...neutralFood, sugaryDrinks: 3, sweetSnacks: 3, mealRegularity: 0 },
      }),
    );
    expect(rec.kind === "module" && rec.module).toBe("M");
  });

  it("family history counts half of personal history", () => {
    const own = factor(base({ history: { ...noHistory, hypertension: true } }), "S", "hypertension_history");
    const fam = factor(base({ history: { ...noHistory, familyHypertensionStroke: true } }), "S", "hypertension_history");
    expect(fam).toBeCloseTo(own / 2);
  });

  it("Tier 2 lipid values refine the result towards L", () => {
    const input = base({
      history: { ...noHistory, familyHypertensionStroke: true },
      symptoms: { ...noSymptoms, headacheNeck: true },
      food: { ...neutralFood, saltyPackaged: 3, instantNoodle: 2, addedSalt: 2 },
    });
    const t1 = recommend(input);
    expect(t1.kind === "module" && t1.module).toBe("S");
    const t2 = recommend({ ...input, tier2: { ldl: 170, triglycerides: 210 } });
    expect(t2.kind === "module" && t2.module).toBe("L");
    expect(t2.kind === "module" && t2.tier).toBe(2);
    expect(t2.kind === "module" && t2.reasons).toContain("lipid_values");
  });

  it("Tier 2 fasting glucose raises M and appears as a reason", () => {
    const input = base({ food: { ...neutralFood, sugaryDrinks: 2, sweetSnacks: 2 } });
    const without = scoreModules(input).scores.M;
    const withGlu = scoreModules({ ...input, tier2: { fastingGlucose: 140 } }).scores.M;
    expect(withGlu).toBeGreaterThan(without);
    const rec = recommend({ ...input, tier2: { fastingGlucose: 140 } });
    expect(rec.kind === "module" && rec.module).toBe("M");
    expect(rec.kind === "module" && rec.reasons).toContain("glucose_value");
  });

  it("low HDL is sex-specific", () => {
    const m = scoreModules(base({ sex: "male", tier2: { hdl: 45 } }));
    const f = scoreModules(base({ sex: "female", tier2: { hdl: 45 } }));
    expect(f.scores.L).toBeGreaterThan(m.scores.L);
  });

  it("scores stay within 0..1 even for the worst profile", () => {
    const worst = scoreModules(
      base({
        sex: "male",
        waistCm: 120,
        heightCm: 170,
        weightKg: 110,
        bloodPressure: [{ systolic: 170, diastolic: 105 }, { systolic: 170, diastolic: 105 }],
        history: { hypertension: true, highCholesterol: true, diabetes: true, familyHypertensionStroke: true, familyEarlyHeartDisease: true, familyDiabetes: true },
        symptoms: { headacheNeck: true, dizziness: true, thirst: true, urination: true, hunger: true, tiredAfterMeals: true, weightLoss: true },
        food: { saltyPackaged: 3, instantNoodle: 3, addedSalt: 3, sugaryDrinks: 3, sweetSnacks: 3, fried: 3, fattyMeat: 3, vegetables: 0, legumesNuts: 0, mealRegularity: 0 },
        tier2: { ldl: 185, hdl: 30, triglycerides: 400, fastingGlucose: 190 },
      }),
    );
    for (const v of Object.values(worst.scores)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("gives one or two reasons for a profile with signals", () => {
    const rec = recommend(base({ food: { ...neutralFood, saltyPackaged: 3, instantNoodle: 3, addedSalt: 3 }, history: { ...noHistory, hypertension: true } }));
    expect(rec.kind).toBe("module");
    if (rec.kind === "module") {
      expect(rec.reasons.length).toBeGreaterThanOrEqual(1);
      expect(rec.reasons.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("no clear priority", () => {
  it("does not force a module when every score is low", () => {
    const rec = recommend(base());
    expect(rec.kind).toBe("none");
  });

  it("minimum priority boundary and deterministic tie-break S, L, M", () => {
    expect(pickModule({ S: 0.2, L: 0.2, M: 0.2 })).toBeNull();
    expect(pickModule({ S: 0.25, L: 0.1, M: 0.1 })).toBe("S");
    expect(pickModule({ S: 0.4, L: 0.4, M: 0.4 })).toBe("S");
    expect(pickModule({ S: 0.2, L: 0.4, M: 0.4 })).toBe("L");
    expect(pickModule({ S: 0.2, L: 0.3, M: 0.4 })).toBe("M");
  });

  it("renders a neutral message without a module name", () => {
    const txt = renderRecommendation(recommend(base()), "en");
    expect(txt.headline).toBe("No clear priority from your answers");
    expect(txt.reasons.join(" ")).not.toMatch(/S-CUP|L-CUP|M-CUP/);
  });
});

describe("notices", () => {
  const metabolic: Partial<ScreeningInput> = {
    heightCm: 160,
    weightKg: 75,
    history: { ...noHistory, diabetes: true },
    food: { ...neutralFood, sugaryDrinks: 3, sweetSnacks: 3 },
  };
  it("points to a glucose check when thirst, urination and weight loss occur together, besides the module", () => {
    const rec = recommend(base({ ...metabolic, symptoms: { ...noSymptoms, thirst: true, urination: true, weightLoss: true } }));
    expect(rec.kind === "module" && rec.module).toBe("M");
    expect(rec.kind === "module" && rec.notices).toEqual(["check_glucose"]);
  });
  it("still shows on a 'no clear priority' result", () => {
    const rec = recommend(base({ symptoms: { ...noSymptoms, thirst: true, urination: true, weightLoss: true } }));
    expect(rec.kind).toBe("none");
    expect(rec.kind === "none" && rec.notices).toEqual(["check_glucose"]);
    const txt = renderRecommendation(rec, "en");
    expect(txt.notices.join(" ")).toMatch(/blood sugar check/);
  });
  it("does not when only two of the three occur", () => {
    const rec = recommend(base({ ...metabolic, symptoms: { ...noSymptoms, thirst: true, urination: true } }));
    expect(rec.kind === "module" && rec.notices).toEqual([]);
  });
});

describe("safety always wins", () => {
  it("never recommends a module when an exclusion applies, whatever the scores", () => {
    const rec = recommend(
      base({
        safety: { ...noSafety, soyAllergy: true },
        history: { ...noHistory, hypertension: true },
        food: { ...neutralFood, saltyPackaged: 3, instantNoodle: 3, addedSalt: 3 },
      }),
    );
    expect(rec.kind).toBe("consult");
  });
});

describe("demo profile", () => {
  it("gives S-CUP (used in presentations)", () => {
    const rec = recommend(DEMO_INPUT);
    expect(rec.kind === "module" && rec.module).toBe("S");
  });
});

describe("output templates", () => {
  it("renders the consult outcome with the required headline and disclaimer", () => {
    const rec = recommend(base({ safety: { ...noSafety, pregnant: true } }));
    const txt = renderRecommendation(rec, "id");
    expect(txt.headline).toBe("Konsultasikan dengan tenaga kesehatan");
    expect(txt.disclaimer).toBe("Alat bantu keputusan, bukan diagnosis.");
    expect(txt.reasons.length).toBe(1);
  });

  it("renders a module outcome in both languages", () => {
    const rec = recommend(DEMO_INPUT);
    expect(renderRecommendation(rec, "id").headline).toMatch(/CUP/);
    expect(renderRecommendation(rec, "en").disclaimer).toMatch(/not a diagnosis/i);
  });
});
