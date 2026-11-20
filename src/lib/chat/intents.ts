import type { IntentId } from "./types";

/**
 * Keywords for the rule-based matcher (sprint T-04) and the guard lists (T-05). Plain data:
 * Indonesian and English are mixed on purpose, because people type in either language
 * whatever language the app is set to. Weights: 3 strong, 2 medium, 1 weak. An intent is
 * chosen only when its total reaches MIN_SCORE; otherwise the chat says it is not sure.
 */

export type Weighted = [term: string, weight: number];

export const MIN_SCORE = 2;

/** Order matters only for ties: earlier wins. */
export const MATCH_ORDER: IntentId[] = [
  "brew.how",
  "allergens",
  "caution.l",
  "who.can",
  "who.consult",
  "who.priority",
  "compare.modules",
  "nutrition.estimate",
  "ingredients",
  "claims.health",
  "screening.start",
  "heart.symptoms",
  "heart.emergency",
];

export const INTENT_TERMS: Partial<Record<IntentId, Weighted[]>> = {
  "brew.how": [
    ["seduh", 3], ["nyeduh", 3], ["menyeduh", 3], ["diseduh", 3], ["seduhan", 3], ["brew", 3], ["brewing", 3], ["prepare", 3],
    ["preparing", 3], ["preparation", 3], ["siapkan", 3], ["menyiapkan", 3], ["penyajian", 3], ["saji", 2],
    ["cara membuat", 3], ["cara bikin", 3], ["cara masak", 3], ["cara memasak", 3], ["cara minum", 3],
    ["cara makan", 3], ["cara pakai", 3], ["cara penggunaan", 3], ["cara konsumsi", 3], ["how to make", 3],
    ["how to cook", 3], ["how to use", 3], ["how to eat", 3], ["how to drink", 3], ["how do i make", 3],
    ["how do i prepare", 3], ["air panas", 3], ["hot water", 3], ["takaran", 2], ["suhu", 2], ["temperature", 2],
    ["aduk", 2], ["stir", 2], ["mengental", 2], ["thicken", 2], ["berapa air", 3], ["how much water", 3],
    ["how long", 2], ["berapa lama", 2], ["instruksi", 2], ["instructions", 2], ["directions", 2], ["cara", 1],
    ["tunggu", 1], ["wait", 1], ["menit", 1], ["minutes", 1], ["campur", 1], ["mix", 1],
  ],
  allergens: [
    ["alergen", 3], ["alergi", 3], ["alergik", 3], ["allergen", 3], ["allergens", 3], ["allergy", 3],
    ["allergic", 3], ["allergies", 3], ["kedelai", 3], ["soy", 3], ["soya", 3], ["soybean", 3], ["tempe", 2],
    ["tempeh", 2], ["gluten", 2], ["pantangan", 2], ["pantang", 2], ["efek samping", 4], ["side effect", 4],
    ["side effects", 4], ["perlu diperhatikan", 3], ["points to note", 3], ["bahaya", 2], ["berbahaya", 2],
    ["risk", 2], ["risiko", 2], ["mengandung kedelai", 4], ["contains soy", 4], ["ada kedelai", 3],
    ["intoleransi", 2], ["intolerance", 2],
  ],
  "caution.l": [
    ["peringatan khusus", 3], ["peringatan", 2], ["special caution", 3], ["caution", 2], ["warning", 2],
    ["hati hati", 2], ["careful", 1], ["serat kental", 3], ["viscous", 3], ["mengembang", 3], ["swell", 3],
    ["swells", 3], ["swelling", 3], ["oksalat", 3], ["oxalate", 3], ["porang", 1], ["glukomanan", 2],
    ["glucomannan", 2], ["konjac", 2], ["menelan", 3], ["swallow", 3], ["swallowing", 3], ["tersedak", 3],
    ["choke", 3], ["choking", 3],
  ],
  "who.can": [
    ["siapa yang boleh", 3], ["siapa saja yang boleh", 3], ["boleh minum", 3], ["boleh diminum", 3],
    ["boleh dikonsumsi", 3], ["boleh makan", 3], ["dapat dikonsumsi", 3], ["bisa diminum", 3],
    ["bisa dikonsumsi", 3], ["bolehkah", 2], ["boleh", 1], ["aman", 2], ["amankah", 2], ["cocok", 1],
    ["who can", 3], ["can anyone", 3], ["can everyone", 3], ["can i drink", 3], ["can i eat", 3],
    ["can i have", 3], ["can i take", 3], ["can i", 1], ["is it safe", 3], ["safe", 2],
    ["suitable", 2], ["anyone", 2], ["everyone", 2], ["semua orang", 2], ["anak", 1], ["anak anak", 2],
    ["children", 2], ["child", 1], ["kids", 2], ["lansia", 1], ["elderly", 1], ["dewasa", 1], ["adult", 1],
    ["adults", 1], ["usia", 1], ["age", 1], ["umur", 1],
  ],
  "who.consult": [
    ["siapa yang perlu", 3], ["perlu konsultasi", 3], ["konsultasi", 3], ["konsul", 3], ["dokter", 3],
    ["tenaga kesehatan", 3], ["ahli gizi", 3], ["consult", 3], ["consultation", 3], ["doctor", 3],
    ["physician", 3], ["nutritionist", 3], ["dietitian", 3], ["professional", 2], ["who should", 3],
    ["check with", 2], ["should i see", 3], ["hindari", 2], ["avoid", 2], ["tidak disarankan", 3],
    ["not recommended", 3], ["tidak boleh", 2], ["should not", 2], ["shouldnt", 2], ["pantangan", 1],
    ["kondisi tertentu", 2], ["certain conditions", 2], ["perlu hati hati", 2],
  ],
  "who.priority": [
    ["untuk siapa", 3], ["cocok untuk siapa", 3], ["siapa yang cocok", 3], ["for whom", 3], ["who is it for", 3],
    ["who is this", 3], ["who is", 1], ["cup for", 2], ["module for", 2], ["modul ini", 1], ["who should use", 2], ["prioritas", 3], ["priority", 3],
    ["indikasi", 3], ["target", 1], ["sasaran", 2], ["peruntukan", 3], ["diperuntukkan", 3], ["ditujukan", 3],
    ["intended for", 3], ["meant for", 3], ["recommended for", 2], ["modul mana", 1], ["which module", 1],
    ["mana yang cocok", 2], ["fungsi", 1],
  ],
  "compare.modules": [
    ["beda", 3], ["perbedaan", 3], ["membedakan", 3], ["bandingkan", 3], ["perbandingan", 3], ["banding", 2],
    ["compare", 3], ["compared", 3], ["comparison", 3], ["difference", 3], ["differences", 3], ["different", 2],
    ["versus", 2], ["vs", 2], ["mana yang lebih", 2], ["which is better", 3], ["which one is better", 3],
    ["lebih baik", 2], ["better", 1], ["s m l", 3], ["s m dan l", 3], ["s m and l", 3], ["semua modul", 2],
    ["all modules", 2], ["ketiga", 2], ["three", 1],
  ],
  "nutrition.estimate": [
    ["gizi", 3], ["nutrisi", 3], ["nutrition", 3], ["nutritional", 3], ["kalori", 3], ["calories", 3],
    ["calorie", 3], ["kkal", 3], ["kcal", 3], ["energi", 2], ["energy", 2], ["protein", 3], ["natrium", 3],
    ["sodium", 3], ["garam", 2], ["salt", 2], ["lemak", 2], ["fat", 2], ["karbohidrat", 2], ["carbohydrate", 2],
    ["carbs", 2], ["carb", 2], ["gula", 2], ["sugar", 2], ["kalium", 2], ["potassium", 2], ["kalsium", 2],
    ["calcium", 2], ["zat besi", 2], ["iron", 2], ["serat", 1], ["fibre", 2], ["fiber", 2], ["nilai gizi", 3],
    ["kandungan", 2], ["content", 1], ["estimasi", 1], ["estimate", 1], ["estimated", 1], ["mg", 1], ["gram", 1],
  ],
  ingredients: [
    ["bahan", 3], ["bahan bahan", 3], ["komposisi", 3], ["terbuat", 3], ["dibuat dari", 3], ["dibuat", 1],
    ["ingredient", 3], ["ingredients", 3], ["composition", 3], ["made of", 3], ["made from", 3], ["made with", 3],
    ["what is in", 3], ["whats in", 3], ["apa isi", 3], ["isi", 2], ["contains", 1], ["contain", 1],
    ["mengandung", 1], ["kandungan", 1], ["sorgum", 1], ["sorghum", 1], ["porang", 1], ["selasih", 1],
    ["basil", 1], ["jamur", 1], ["mushroom", 1], ["bawang", 1], ["garlic", 1], ["shallot", 1],
    ["beras merah", 1], ["brown rice", 1], ["kacang hijau", 1], ["mung bean", 1], ["pisang", 1], ["banana", 1],
    ["mocaf", 2], ["tepung", 1], ["flour", 1], ["tempe", 1], ["tempeh", 1], ["dedak", 2], ["bran", 1],
  ],
  "claims.health": [
    ["khasiat", 3], ["manfaat", 3], ["benefit", 3], ["benefits", 3], ["berguna", 2], ["kegunaan", 2], ["efek", 2],
    ["effect", 2], ["effects", 2], ["obat", 2], ["medicine", 2], ["medicinal", 3], ["klaim", 2], ["claim", 2],
    ["terbukti", 3], ["proven", 3], ["clinically", 3], ["klinis", 2], ["studi", 2], ["study", 2],
    ["penelitian", 2], ["evidence", 2], ["bukti", 2],
  ],
  "screening.start": [
    ["cek prioritas", 6], ["check my priority", 6], ["check priority", 5], ["check module", 3], ["skrining", 3],
    ["screening", 3], ["rekomendasi", 3], ["rekomendasikan", 3], ["recommend", 3], ["recommendation", 3],
    ["recommended", 1], ["modul mana", 3], ["which module", 3], ["pilih modul", 3], ["choose module", 3],
    ["saran modul", 3], ["mana yang cocok untuk saya", 4], ["right for me", 3], ["for me", 2], ["untuk saya", 2],
    ["wizard", 2], ["kuesioner", 2], ["questionnaire", 2], ["tes", 1], ["test", 1], ["prioritas", 1],
    ["priority", 1], ["profil", 2], ["profile", 2], ["check", 1], ["cek", 1], ["mulai", 1], ["start", 1],
  ],
  "heart.symptoms": [
    ["gejala", 2], ["tanda", 2], ["ciri", 2], ["keluhan", 2], ["symptom", 3], ["symptoms", 3], ["sign", 2],
    ["signs", 2], ["complaint", 2], ["complaints", 2], ["jantung", 3], ["heart", 3], ["stroke", 3],
    ["serangan jantung", 4], ["heart attack", 4], ["kardiovaskular", 3], ["cardiovascular", 3],
    ["pembuluh darah", 3], ["blood vessel", 3], ["blood vessels", 3], ["nyeri dada", 3], ["chest pain", 3],
    ["berdebar", 3], ["palpitations", 3], ["palpitation", 3], ["penyakit jantung", 4], ["heart disease", 4],
    ["gagal jantung", 3], ["heart failure", 3],
  ],
  "heart.emergency": [
    ["darurat", 3], ["emergency", 3], ["igd", 3], ["ugd", 3], ["ambulans", 3], ["ambulance", 3],
    ["rumah sakit", 2], ["hospital", 2], ["kapan harus ke", 3], ["when to get", 3], ["when should i go", 3],
    ["when to see", 3], ["kapan ke dokter", 3], ["kapan harus", 1], ["119", 3], ["112", 3],
    ["gawat darurat", 3], ["layanan darurat", 3], ["emergency help", 3], ["urgent", 2], ["segera", 1],
  ],
};

