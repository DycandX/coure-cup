# TODO dan konfirmasi ke tim

Daftar ini **bukan** task sprint (lihat [sprint/README.md](sprint/README.md)). Isinya hal yang perlu dikonfirmasi atau diputuskan orang lain sebelum atau sesudah sprint berjalan. Diperbarui 2026-11-21. Jawaban tim (dokumen "Jawaban untuk Pertanyaan Tim CUORE") sudah diterapkan sebagai draf, lihat `DECISIONS.md` D-006.

Daftar pertanyaan siap kirim, lengkap dengan contoh jawaban dan perbandingan esai vs web: `deliverables/Pertanyaan_untuk_Tim_CUORE.md` (lokal, `deliverables/` di-ignore git).

## Dr. Enny (klinis)

- [x] Ambang TD, pinggang, gula puasa, dan TD opsional untuk modul S: dikonfirmasi 2026-11-19 (`DECISIONS.md` D-005). Pinggang pria diubah ke 90 cm.
- [ ] **Konfirmasi dr. Enny atas usulan yang sudah diterapkan (D-006):** BMI titik Asia 23,0/27,5; TD tingkat tengah dihapus; lipid NCEP ATP III dengan HDL <40 untuk semua; kolom lipid aktif; pinggang atau tinggi+berat cukup salah satu.
- [ ] **Bobot S (pilihan agent):** keluhan 0,1, pola makan asin naik ke 0,45. Setuju?
- [ ] Teks edukasi dan teks manfaat produk (ditulis agent, termasuk angka pedoman WHO).
- [ ] Ringkasan gejala jantung di `sprint/riset-chatbot.md` bagian 4.1: akurat dan pantas dipakai di chatbot? Perlu ditambah atau dikurangi?
- [ ] Apakah chatbot boleh menjawab pertanyaan gejala jantung sama sekali, atau hanya merujuk ke tenaga kesehatan.
- [x] Nomor darurat: 119 (Kemenkes) dan 112 (Komdigi), dicek ke situs resmi 2026-11-21 dan dipakai di wizard dan chat. Catatan: menurut portal Komdigi, layanan 112 belum aktif di semua kabupaten/kota.

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

- [x] Pendekatan chatbot berbasis aturan disetujui (B1, keputusan tim). D-004 berlaku.
- [ ] Setuju mengganti istilah "indikasi minum" menjadi "untuk siapa / prioritas formulasi".
- [ ] **Data seduh:** volume air, suhu, dan waktu tunggu per modul (belum ada di brief dan poster; dibutuhkan chatbot dan kemasan).
- [ ] Boleh tidaknya foto dan nama anggota tim tampil di web (poster memuatnya; T-02 memotongnya).
- [ ] Judul poster "Machine Learning-Assisted" vs web berbasis aturan: sepakati satu narasi di materi publik.
- [x] Domain final `cuorecup.vercel.app` (diatur pemilik di Vercel 2026-11-21; `cuore-cup.vercel.app` dialihkan 307 ke sana). QR di `deliverables/qr/` dibuat ulang untuk domain ini.
- [ ] **Pindai satu stiker yang sudah dicetak** dan catat URL lengkapnya. Domain benar tetapi path selain `/cup/s|m|l` tetap gagal; gambar label yang dikirim sebelumnya memakai `q.me-qr.com/6cxfzr2e`.
- [ ] **Sleeve di web:** gambar sleeve yang tayang masih memuat kalimat yang menurut D6 harus diganti ("Heart Friendly" dst.). Sembunyikan sampai desain baru datang, atau biarkan?
- [ ] Boleh `docs/Brief_Web_CUORE.md` di-commit? (`docs/` di-ignore, klon baru tidak punya brief.)
- [ ] Tahap lomba berikutnya dan tenggat baru (tenggat 18 Nov 2026 sudah lewat).

## Pengujian dan teknis

- [ ] Uji `https://cuorecup.vercel.app/cup/s|m|l` di HP nyata (Android dan iPhone, data seluler). Penguji: Atina (E1).
- [ ] Jalankan `scripts/e2e-check.mjs` terhadap domain live.
- [ ] Uji aksesibilitas: pembaca layar, Lighthouse, pengguna lansia.
- [ ] Tinjau terjemahan ID oleh penutur asli (bahasa bawaan sekarang Inggris).
- [ ] Pertimbangkan CI (`test:run` dan e2e) sebelum merge.
- [ ] Opsi lanjutan, bukan sprint ini: pencarian semantik on-device untuk chatbot (lihat `sprint/riset-chatbot.md` bagian 5), model ML setelah ada data berlabel klinisi.
