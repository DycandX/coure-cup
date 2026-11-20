import type { ExclusionCode, Lang } from "./recommender/types";
import { THRESHOLDS } from "./recommender/scoring";
import { SAFETY_LIMITS } from "./recommender/safety";

/**
 * Short model card (sprint T-07). Every number is read from THRESHOLDS and
 * SAFETY_LIMITS, never typed again, so the page cannot drift from the rules.
 * Content states only what exists today: a draft rule set, no trained model,
 * no validation, no subgroup audit. No accuracy or validation claims.
 */

export interface ModelCardSection {
  id: string;
  heading: string;
  items: string[];
}

export interface ModelCard {
  title: string;
  subtitle: string;
  status: string;
  sections: ModelCardSection[];
}

/** Short label for each safety exclusion. Record<ExclusionCode, ...> forces an entry for any new code. */
export const EXCLUSION_LABEL: Record<ExclusionCode, Record<Lang, string>> = {
  no_consent: { id: "tidak memberi persetujuan", en: "consent not given" },
  under_age: { id: `usia di bawah ${SAFETY_LIMITS.minAge} tahun`, en: `under ${SAFETY_LIMITS.minAge} years old` },
  emergency_symptoms: { id: "gejala yang perlu pertolongan segera", en: "symptoms that need urgent care" },
  pregnant: { id: "sedang hamil", en: "pregnant" },
  kidney_disease: { id: "penyakit ginjal", en: "kidney disease" },
  soy_allergy: { id: "alergi kedelai", en: "soy allergy" },
  swallowing_difficulty: { id: "kesulitan menelan", en: "difficulty swallowing" },
  medication: { id: "penggunaan obat rutin", en: "regular medication" },
  missing_data: { id: "data kunci belum lengkap", en: "key data missing" },
  implausible_values: { id: "angka yang tidak masuk akal", en: "implausible values" },
  markedly_elevated: { id: "angka yang sangat tinggi", en: "markedly high values" },
};

const num = (n: number, lang: Lang, digits = 0) => {
  const s = n.toFixed(digits);
  return lang === "id" ? s.replace(".", ",") : s;
};

