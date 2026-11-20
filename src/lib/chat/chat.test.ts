import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FORBIDDEN, stripNegatedDisclaimer } from "../compliance-rules";
import { EMERGENCY_CALL } from "../recommender/templates";
import type { Lang } from "../recommender/types";
import { CHAT_CONFIG } from "./config";
import { answer, chipRef, classify, MAX_INPUT, renderReply } from "./engine";
import { HEART_REFERRAL } from "./heart-info";
import { KNOWLEDGE, renderAnswer } from "./knowledge";
import { editDistance, tokenize, tokenMatches } from "./text";
import { TRIAGE_SIGNALS, triage, triageLines } from "./triage";
import { INTENT_IDS } from "./types";

const LANGS: Lang[] = ["id", "en"];
const PRODUCT_WORDS = /CUORE|S-CUP|M-CUP|L-CUP|modul|module/i;

// ---- emergency triage (T-05) ------------------------------------------------------------

/** Messages that MUST reach the emergency reply: Indonesian, English, slang and misspellings. */
const EMERGENCY: string[] = [
  // Indonesian
  "dada saya sakit",
  "nyeri dada sejak tadi",
  "dada terasa tertekan",
  "dada sesak",
  "sesak napas",
  "saya susah bernapas",
  "tidak bisa napas",
  "sesak nafas parah",
  "keringat dingin dan mual",
  "saya hampir pingsan",
  "tadi pingsan",
  "lengan kiri sakit menjalar ke punggung",
  "tangan kiri saya nyeri",
  "badan saya lemah sebelah",
  "tangan kanan mati rasa mendadak",
  "wajah saya miring",
  "bicara saya pelo",
  "tiba-tiba susah bicara",
  "sakit kepala hebat mendadak",
  "kepala saya sakit terparah seumur hidup",
  "kayaknya saya kena serangan jantung",
  "saya sedang stroke",
  "jantung saya nyeri",
  "dadaku sakit sekali",
  // Indonesian: slang and misspellings
  "dada saya sakiiit",
  "sesk napas",
  "pingsn tadi pagi",
  "keringat dinggin",
  "nyri dada",
  "susah nafas",
  "ga bisa napas",
  "sesek banget dada gue",
  // English
  "chest pain",
  "my chest hurts",
  "tightness in my chest",
  "pressure in my chest",
  "crushing chest pain",
  "shortness of breath",
  "I can't breathe",
  "cant breathe",
  "trouble breathing",
  "it is hard to breathe",
  "I am short of breath",
  "I'm in a cold sweat",
  "I feel like I'm going to faint",
  "I passed out",
  "he collapsed",
  "she is unconscious",
  "numbness on one side of my body",
  "sudden weakness in my arm",
  "my face is drooping",
  "slurred speech",
  "trouble speaking",
  "sudden severe headache",
  "worst headache of my life",
  "I think I'm having a heart attack",
  "I'm having a stroke",
  "pain in my left arm",
  // English: misspellings
  "chest pian",
  "shortnes of breath",
  "cant brethe",
  "difficulty breathng",
];

/** Everyday questions that must NOT be treated as an emergency. */
const NOT_EMERGENCY: string[] = [
  "bagaimana cara menyeduh S-CUP?",
  "apa saja tanda serangan jantung?",
  "what are the signs of a stroke",
  "berapa natrium di M-CUP",
  "can children have it",
  "is there soy in it",
  "apakah aman untuk ibu hamil",
  "how much protein is in L-CUP",
  "boleh diminum setiap hari?",
  "heart disease signs",
  "apa itu stroke",
  "what is the difference between S and L",
  "where can I buy it",
  "harganya berapa",
  "beli di mana",
  "kepala saya agak pusing",
  "badan saya lemas hari ini",
  "I have a headache",
  "my hand hurts a bit",
  "what is in the universal base",
  "apakah ini obat?",
  "can it lower cholesterol",
  "tanda dan keluhan penyakit jantung",
  "Kapan harus ke layanan darurat?",
  "When to get emergency help",
];

