import type { Lang, ModuleId } from "./recommender/types";

/**
 * Product data from docs/Brief_Web_CUORE.md. All nutrition values are ESTIMATES
 * (not laboratory results) per 55 g (35 g Universal Base + 20 g module).
 */

export interface Ingredient {
  id: string;
  grams: number;
}

export const BASE_COMPOSITION: Ingredient[] = [
  { id: "sorghum", grams: 15 },
  { id: "brownRice", grams: 8 },
  { id: "tempehFlour", grams: 5 },
  { id: "mungBean", grams: 4 },
  { id: "oysterMushroom", grams: 1 },
  { id: "garlic", grams: 1 },
  { id: "shallot", grams: 1 },
];

export const INGREDIENT_NAME: Record<string, Record<Lang, string>> = {
  sorghum: { id: "Sorgum", en: "Sorghum" },
  brownRice: { id: "Beras merah", en: "Brown rice" },
  tempehFlour: { id: "Tepung tempe", en: "Tempeh flour" },
  mungBean: { id: "Kacang hijau", en: "Mung bean" },
  oysterMushroom: { id: "Jamur tiram", en: "Oyster mushroom" },
  garlic: { id: "Bawang putih", en: "Garlic" },
  shallot: { id: "Bawang merah", en: "Shallot" },
  mocaf: { id: "MOCAF", en: "MOCAF (modified cassava flour)" },
  basilSeed: { id: "Biji selasih", en: "Basil seed" },
  rawBananaFlour: { id: "Tepung pisang mentah", en: "Raw banana flour" },
  konjac: { id: "Glukomanan porang", en: "Porang glucomannan" },
  riceBran: { id: "Dedak beras", en: "Rice bran" },
};

export const NUTRITION_KEYS = [
  "energyKcal",
  "protein",
  "fat",
  "carbohydrate",
  "fibre",
  "solubleFibre",
  "resistantStarch",
  "sodiumMg",
  "addedSugar",
] as const;
export type NutritionKey = (typeof NUTRITION_KEYS)[number];

export const NUTRITION_LABEL: Record<NutritionKey, { label: Record<Lang, string>; unit: string }> = {
  energyKcal: { label: { id: "Energi", en: "Energy" }, unit: "kcal" },
  protein: { label: { id: "Protein", en: "Protein" }, unit: "g" },
  fat: { label: { id: "Lemak total", en: "Total fat" }, unit: "g" },
  carbohydrate: { label: { id: "Karbohidrat", en: "Carbohydrate" }, unit: "g" },
  fibre: { label: { id: "Serat pangan", en: "Dietary fibre" }, unit: "g" },
  solubleFibre: { label: { id: "Serat larut", en: "Soluble fibre" }, unit: "g" },
  resistantStarch: { label: { id: "Pati resisten", en: "Resistant starch" }, unit: "g" },
  sodiumMg: { label: { id: "Natrium", en: "Sodium" }, unit: "mg" },
  addedSugar: { label: { id: "Gula tambahan", en: "Added sugar" }, unit: "g" },
};

export interface Product {
  id: ModuleId;
  slug: "s" | "l" | "m";
  name: string;
  /** Theme colour name used by Tailwind tokens (see globals.css). */
  theme: "pink" | "green" | "purple";
  tagline: Record<Lang, string>;
  focus: Record<Lang, string>;
  priorityFor: Record<Lang, string>;
  benefit: Record<Lang, string>;
  composition: Ingredient[];
  allergens: Record<Lang, string[]>;
  nutrition: Record<NutritionKey, number>;
}

const SOY_ID = "Mengandung kedelai (tepung tempe).";
const SOY_EN = "Contains soy (tempeh flour).";

