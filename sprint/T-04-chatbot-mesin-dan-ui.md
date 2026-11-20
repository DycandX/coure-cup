---
id: T-04
title: Chatbot - mesin pencocok intent on-device dan UI chat
status: done
estimate: L
depends_on: [T-03]
---

# T-04: Chatbot, mesin dan UI

Pendekatan yang diusulkan (belum disetujui pemilik, lihat `DECISIONS.md` D-004): **tanya-jawab berbasis aturan, jalan sepenuhnya di perangkat, tanpa model bahasa generatif dan tanpa panggilan jaringan.** Alasannya ada di [riset-chatbot.md](riset-chatbot.md) bagian 5.

## Lingkup

**Mesin** (`src/lib/chat/engine.ts`, fungsi murni, mudah diuji):
1. Normalisasi teks (huruf kecil, tanda baca, sinonim dan salah ketik umum ID/EN).
2. Panggil modul triase dari T-05 lebih dulu.
3. Hitung skor tiap intent dari kata kunci dan sinonim berbobot; pilih yang tertinggi bila di atas ambang.
4. Bila di bawah ambang: jawaban "belum yakin" dengan chip topik. Jangan menebak.
5. Kembalikan jawaban dari `knowledge.ts` dalam bahasa yang sedang dipilih di aplikasi (`LangProvider`), plus chip lanjutan.
6. Antarmuka mesin dibuat sederhana (`answer(input, ctx) -> reply`) agar kelak bisa diganti pencarian semantik tanpa mengubah UI.

**UI** (`src/components/ChatPanel.tsx`):
1. Tombol buka chat di `AppShell`, dan tab "Ask" di `CupPage` yang menjadikan modul yang dipindai sebagai konteks awal.
2. **Chip pertanyaan cepat sebagai cara utama** (Cara seduh, Alergen, Siapa yang boleh, Untuk siapa modul ini, Gejala jantung), kolom ketik sebagai cara kedua.
3. Gelembung chat, teks besar, kontras jelas, dapat dibaca pembaca layar (`aria-live` untuk balasan baru). Animasi Framer Motion ringan, hormati `prefers-reduced-motion`.
4. Teks tetap di dasar panel: "Alat bantu keputusan, bukan diagnosis." dan "Asisten tanya-jawab berbasis aturan, bukan AI bebas."
5. Pesan tidak disimpan (tanpa `localStorage`, tanpa log); menutup panel menghapus percakapan.
6. Tautan ke skrining ("Check my priority") dari jawaban yang relevan.

## Di luar lingkup

- Model bahasa generatif, API eksternal, atau embedding yang diunduh (opsi lanjutan, bukan sprint ini).
- Mengubah wizard skrining.

## Kriteria selesai

- [x] Tidak ada permintaan jaringan saat chat dipakai (e2e menghitung permintaan fetch/xhr selama chat dipakai: 0; test statis melarang `fetch` dan penyimpanan di kode chat).
- [x] Setiap chip menghasilkan jawaban yang benar; 8 variasi pertanyaan bebas per topik (ID dan EN, termasuk salah ketik) cocok ke intent yang benar pada test.
- [x] Pertanyaan di luar cakupan menghasilkan jawaban "belum yakin" dan bukan jawaban acak (termasuk kata sehari-hari yang mirip kata kunci, seperti "tanya", "lemas", "heard").
- [x] Berfungsi di lebar 390, 768, dan 1440 px (e2e 73/73 di ketiganya, termasuk chat saat offline); skrip `scripts/e2e-check.mjs` diperluas dengan alur chat dan lulus.
- [x] Bahasa ID dan EN mengikuti pilihan aplikasi (balasan disimpan sebagai rujukan lalu dirender ulang pada bahasa yang aktif).
- [x] `npm run build`, `tsc`, `eslint`, dan `npm run test:run` (413) bersih, 2026-11-21. Berkas: `src/lib/chat/{engine,intents,text}.ts`, `src/components/{ChatView,ChatLauncher}.tsx`.