describe("emergency triage", () => {
  it("has at least 20 Indonesian and 20 English emergency phrases in the test set", () => {
    expect(EMERGENCY.length).toBeGreaterThanOrEqual(40);
  });

  it.each(EMERGENCY)("catches: %s", (msg) => {
    expect(triage(msg), msg).not.toEqual([]);
  });

  it.each(EMERGENCY)("and the chat answers it with the emergency reply: %s", (msg) => {
    for (const lang of LANGS) {
      const r = answer(msg, lang);
      expect(r.reason).toBe("triage");
      expect(r.lines.join(" ")).toContain(EMERGENCY_CALL[lang]);
    }
  });

  it.each(NOT_EMERGENCY)("does not trigger on: %s", (msg) => {
    expect(triage(msg), msg).toEqual([]);
    expect(classify(msg).reason).not.toBe("triage");
  });

  it("beats every other kind of match, including claim and product questions", () => {
    for (const msg of [
      "dada saya sakit setelah minum cuore, bisa sembuh ga?",
      "I can't breathe, is it safe to drink L-CUP?",
      "sesak napas, cara menyeduhnya gimana",
      "chest pain, can I take it with my medication",
    ]) {
      expect(classify(msg, { module: "S" }).reason, msg).toBe("triage");
    }
  });

  it("replies with the fixed emergency text only: no product, no follow-up chips", () => {
    for (const lang of LANGS) {
      const r = renderReply(classify("chest pain", { module: "L" }), lang);
      expect(r.followUps).toEqual([]);
      expect(r.lines).toEqual(triageLines(lang));
      expect(r.lines.join(" ")).not.toMatch(PRODUCT_WORDS);
    }
  });

  it("keeps its signals as readable data with a note for the reviewer", () => {
    expect(TRIAGE_SIGNALS.length).toBeGreaterThanOrEqual(10);
    for (const s of TRIAGE_SIGNALS) {
      expect(s.note.length, s.id).toBeGreaterThan(5);
      expect(s.all.length).toBeGreaterThan(0);
      for (const group of s.all) expect(group.length).toBeGreaterThan(0);
    }
  });
});

// ---- text matching -----------------------------------------------------------------------

describe("text matching", () => {
  it("tokenizes accents, punctuation, slang and elongated words", () => {
    expect(tokenize("Dadaku, SAKIIIT!!")).toEqual(["dada", "sakit"]);
    expect(tokenize("I can't breathe")).toEqual(["i", "cannot", "breathe"]);
    expect(tokenize("gak bisa nafas")).toEqual(["tidak", "bisa", "napas"]);
  });

  it("allows one edit on longer words, not on short ones", () => {
    expect(tokenMatches("sesk", "sesak")).toBe(true);
    expect(tokenMatches("pian", "pain")).toBe(true); // swapped letters
    expect(tokenMatches("data", "dada")).toBe(false);
    expect(tokenMatches("right", "tight")).toBe(false); // first letter differs
    expect(tokenMatches("check", "chest")).toBe(false); // two edits
    expect(editDistance("napas", "nafas")).toBe(1);
  });
});

// ---- intents (T-04) ----------------------------------------------------------------------

