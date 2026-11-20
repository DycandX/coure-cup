import type {
  ExclusionCode,
  Lang,
  ModuleId,
  NoticeCode,
  ReasonCode,
  Recommendation,
  RecommendationText,
} from "./types";

/**
 * Pre-written, non-claim output sentences. No generative text: every sentence
 * the user can see from the recommender lives in this file so it can be
 * reviewed once (see the language rules in AGENTS.md).
 */

export const DISCLAIMER: Record<Lang, string> = {
  id: "Alat bantu keputusan, bukan diagnosis.",
  en: "Decision-support tool, not a diagnosis.",
};

/**
 * The one emergency call-to-action, shared by the wizard and the chat (team answer
 * A10). 119 = Kemenkes medical emergency line (also in SATUSEHAT Mobile);
 * 112 = Komdigi single emergency number. Checked on kemkes.go.id and
 * layanan112.komdigi.go.id, 2026-11-21.
 */
export const EMERGENCY_CALL: Record<Lang, string> = {
  id: "Segera ke IGD terdekat atau hubungi 119 (darurat medis Kemenkes) atau 112 (panggilan darurat nasional).",
  en: "Go to the nearest emergency department now, or call 119 (Ministry of Health medical emergency line) or 112 (national emergency number).",
};

export const CONSULT_HEADLINE: Record<Lang, string> = {
  id: "Konsultasikan dengan tenaga kesehatan",
  en: "Please consult a health professional",
};

export const NONE_HEADLINE: Record<Lang, string> = {
  id: "Belum ada prioritas yang jelas",
  en: "No clear priority from your answers",
};

export const NONE_BODY: Record<Lang, string> = {
  id: "Jawaban Anda belum mengarah kuat ke satu modul, jadi tidak ada modul yang disarankan. Jika Anda ragu, tanyakan ke tenaga kesehatan.",
  en: "Your answers do not point strongly to one module, so no module is suggested. If you are unsure, ask a health professional.",
};

export const EXCLUSION_TEXT: Record<ExclusionCode, Record<Lang, string>> = {
  no_consent: {
    id: "Persetujuan penggunaan data diperlukan untuk melanjutkan.",
    en: "Consent to use your data is needed to continue.",
  },
  under_age: {
    id: "Alat ini hanya untuk orang dewasa (18 tahun ke atas).",
    en: "This tool is for adults (18 years and over) only.",
  },
  emergency_symptoms: {
    id: `Nyeri dada, sesak napas, pingsan, atau lemah mendadak perlu segera diperiksa tenaga kesehatan atau layanan gawat darurat. ${EMERGENCY_CALL.id}`,
    en: `Chest pain, shortness of breath, fainting or sudden weakness need prompt attention from a health professional or emergency services. ${EMERGENCY_CALL.en}`,
  },
  pregnant: {
    id: "Kehamilan perlu diperhatikan: bicarakan dulu dengan tenaga kesehatan.",
    en: "Pregnancy needs attention: please talk to a health professional first.",
  },
  kidney_disease: {
    id: "Kondisi ginjal perlu diperhatikan: bicarakan dulu dengan tenaga kesehatan.",
    en: "Kidney conditions need attention: please talk to a health professional first.",
  },
  soy_allergy: {
    id: "CUORE mengandung kedelai (tepung tempe). Perlu diperhatikan bila Anda alergi kedelai.",
    en: "CUORE contains soy (tempeh flour). Please take note if you are allergic to soy.",
  },
  swallowing_difficulty: {
    id: "Kesulitan menelan perlu diperhatikan: bicarakan dulu dengan tenaga kesehatan.",
    en: "Swallowing difficulty needs attention: please talk to a health professional first.",
  },
  medication: {
    id: "Penggunaan obat rutin perlu diperhatikan: bicarakan dulu dengan tenaga kesehatan.",
    en: "Regular medication needs attention: please talk to a health professional first.",
  },
  missing_data: {
    id: "Data kunci belum lengkap, sehingga modul tidak dapat disarankan.",
    en: "Some key data is missing, so a module cannot be suggested.",
  },
  implausible_values: {
    id: "Ada angka yang tampak tidak wajar. Periksa kembali pengukuran Anda atau tanyakan ke tenaga kesehatan.",
    en: "Some values look implausible. Please re-check your measurements or ask a health professional.",
  },
  markedly_elevated: {
    id: "Angka yang Anda masukkan cukup tinggi. Sebaiknya dibahas dengan tenaga kesehatan.",
    en: "The values you entered are quite high. They are best discussed with a health professional.",
  },
};

export const MODULE_NAME: Record<ModuleId, string> = {
  S: "S-CUP",
  L: "L-CUP",
  M: "M-CUP",
};

