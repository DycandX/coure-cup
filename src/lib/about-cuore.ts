import type { Lang, ModuleId } from "./recommender/types";
import { BASE_COMPOSITION, ESTIMATE_NOTE, PREP_STEPS, PRODUCT_LIST, PRODUCTS } from "./products";

/**
 * "What is a CUORE cup?" (one source for the home panel, the About page and the chat).
 * Every number is computed from products.ts, never typed again. No health claims:
 * it is a food, the modules are formulation priorities, nutrition values are estimates.
 */

const sum = (items: { grams: number }[]) => items.reduce((n, i) => n + i.grams, 0);

export const PORTION = {
  baseGrams: sum(BASE_COMPOSITION),
  moduleGrams: sum(PRODUCTS.S.composition),
  get totalGrams() {
    return this.baseGrams + this.moduleGrams;
  },
};

export interface AboutCuore {
  title: string;
  intro: string;
  /** One line: portion = base + module. */
  portion: string;
  /** Short labels for the visual: [Universal Base, Module, Portion]. */
  portionParts: { label: string; grams: number }[];
  stepsTitle: string;
  steps: string[];
  modulesTitle: string;
  modules: { id: ModuleId; name: string; tagline: string; focus: string; theme: string }[];
  notesTitle: string;
  notes: string[];
  cta: string;
}

export function buildAboutCuore(lang: Lang): AboutCuore {
  const id = lang === "id";
  const { baseGrams: b, moduleGrams: m, totalGrams: total } = PORTION;
  return {
    title: id ? "Apa itu CUORE cup?" : "What is a CUORE cup?",
    intro: id
      ? "CUORE adalah bubur instan gurih modular berbahan pangan lokal, seperti sorgum, tempe, porang, dan jamur tiram. Rasanya gurih, dan Anda memilih satu dari tiga modul."
      : "CUORE is a modular savoury instant porridge made from local ingredients such as sorghum, tempeh, porang and oyster mushroom. You choose one of three modules.",
    portion: id
      ? `Satu porsi ${total} g = ${b} g Universal Base + 1 modul ${m} g (S-CUP, M-CUP, atau L-CUP).`
      : `One ${total} g portion = ${b} g Universal Base + one ${m} g module (S-CUP, M-CUP or L-CUP).`,
    portionParts: [
      { label: "Universal Base", grams: b },
      { label: id ? "1 modul" : "1 module", grams: m },
      { label: id ? "1 porsi" : "1 portion", grams: total },
    ],
    stepsTitle: id ? "Cara kerjanya" : "How it works",
    steps: id
      ? [
          "Pilih modul. Pindai QR di cup, atau pilih sendiri: S-CUP, M-CUP, atau L-CUP.",
          PREP_STEPS.id.join(" "),
          "Ingin tahu modul mana yang diprioritaskan untuk Anda? Isi cek prioritas: 3 langkah singkat yang diproses di perangkat Anda dan tidak dikirim ke server.",
        ]
      : [
          "Choose a module. Scan the QR code on the cup, or pick one yourself: S-CUP, M-CUP or L-CUP.",
          PREP_STEPS.en.join(" "),
          "Want to know which module is a priority for you? Do the priority check: 3 short steps processed on your device and not sent to any server.",
        ],
    modulesTitle: id ? "Tiga modul" : "Three modules",
    modules: PRODUCT_LIST.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline[lang],
      focus: p.focus[lang],
      theme: p.theme,
    })),
    notesTitle: id ? "Perlu diperhatikan" : "Points to note",
    notes: [
      id
        ? "CUORE adalah pangan, bukan obat. Modul S, M, dan L adalah prioritas formulasi pangan, bukan pengobatan."
        : "CUORE is a food, not a medicine. Modules S, M and L are food formulation priorities, not treatments.",
      PRODUCTS.S.allergens[lang][0],
      PRODUCTS.L.allergens[lang][1],
      ESTIMATE_NOTE[lang],
    ],
    cta: id ? "Cek prioritas saya" : "Check my priority",
  };
}
