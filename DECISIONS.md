# DECISIONS: web-course-atina (CUORE Web)

Catatan keputusan teknis dan produk. Satu entri per keputusan, terbaru di atas. Tujuannya agar agent berikutnya tidak membuka ulang keputusan yang sudah diambil, dan tahu alasannya bila perlu mengubahnya.

Aturan:
- Catat saat memilih library, arsitektur, format data, atau menolak sebuah pendekatan.
- Jangan menghapus entri lama. Bila keputusan berubah, tambahkan entri baru dan tandai yang lama `Digantikan oleh D-nnn`.
- Satu entri maksimal 10 baris.

---

## D-003: Alur QR-first, input baru, ambang WHO, dan bahasa bawaan Inggris

| | |
| :--- | :--- |
| **Tanggal** | 2026-11-19 |
| **Status** | Berlaku (angka klinis masih draf, menunggu dr. Enny) |
| **Diputuskan oleh** | Permintaan pemilik + jawaban wawancara tim (angka klinis: dr. Enny, belum mengonfirmasi) |

- **Konteks:** Tim menjawab wawancara (bahasa Inggris, merah marun, ambang WHO, tanpa penyimpanan data, boleh menyebut berbasis aturan) dan pemilik meminta alur: scan QR di cup, isi TB/BB/pinggang/riwayat/keluhan, lalu modul yang sesuai.
- **Keputusan:** `/cup/[variant]` langsung membuka skrining (tab "Check my priority"; info cup di tab kedua). Input: usia, jenis kelamin, TB dan BB (BMI otomatis), pinggang, riwayat pribadi/keluarga, keluhan, 10 pertanyaan makan; tekanan darah dan lab opsional. Keluhan darurat, hamil, ginjal, kedelai, sulit menelan, atau obat rutin langsung ke konsultasi. Bila skor tertinggi < 0,25 tampil "tidak ada prioritas jelas" (modul tidak dipaksakan). Hasil dapat berbeda dari cup yang dipindai dan ditulis demikian. Bahasa bawaan Inggris.
- **Ambang (WHO, draf):** TD rata-rata ≥140/90 skor penuh, 130-139/85-89 skor 0,4; pinggang ≥94 cm (L) / ≥80 cm (P); BMI ≥25; gula puasa ≥126 penuh, 110-125 parsial. Ambang lipid bukan dari WHO: kolom LDL, HDL, dan trigliserida disembunyikan di UI sampai dr. Enny memberi angka (mesin skor tetap punya draf `D-002`); kolom gula puasa tetap ada. `D-003` menggantikan ambang TD, pinggang, BMI, dan glukosa pada `D-002`.
- **Menyimpang dari brief:** tekanan darah kini opsional (brief meminta ≥2 pengukuran). Satu pengukuran saja dianggap data tidak lengkap. Perlu persetujuan dr. Enny.
- **ML:** model tidak dilatih (tidak ada data berlabel klinisi). Web menulis "Rule-based (WHO thresholds), ML-ready; model validation planned."

## D-002: Ambang Rule Layer Sementara (draf, perlu tinjauan klinisi)

| | |
| :--- | :--- |
| **Tanggal** | 2026-11-17 |
| **Status** | Berlaku sementara (menunggu tinjauan klinisi); ambang TD, pinggang, BMI, glukosa digantikan oleh D-003 |
| **Diputuskan oleh** | Draf agent (Claude Sonnet 5.5); belum dikonfirmasi pemilik maupun klinisi |

- **Konteks:** Brief dan esai hanya menyebut kondisi eksklusi, belum ada ambang numerik. Esai menyatakan rule set final ditetapkan dokter, ahli gizi klinis, dan teknolog pangan.
- **Keputusan:** Ambang sementara dari pedoman umum ada di `src/lib/recommender/safety.ts` (`SAFETY_LIMITS`) dan `scoring.ts`: TD rata-rata ≥180/110, LDL ≥190, TG ≥500, GDP ≥200 mg/dL → konsultasi; lingkar pinggang ≥90 cm (L) / ≥80 cm (P), tanpa tingkat tengah, dan BMI ≥23 (skor 0,5) / ≥25 (skor 1); "obat tertentu" = satu pertanyaan ya/tidak (ya → konsultasi).
- **Konsekuensi:** Ganti angka-angka itu setelah ada penetapan klinisi. Test di `recommender.test.ts` menjaga batas; ubah test bersama angkanya. Seri skor: urutan S, L, M.

## D-001: Pilihan Tech Stack, Lokasi Source Code, dan Bahasa Default UI

| | |
| :--- | :--- |
| **Tanggal** | 2026-11-17 |
| **Status** | Berlaku |
| **Diputuskan oleh** | Pemilik (disetujui 2026-11-17; diusulkan oleh agy / Gemini 4 Hydrogen (Medium)) |

- **Konteks:** `COURE-CUP/` saat ini hanya berisi `index.html` statis dan mockup `app.py` (Streamlit), sedangkan `docs/Brief_Web_CUORE.md` meminta web *app-like* dengan transisi Framer Motion/GSAP, wizard 3 langkah on-device, rute QR `/cup/s`, `/cup/m`, `/cup/l`, dan deploy di Vercel.
- **Keputusan (usulan):** Membangun aplikasi baru di root `web-course-atina` menggunakan **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**, dengan dukungan dwibahasa ID/EN (default ID).
- **Alasan:** Mendukung routing `/cup/[variant]`, animasi ringan di mobile, static/client-side execution untuk privasi on-device, dan integrasi native ke Vercel.
- **Pilihan yang ditolak:** Melanjutkan `index.html` tunggal (sulit mengelola rute `/cup/*`, state wizard, dan i18n secara bersih) atau Streamlit (tidak cocok untuk mobile-first UX & Vercel).
- **Implementasi:** Next.js 16.4 + React 19 + Tailwind 4 + Framer Motion + Vitest di root (`@types/node` dinaikkan ke ^24 karena peer Vitest 5). `docs/` dan `COURE-CUP/` masuk `.gitignore` (dokumen kompetisi & repo bersarang).
- **Konsekuensi:** Folder `COURE-CUP/` dipertahankan sebagai referensi/arsip lama sampai pemilik memutuskan apakah kode baru akan di-push ke repo tersebut atau repo baru.