// ---- Guards (T-05), checked after the emergency triage and before intent matching ----------

/** A health or cure claim question always gets the fixed non-claim answer. */
export const CLAIM_SINGLE: string[] = [
  "sembuh", "menyembuhkan", "sembuhkan", "cure", "curing", "heal", "healing", "khasiat", "pengganti obat",
  "ganti obat", "gantikan obat", "replace medication", "replace medicine", "replace my medication",
  "instead of medication", "instead of medicine", "apakah ini obat", "apa ini obat", "is it a medicine",
  "is this a medicine", "is it medicine", "is this medicine", "is it a drug", "ramah jantung", "sehat jantung",
  "baik untuk jantung", "bagus untuk jantung", "heart friendly", "heart healthy", "good for the heart",
  "good for your heart", "good for heart", "medicinal", "health benefits", "health benefit", "manfaat kesehatan",
];

/** [action words, targets]: both must appear, for example "menurunkan" + "kolesterol". */
export const CLAIM_PAIRS: [string[], string[]][] = [
  [
    [
      "menurunkan", "turunkan", "nurunin", "mengurangi", "kurangi", "mengontrol", "kontrol", "mengendalikan",
      "mengatasi", "melawan", "mencegah", "cegah", "mengobati", "lower", "lowers", "lowering",
      "reduce", "reduces", "reducing", "treat", "treats", "treating", "prevent", "prevents", "preventing", "fight",
      "control", "manage", "fix",
    ],
    [
      "kolesterol", "cholesterol", "tekanan darah", "darah tinggi", "hipertensi", "gula darah", "diabetes",
      "penyakit", "jantung", "stroke", "trigliserida", "blood pressure", "hypertension", "blood sugar", "glucose",
      "disease", "heart", "triglycerides",
    ],
  ],
  [
    [
      "baik", "bagus", "sehat", "ramah", "membantu", "bantu", "menjaga", "mendukung", "melindungi", "good",
      "healthy", "friendly", "helps", "help", "support", "protect", "protects", "benefit",
    ],
    ["jantung", "heart"],
  ],
];

