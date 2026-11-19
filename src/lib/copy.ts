import type { FoodKey, HistoryAnswers, Lang, SymptomAnswers } from "./recommender/types";
import { PRODUCTS } from "./products";

/** About-page nutrition list, built from products.ts so the numbers cannot drift. */
const kcalSodium = (kcal: string, sodium: string) =>
  (["S", "L", "M"] as const)
    .map((id) => {
      const p = PRODUCTS[id];
      return `${p.name} ${p.nutrition.energyKcal} ${kcal}, ${sodium} ${p.nutrition.sodiumMg} mg`;
    })
    .join("; ");

/** UI copy (ID/EN). Scanned by compliance.test.ts for forbidden claims. */

export interface Copy {
  appName: string;
  tagline: string;
  langToggle: string;
  back: string;
  close: string;
  next: string;
  previous: string;
  seeResult: string;
  startOver: string;
  open: string;
  landing: { cta: string; sub: string };
  home: {
    title: string;
    education: { title: string; desc: string };
    products: { title: string; desc: string };
    wizard: { title: string; desc: string };
    about: { title: string; desc: string };
  };
  about: {
    nav: string;
    title: string;
    subtitle: string;
    mlNotice: string;
    summaryTitle: string;
    bullets: string[];
    posterTitle: string;
    posterHint: string;
    posterAlt: string;
    zoomOpen: string;
    zoomClose: string;
    zoomIn: string;
    zoomOut: string;
    zoomReset: string;
    viewerLabel: string;
    panHint: string;
  };
  education: {
    title: string;
    intro: string;
    topics: { id: string; title: string; summary: string; body: string[] }[];
  };
  products: {
    title: string;
    intro: string;
    composition: string;
    base: string;
    module: string;
    nutrition: string;
    nutritionNote: string;
    allergens: string;
    prepare: string;
    focus: string;
    priority: string;
    benefit: string;
    perServing: string;
    viewPage: string;
    generalNote: string;
  };
  wizard: {
    title: string;
    stepLabel: (n: number, total: number) => string;
    steps: [string, string, string];
    consentTitle: string;
    consentBody: string;
    consentCheck: string;
    safetyTitle: string;
    safetyQuestions: Record<
      "emergencySymptoms" | "pregnant" | "kidneyDisease" | "soyAllergy" | "swallowingDifficulty" | "takesMedication",
      string
    >;
    yes: string;
    no: string;
    bodyTitle: string;
    age: string;
    sex: string;
    female: string;
    male: string;
    height: string;
    weight: string;
    bmiAuto: (bmi: string) => string;
    waist: string;
    bpTitle: string;
    bpHint: string;
    reading: (n: number) => string;
    systolic: string;
    diastolic: string;
    historyTitle: string;
    historyHint: string;
    history: Record<keyof HistoryAnswers, string>;
    optionalLab: string;
    optionalLabHint: string;
    ldl: string;
    hdl: string;
    tg: string;
    glucose: string;
    symptomsTitle: string;
    symptomsHint: string;
    symptoms: Record<keyof SymptomAnswers, string>;
    foodTitle: string;
    foodHint: string;
    freq: [string, string, string, string];
    food: Record<FoodKey, string>;
    errorIncomplete: string;
    errorBp: string;
    resultTitle: string;
    seeProduct: string;
    onDevice: string;
    reasonsTitle: string;
    tierNote: (tier: 1 | 2) => string;
    scannedSame: (cup: string) => string;
    scannedDiff: (scanned: string, result: string) => string;
    mlNote: string;
    demoButton: string;
    demoHint: string;
    demoLabel: string;
  };
  qr: { backHome: string; scanned: (cup: string) => string; tabCheck: string; tabAbout: (cup: string) => string };
}

