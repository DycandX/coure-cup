---
id: T-03
title: Chatbot - susun basis pengetahuan lima topik (ID/EN)
status: done (belum di-commit)
estimate: M
depends_on: []
---

# T-03: Chatbot, basis pengetahuan

Permintaan tim: chatbot yang menjawab seputar produk modul: cara seduh, alergen, siapa yang boleh minum, indikasi minum, serta gejala dan keluhan penyakit jantung. Penjelasan lengkap dan sumber ada di [riset-chatbot.md](riset-chatbot.md).

## Tujuan

Menulis semua jawaban sebagai data terstruktur dan dwibahasa, satu sumber kebenaran, sebelum ada mesin atau UI.

## Lingkup

Buat `src/lib/chat/knowledge.ts` (tipe dan data) dan `src/lib/chat/heart-info.ts` (konten edukasi jantung). Jawaban produk **disusun dari data yang sudah ada** (`PRODUCTS`, `PREP_STEPS`, `GENERAL_NOTE`, `ESTIMATE_NOTE` di `src/lib/products.ts`), bukan disalin, supaya tidak pernah berbeda dari halaman produk.

| Topik | Sumber isi | Keadaan data |
| :--- | :--- | :--- |
| Cara seduh | `PREP_STEPS` | Hanya 4 langkah umum. **Volume air, suhu, dan waktu tunggu belum ada** di brief maupun poster. Sampai ada, jawaban memberi langkah umum dan "ikuti petunjuk di kemasan". Jangan mengarang angka. |
| Alergen | `PRODUCTS[x].allergens` | Lengkap: kedelai (semua modul); L: serat kental mengembang dan kalsium oksalat porang. |
| Siapa yang boleh minum | `GENERAL_NOTE` dan aturan di `recommender/safety.ts` | Dewasa 18+. Konsultasi dulu bila hamil, sakit ginjal, alergi kedelai, sulit menelan, atau memakai obat tertentu. |
| "Indikasi minum" | `PRODUCTS[x].priorityFor` | Istilah diganti **"untuk siapa / prioritas formulasi"**. Jangan memakai kata "indikasi" dalam jawaban. Arahkan ke skrining "Check my priority". |
| Gejala dan keluhan penyakit jantung | Draf ringkasan WHO dan Kemenkes di `riset-chatbot.md` bagian 4 | Konten baru, status draf. Berupa edukasi umum dan rujukan, bukan diagnosis, dan tidak dikaitkan dengan produk. |

Tambahan yang diperlukan agar chatbot berguna:
- Jawaban perbandingan S/M/L dengan natrium benar (S = 17 mg, L dan M = 8 mg).
- Jawaban tetap untuk pertanyaan klaim ("apakah menurunkan kolesterol / menyembuhkan?"): tidak, CUORE bukan obat dan tidak mendiagnosis, mengobati, atau mencegah penyakit.
- Jawaban nilai gizi dan bahan, selalu berlabel estimasi.
- Jawaban "di luar cakupan" yang mengarahkan ke tenaga kesehatan.

Tiap entri berisi: `id`, `intent`, `moduleScope` (semua atau S/M/L), `answer` ID dan EN, `followUps` (chip lanjutan), dan `source` (produk, WHO, Kemenkes, atau draf).

## Di luar lingkup

- Pencocokan pertanyaan pengguna (T-04) dan pagar keamanan (T-05).
- Mengubah angka gizi, ambang skrining, atau komposisi.

## Kriteria selesai

- [x] Lima topik tercakup, masing-masing minimal satu jawaban ID dan EN; entri perbandingan dan klaim ada.
- [x] Jawaban produk dibangun dari `products.ts`; tidak ada angka gizi atau bahan yang diketik ulang.
- [x] Entri jantung bertanda `source` dan `status: "draft"`.
- [x] Tidak ada kata terlarang (lihat `AGENTS.md`); jawaban gizi berlabel estimasi.
- [x] `tsc`, `eslint`, dan test bersih.