/** Medication, pregnancy and "my own condition" questions go to a health professional. */
export const MEDICAL_SINGLE: string[] = [
  "hamil", "kehamilan", "ibu hamil", "menyusui", "pregnant", "pregnancy", "breastfeeding", "obat", "minum obat",
  "obat obatan", "medication", "medications", "medicine", "medicines", "drug", "drugs", "dosis", "dosage",
  "interaksi", "interaction", "warfarin", "metformin", "insulin", "statin", "amlodipine", "captopril",
  "antibiotik", "antibiotic", "diagnosa", "mendiagnosis", "diagnose", "diagnosing", "penyakit saya",
  "my condition", "my disease", "kesehatan pribadi", "personal health",
];

/** A named condition plus a personal or permission word ("aman untuk penderita diabetes?"). */
export const DISEASE_TERMS: string[] = [
  "diabetes", "diabetic", "diabetics", "kencing manis", "hipertensi", "hypertension", "darah tinggi",
  "high blood pressure", "kolesterol", "cholesterol", "gagal jantung", "heart failure", "jantung koroner",
  "asam urat", "gout", "penyakit ginjal", "kidney disease", "gagal ginjal", "liver", "maag", "gerd", "kanker",
  "cancer", "stroke", "penyakit jantung", "heart disease",
];
export const PERSONAL_MARKERS: string[] = [
  "saya", "aku", "punya", "menderita", "pengidap", "penderita", "boleh", "bolehkah", "aman", "amankah", "cocok",
  "my", "have", "suffer", "suffering", "safe", "okay", "allowed", "can i", "should i",
];
/** General education questions about signs are not personal: the heart topic answers them. */
export const EDUCATION_TERMS: string[] = [
  "gejala", "tanda", "ciri", "keluhan", "symptom", "symptoms", "sign", "signs", "complaint", "complaints",
];