export const MODULE_HEADLINE: Record<ModuleId, Record<Lang, string>> = {
  S: {
    id: "Prioritas formulasi untuk profil Anda: S-CUP (Sodium-conscious)",
    en: "Formulation priority for your profile: S-CUP (Sodium-conscious)",
  },
  L: {
    id: "Prioritas formulasi untuk profil Anda: L-CUP (Lipid-oriented)",
    en: "Formulation priority for your profile: L-CUP (Lipid-oriented)",
  },
  M: {
    id: "Prioritas formulasi untuk profil Anda: M-CUP (Metabolic)",
    en: "Formulation priority for your profile: M-CUP (Metabolic)",
  },
};

export const REASON_TEXT: Record<ReasonCode, Record<Lang, string>> = {
  salty_foods: {
    id: "Pola makan Anda menunjukkan cukup sering makan makanan kemasan atau asin.",
    en: "Your eating pattern shows fairly frequent salty or packaged foods.",
  },
  blood_pressure: {
    id: "Rata-rata tekanan darah yang Anda masukkan menunjukkan prioritas pada perhatian terhadap sodium.",
    en: "The average blood pressure you entered points to a priority on sodium awareness.",
  },
  hypertension_history: {
    id: "Anda menyebut riwayat tekanan darah tinggi pada diri sendiri atau keluarga.",
    en: "You mentioned a personal or family history related to high blood pressure.",
  },
  sodium_symptoms: {
    id: "Anda menyebut keluhan seperti sakit kepala, tengkuk berat, atau pusing.",
    en: "You mentioned complaints such as headache, a heavy neck, or dizziness.",
  },
  fatty_foods: {
    id: "Pola makan Anda menunjukkan cukup sering makan gorengan atau makanan berlemak.",
    en: "Your eating pattern shows fairly frequent fried or fatty foods.",
  },
  low_fiber_foods: {
    id: "Asupan sayur dan kacang-kacangan Anda masih bisa ditingkatkan.",
    en: "Your vegetable and legume intake could be higher.",
  },
  adiposity: {
    id: "Lingkar pinggang atau BMI Anda berada di atas rentang acuan WHO.",
    en: "Your waist circumference or BMI is above the WHO reference range.",
  },
  cholesterol_history: {
    id: "Anda menyebut riwayat kolesterol tinggi atau penyakit jantung dini pada keluarga.",
    en: "You mentioned a history of high cholesterol or early heart disease in the family.",
  },
  lipid_values: {
    id: "Nilai lipid yang Anda masukkan menunjukkan prioritas pada serat larut.",
    en: "The lipid values you entered point to a priority on soluble fibre.",
  },
  sugary_foods: {
    id: "Pola makan Anda menunjukkan cukup sering minuman manis atau camilan manis.",
    en: "Your eating pattern shows fairly frequent sugary drinks or sweet snacks.",
  },
  irregular_meals: {
    id: "Jadwal makan Anda belum teratur.",
    en: "Your meal times are not yet regular.",
  },
  diabetes_history: {
    id: "Anda menyebut riwayat gula darah tinggi pada diri sendiri atau keluarga.",
    en: "You mentioned a personal or family history related to high blood sugar.",
  },
  metabolic_symptoms: {
    id: "Anda menyebut keluhan seperti sering haus, sering buang air kecil, cepat lapar, atau lemas setelah makan.",
    en: "You mentioned complaints such as frequent thirst or urination, quick hunger, or tiredness after meals.",
  },
  glucose_value: {
    id: "Nilai gula darah puasa yang Anda masukkan menunjukkan prioritas metabolik.",
    en: "The fasting glucose value you entered points to a metabolic priority.",
  },
};

export const NOTICE_TEXT: Record<NoticeCode, Record<Lang, string>> = {
  check_glucose: {
    id: "Sering haus dan buang air kecil bersama penurunan berat badan tanpa sebab perlu dibicarakan dengan tenaga kesehatan, misalnya untuk pemeriksaan gula darah.",
    en: "Frequent thirst and urination together with unexplained weight loss are worth discussing with a health professional, for example a blood sugar check.",
  },
};

export function renderRecommendation(rec: Recommendation, lang: Lang): RecommendationText {
  const disclaimer = DISCLAIMER[lang];
  if (rec.kind === "consult") {
    return {
      headline: CONSULT_HEADLINE[lang],
      reasons: rec.exclusions.map((e) => EXCLUSION_TEXT[e][lang]),
      notices: [],
      disclaimer,
    };
  }
  if (rec.kind === "none") {
    return {
      headline: NONE_HEADLINE[lang],
      reasons: [NONE_BODY[lang]],
      notices: rec.notices.map((n) => NOTICE_TEXT[n][lang]),
      disclaimer,
    };
  }
  return {
    headline: MODULE_HEADLINE[rec.module][lang],
    reasons: rec.reasons.map((r) => REASON_TEXT[r][lang]),
    notices: rec.notices.map((n) => NOTICE_TEXT[n][lang]),
    disclaimer,
  };
}
