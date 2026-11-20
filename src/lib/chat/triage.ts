import { EXCLUSION_TEXT } from "../recommender/templates";
import type { Lang } from "../recommender/types";
import { compile, hasAny, tokenize } from "./text";

/**
 * Emergency triage (sprint T-05). Runs BEFORE any other matching and always replies with
 * the fixed emergency message: no product, no diet advice, no diagnosis.
 *
 * STATUS: DRAFT, waiting for clinician review (todo.md, dr. Enny). The list is plain data
 * so a clinician can read and change it. How a signal matches:
 *   - `all` is a list of groups; EVERY group must be matched by the message;
 *   - inside a group, ANY one alternative is enough;
 *   - an alternative is one word or a few words in order ("keringat dingin").
 * Matching tolerates slang, elongation ("sakiiit") and small misspellings (see text.ts).
 * It is built to err on the side of showing the emergency message: a missed emergency is
 * far worse than one extra referral.
 */
export interface TriageSignal {
  id: string;
  /** What the signal stands for, for reviewers. Not shown to users. */
  note: string;
  all: string[][];
}

const NOW = [
  "sedang", "lagi", "sekarang", "barusan", "tadi", "kena", "terkena", "mengalami", "kayaknya", "sepertinya",
  "having", "now", "just", "think", "suspect", "got",
];

export const TRIAGE_SIGNALS: TriageSignal[] = [
  {
    id: "chest_pain",
    note: "Pain, pressure or tightness in the chest",
    all: [
      [
        "nyeri", "sakit", "sesak", "tertekan", "tertindih", "berat", "perih", "panas", "ngilu", "nyut", "ditekan",
        "diremas", "pain", "ache", "tight", "tightness", "pressure", "squeezing", "crushing", "hurts", "hurting",
        "burning", "heavy", "discomfort",
      ],
      ["dada", "dda", "chest"],
    ],
  },
  {
    id: "heart_pain",
    note: "Pain in or around the heart as the person words it",
    all: [
      ["jantung", "heart"],
      ["nyeri", "tertusuk", "sesak", "pain", "hurts", "hurt", "racing", "pounding"],
    ],
  },
  {
    id: "arm_shoulder_pain",
    note: "Pain, tightness or numbness in the left arm or shoulder",
    all: [
      ["nyeri", "sakit", "pain", "tight", "numb", "kebas", "baal", "ngilu"],
      ["lengan kiri", "bahu kiri", "tangan kiri", "left arm", "left shoulder"],
    ],
  },
  {
    id: "breathing",
    note: "Shortness of breath or trouble breathing",
    all: [
      [
        "sesak", "susah", "sulit", "kesulitan", "engap", "pendek", "berat", "tidak bisa", "tidak dapat",
        "shortness", "short", "cannot", "can not", "trouble", "difficulty", "difficult", "hard", "struggling",
        "gasping", "unable",
      ],
      ["napas", "bernapas", "breath", "breathe", "breathing", "breathless"],
    ],
  },
  {
    id: "breathless",
    note: "Breathless or gasping, said on its own",
    all: [["breathless", "engap", "gasping", "megap megap"]],
  },
  {
    id: "cold_sweat",
    note: "Cold sweat",
    all: [["keringat dingin", "berkeringat dingin", "cold sweat", "cold sweats", "sweating cold"]],
  },
  {
    id: "fainting",
    note: "Fainting, passing out, loss of consciousness",
    all: [
      [
        "pingsan", "semaput", "fainted", "fainting", "faint", "passed out", "pass out", "blacked out", "black out",
        "collapsed", "collapse", "unconscious", "tidak sadar", "hilang kesadaran", "kehilangan kesadaran", "ambruk",
      ],
    ],
  },
  {
    id: "weakness_one_side",
    note: "Sudden weakness or numbness, or on one side of the body",
    all: [
      [
        "lemah", "lemas", "lumpuh", "kelemahan", "mati rasa", "kebas", "baal", "numb", "numbness", "weak",
        "weakness", "paralyzed", "paralysed",
      ],
      [
        "sebelah", "satu sisi", "separuh", "setengah badan", "sisi kiri", "sisi kanan", "one side", "left side",
        "right side", "mendadak", "tiba tiba", "sudden", "suddenly",
      ],
    ],
  },
  {
    id: "face_droop",
    note: "Face drooping or uneven",
    all: [
      ["wajah", "muka", "mulut", "bibir", "face", "mouth", "smile"],
      ["miring", "mencong", "perot", "droop", "drooping", "droopy", "uneven", "crooked", "sagging"],
    ],
  },
  {
    id: "slurred_speech",
    note: "Slurred speech, said on its own",
    all: [["pelo", "cadel mendadak", "slurred", "slurring", "slur"]],
  },
  {
    id: "speech_trouble",
    note: "Trouble speaking or being understood",
    all: [
      ["bicara", "berbicara", "ngomong", "speak", "speaking", "talk", "talking", "speech"],
      ["sulit", "susah", "tidak bisa", "tidak jelas", "kacau", "cannot", "trouble", "difficulty", "unclear", "garbled", "confused", "bingung"],
    ],
  },
  {
    id: "sudden_severe_headache",
    note: "Sudden, severe headache",
    all: [
      ["kepala", "headache", "head"],
      ["hebat", "parah", "terparah", "terburuk", "severe", "worst", "thunderclap"],
      ["mendadak", "tiba tiba", "sudden", "suddenly"],
    ],
  },
  {
    id: "worst_headache",
    note: "\"Worst headache of my life\" without the word sudden",
    all: [
      ["kepala", "headache", "head"],
      ["terparah", "terburuk", "worst", "thunderclap"],
    ],
  },
  {
    id: "named_event_now",
    note: "A heart attack, stroke or cardiac arrest, said as happening or suspected now",
    all: [
      ["serangan jantung", "heart attack", "stroke", "henti jantung", "cardiac arrest", "jantung berhenti"],
      NOW,
    ],
  },
];

const compiled = TRIAGE_SIGNALS.map((s) => ({ id: s.id, groups: s.all.map(compile) }));

/** Ids of the emergency signals found in the message (empty when none). */
export function triage(input: string): string[] {
  const tokens = tokenize(input);
  return compiled.filter((s) => s.groups.every((g) => hasAny(tokens, g))).map((s) => s.id);
}

export const TRIAGE_NOTE: Record<Lang, string> = {
  id: "Chat ini tidak bisa menilai kondisi Anda dan tidak memberi diagnosis. Hubungi bantuan medis sekarang.",
  en: "This chat cannot assess your condition and does not give a diagnosis. Please get medical help now.",
};

/** The fixed emergency reply: the shared emergency sentence plus a note. Nothing about products. */
export const triageLines = (lang: Lang): string[] => [EXCLUSION_TEXT.emergency_symptoms[lang], TRIAGE_NOTE[lang]];
