import { EMERGENCY_CALL } from "../recommender/templates";
import type { Lang } from "../recommender/types";

/**
 * General education about heart and blood-vessel warning signs, paraphrased from
 * public WHO and Kemenkes pages. STATUS: DRAFT, waiting for clinician review
 * (todo.md, dr. Enny). It is information and a referral, never a diagnosis.
 *
 * Deliberately NOT here: diet advice and any link between CUORE and these signs.
 * Emergency numbers come only from the shared EMERGENCY_CALL (team answer A10).
 */

export const HEART_INFO_STATUS = "draft" as const;

export const HEART_SOURCES = [
  {
    name: "WHO, Cardiovascular diseases (CVDs) fact sheet",
    url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)",
  },
  {
    name: "Kemenkes RI, Kenali Gejala Jantung Sejak Dini",
    url: "https://www.kemkes.go.id/id/kenali-gejala-jantung-sejak-dini",
  },
] as const;

interface Section {
  title: Record<Lang, string>;
  items: Record<Lang, string[]>;
}

export const HEART_ATTACK: Section = {
  title: { id: "Tanda serangan jantung", en: "Signs of a heart attack" },
  items: {
    id: [
      "Nyeri atau rasa tidak nyaman di tengah dada (tertekan, sesak, atau seperti terbakar), atau di lengan, bahu kiri, siku, rahang, leher, atau punggung.",
      "Sesak napas, mual atau muntah, pusing atau rasa mau pingsan, keringat dingin, atau wajah pucat.",
      "Pada perempuan, sesak napas, mual, serta nyeri punggung atau rahang lebih sering muncul.",
    ],
    en: [
      "Pain or discomfort in the centre of the chest (pressure, tightness or a burning feeling), or in the arms, left shoulder, elbows, jaw, neck or back.",
      "Shortness of breath, nausea or vomiting, light-headedness or feeling faint, cold sweat, or looking pale.",
      "In women, shortness of breath, nausea, and back or jaw pain are more common.",
    ],
  },
};

export const STROKE: Section = {
  title: { id: "Tanda stroke", en: "Signs of a stroke" },
  items: {
    id: [
      "Kelemahan mendadak pada wajah, lengan, atau tungkai, paling sering di satu sisi tubuh.",
      "Mati rasa mendadak, bingung, sulit bicara atau memahami pembicaraan, gangguan penglihatan, sulit berjalan atau menjaga keseimbangan, sakit kepala hebat tanpa sebab yang jelas, atau pingsan.",
    ],
    en: [
      "Sudden weakness of the face, arm or leg, most often on one side of the body.",
      "Sudden numbness, confusion, trouble speaking or understanding, vision problems, trouble walking or keeping balance, a severe headache with no clear cause, or fainting.",
    ],
  },
};

export const OTHER_SIGNS: Section = {
  title: { id: "Keluhan lain yang perlu diperhatikan", en: "Other signs to take note of" },
  items: {
    id: [
      "Kaki bengkak, mudah lelah, jantung berdebar atau detak tidak teratur, atau batuk yang tidak kunjung sembuh dengan dahak merah muda pucat atau berbusa.",
    ],
    en: [
      "Swollen legs, feeling tired easily, a pounding or irregular heartbeat, or a cough that does not go away with pale pink or foamy sputum.",
    ],
  },
};

/** Signs can be absent, and they differ between people. */
export const SILENT_NOTE: Record<Lang, string> = {
  id: "Penyakit jantung dan pembuluh darah sering tidak menimbulkan gejala; serangan jantung atau stroke bisa menjadi tanda pertamanya. Gejala juga bisa berbeda pada tiap orang.",
  en: "Heart and blood-vessel disease often has no symptoms; a heart attack or stroke can be the first sign. Symptoms can also differ from person to person.",
};

/** For signs happening right now. Same message as the wizard's emergency exclusion, plus a call to act. */
export const SEEK_CARE_NOW: Record<Lang, string> = {
  id: `Bila tanda-tanda ini terjadi sekarang, jangan menunda. ${EMERGENCY_CALL.id}`,
  en: `If these signs are happening right now, do not wait. ${EMERGENCY_CALL.en}`,
};

/** For repeated or worrying complaints that are not happening right now. */
export const SEEK_CARE_SOON: Record<Lang, string> = {
  id: "Keluhan yang berulang atau membuat Anda khawatir sebaiknya diperiksakan ke dokter, karena hanya pemeriksaan oleh tenaga kesehatan yang dapat memastikan penyebabnya.",
  en: "Complaints that keep coming back or worry you should be checked by a doctor, because only an examination by a health professional can find the cause.",
};

/**
 * Used instead of the signs list when CHAT_CONFIG.heartEducation is off: refer only.
 * Names no product and gives no diet advice.
 */
export const HEART_REFERRAL: Record<Lang, string[]> = {
  id: [
    "Tanda dan keluhan jantung perlu dinilai oleh tenaga kesehatan. Chat ini hanya memberi informasi produk dan tidak menjelaskan gejalanya.",
    `Bila Anda sedang mengalami nyeri dada, sesak napas, pingsan, atau lemah mendadak, jangan menunda. ${EMERGENCY_CALL.id}`,
    "Keluhan yang berulang atau membuat Anda khawatir sebaiknya diperiksakan ke dokter.",
  ],
  en: [
    "Heart signs and complaints need to be assessed by a health professional. This chat only gives product information and does not explain the symptoms.",
    `If you are having chest pain, shortness of breath, fainting or sudden weakness right now, do not wait. ${EMERGENCY_CALL.en}`,
    "Complaints that keep coming back or worry you should be checked by a doctor.",
  ],
};

/** Said with every heart answer: what this is not. */
export const HEART_LIMITS: Record<Lang, string> = {
  id: "Ini informasi umum, bukan diagnosis, dan daftarnya tidak lengkap. CUORE adalah pangan dan tidak dimaksudkan untuk menanggapi tanda-tanda ini.",
  en: "This is general information, not a diagnosis, and the list is not complete. CUORE is a food and is not meant as a response to these signs.",
};
