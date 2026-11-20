import { buildAboutCuore } from "../about-cuore";
import { DISCLAIMER, EXCLUSION_TEXT } from "../recommender/templates";
import type { Lang, ModuleId } from "../recommender/types";
import {
  BASE_COMPOSITION,
  ESTIMATE_NOTE,
  GENERAL_NOTE,
  INGREDIENT_NAME,
  NUTRITION_KEYS,
  NUTRITION_LABEL,
  PREP_STEPS,
  PRODUCTS,
  PRODUCT_LIST,
  type Ingredient,
} from "../products";
import {
  HEART_ATTACK,
  HEART_LIMITS,
  HEART_REFERRAL,
  OTHER_SIGNS,
  SEEK_CARE_NOW,
  SEEK_CARE_SOON,
  SILENT_NOTE,
  STROKE,
} from "./heart-info";
import { CHAT_CONFIG } from "./config";
import type { AnswerContext, ChatAnswer, IntentId, KnowledgeEntry } from "./types";
import { INTENT_IDS } from "./types";

/**
 * Product Q&A knowledge base. Product facts are composed from products.ts and the
 * recommender templates so the chat can never disagree with the product pages.
 * Rules: no health claims, nutrition labelled as estimate, emergency numbers only via EMERGENCY_CALL,
 * and the word "indikasi" is not used (food has priorities, not indications).
 */

// ---- Brew details (waiting for the team) ------------------------------------------------

/**
 * Water amount, temperature and waiting time are NOT defined yet: the essay says the
 * final hydration time is still to be validated. Fill all three when the team supplies
 * them (todo.md, pertanyaan C1) and set the brew.how entry status to "final".
 */
export interface BrewDetails {
  waterMl?: number;
  temperatureC?: number;
  waitMinutes?: number;
}
export const BREW_DETAILS: BrewDetails = {};

export function brewLines(lang: Lang, details: BrewDetails = BREW_DETAILS): string[] {
  const steps = PREP_STEPS[lang].map((s, i) => `${i + 1}. ${s}`);
  const { waterMl, temperatureC, waitMinutes } = details;
  const known = waterMl !== undefined && temperatureC !== undefined && waitMinutes !== undefined;
  const extra = known
    ? lang === "id"
      ? `Gunakan sekitar ${waterMl} mL air panas (${temperatureC} °C), lalu tunggu ${waitMinutes} menit hingga mengental.`
      : `Use about ${waterMl} mL of hot water (${temperatureC} °C), then wait ${waitMinutes} minutes for it to thicken.`
    : lang === "id"
      ? "Takaran air, suhu, dan waktu tunggu yang tepat masih dalam pengujian. Ikuti petunjuk pada kemasan."
      : "The exact amount of water, temperature and waiting time are still being tested. Follow the instructions on the pack.";
  return [lang === "id" ? "Cara menyiapkan:" : "How to prepare:", ...steps, extra];
}

// ---- Helpers ---------------------------------------------------------------------------

const T = <A, B>(id: A, en: B) => ({ id, en });
const pick = <V>(lang: Lang, v: { id: V; en: V }) => v[lang];

const ingredientText = (items: Ingredient[], lang: Lang) =>
  items.map((i) => `${INGREDIENT_NAME[i.id][lang]} ${i.grams} g`).join(", ");

const modulesFor = (ctx?: AnswerContext) => (ctx?.module ? [PRODUCTS[ctx.module]] : PRODUCT_LIST);

const SCREENING_CTA: Record<Lang, string> = {
  id: "Untuk mengetahui modul mana yang diprioritaskan bagi Anda, gunakan \"Cek prioritas saya\": 3 langkah singkat yang diproses di perangkat Anda dan tidak dikirim ke server.",
  en: "To find out which module is a priority for you, use \"Check my priority\": 3 short steps processed on your device and not sent to any server.",
};

// ---- Entries ---------------------------------------------------------------------------

