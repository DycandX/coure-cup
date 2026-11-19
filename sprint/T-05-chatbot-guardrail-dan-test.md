---
id: T-05
title: Chatbot - pagar keamanan, rujukan darurat, dan test kepatuhan
status: todo
estimate: M
depends_on: [T-03]
---

# T-05: Chatbot, pagar keamanan dan test kepatuhan

Bagian jantung dari permintaan ("gejala dan keluhan penyakit jantung") adalah edukasi kesehatan umum, bukan informasi produk, dan paling berisiko bila salah. Task ini memastikan chatbot tidak pernah melewati batas non-diagnostik dan non-klaim. Dikerjakan berdampingan dengan T-04.

## Lingkup

**Triase darurat** (`src/lib/chat/triage.ts`, dijalankan sebelum pencocokan intent):
1. Deteksi pesan yang menandakan gejala akut yang sedang dialami (nyeri atau tertekan di dada, sesak napas, keringat dingin, pingsan, lemah atau mati rasa mendadak satu sisi, bicara pelo, dalam ID dan EN).
2. Bila terdeteksi: tampilkan jawaban darurat tetap, yaitu segera cari pertolongan medis (IGD terdekat atau layanan darurat), tanpa membahas produk, tanpa saran makan, tanpa diagnosis.
3. Daftar kata kunci disimpan sebagai data sehingga mudah ditinjau klinisi.

**Pagar jawaban:**
1. Jawaban gejala jantung hanya berbentuk edukasi umum dan rujukan; tidak boleh menyimpulkan ("Anda terkena..."), tidak boleh menyarankan CUORE sebagai respons atas gejala.
2. Pertanyaan klaim (menurunkan kolesterol, menyembuhkan, mencegah, pengganti obat) selalu dijawab dengan jawaban tetap non-klaim.
3. Pertanyaan tentang obat, dosis, interaksi obat, kehamilan, atau penyakit tertentu: jawaban konsultasi ke tenaga kesehatan, bukan jawaban produk.
4. Larangan kata: tidak ada klaim penyakit, tidak ada "efek samping" (pakai "Perlu diperhatikan"), tidak ada pernyataan S-CUP lebih rendah natrium.

**Test** (`src/lib/chat/chat.test.ts`, pola sama dengan `src/lib/compliance.test.ts`):
1. Semua jawaban (ID dan EN, semua modul) dipindai untuk frasa terlarang.
2. Semua jawaban gizi memuat label estimasi; jawaban perbandingan natrium benar.
3. Set pesan darurat (minimal 20 frasa ID dan EN, termasuk salah ketik): **semuanya** harus masuk triase. Set pesan non-darurat tidak boleh memicu triase tanpa alasan.
4. Set pertanyaan klaim dan pertanyaan di luar cakupan menghasilkan jawaban tetap yang benar.
5. Tidak ada impor jaringan di `src/lib/chat/` (cek statis `fetch`, `XMLHttpRequest`, `sendBeacon`).

## Di luar lingkup

- Menetapkan isi klinis final; konten jantung tetap berstatus draf (`heart-info.ts`) dan ditandai demikian.

## Kriteria selesai

- [ ] Triase memuat semua frasa di set uji dan mengalahkan pencocokan intent lain.
- [ ] Tidak ada jawaban yang lolos dari pemindaian frasa terlarang.
- [ ] Test baru lulus bersama 70 test yang sudah ada; `tsc`, `eslint`, dan `npm run build` bersih.
- [ ] Tidak ada panggilan jaringan dari kode chat.
