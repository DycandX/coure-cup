# TODO dan konfirmasi ke tim

Daftar ini **bukan** task sprint (lihat [sprint/README.md](sprint/README.md)). Isinya hal yang perlu dikonfirmasi atau diputuskan orang lain sebelum atau sesudah sprint berjalan. Diperbarui 2026-11-19.

## Dr. Enny (klinis)

- [x] Ambang TD, pinggang, gula puasa, dan TD opsional untuk modul S: dikonfirmasi 2026-11-19 (`DECISIONS.md` D-005). Pinggang pria diubah ke 90 cm.
- [ ] **BMI:** pakai batas WHO 25 dan 30, titik Asia 23,0 dan 27,5, atau campuran? Kode sekarang ≥25 saja.
- [ ] **Tekanan darah 130-139 / 85-89:** tingkat tengah (skor 0,4) tidak ada di pedoman WHO 2021. Dipertahankan atau dihapus?
- [ ] **Lipid:** ESC/EAS 2019 memberi target berbasis risiko, bukan satu angka batas. Angka draf sekarang (LDL 100/130/160, TG 150/200, HDL pria <40 dan wanita <50) sejalan dengan kelas NCEP ATP III; HDL wanita <50 setahu saya berasal dari kriteria sindrom metabolik. Tetapkan angka final, lalu putuskan apakah kolom LDL/HDL/TG di wizard diaktifkan lagi.
- [ ] Teks edukasi dan teks manfaat produk (ditulis agent, termasuk angka pedoman WHO).
- [ ] Ringkasan gejala jantung di `sprint/riset-chatbot.md` bagian 4.1: akurat dan pantas dipakai di chatbot? Perlu ditambah atau dikurangi?
- [ ] Apakah chatbot boleh menjawab pertanyaan gejala jantung sama sekali, atau hanya merujuk ke tenaga kesehatan.
- [ ] Nomor dan langkah darurat yang dipakai di jawaban (119, IGD, atau 112): verifikasi ke sumber resmi.

## Tim desain / kemasan

Temuan dari gambar yang dikirim 2026-11-19 (dibaca dari gambar, perlu dicek di berkas asli):

- [ ] **Label L-CUP:** tabel gizi tertulis L-CUP, tetapi lencana di tengah tertulis "S-CUP" (tagline Viscous Soluble Fibre sudah benar).
- [ ] **Label S-CUP:** "Serving Size" kosong (L dan M tertulis 55 G).
- [ ] **Pernyataan alergen:** tidak terlihat di ketiga label. Daftar bahan memuat *tempeh flour*, tetapi tidak ada tulisan "mengandung kedelai". Peringatan L-CUP (serat kental mengembang, kalsium oksalat porang) juga tidak terlihat.
- [ ] **Label gizi:** angka tidak berlabel "estimasi" (wajib per `AGENTS.md`).
- [ ] **Daftar bahan L-CUP:** memuat MOCAF dan tidak memuat dedak beras, sedangkan brief menyusun modul L dari porang, selasih, dedak beras, tepung tempe, sorgum, dan pisang mentah. Mana yang benar?
- [ ] **QR di ketiga label sama persis** (`https://q.me-qr.com/6cxfzr2e`, layanan QR pihak ketiga; tujuan tidak saya periksa). Bukan `/cup/s|m|l`. Ganti dengan QR di `deliverables/qr/` sebelum cetak.
- [ ] **Kalimat di sleeve** (mungkin dibaca sebagai klaim kesehatan): "Heart Friendly" (S), "Nourishment for a Longer Life" (M), "Good Taste, Healthier Choice" (S), "Better You" dan "Small Cup, Big Benefits" (L). Brief melarang klaim menyembuhkan, menurunkan kolesterol, atau mencegah penyakit. Perlu keputusan Atina dan dr. Enny.
- [ ] Typo `CARBOHYDARTE` dan `FLUOR` pada gambar lama tampak sudah benar di gambar baru; pastikan di berkas cetak final.
- [ ] Sleeve dan label final? Foto di sprint T-01 hanya dipakai setelah dinyatakan final. Minta juga berkas sumber beresolusi tinggi dan logo resmi.

## Atina (keputusan produk)

- [ ] Persetujuan pendekatan chatbot: tanya-jawab berbasis aturan, tanpa AI bebas (`DECISIONS.md` D-004). Poster memakai istilah "AI Recommender Assistant"; pastikan harapan tim sama.
- [ ] Setuju mengganti istilah "indikasi minum" menjadi "untuk siapa / prioritas formulasi".
- [ ] **Data seduh:** volume air, suhu, dan waktu tunggu per modul (belum ada di brief dan poster; dibutuhkan chatbot dan kemasan).
- [ ] Boleh tidaknya foto dan nama anggota tim tampil di web (poster memuatnya; T-02 memotongnya).
- [ ] Judul poster "Machine Learning-Assisted" vs web berbasis aturan: sepakati satu narasi di materi publik.
- [ ] Domain final `cuore-cup.vercel.app`; domain lama `cuorecup.vercel.app` bukan milik project ini. Cetak QR hanya dengan domain final.
- [ ] Boleh `docs/Brief_Web_CUORE.md` di-commit? (`docs/` di-ignore, klon baru tidak punya brief.)
- [ ] Tahap lomba berikutnya dan tenggat baru (tenggat 18 Nov 2026 sudah lewat).

## Pengujian dan teknis

- [ ] Uji `https://cuore-cup.vercel.app/cup/s|m|l` di HP nyata (Android dan iPhone, data seluler).
- [ ] Jalankan `scripts/e2e-check.mjs` terhadap domain live.
- [ ] Uji aksesibilitas: pembaca layar, Lighthouse, pengguna lansia.
- [ ] Tinjau terjemahan ID oleh penutur asli (bahasa bawaan sekarang Inggris).
- [ ] Pertimbangkan CI (`test:run` dan e2e) sebelum merge.
- [ ] Opsi lanjutan, bukan sprint ini: pencarian semantik on-device untuk chatbot (lihat `sprint/riset-chatbot.md` bagian 5), model ML setelah ada data berlabel klinisi.