export const COPY: Record<Lang, Copy> = {
  id: {
    appName: "CUORE",
    tagline: "Local comfort, thoughtfully engineered",
    langToggle: "EN",
    back: "Kembali",
    close: "Tutup",
    next: "Lanjut",
    previous: "Sebelumnya",
    seeResult: "Lihat hasil",
    startOver: "Mulai ulang",
    open: "Buka",
    landing: {
      cta: "Mulai",
      sub: "Bubur instan gurih modular: 35 g Universal Base + 20 g modul pilihan.",
    },
    home: {
      title: "Mau mulai dari mana?",
      education: { title: "Edukasi", desc: "Hipertensi, sodium, dan serat dalam bahasa sederhana." },
      products: { title: "Produk", desc: "Kenali S-CUP, M-CUP, dan L-CUP." },
      wizard: { title: "Cek prioritas modul", desc: "3 langkah singkat, diproses di perangkat Anda." },
      about: { title: "Tentang & Poster", desc: "Poster ilmiah 5th IYC 2026 dan ringkasan konsep CUORE." },
    },
    about: {
      nav: "Tentang",
      title: "Tentang CUORE & Poster Ilmiah",
      subtitle:
        "Ringkasan konsep bubur instan gurih modular CUORE dari poster 5th International Youth Conference (IYC) 2026.",
      mlNotice:
        "Versi web saat ini berbasis aturan, model ML belum dilatih (memakai ambang WHO dan arsitektur siap ML / ML-ready).",
      summaryTitle: "Ringkasan poster",
      bullets: [
        "CUORE ingin menjembatani anjuran umum seperti kurangi garam dan perbanyak serat dengan pangan gurih yang familiar dan terjangkau, sebagai inovasi pangan dan alat bantu keputusan.",
        "Satu porsi 55 g terdiri dari 35 g Universal Base dan 20 g modul pilihan, berbahan pangan lokal seperti sorgum, beras merah, tepung tempe, kacang hijau, glukomanan porang, tepung pisang mentah, MOCAF, biji selasih, jamur tiram, bawang putih, dan bawang merah.",
        "Tiga modul — S-CUP (Sodium-conscious, rasa umami jamur dan bawang tanpa garam tambahan), L-CUP (Lipid-oriented, serat larut kental dari porang dan selasih), dan M-CUP (Metabolic, pati resisten dan protein nabati) — adalah prioritas formulasi pangan, bukan pengobatan.",
        "Skrining awal memeriksa kondisi keamanan (gejala darurat, kehamilan, ginjal, alergi kedelai, kesulitan menelan, dan penggunaan obat rutin) lalu memetakan prioritas modul berbasis aturan sebagai alat bantu keputusan, bukan diagnosis.",
        "Semua jawaban skrining diproses langsung di perangkat Anda tanpa mengirim atau menyimpan data pribadi ke server eksternal, selaras dengan semangat UU PDP 2022.",
        `Semua angka gizi per porsi 55 g (${kcalSodium("kkal", "natrium")}) adalah estimasi dan belum merupakan hasil uji laboratorium. Perlu diperhatikan: semua varian mengandung kedelai (tempe), dan serat kental L-CUP mengembang saat terkena air sehingga tidak ditujukan bagi orang dengan kesulitan menelan.`,
      ],
      posterTitle: "Poster 5th IYC 2026",
      posterHint: "Ketuk poster untuk memperbesar dan menggeser tampilan.",
      posterAlt:
        "Poster ilmiah 5th International Youth Conference (IYC) 2026 berjudul Machine Learning-Assisted Dietary-Priority Profiling and Characterisation of a Modular Local Botanical Porridge (Sorghum bicolor - Tempeh - Amorphophallus muelleri): memuat latar belakang, bahan lokal, tabel gizi estimasi per 55 g (35 g Universal Base + 20 g modul S/L/M), alur skrining keamanan berbasis aturan dan pemetaan prioritas modul, tahapan produksi dan keamanan pangan, peta jalan validasi, serta kesimpulan.",
      zoomOpen: "Perbesar poster",
      zoomClose: "Tutup tampilan poster layar penuh",
      zoomIn: "Perbesar",
      zoomOut: "Perkecil",
      zoomReset: "Ukuran pas layar",
      viewerLabel: "Tampilan penuh poster ilmiah CUORE",
      panHint: "Geser untuk menggulir poster. Tekan Escape atau tombol Tutup untuk keluar.",
    },
    education: {
      title: "Edukasi",
      intro: "Ketuk kartu untuk membaca penjelasannya. Ini informasi umum, bukan saran medis.",
      topics: [
        {
          id: "hypertension",
          title: "Hipertensi",
          summary: "Apa itu tekanan darah dan mengapa diukur lebih dari sekali.",
          body: [
            "Tekanan darah adalah tekanan darah pada dinding pembuluh saat jantung memompa. Angkanya ditulis dua: sistolik (atas) dan diastolik (bawah).",
            "Hasil ukur bisa berubah-ubah sepanjang hari, karena itu pengukuran sebaiknya dilakukan minimal dua kali dalam keadaan tenang lalu dirata-rata.",
            "Penilaian dan penanganan tekanan darah dilakukan oleh tenaga kesehatan. CUORE hanya membantu mengenali prioritas pola makan.",
          ],
        },
        {
          id: "sodium",
          title: "Sodium",
          summary: "Dari mana sodium berasal dalam makanan sehari-hari.",
          body: [
            "Sodium (natrium) adalah mineral yang ada dalam garam dapur dan banyak makanan kemasan, mi instan, saus, serta makanan olahan.",
            "Pedoman umum WHO menyarankan asupan natrium kurang dari 2 gram per hari (setara sekitar 5 gram garam).",
            "Membaca label kemasan dan mengurangi garam tambahan adalah langkah sederhana untuk lebih sadar akan sodium.",
          ],
        },
        {
          id: "fibre",
          title: "Serat",
          summary: "Serat larut dan tidak larut, dan sumbernya dari pangan lokal.",
          body: [
            "Serat pangan berasal dari tumbuhan seperti sayur, kacang-kacangan, dan biji-bijian utuh.",
            "Serat larut membentuk gel kental saat terkena air, sedangkan serat tidak larut menambah volume makanan.",
            "CUORE memakai sorgum, tempe, glukomanan porang, biji selasih, dan tepung pisang mentah. Nilai gizinya masih estimasi.",
          ],
        },
      ],
    },
    products: {
      title: "Produk",
      intro: "1 porsi = 35 g Universal Base + 1 modul 20 g. Pilih cup untuk melihat detailnya.",
      composition: "Komposisi",
      base: "Universal Base 35 g",
      module: "Modul 20 g",
      nutrition: "Gizi per 55 g (estimasi)",
      nutritionNote: "Semua angka adalah estimasi, belum hasil uji laboratorium.",
      allergens: "Alergen dan perlu diperhatikan",
      prepare: "Cara menyiapkan",
      focus: "Fokus",
      priority: "Prioritas untuk siapa",
      benefit: "Kegunaan singkat",
      perServing: "per 55 g",
      viewPage: "Buka halaman kemasan",
      generalNote: "Catatan umum",
    },
    wizard: {
      title: "Cek prioritas modul",
      stepLabel: (n, t) => `Langkah ${n} dari ${t}`,
      steps: ["Persetujuan", "Tubuh & riwayat", "Keluhan & makan"],
      consentTitle: "Persetujuan data",
      consentBody:
        "Jawaban Anda diproses hanya di perangkat ini dan tidak dikirim ke server mana pun, sesuai semangat UU PDP 2022. Alat ini untuk dewasa 18 tahun ke atas.",
      consentCheck: "Saya setuju datanya diproses di perangkat ini.",
      safetyTitle: "Pertanyaan keamanan",
      safetyQuestions: {
        emergencySymptoms: "Apakah saat ini Anda mengalami nyeri dada, sesak napas, pingsan, atau lemah mendadak?",
        pregnant: "Apakah Anda sedang hamil?",
        kidneyDisease: "Apakah Anda memiliki sakit ginjal?",
        soyAllergy: "Apakah Anda alergi kedelai?",
        swallowingDifficulty: "Apakah Anda sulit menelan?",
        takesMedication: "Apakah Anda rutin minum obat untuk tekanan darah, gula, kolesterol, jantung, atau ginjal?",
      },
      yes: "Ya",
      no: "Tidak",
      bodyTitle: "Data tubuh",
      age: "Usia (tahun)",
      sex: "Jenis kelamin",
      female: "Perempuan",
      male: "Laki-laki",
      height: "Tinggi badan (cm)",
      weight: "Berat badan (kg)",
      bmiAuto: (bmi) => `BMI dihitung otomatis: ${bmi}`,
      waist: "Lingkar pinggang (cm)",
      bpTitle: "Tekanan darah (opsional)",
      bpHint: "Bila punya, isi 2 kali ukur dalam keadaan tenang. Boleh dikosongkan.",
      reading: (n) => `Ukuran ke-${n}`,
      systolic: "Sistolik (atas)",
      diastolic: "Diastolik (bawah)",
      historyTitle: "Riwayat",
      historyHint: "Centang yang sesuai. Boleh tidak ada yang dicentang.",
      history: {
        hypertension: "Saya pernah diberi tahu memiliki tekanan darah tinggi",
        highCholesterol: "Saya pernah diberi tahu memiliki kolesterol tinggi",
        diabetes: "Saya pernah diberi tahu memiliki diabetes atau prediabetes",
        familyHypertensionStroke: "Keluarga: tekanan darah tinggi atau stroke",
        familyEarlyHeartDisease: "Keluarga: penyakit jantung di usia muda",
        familyDiabetes: "Keluarga: diabetes",
      },
      optionalLab: "Opsional: hasil laboratorium",
      optionalLabHint: "Kosongkan bila tidak punya. Hasil ini membuat saran lebih rinci.",
      ldl: "LDL (mg/dL)",
      hdl: "HDL (mg/dL)",
      tg: "Trigliserida (mg/dL)",
      glucose: "Gula darah puasa (mg/dL)",
      symptomsTitle: "Keluhan",
      symptomsHint: "Centang yang Anda alami belakangan ini. Boleh tidak ada yang dicentang.",
      symptoms: {
        headacheNeck: "Sakit kepala atau tengkuk terasa berat",
        dizziness: "Pusing",
        thirst: "Sering haus",
        urination: "Sering buang air kecil",
        hunger: "Cepat lapar",
        tiredAfterMeals: "Lemas setelah makan",
        weightLoss: "Berat badan turun tanpa sebab yang jelas",
      },
      foodTitle: "Pola makan",
      foodHint: "Seberapa sering Anda biasanya melakukan ini?",
      freq: ["Jarang (<1x/minggu)", "Kadang (1-3x/minggu)", "Sering (4-6x/minggu)", "Hampir setiap hari"],
      food: {
        saltyPackaged: "Makan makanan kemasan yang asin (keripik, sosis, kornet)",
        instantNoodle: "Makan mi instan atau makanan instan berkuah",
        addedSalt: "Menambah garam atau kecap asin ke makanan",
        sugaryDrinks: "Minum minuman manis (teh manis, soda, kopi gula)",
        sweetSnacks: "Makan kue, roti manis, atau camilan manis",
        fried: "Makan gorengan",
        fattyMeat: "Makan daging berlemak atau jeroan",
        vegetables: "Makan sayur",
        legumesNuts: "Makan kacang-kacangan atau tempe/tahu",
        mealRegularity: "Makan pada waktu yang teratur",
      },
      errorIncomplete: "Mohon lengkapi data yang wajib diisi.",
      errorBp: "Tekanan darah: isi kedua ukuran, atau kosongkan semuanya.",
      resultTitle: "Hasil",
      seeProduct: "Lihat produk",
      onDevice: "Diproses di perangkat Anda. Tidak ada data yang dikirim atau disimpan di server.",
      reasonsTitle: "Alasan singkat",
      tierNote: (tier) =>
        tier === 2
          ? "Hasil memakai data laboratorium opsional Anda."
          : "Hasil memakai data dasar (tanpa laboratorium).",
      scannedSame: (cup) => `Anda memindai ${cup}, dan profil Anda juga mengarah ke modul ini.`,
      scannedDiff: (scanned, result) =>
        `Anda memindai ${scanned}, tetapi profil Anda lebih mengarah ke ${result}. Hasil bisa berbeda dari cup yang dipindai.`,
      mlNote: "Berbasis aturan (ambang WHO), siap diganti model ML; validasi model direncanakan.",
      demoButton: "Pakai data demo",
      demoHint: "Mengisi profil contoh (45 th, 138/88 mmHg) untuk presentasi.",
      demoLabel: "Profil demo: data contoh, bukan orang sungguhan.",
    },
    qr: {
      backHome: "Ke beranda CUORE",
      scanned: (cup) => `Anda memindai ${cup}`,
      tabCheck: "Cek prioritas saya",
      tabAbout: (cup) => `Tentang ${cup}`,
    },
  },
  en: {
    appName: "CUORE",
    tagline: "Local comfort, thoughtfully engineered",
    langToggle: "ID",
    back: "Back",
    close: "Close",
    next: "Next",
    previous: "Previous",
    seeResult: "See result",
    startOver: "Start over",
    open: "Open",
    landing: {
      cta: "Start",
      sub: "A modular savoury instant porridge: 35 g Universal Base + a 20 g module of your choice.",
    },
    home: {
      title: "Where would you like to start?",
      education: { title: "Learn", desc: "Hypertension, sodium and fibre in plain language." },
      products: { title: "Products", desc: "Get to know S-CUP, M-CUP and L-CUP." },
      wizard: { title: "Check module priority", desc: "3 short steps, processed on your device." },
      about: { title: "About & Poster", desc: "5th IYC 2026 scientific poster and CUORE concept summary." },
    },
    about: {
      nav: "About",
      title: "About CUORE & Scientific Poster",
      subtitle:
        "Summary of the CUORE modular savoury instant porridge concept from the 5th International Youth Conference (IYC) 2026 poster.",
      mlNotice:
        "The current web version is rule-based (WHO thresholds) and ML-ready; an ML model has not been trained yet.",
      summaryTitle: "Poster summary",
      bullets: [
        "CUORE aims to turn general advice such as eating less salt and more fibre into a familiar, affordable savoury food, as a food innovation and decision-support concept.",
        "One 55 g serving combines a 35 g Universal Base with a 20 g module of choice, made from local ingredients including sorghum, brown rice, tempeh flour, mung bean, porang glucomannan, raw banana flour, MOCAF, basil seed, oyster mushroom, garlic, and shallot.",
        "Three modules — S-CUP (Sodium-conscious, umami from mushroom and alliums with no added salt), L-CUP (Lipid-oriented, viscous soluble fibre from porang and basil seed), and M-CUP (Metabolic, resistant starch and plant protein) — represent food formulation priorities, not treatments.",
        "Initial screening checks safety exclusions (emergency symptoms, pregnancy, kidney disease, soy allergy, swallowing difficulty, and regular medication) and maps module priority using rules as a decision-support tool, not a diagnosis.",
        "All screening answers are processed directly on your device without sending or storing personal data on any external server, in the spirit of Indonesia's PDP Law 2022.",
        `All nutrition values per 55 g serving (${kcalSodium("kcal", "sodium")}) are estimates and not laboratory test results. Points to note: every variant contains soy (tempeh), and L-CUP's viscous fibre swells with water so it is not for people with swallowing difficulty.`,
      ],
      posterTitle: "5th IYC 2026 Poster",
      posterHint: "Tap the poster to enlarge and pan around.",
      posterAlt:
        "5th International Youth Conference (IYC) 2026 scientific poster titled Machine Learning-Assisted Dietary-Priority Profiling and Characterisation of a Modular Local Botanical Porridge (Sorghum bicolor - Tempeh - Amorphophallus muelleri): covering background, local ingredients, estimated nutrition table per 55 g (35 g Universal Base + 20 g S/L/M module), rule-based safety screening and dietary priority workflow, production and food safety targets, validation roadmap, and conclusion.",
      zoomOpen: "Enlarge poster",
      zoomClose: "Close full-screen poster viewer",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      zoomReset: "Fit to screen",
      viewerLabel: "Full-screen CUORE scientific poster viewer",
      panHint: "Drag or scroll to pan around the poster. Press Escape or Close to exit.",
    },
    education: {
      title: "Learn",
      intro: "Tap a card to read more. This is general information, not medical advice.",
      topics: [
        {
          id: "hypertension",
          title: "Hypertension",
          summary: "What blood pressure is and why it is measured more than once.",
          body: [
            "Blood pressure is the force of blood on the vessel walls as the heart pumps. It is written as two numbers: systolic (top) and diastolic (bottom).",
            "Readings vary through the day, so measure at least twice while calm and take the average.",
            "Assessment and management of blood pressure belong to health professionals. CUORE only helps identify dietary priorities.",
          ],
        },
        {
          id: "sodium",
          title: "Sodium",
          summary: "Where sodium comes from in everyday food.",
          body: [
            "Sodium is a mineral found in table salt and in many packaged foods, instant noodles, sauces and processed foods.",
            "WHO general guidance suggests less than 2 grams of sodium per day (about 5 grams of salt).",
            "Reading labels and cutting back on added salt are simple ways to be more aware of sodium.",
          ],
        },
        {
          id: "fibre",
          title: "Fibre",
          summary: "Soluble and insoluble fibre, and local sources.",
          body: [
            "Dietary fibre comes from plants such as vegetables, legumes and whole grains.",
            "Soluble fibre forms a thick gel with water, while insoluble fibre adds bulk to food.",
            "CUORE uses sorghum, tempeh, porang glucomannan, basil seed and raw banana flour. Its nutrition values are still estimates.",
          ],
        },
      ],
    },
    products: {
      title: "Products",
      intro: "1 serving = 35 g Universal Base + one 20 g module. Pick a cup to see details.",
      composition: "Composition",
      base: "Universal Base 35 g",
      module: "Module 20 g",
      nutrition: "Nutrition per 55 g (estimate)",
      nutritionNote: "All figures are estimates, not laboratory results.",
      allergens: "Allergens and points to note",
      prepare: "How to prepare",
      focus: "Focus",
      priority: "Priority for whom",
      benefit: "Short use",
      perServing: "per 55 g",
      viewPage: "Open packaging page",
      generalNote: "General note",
    },
    wizard: {
      title: "Check module priority",
      stepLabel: (n, t) => `Step ${n} of ${t}`,
      steps: ["Consent", "Body & history", "Complaints & eating"],
      consentTitle: "Data consent",
      consentBody:
        "Your answers are processed only on this device and are not sent to any server, in the spirit of Indonesia's PDP Law 2022. This tool is for adults aged 18 and over.",
      consentCheck: "I agree to my data being processed on this device.",
      safetyTitle: "Safety questions",
      safetyQuestions: {
        emergencySymptoms: "Right now, do you have chest pain, shortness of breath, fainting, or sudden weakness?",
        pregnant: "Are you pregnant?",
        kidneyDisease: "Do you have kidney disease?",
        soyAllergy: "Are you allergic to soy?",
        swallowingDifficulty: "Do you have difficulty swallowing?",
        takesMedication: "Do you regularly take medication for blood pressure, blood sugar, cholesterol, heart, or kidney?",
      },
      yes: "Yes",
      no: "No",
      bodyTitle: "Body data",
      age: "Age (years)",
      sex: "Sex",
      female: "Female",
      male: "Male",
      height: "Height (cm)",
      weight: "Weight (kg)",
      bmiAuto: (bmi) => `BMI calculated automatically: ${bmi}`,
      waist: "Waist circumference (cm)",
      bpTitle: "Blood pressure (optional)",
      bpHint: "If you have it, enter 2 readings taken while calm. You may leave it blank.",
      reading: (n) => `Reading ${n}`,
      systolic: "Systolic (top)",
      diastolic: "Diastolic (bottom)",
      historyTitle: "History",
      historyHint: "Tick what applies. You may tick nothing.",
      history: {
        hypertension: "I have been told I have high blood pressure",
        highCholesterol: "I have been told I have high cholesterol",
        diabetes: "I have been told I have diabetes or prediabetes",
        familyHypertensionStroke: "Family: high blood pressure or stroke",
        familyEarlyHeartDisease: "Family: heart disease at a young age",
        familyDiabetes: "Family: diabetes",
      },
      optionalLab: "Optional: laboratory results",
      optionalLabHint: "Leave blank if you do not have them. They make the suggestion more detailed.",
      ldl: "LDL (mg/dL)",
      hdl: "HDL (mg/dL)",
      tg: "Triglycerides (mg/dL)",
      glucose: "Fasting glucose (mg/dL)",
      symptomsTitle: "Complaints",
      symptomsHint: "Tick what you have had lately. You may tick nothing.",
      symptoms: {
        headacheNeck: "Headache or a heavy neck",
        dizziness: "Dizziness",
        thirst: "Frequent thirst",
        urination: "Frequent urination",
        hunger: "Getting hungry quickly",
        tiredAfterMeals: "Tiredness after meals",
        weightLoss: "Unexplained weight loss",
      },
      foodTitle: "Eating pattern",
      foodHint: "How often do you usually do this?",
      freq: ["Rarely (<1x/week)", "Sometimes (1-3x/week)", "Often (4-6x/week)", "Almost daily"],
      food: {
        saltyPackaged: "Eat salty packaged foods (chips, sausages, corned beef)",
        instantNoodle: "Eat instant noodles or instant soups",
        addedSalt: "Add salt or salty soy sauce to food",
        sugaryDrinks: "Drink sugary drinks (sweet tea, soda, sugared coffee)",
        sweetSnacks: "Eat cakes, sweet bread or sweet snacks",
        fried: "Eat fried foods",
        fattyMeat: "Eat fatty meat or offal",
        vegetables: "Eat vegetables",
        legumesNuts: "Eat legumes, nuts, or tempeh/tofu",
        mealRegularity: "Eat at regular times",
      },
      errorIncomplete: "Please complete the required fields.",
      errorBp: "Blood pressure: fill in both readings, or leave all of them blank.",
      resultTitle: "Result",
      seeProduct: "See product",
      onDevice: "Processed on your device. No data is sent to or stored on a server.",
      reasonsTitle: "Short reasons",
      tierNote: (tier) =>
        tier === 2
          ? "This result uses your optional laboratory values."
          : "This result uses basic data (no laboratory values).",
      scannedSame: (cup) => `You scanned ${cup}, and your profile also points to this module.`,
      scannedDiff: (scanned, result) =>
        `You scanned ${scanned}, but your profile points more towards ${result}. The result can differ from the cup you scanned.`,
      mlNote: "Rule-based (WHO thresholds), ML-ready; model validation planned.",
      demoButton: "Use demo data",
      demoHint: "Fills a sample profile (45 y, 138/88 mmHg) for presentations.",
      demoLabel: "Demo profile: sample data, not a real person.",
    },
    qr: {
      backHome: "Go to CUORE home",
      scanned: (cup) => `You scanned ${cup}`,
      tabCheck: "Check my priority",
      tabAbout: (cup) => `About ${cup}`,
    },
  },
};