/** [message, intent]. Each primary topic has 8 free-form questions, Indonesian and English, with misspellings. */
const VARIATIONS: Record<string, string[]> = {
  "about.cuore": [
    "apa itu CUORE cup?",
    "cuore itu apa sih",
    "jelaskan tentang cuore",
    "ini produk apa",
    "what is a CUORE cup",
    "whats cuore",
    "tell me about cuore",
    "what is cuoer cup", // misspelling
  ],
  "brew.how": [
    "bagaimana cara menyeduhnya?",
    "berapa air panas yang dipakai",
    "cara bikin cuore gimana",
    "caranya nyeduh gmn",
    "cara menyedu nya gimana", // misspelling
    "how do I prepare it",
    "how much hot water do I add",
    "preperation instructions", // misspelling
  ],
  allergens: [
    "ada alergen apa saja?",
    "mengandung kedelai ga?",
    "aku alergi kacang kedelai",
    "efek sampingnya apa?",
    "alergenn apa aja", // misspelling
    "does it contain soy",
    "what are the side effects",
    "is it ok if I'm alergic to soy", // misspelling
  ],
  "who.can": [
    "siapa yang boleh minum cuore?",
    "apakah aman dikonsumsi lansia",
    "bolehkah anak-anak mengonsumsinya",
    "siapa yg bleh minum", // misspelling
    "who can have this",
    "is it safe for everyone",
    "can kids eat it",
    "sutable for adults", // misspelling
  ],
  "who.priority": [
    "untuk siapa modul S ini?",
    "ini diperuntukkan buat siapa",
    "prioritas modul L apa",
    "untk siapa modul ini", // misspelling
    "who is this module for",
    "who is L-CUP for",
    "what is M-CUP meant for",
    "who is this modul for", // misspelling
  ],
  "heart.symptoms": [
    "apa saja gejala penyakit jantung",
    "tanda-tanda serangan jantung",
    "ciri ciri stroke",
    "gejla jantung", // misspelling
    "what are the heart attack symptoms",
    "signs of stroke",
    "heart disease warning signs",
    "symtoms of heart problem", // misspelling
  ],
  ingredients: ["bahan-bahannya apa saja", "terbuat dari apa?", "what are the ingredients", "whats in the module"],
  "nutrition.estimate": ["berapa kalori per porsi", "kandungan protein dan natrium", "how many calories", "nutritional values"],
  "compare.modules": ["apa beda S dan L", "bandingkan ketiga modul", "difference between S, M and L", "which is better S or M"],
  "screening.start": ["saya mau cek prioritas", "modul mana yang cocok untuk saya", "which module is right for me", "start the screening"],
  "who.consult": ["perlu konsultasi dokter dulu?", "siapa yang perlu hati-hati", "should I see a doctor first", "who should check with a professional"],
  "heart.emergency": ["kapan harus ke IGD", "nomor darurat berapa", "when to get emergency help", "do I need an ambulance"],
  "caution.l": ["peringatan khusus L-CUP", "kenapa serat mengembang", "does it swell", "oxalate in porang"],
};

describe("intent matching", () => {
  it.each(Object.entries(VARIATIONS).flatMap(([intent, msgs]) => msgs.map((m) => [intent, m] as const)))(
    "%s <- %s",
    (intent, msg) => {
      expect(classify(msg).intent, msg).toBe(intent);
    },
  );

  it("has at least 8 variations for each of the five primary topics", () => {
    for (const id of ["brew.how", "allergens", "who.can", "who.priority", "heart.symptoms"]) {
      expect(VARIATIONS[id].length, id).toBeGreaterThanOrEqual(8);
    }
  });

  it("every quick-reply chip, in both languages, leads to its own topic", () => {
    for (const id of INTENT_IDS) {
      for (const lang of LANGS) {
        const chip = KNOWLEDGE[id].chip[lang];
        const ref = classify(chip);
        expect(ref.intent, `${id} / ${lang}: "${chip}"`).toBe(id);
        expect(ref.reason).not.toBe("triage");
      }
    }
  });

  it("says it is not sure about anything outside its scope, and does not guess", () => {
    for (const msg of [
      "harganya berapa",
      "where can I buy it",
      "siapa presiden indonesia",
      "tell me a joke",
      "asdfgh",
      "cuaca hari ini",
      "😀",
      // everyday words one edit away from a keyword must not be read as that keyword
      "mau tanya dong", // tanya is not tanda
      "badan lemas banget", // lemas is not lemak
      "I heard it is tasty", // heard is not heart
      "kurang tidur serta kurang minum",
      "beras di atas meja",
    ]) {
      const r = classify(msg);
      expect(r.intent, msg).toBe("unknown");
      expect(["unknown", "empty"]).toContain(r.reason);
    }
  });

  it("treats an empty or punctuation-only message as nothing to answer", () => {
    expect(classify("   ").reason).toBe("empty");
    expect(classify("?!?").reason).toBe("empty");
  });

  it("uses the scanned cup as context, and a cup named in the message wins", () => {
    expect(classify("alergennya apa saja", { module: "L" }).module).toBe("L");
    expect(classify("alergen S-CUP", { module: "L" }).module).toBe("S");
    expect(classify("alergen modul M").module).toBe("M");
    expect(classify("beda S-CUP dan L-CUP", { module: "M" }).module).toBe("M"); // two cups named: keep the context
    const r = answer("alergennya apa saja", "en", { module: "L" });
    expect(r.lines.join(" ")).toMatch(/swells|swell/i);
  });

  it("is deterministic and independent of the interface language", () => {
    expect(classify("cara menyeduh")).toEqual(classify("cara menyeduh"));
    expect(renderReply(classify("how do I prepare it"), "id").intent).toBe("brew.how");
    expect(renderReply(classify("how do I prepare it"), "id").lines).toEqual(renderAnswer("brew.how", "id").lines);
  });

  it("a chip needs no matching", () => {
    expect(renderReply(chipRef("who.priority", { module: "S" }), "en").lines.join(" ")).toMatch(/S-CUP/);
  });

  it("ignores everything beyond the input limit", () => {
    const long = "x ".repeat(MAX_INPUT) + "chest pain";
    expect(classify(long).reason).not.toBe("triage");
    expect(classify("chest pain " + "x ".repeat(MAX_INPUT)).reason).toBe("triage");
  });
});