export function buildModelCard(lang: Lang): ModelCard {
  const T = THRESHOLDS;
  const L = SAFETY_LIMITS;
  const id = lang === "id";
  const n = (v: number, d = 0) => num(v, lang, d);

  const exclusions = (Object.keys(EXCLUSION_LABEL) as ExclusionCode[]).map((c) => EXCLUSION_LABEL[c][lang]);

  return {
    title: "Model card",
    subtitle: id
      ? "Ringkasan singkat cara kerja dan batas alat skrining CUORE."
      : "A short summary of how the CUORE screening tool works and where its limits are.",
    status: id
      ? "Status: draf. Aturan dan ambang di bawah menunggu penetapan tiga pakar (Stage B)."
      : "Status: draft. The rules and thresholds below are awaiting confirmation by the three experts (Stage B).",
    sections: [
      {
        id: "purpose",
        heading: id ? "Tujuan" : "Purpose",
        items: id
          ? [
              "Alat bantu keputusan, bukan diagnosis.",
              "Menyarankan modul CUORE (S, L, atau M) yang diprioritaskan untuk orang dewasa. Ini prioritas formulasi pangan, bukan pengobatan.",
              `Hanya untuk usia ${L.minAge} tahun ke atas. Bila tidak ada modul yang menonjol, alat tidak memaksakan satu modul.`,
            ]
          : [
              "A decision-support tool, not a diagnosis.",
              "Suggests which CUORE module (S, L or M) to prioritise for an adult. This is a food formulation priority, not a treatment.",
              `For ages ${L.minAge} and over only. When no module stands out, the tool does not force one.`,
            ],
      },
      {
        id: "inputs",
        heading: id ? "Data yang dipakai" : "Inputs",
        items: id
          ? [
              "Tahap 1 (wajib): usia, jenis kelamin, lingkar pinggang atau tinggi dan berat badan (salah satu cukup), kebiasaan makan, riwayat diri dan keluarga, serta keluhan.",
              `Tekanan darah (opsional): bila diisi, minimal ${L.minBpReadings} kali ukur lalu dirata-rata.`,
              "Tahap 2 (opsional): LDL, HDL, trigliserida, dan gula darah puasa dari hasil laboratorium.",
            ]
          : [
              "Tier 1 (required): age, sex, waist circumference or height and weight (either is enough), eating habits, personal and family history, and complaints.",
              `Blood pressure (optional): if entered, at least ${L.minBpReadings} readings, averaged.`,
              "Tier 2 (optional): LDL, HDL, triglycerides and fasting glucose from lab results.",
            ],
      },
      {
        id: "rules",
        heading: id ? "Aturan dan ambang saat ini (draf)" : "Current rules and thresholds (draft)",
        items: id
          ? [
              `Tekanan darah: ${n(T.bp.hypertension[0])}/${n(T.bp.hypertension[1])} mmHg atau lebih dihitung penuh; tanpa tingkat tengah (WHO 2021).`,
              `Lingkar pinggang (batas populasi Asia): ${n(T.waistCm.male)} cm untuk pria dan ${n(T.waistCm.female)} cm untuk wanita.`,
              `Indeks massa tubuh (titik tindakan Asia): ${n(T.bmi.asiaIncreased, 1)} sampai kurang dari ${n(T.bmi.asiaHigh, 1)} dihitung sebagian, ${n(T.bmi.asiaHigh, 1)} atau lebih dihitung penuh.`,
              `Gula darah puasa: ${n(T.glucose.impairedFasting)} mg/dL ke atas dihitung sebagian, ${n(T.glucose.diabetesRange)} mg/dL ke atas dihitung penuh (WHO/IDF).`,
              `LDL: ${n(T.ldl.nearOptimal)} / ${n(T.ldl.borderline)} / ${n(T.ldl.high)} mg/dL. Trigliserida: ${n(T.triglycerides.borderline)} / ${n(T.triglycerides.high)} mg/dL. HDL di bawah ${n(T.hdlLow)} mg/dL untuk semua (kelas NCEP ATP III; WHO tidak menetapkan ambang lipid).`,
              `Modul disarankan bila skor modul tertinggi minimal ${n(T.minPriority, 2)}. Keluhan hanya menambah paling banyak ${n(T.symptomWeightMax, 1)} dan tidak pernah menjadi satu-satunya alasan.`,
            ]
          : [
              `Blood pressure: ${n(T.bp.hypertension[0])}/${n(T.bp.hypertension[1])} mmHg or higher counts in full; no intermediate tier (WHO 2021).`,
              `Waist circumference (Asian population cut-offs): ${n(T.waistCm.male)} cm for men and ${n(T.waistCm.female)} cm for women.`,
              `Body mass index (Asian action points): ${n(T.bmi.asiaIncreased, 1)} to below ${n(T.bmi.asiaHigh, 1)} counts partly, ${n(T.bmi.asiaHigh, 1)} or higher counts in full.`,
              `Fasting glucose: ${n(T.glucose.impairedFasting)} mg/dL and above counts partly, ${n(T.glucose.diabetesRange)} mg/dL and above counts in full (WHO/IDF).`,
              `LDL: ${n(T.ldl.nearOptimal)} / ${n(T.ldl.borderline)} / ${n(T.ldl.high)} mg/dL. Triglycerides: ${n(T.triglycerides.borderline)} / ${n(T.triglycerides.high)} mg/dL. HDL below ${n(T.hdlLow)} mg/dL for everyone (NCEP ATP III classes; WHO sets no lipid cut-offs).`,
              `A module is suggested only when the top module score is at least ${n(T.minPriority, 2)}. Complaints add at most ${n(T.symptomWeightMax, 1)} and are never the only reason given.`,
            ],
      },
      {
        id: "safety",
        heading: id ? "Pengecualian keamanan" : "Safety exclusions",
        items: id
          ? [
              `Alat menyarankan konsultasi ke tenaga kesehatan, bukan modul, bila: ${exclusions.join("; ")}.`,
              `Angka sangat tinggi juga mengarah ke konsultasi: sistolik ${n(L.markedly.systolic)} atau diastolik ${n(L.markedly.diastolic)} mmHg atau lebih, LDL ${n(L.markedly.ldl)}, trigliserida ${n(L.markedly.triglycerides)}, atau gula puasa ${n(L.markedly.fastingGlucose)} mg/dL atau lebih.`,
            ]
          : [
              `The tool advises seeing a health professional, not a module, when: ${exclusions.join("; ")}.`,
              `Markedly high values also lead to a consultation: systolic ${n(L.markedly.systolic)} or diastolic ${n(L.markedly.diastolic)} mmHg or higher, LDL ${n(L.markedly.ldl)}, triglycerides ${n(L.markedly.triglycerides)}, or fasting glucose ${n(L.markedly.fastingGlucose)} mg/dL or higher.`,
            ],
      },
      {
        id: "missing",
        heading: id ? "Yang belum ada" : "What does not exist yet",
        items: id
          ? [
              "Model machine learning belum dilatih. Web ini berbasis aturan dan dirancang siap ML.",
              "Belum ada validasi dan belum ada angka akurasi.",
              "Belum ada audit keadilan antar kelompok pengguna.",
              "Semua angka gizi adalah estimasi dan belum merupakan hasil uji laboratorium.",
            ]
          : [
              "No machine learning model has been trained. This web app is rule-based and built to be ML-ready.",
              "There is no validation yet and no accuracy figure.",
              "There is no fairness audit across user groups yet.",
              "All nutrition values are estimates, not laboratory results.",
            ],
      },
      {
        id: "privacy",
        heading: id ? "Privasi" : "Privacy",
        items: id
          ? ["Jawaban skrining diproses di perangkat Anda. Tidak dikirim ke server dan tidak disimpan."]
          : ["Screening answers are processed on your device. They are not sent to a server and are not stored."],
      },
    ],
  };
}

