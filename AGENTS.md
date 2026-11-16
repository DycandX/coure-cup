# AGENTS.md

Aturan kerja untuk AI agent di repo ini, apa pun harness dan modelnya. Konteks projek dan kondisi terkini ada di [HANDOFF.md](HANDOFF.md). Baca itu lebih dulu.

## Alur sesi (wajib)
1. **Awal:** baca `HANDOFF.md` bagian 0, 4, dan 5 (bagian lain hanya bila tugas memerlukannya), lalu jalankan `git status -sb` dan `git log $(git log -1 --format=%H -- HANDOFF.md)..HEAD --oneline`. Bila ada isi, laporkan sebelum mengubah apa pun. Bila `HANDOFF.md` belum ada, katakan itu dan sarankan membuatnya (prompt 01 pada project-kit).
2. **Selama kerja:** satu perubahan logis per langkah. Catat keputusan penting di `DECISIONS.md`.
3. **Akhir:** perbarui `HANDOFF.md` (frontmatter `updated` dan `based_on`, status, langkah berikutnya, satu baris riwayat sesi) sebelum menyatakan selesai. Jangan menunggu diminta.

## Komunikasi
- Bicara dengan pemilik dalam bahasa Indonesia. Kode, nama, komentar kode, dan pesan commit dalam bahasa Inggris.
- Untuk perubahan besar, jelaskan rencana dan tunggu persetujuan. Jangan push tanpa diminta.
- Laporkan dengan jujur apa yang sudah diuji, apa yang belum, dan apa yang gagal.
- Jangan menebak. Bila fakta tidak ada di berkas atau hasil perintah, katakan tidak tahu.

## Perintah
```bash
# Akan diisi setelah inisialisasi proyek web (D-001), mis.:
# npm install
# npm test
# npm run dev
```

## Aturan kode & konten CUORE
- Ikuti gaya berkas yang diubah; pisahkan logika *rule-based recommender* secara modular agar kelak mudah diganti model ML.
- **Kepatuhan bahasa wajib** (sesuai `docs/Brief_Web_CUORE.md`):
  - Tidak boleh ada klaim menyembuhkan, menurunkan kolesterol, atau mencegah penyakit.
  - Jangan tulis S-CUP lebih rendah natrium dari L-CUP/M-CUP (natrium S = 17 mg, L & M = 8 mg).
  - Semua angka gizi wajib berlabel **estimasi** (belum hasil lab).
  - Hindari kata "efek samping"; gunakan **"Perlu diperhatikan"**.
  - Wajib tampilkan disclaimer: **"Alat bantu keputusan, bukan diagnosis."**

## Test
- Setiap perubahan perilaku disertai test (terutama logika *safety screening* dan skor modul S/L/M). Perbaikan bug disertai test yang menangkap bug itu.

## Dokumentasi
- Perbarui `HANDOFF.md` bila kondisi projek berubah.
- Rujukan spesifikasi produk & ilmiah ada di `docs/Brief_Web_CUORE.md` dan `docs/Food_5th_IYC_CUORE_Scientific_Essay.md`.

## Git
- Conventional Commits dengan scope: `feat(area):`, `fix(area):`, `docs:`.
- Satu perubahan logis per commit. Jangan commit kecuali diminta.

## Jangan
- Jangan menulis nilai rahasia (kunci API, token, kata sandi) ke berkas mana pun, termasuk dokumen handoff.
- Jangan commit `.env`, kredensial, atau data pribadi.
- Jangan menghapus, memindahkan, atau menimpa berkas di luar tugas tanpa izin pemilik.
- Jangan mengganti library inti atau penyimpanan tanpa mencatat keputusan di `DECISIONS.md`.
- Jangan mengirim data skrining kesehatan pengguna ke server eksternal; semua pemrosesan wizard harus berjalan *on-device*.