// ---- guards (T-05) -----------------------------------------------------------------------

describe("claim and medical guards", () => {
  const CLAIMS = [
    "apakah bisa menurunkan kolesterol?",
    "bisa menyembuhkan darah tinggi ga",
    "does it lower cholesterol",
    "will it cure diabetes",
    "can it prevent heart disease",
    "is this good for the heart",
    "ramah jantung ga?",
    "can I replace my medication with it",
    "apakah ini obat?",
    "is it a medicine?",
    "heart friendly?",
    "does it help my heart",
  ];
  it.each(CLAIMS)("claim question gets the fixed non-claim answer: %s", (msg) => {
    for (const lang of LANGS) {
      const r = answer(msg, lang);
      expect(r.reason).toBe("claim");
      expect(r.intent).toBe("claims.health");
      expect(r.lines.join(" ")).toMatch(lang === "id" ? /pangan, bukan obat/ : /food, not a medicine/);
    }
  });

  const MEDICAL = [
    "boleh diminum ibu hamil?",
    "I am pregnant, can I eat it",
    "interaksi dengan warfarin",
    "can I take it with my medication",
    "dosis berapa untuk diabetes",
    "saya menderita diabetes, apakah aman",
    "is it safe for people with high blood pressure",
    "pertanyaan kesehatan pribadi",
    "A personal health question",
    "my kidney disease, is it safe",
    "obat darah tinggi saya amlodipine", // "obat" is not read as "obati" (to treat)
  ];
  it.each(MEDICAL)("medication, pregnancy or own-condition question goes to a professional: %s", (msg) => {
    for (const lang of LANGS) {
      const r = answer(msg, lang);
      expect(r.reason).toBe("medical");
      expect(r.intent).toBe("out.of.scope");
      expect(r.lines.join(" ")).toMatch(lang === "id" ? /tenaga kesehatan/ : /health professional/);
    }
  });

  // Swallowing difficulty is a hard safety exclusion: never answered as "who can have it".
  const SWALLOWING = [
    "sulit menelan",
    "susah menelan",
    "saya kesulitan menelan, apakah aman",
    "tidak bisa menelan dengan baik",
    "L-CUP aman untuk yang susah menelan?",
    "difficulty swallowing",
    "trouble swallowing",
    "dysphagia",
    "is L-CUP safe if I can't swallow well",
    "my mother has a swallowing problem, can she eat it",
  ];
  it.each(SWALLOWING)("swallowing difficulty goes to the consult answer, with or without a cup in context: %s", (msg) => {
    for (const cup of [undefined, "L", "S"] as const) {
      for (const lang of LANGS) {
        const r = answer(msg, lang, { module: cup });
        expect(r.intent, `${msg} / ${cup}`).toBe("who.consult");
        expect(r.reason).toBe("medical");
        expect(r.lines.join(" ")).toMatch(lang === "id" ? /menelan/i : /swallow/i);
      }
    }
    expect(triage(msg), msg).toEqual([]);
  });

  it("does not treat general education about signs as a personal medical question", () => {
    for (const msg of ["apa gejala penyakit jantung", "heart disease signs", "tanda stroke"]) {
      expect(classify(msg).reason, msg).toBe("match");
      expect(classify(msg).intent, msg).toBe("heart.symptoms");
    }
  });

  it("answers the S-CUP sodium question without calling S lower", () => {
    const r = answer("natrium S-CUP dibanding L-CUP", "id");
    const text = r.lines.join(" ");
    expect(text).not.toMatch(/lebih rendah/);
  });
});

