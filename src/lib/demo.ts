import type { ScreeningInput } from "./recommender/types";

/** Demo profile for presentations (45 y, 138/88 mmHg). Not a real person. */
export const DEMO_INPUT: ScreeningInput = {
  consent: true,
  age: 45,
  sex: "female",
  heightCm: 160,
  weightKg: 62,
  waistCm: 82,
  bloodPressure: [
    { systolic: 138, diastolic: 88 },
    { systolic: 138, diastolic: 88 },
  ],
  history: {
    hypertension: false,
    highCholesterol: false,
    diabetes: false,
    familyHypertensionStroke: true,
    familyEarlyHeartDisease: false,
    familyDiabetes: false,
  },
  symptoms: {
    headacheNeck: true,
    dizziness: false,
    thirst: false,
    urination: false,
    hunger: false,
    tiredAfterMeals: false,
    weightLoss: false,
  },
  food: {
    saltyPackaged: 3,
    instantNoodle: 2,
    addedSalt: 2,
    sugaryDrinks: 1,
    sweetSnacks: 1,
    fried: 1,
    fattyMeat: 1,
    vegetables: 2,
    legumesNuts: 2,
    mealRegularity: 2,
  },
  safety: {
    pregnant: false,
    kidneyDisease: false,
    soyAllergy: false,
    swallowingDifficulty: false,
    takesMedication: false,
    emergencySymptoms: false,
  },
};