export const PRODUCTS: Record<ModuleId, Product> = {
  S: {
    id: "S",
    slug: "s",
    name: "S-CUP",
    theme: "pink",
    tagline: { id: "Sodium-conscious", en: "Sodium-conscious" },
    focus: {
      id: "Rasa gurih dari jamur tiram, bawang putih, dan bawang merah, tanpa garam tambahan.",
      en: "Savoury flavour from oyster mushroom, garlic and shallot, with no added salt.",
    },
    priorityFor: {
      id: "Untuk orang dewasa yang hasil profilnya menunjukkan prioritas pada pola makan asin. Ini prioritas formulasi, bukan pengobatan.",
      en: "For adults whose profile shows a priority on a salty eating pattern. This is a formulation priority, not a treatment.",
    },
    benefit: {
      id: "Pilihan rasa gurih dengan umami dari jamur dan bawang, tanpa garam tambahan.",
      en: "A savoury option with umami from mushroom and alliums, with no added salt.",
    },
    composition: [
      { id: "oysterMushroom", grams: 5 },
      { id: "garlic", grams: 2 },
      { id: "shallot", grams: 2 },
      { id: "sorghum", grams: 5 },
      { id: "mocaf", grams: 4 },
      { id: "basilSeed", grams: 2 },
    ],
    allergens: {
      id: [SOY_ID.replace("(tepung tempe).", "(tepung tempe) pada Universal Base.")],
      en: [SOY_EN.replace("(tempeh flour).", "(tempeh flour) in the Universal Base.")],
    },
    nutrition: {
      energyKcal: 203,
      protein: 8.1,
      fat: 3.4,
      carbohydrate: 35.0,
      fibre: 5.5,
      solubleFibre: 1.9,
      resistantStarch: 2.2,
      sodiumMg: 17,
      addedSugar: 0,
    },
  },
  M: {
    id: "M",
    slug: "m",
    name: "M-CUP",
    theme: "green",
    tagline: { id: "Metabolic", en: "Metabolic" },
    focus: {
      id: "Menonjolkan pati resisten dan protein nabati.",
      en: "Highlights resistant starch and plant protein.",
    },
    priorityFor: {
      id: "Untuk orang dewasa yang hasil profilnya menunjukkan prioritas metabolik. Ini prioritas formulasi, bukan pengobatan.",
      en: "For adults whose profile shows a metabolic priority. This is a formulation priority, not a treatment.",
    },
    benefit: {
      id: "Menonjolkan pati resisten dan protein nabati (nilai gizi estimasi).",
      en: "Highlights resistant starch and plant protein (nutrition values estimated).",
    },
    composition: [
      { id: "rawBananaFlour", grams: 7 },
      { id: "mocaf", grams: 4 },
      { id: "tempehFlour", grams: 4 },
      { id: "mungBean", grams: 2 },
      { id: "sorghum", grams: 3 },
    ],
    allergens: { id: [SOY_ID.replace("(tepung tempe)", "(tempe)")], en: [SOY_EN.replace("(tempeh flour)", "(tempeh)")] },
    nutrition: {
      energyKcal: 208,
      protein: 11.2,
      fat: 3.5,
      carbohydrate: 33.0,
      fibre: 7.5,
      solubleFibre: 3.1,
      resistantStarch: 5.8,
      sodiumMg: 8,
      addedSugar: 0,
    },
  },
  L: {
    id: "L",
    slug: "l",
    name: "L-CUP",
    theme: "purple",
    tagline: { id: "Lipid-oriented", en: "Lipid-oriented" },
    focus: {
      id: "Menonjolkan serat larut kental dari glukomanan porang dan biji selasih.",
      en: "Highlights viscous soluble fibre from porang glucomannan and basil seed.",
    },
    priorityFor: {
      id: "Untuk orang dewasa yang hasil profilnya menunjukkan prioritas lipid. Ini prioritas formulasi, bukan pengobatan.",
      en: "For adults whose profile shows a lipid priority. This is a formulation priority, not a treatment.",
    },
    benefit: {
      id: "Menonjolkan serat larut kental dari glukomanan porang dan biji selasih (nilai gizi estimasi).",
      en: "Highlights viscous soluble fibre from porang glucomannan and basil seed (nutrition values estimated).",
    },
    composition: [
      { id: "konjac", grams: 6 },
      { id: "basilSeed", grams: 4 },
      { id: "riceBran", grams: 3 },
      { id: "tempehFlour", grams: 2 },
      { id: "sorghum", grams: 3 },
      { id: "rawBananaFlour", grams: 2 },
    ],
    allergens: {
      id: [
        SOY_ID.replace("(tepung tempe)", "(tempe)"),
        "Serat kental mengembang saat terkena air: tidak untuk orang dengan kesulitan menelan, dan siapkan sesuai petunjuk dengan cairan yang cukup.",
        "Porang mengandung kalsium oksalat, karena itu diproses untuk menurunkan kadarnya.",
      ],
      en: [
        SOY_EN.replace("(tempeh flour)", "(tempeh)"),
        "The viscous fibre swells on contact with water: not for people with swallowing difficulty; prepare as directed with enough liquid.",
        "Porang contains calcium oxalate, so it is processed to reduce its level.",
      ],
    },
    nutrition: {
      energyKcal: 218,
      protein: 8.9,
      fat: 5.8,
      carbohydrate: 32.5,
      fibre: 8.8,
      solubleFibre: 4.2,
      resistantStarch: 2.5,
      sodiumMg: 8,
      addedSugar: 0,
    },
  },
};

export const PRODUCT_LIST: Product[] = [PRODUCTS.S, PRODUCTS.M, PRODUCTS.L];
export const BY_SLUG = { s: PRODUCTS.S, m: PRODUCTS.M, l: PRODUCTS.L } as const;

export const PREP_STEPS: Record<Lang, string[]> = {
  id: [
    "Tuang Universal Base 35 g dan 1 modul 20 g ke dalam cup.",
    "Tambahkan air panas.",
    "Aduk rata.",
    "Tunggu hingga mengental.",
  ],
  en: [
    "Pour the 35 g Universal Base and one 20 g module into the cup.",
    "Add hot water.",
    "Stir well.",
    "Wait for it to thicken.",
  ],
};

export const GENERAL_NOTE: Record<Lang, string> = {
  id: "Dewasa 18+. Jika hamil, sakit ginjal, alergi kedelai, atau memakai obat tertentu, konsultasikan dulu dengan tenaga kesehatan. Nilai gizi adalah estimasi dan belum diuji laboratorium. CUORE tidak mendiagnosis, mengobati, atau mencegah penyakit.",
  en: "Adults 18+. If pregnant, with kidney disease, soy allergy, or taking certain medication, please consult a health professional first. Nutrition values are estimates and have not been laboratory tested. CUORE does not diagnose, treat or prevent disease.",
};

export const ESTIMATE_NOTE: Record<Lang, string> = {
  id: "Nilai gizi per 55 g adalah estimasi (belum hasil lab).",
  en: "Nutrition values per 55 g are estimates (not laboratory results).",
};