// ---- heart topic switch --------------------------------------------------------------------

describe("heart topic switch (CHAT_CONFIG.heartEducation)", () => {
  it("is on by default and answers with the draft signs", () => {
    expect(CHAT_CONFIG.heartEducation).toBe(true);
    expect(renderAnswer("heart.symptoms", "en").lines.length).toBeGreaterThan(4);
  });

  it("when switched off, only refers to a professional, with the shared emergency sentence and no product", () => {
    CHAT_CONFIG.heartEducation = false;
    try {
      for (const lang of LANGS) {
        const r = renderAnswer("heart.symptoms", lang);
        expect(r.lines).toEqual(HEART_REFERRAL[lang]);
        expect(r.lines.join(" ")).toContain(EMERGENCY_CALL[lang]);
        expect(r.lines.join(" ")).not.toMatch(PRODUCT_WORDS);
      }
      expect(triage("chest pain")).not.toEqual([]); // the emergency triage is not switchable
    } finally {
      CHAT_CONFIG.heartEducation = true;
    }
  });
});

// ---- compliance and privacy -----------------------------------------------------------------

describe("compliance of what the chat can say", () => {
  const replies = (): { label: string; text: string }[] => {
    const out: { label: string; text: string }[] = [];
    const messages = [...EMERGENCY.slice(0, 5), ...CLAIMS_AND_MEDICAL, ...Object.values(VARIATIONS).flat(), "asdfgh"];
    for (const lang of LANGS) {
      for (const m of messages) for (const mod of [undefined, "S", "L", "M"] as const) {
        out.push({ label: `${lang}/${mod}/${m}`, text: answer(m, lang, { module: mod }).lines.join("\n") });
      }
      out.push({ label: `${lang}/referral`, text: HEART_REFERRAL[lang].join("\n") });
    }
    return out;
  };
  const CLAIMS_AND_MEDICAL = ["apakah ini obat?", "can it lower cholesterol", "boleh diminum ibu hamil?"];

  it.each(FORBIDDEN)("no reply contains a %s", (_name, re) => {
    const all = replies();
    expect(all.length).toBeGreaterThan(300); // guards against the scan going vacuous
    for (const r of all) expect(stripNegatedDisclaimer(r.text), r.label).not.toMatch(re);
  });

  it("never says 'indikasi' or diagnoses the user", () => {
    for (const r of replies()) {
      expect(r.text, r.label).not.toMatch(/indikasi|indication/i);
      expect(r.text, r.label).not.toMatch(/\b(anda|you)\s+(terkena|menderita|are having a|likely have|probably have)/i);
    }
  });

  it("emergency numbers appear only inside the shared emergency sentence", () => {
    for (const lang of LANGS) {
      for (const r of [answer("chest pain", lang), answer("kapan harus ke IGD", lang), answer("gejala jantung", lang)]) {
        const rest = r.lines.join("\n").split(EMERGENCY_CALL[lang]).join("");
        expect(rest).not.toMatch(/\b(119|112)\b/);
      }
    }
  });

  it("makes no network or storage call anywhere in the chat code", () => {
    const dirs = ["src/lib/chat", "src/components"];
    const files = dirs.flatMap((d) =>
      fs
        .readdirSync(path.resolve(__dirname, "../../..", d))
        .filter((f) => /^(?!.*\.test\.).*\.tsx?$/.test(f) && (d === "src/lib/chat" || /^Chat/.test(f)))
        .map((f) => path.resolve(__dirname, "../../..", d, f)),
    );
    expect(files.length).toBeGreaterThanOrEqual(7);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie/);
    }
  });
});