const ENTRIES: KnowledgeEntry[] = [
  {
    id: "about.cuore",
    chip: T("Apa itu CUORE cup?", "What is a CUORE cup?"),
    moduleScope: "all",
    // Same content as the home panel and the About page (src/lib/about-cuore.ts).
    answer: (lang) => {
      const a = buildAboutCuore(lang);
      return [
        a.intro,
        a.portion,
        ...a.modules.map((m) => `${m.name} (${m.tagline}): ${m.focus}`),
        a.notes[0],
        SCREENING_CTA[lang],
      ];
    },
    followUps: ["brew.how", "compare.modules", "who.priority"],
    source: "product",
    status: "draft",
  },
  {
    id: "brew.how",
    chip: T("Cara menyeduh", "How to prepare"),
    moduleScope: "all",
    answer: (lang) => brewLines(lang),
    followUps: ["allergens", "who.can", "nutrition.estimate"],
    source: "product",
    status: "pending-data",
  },
  {
    id: "allergens",
    chip: T("Alergen dan hal yang perlu diperhatikan", "Allergens and points to note"),
    moduleScope: "all",
    answer: (lang, ctx) => {
      const head = lang === "id" ? "Alergen dan hal yang perlu diperhatikan:" : "Allergens and points to note:";
      if (ctx?.module) return [head, ...PRODUCTS[ctx.module].allergens[lang]];
      const soy = PRODUCTS.S.allergens[lang][0];
      const lExtra = PRODUCTS.L.allergens[lang].slice(1).join(" ");
      return [head, soy, `L-CUP: ${lExtra}`];
    },
    followUps: ["caution.l", "who.consult", "ingredients"],
    source: "product",
    status: "final",
  },
  {
    id: "caution.l",
    chip: T("Peringatan khusus L-CUP", "L-CUP special caution"),
    moduleScope: ["L"],
    answer: (lang) => [
      lang === "id" ? "L-CUP: hal yang perlu diperhatikan" : "L-CUP: points to note",
      ...PRODUCTS.L.allergens[lang],
    ],
    followUps: ["who.consult", "brew.how"],
    source: "product",
    status: "final",
  },
  {
    id: "who.can",
    chip: T("Siapa yang boleh minum?", "Who can have it?"),
    moduleScope: "all",
    answer: (lang) => [GENERAL_NOTE[lang], SCREENING_CTA[lang]],
    followUps: ["who.consult", "who.priority", "screening.start"],
    source: "policy",
    status: "final",
  },
  {
    id: "who.consult",
    chip: T("Siapa yang perlu konsultasi dulu?", "Who should check with a professional first?"),
    moduleScope: "all",
    answer: (lang) => [
      lang === "id"
        ? "Perlu diperhatikan sebelum mencoba CUORE (dewasa 18 tahun ke atas):"
        : "Points to note before trying CUORE (adults 18 and over):",
      EXCLUSION_TEXT.pregnant[lang],
      EXCLUSION_TEXT.kidney_disease[lang],
      EXCLUSION_TEXT.soy_allergy[lang],
      EXCLUSION_TEXT.swallowing_difficulty[lang],
      EXCLUSION_TEXT.medication[lang],
    ],
    followUps: ["allergens", "screening.start", "out.of.scope"],
    source: "policy",
    status: "final",
  },
  {
    id: "who.priority",
    chip: T("Untuk siapa modul ini?", "Who is this module for?"),
    moduleScope: "all",
    answer: (lang, ctx) => [
      ...modulesFor(ctx).map((p) => `${p.name} (${p.tagline[lang]}): ${p.priorityFor[lang]}`),
      SCREENING_CTA[lang],
    ],
    followUps: ["screening.start", "compare.modules", "who.consult"],
    source: "product",
    status: "final",
  },
  {
    id: "compare.modules",
    chip: T("Beda S, M, dan L", "S, M and L compared"),
    moduleScope: "all",
    answer: (lang) => {
      const sodium = PRODUCT_LIST.map((p) => `${p.name} ${p.nutrition.sodiumMg} mg`).join(", ");
      return [
        ...PRODUCT_LIST.map((p) => `${p.name} (${p.tagline[lang]}): ${p.focus[lang]}`),
        lang === "id"
          ? `Natrium per 55 g (estimasi): ${sodium}. S-CUP dibedakan oleh rasa umami dari jamur dan bawang tanpa garam tambahan, bukan oleh kadar natrium.`
          : `Sodium per 55 g (estimate): ${sodium}. S-CUP is set apart by umami flavour from mushroom and alliums with no added salt, not by its sodium level.`,
        ESTIMATE_NOTE[lang],
      ];
    },
    followUps: ["who.priority", "nutrition.estimate", "screening.start"],
    source: "product",
    status: "final",
  },
  {
    id: "nutrition.estimate",
    chip: T("Nilai gizi (estimasi)", "Nutrition (estimate)"),
    moduleScope: "all",
    answer: (lang, ctx) => [
      ...modulesFor(ctx).map(
        (p) =>
          `${p.name}: ` +
          NUTRITION_KEYS.map((k) => `${NUTRITION_LABEL[k].label[lang]} ${p.nutrition[k]} ${NUTRITION_LABEL[k].unit}`).join("; "),
      ),
      ESTIMATE_NOTE[lang],
    ],
    followUps: ["compare.modules", "ingredients", "claims.health"],
    source: "product",
    status: "final",
  },
  {
    id: "ingredients",
    chip: T("Bahan-bahannya", "Ingredients"),
    moduleScope: "all",
    answer: (lang, ctx) => [
      `Universal Base 35 g: ${ingredientText(BASE_COMPOSITION, lang)}`,
      ...modulesFor(ctx).map((p) => `${p.name} 20 g: ${ingredientText(p.composition, lang)}`),
    ],
    followUps: ["allergens", "nutrition.estimate", "brew.how"],
    source: "product",
    status: "final",
  },
  {
    id: "claims.health",
    chip: T("Apakah ini obat atau punya khasiat?", "Is it a medicine, or does it have health effects?"),
    moduleScope: "all",
    answer: (lang) => [
      lang === "id"
        ? "CUORE adalah pangan, bukan obat. CUORE tidak mendiagnosis, mengobati, atau mencegah penyakit, dan belum ada studi pada manusia yang membuktikan manfaat kesehatan tertentu."
        : "CUORE is a food, not a medicine. CUORE does not diagnose, treat or prevent disease, and there are no human studies yet showing a specific health benefit.",
      lang === "id"
        ? "Modul S, L, dan M adalah prioritas formulasi pangan, bukan pengobatan. Pertanyaan tentang kondisi kesehatan Anda sebaiknya ditanyakan ke tenaga kesehatan."
        : "Modules S, L and M are food formulation priorities, not treatments. Questions about your own health are best asked of a health professional.",
      ESTIMATE_NOTE[lang],
    ],
    followUps: ["who.priority", "who.consult", "out.of.scope"],
    source: "policy",
    status: "draft",
  },
  {
    id: "screening.start",
    chip: T("Cek prioritas saya", "Check my priority"),
    moduleScope: "all",
    answer: (lang) => [SCREENING_CTA[lang], DISCLAIMER[lang]],
    followUps: ["who.consult", "who.priority"],
    source: "policy",
    status: "draft",
  },
  {
    id: "heart.symptoms",
    chip: T("Tanda dan keluhan penyakit jantung", "Heart disease signs and complaints"),
    moduleScope: "all",
    answer: (lang) =>
      CHAT_CONFIG.heartEducation
        ? [
            lang === "id"
              ? "Informasi umum tentang tanda penyakit jantung dan pembuluh darah:"
              : "General information about signs of heart and blood-vessel disease:",
            ...[HEART_ATTACK, STROKE, OTHER_SIGNS].map((s) => `${pick(lang, s.title)}: ${s.items[lang].join(" ")}`),
            SILENT_NOTE[lang],
            SEEK_CARE_NOW[lang],
            SEEK_CARE_SOON[lang],
            HEART_LIMITS[lang],
          ]
        : HEART_REFERRAL[lang],
    followUps: ["heart.emergency", "out.of.scope", "claims.health"],
    source: "who-kemenkes",
    status: "draft",
  },
  {
    id: "heart.emergency",
    chip: T("Kapan harus ke layanan darurat?", "When to get emergency help"),
    moduleScope: "all",
    // The wizard's emergency text already ends with the shared EMERGENCY_CALL.
    answer: (lang) => [EXCLUSION_TEXT.emergency_symptoms[lang], HEART_LIMITS[lang]],
    followUps: ["heart.symptoms"],
    source: "who-kemenkes",
    status: "draft",
  },
  {
    id: "out.of.scope",
    chip: T("Pertanyaan kesehatan pribadi", "A personal health question"),
    moduleScope: "all",
    answer: (lang) => [
      lang === "id"
        ? "Pertanyaan ini perlu dijawab tenaga kesehatan, misalnya soal kehamilan, obat yang Anda pakai, penyakit tertentu, atau keluhan yang Anda rasakan. Chat ini hanya memberi informasi produk."
        : "This needs to be answered by a health professional, for example about pregnancy, medication you take, a specific condition, or complaints you have. This chat only gives product information.",
      GENERAL_NOTE[lang],
    ],
    followUps: ["who.consult", "heart.emergency"],
    source: "policy",
    status: "draft",
  },
  {
    id: "unknown",
    chip: T("Topik lain", "Other topics"),
    moduleScope: "all",
    answer: (lang) => [
      lang === "id"
        ? "Saya belum yakin maksud pertanyaan Anda. Coba pilih salah satu topik di bawah, atau tanyakan ke tenaga kesehatan bila ini soal kesehatan Anda."
        : "I am not sure what you mean. Try one of the topics below, or ask a health professional if this is about your own health.",
    ],
    followUps: ["about.cuore", "brew.how", "allergens", "who.can", "who.priority", "heart.symptoms"],
    source: "policy",
    status: "draft",
  },
];

export const KNOWLEDGE: Record<IntentId, KnowledgeEntry> = Object.fromEntries(
  ENTRIES.map((e) => [e.id, e]),
) as Record<IntentId, KnowledgeEntry>;

/** Quick-reply chips shown first: what CUORE is, then the five topics the team asked for. */
export const PRIMARY_CHIPS: IntentId[] = ["about.cuore", "brew.how", "allergens", "who.can", "who.priority", "heart.symptoms"];

export function renderAnswer(id: IntentId, lang: Lang, ctx?: AnswerContext): ChatAnswer {
  const e = KNOWLEDGE[id];
  return { intent: id, lines: e.answer(lang, ctx), followUps: e.followUps, status: e.status };
}

/** Every context an answer can be rendered in: no module, then each module. */
export const ALL_CONTEXTS: (ModuleId | undefined)[] = [undefined, "S", "L", "M"];

export { INTENT_IDS };
