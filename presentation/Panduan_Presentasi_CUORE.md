# CUORE Web: Panduan Penggunaan dan Penjelasan untuk Tim Presentasi

Disusun 21 November 2026 dari kondisi produksi di https://cuorecup.vercel.app. Bahasa dokumen: Indonesia. Kalimat yang boleh diucapkan saat presentasi ditulis dalam bahasa Inggris karena web dan demo berbahasa Inggris.

## 1. Ringkasan satu menit

- **Apa itu:** CUORE adalah bubur instan gurih modular berbahan pangan lokal (sorgum, tempe, porang, jamur tiram). Satu porsi 55 g = 35 g Universal Base + 1 modul 20 g (S-CUP, M-CUP, atau L-CUP).
- **Web ini:** etalase produk, edukasi singkat, *cek prioritas modul* (3 langkah, berbasis aturan), tanya-jawab produk, dan halaman QR di tiap cup.
- **Cara kerja cek prioritas:** persetujuan dan cek keamanan, data tubuh dan riwayat, lalu keluhan dan pola makan. Hasilnya satu modul dengan 1-2 alasan singkat, atau saran konsultasi ke tenaga kesehatan.
- **Privasi:** semua jawaban diproses di perangkat pengguna. Tidak dikirim ke server dan tidak disimpan.
- **Offline:** setelah dibuka sekali, web tetap bisa dipakai tanpa jaringan (PWA).
- **Yang wajib selalu terlihat:** *Alat bantu keputusan, bukan diagnosis.*

## 2. Tautan dan berkas

| Apa | Di mana |
| --- | --- |
| Web produksi | https://cuorecup.vercel.app |
| Halaman QR per cup | /cup/s (S-CUP), /cup/m (M-CUP), /cup/l (L-CUP) |
| Tentang dan poster | /about |
| Model card (aturan dan batasan) | /model |
| Video demo, ponsel (portrait, ±2 menit) | deliverables/CUORE_demo_phone.mp4 (6,7 MB) |
| Video demo, desktop (landscape, ±2 menit, untuk proyektor) | deliverables/CUORE_demo_desktop.mp4 (10 MB) |
| Versi WebM dari kedua video | CUORE_demo_phone.webm dan CUORE_demo_desktop.webm (lebih besar; pakai MP4 untuk PowerPoint) |
| Tangkapan layar per langkah demo | deliverables/demo-steps-phone/ dan demo-steps-desktop/ (23 gambar PNG dan steps.json di masing-masing) |
| QR siap cetak | deliverables/qr/ |

Folder deliverables ada di komputer pemilik repo dan tidak ikut git. Untuk merekam ulang demo: jalankan `npm run build`, lalu `npm run demo` (ponsel) atau `npm run demo -- desktop`.

## 3. Cara menggunakan web

### Jalur A: pindai QR di cup (yang paling utama)

1. Pindai QR di cup. Halaman cup terbuka dan langsung masuk ke cek prioritas.
2. Centang persetujuan dan jawab enam pertanyaan keamanan (ya/tidak). Jawaban "Ya" pada salah satunya berarti saran konsultasi ke tenaga kesehatan, tanpa rekomendasi modul.
3. Isi data tubuh: usia, jenis kelamin, lingkar pinggang atau tinggi dan berat badan (salah satu cukup), riwayat. Tekanan darah boleh dikosongkan; bila diisi, dua kali ukur.
4. Isi keluhan dan sepuluh pertanyaan pola makan, lalu tekan *See result*.
5. Lihat hasil: modul yang diprioritaskan dan alasannya. Bila berbeda dengan cup yang dipindai, web menjelaskannya. Tekan *See product* untuk info cup tersebut.
6. Tab *About* berisi komposisi, nilai gizi (estimasi), dan hal yang perlu diperhatikan. Tab *Ask* berisi tanya-jawab dengan cup tersebut sebagai konteks.

### Jalur B: dari beranda

Buka web, tekan *Start*. Pilihannya: *Check module priority*, *What is a CUORE cup?*, *Products*, *Learn* (edukasi), dan *About & Poster*. Tombol *Ask CUORE* di pojok kanan bawah membuka tanya-jawab dari halaman mana pun.

### Jalur C: tanya-jawab

Pilih pertanyaan cepat atau ketik pertanyaan sendiri (bahasa Indonesia atau Inggris, salah ketik kecil dimaklumi). Topiknya: apa itu CUORE, cara menyiapkan, alergen, siapa yang boleh, untuk siapa tiap modul, gejala jantung (edukasi umum, draf), nilai gizi, bahan, dan perbandingan modul. Percakapan tidak disimpan; menutup panel menghapusnya.

### Bahasa dan pasang di HP

Tombol bahasa di pojok atas (ID/EN) mengganti seluruh teks. Bahasa bawaan Inggris. Untuk memasangnya di layar utama: buka web sekali saat online, lalu *Install app* atau *Add to Home Screen* di peramban.

## 4. Skrip demo 15 langkah

Video demo mengikuti tabel ini persis. Waktu dihitung dari awal video (perkiraan). Kolom kanan adalah kalimat yang aman diucapkan.

| No | Waktu | Yang terlihat | Kalimat untuk presentasi (EN) |
| --- | --- | --- | --- |
| 1 | 0:00 | Pindai QR di cup, halaman M-CUP terbuka langsung ke skrining | "Every cup carries a QR code. Scanning it opens the screening directly." |
| 2 | 0:04 | Persetujuan dan enam pertanyaan keamanan | "First, consent and a safety check. Any yes stops the screening and refers the person to a health professional." |
| 3 | 0:09 | Data tubuh, riwayat keluarga, dua kali ukur tekanan darah | "Waist or height and weight is enough. Blood pressure is optional, two readings." |
| 4 | 0:15 | Keluhan dan sepuluh pertanyaan pola makan | "Ten short questions about eating habits. Everything stays on the device." |
| 5 | 0:22 | Hasil: S-CUP, padahal yang dipindai M-CUP, dengan alasan singkat | "The result is a formulation priority with one or two reasons. It is rule-based and ML-ready, a decision aid and not a diagnosis." |
| 6 | 0:28 | Tombol See product membuka info cup | "One tap from the result to the cup: ingredients, estimated nutrition and points to note." |
| 7 | 0:34 | Ganti bahasa Indonesia lalu kembali ke Inggris | "The whole app switches language with one button." |
| 8 | 0:39 | Jawaban "Ya" pada pertanyaan keamanan menghasilkan saran konsultasi | "A yes on a safety question stops the screening. No module is suggested." |
| 9 | 0:47 | Tab Ask di halaman L-CUP: chip alergen lalu pertanyaan klaim "does it lower cholesterol" | "The Q&A is rule-based, not a free-form AI. A claim question always gets the same answer: CUORE is a food, not a medicine." |
| 10 | 0:58 | Mengetik "my chest hurts": pesan darurat 119 dan 112 | "Words like chest pain always get the emergency message, never product talk." |
| 11 | 1:03 | Panel What is a CUORE cup?: 35 g + 20 g = 55 g, tiga modul | "35 grams of Universal Base plus one 20 gram module. Three modules: S, M and L." |
| 12 | 1:15 | Kartu edukasi (Sodium) dan daftar produk | "Short education cards, and the three cups, each with its own colour." |
| 13 | 1:27 | Tombol Ask CUORE dari beranda, chip How to prepare | "The same Q&A is one tap away on every page." |
| 14 | 1:32 | About, penampil poster, lalu model card | "The poster, and a one-page model card that says what the rules are and what does not exist yet." |
| 15 | 1:46 | Server dimatikan dan jaringan diputus, aplikasi tetap membuka skrining dan tanya-jawab | "After one visit the app works offline, which matters where the signal is weak." |

<!--GALLERY-->

## 5. Penjelasan untuk pertanyaan teknis

### 5.1 Cara hasil ditentukan (aturan, bukan AI)

Web memakai aturan tertulis yang transparan, dengan arsitektur yang siap diganti model ML kelak. Urutan keputusan:

1. **Persetujuan.** Tanpa persetujuan, tidak ada yang diproses.
2. **Cek keamanan.** Usia di bawah 18 tahun, gejala yang perlu pertolongan segera, hamil, penyakit ginjal, alergi kedelai, kesulitan menelan, memakai obat rutin, data kunci kosong, angka tidak masuk akal, atau angka sangat tinggi: tampil *Konsultasikan dengan tenaga kesehatan*, tanpa modul.
3. **Skor tiga modul** (S, L, M) dari pola makan, tekanan darah, lingkar pinggang atau BMI, riwayat, keluhan, dan data laboratorium bila ada.
4. **Ambang prioritas.** Modul tertinggi disarankan hanya bila skornya minimal 0,25. Bila tidak ada yang menonjol, web berkata tidak ada prioritas yang jelas dan tidak memaksakan modul.
5. **Kalimat hasil** diambil dari templat yang sudah ditulis, bukan dihasilkan model bahasa.

### 5.2 Ambang yang dipakai (semuanya DRAF)

| Hal | Nilai | Sumber |
| --- | --- | --- |
| Tekanan darah | 140/90 mmHg atau lebih (tanpa tingkat tengah) | WHO 2021 |
| Lingkar pinggang | 90 cm pria, 80 cm wanita | Batas populasi Asia (WHO) |
| BMI | 23,0 sampai kurang dari 27,5 dihitung sebagian; 27,5 atau lebih penuh | Titik tindakan Asia (WHO Expert Consultation) |
| Gula darah puasa | 110 mg/dL sebagian; 126 mg/dL atau lebih penuh | WHO/IDF |
| LDL | 100 / 130 / 160 mg/dL | Kelas NCEP ATP III |
| Trigliserida | 150 / 200 mg/dL | Kelas NCEP ATP III |
| HDL rendah | di bawah 40 mg/dL untuk semua | NCEP ATP III |
| Keluhan | menambah paling banyak 0,1 dan tidak pernah satu-satunya alasan | Pilihan tim, draf |
| Angka sangat tinggi, langsung konsultasi | tekanan darah sistolik 180 atau diastolik 110, LDL 190, trigliserida 500, gula puasa 200 | Draf |

**Status ambang:** draf, menunggu penetapan tiga pakar (Stage B). Sebagian angka sudah dikonfirmasi tim, sisanya diterapkan sebagai usulan dan menunggu dr. Enny. Jangan menyebutnya "tervalidasi". Halaman /model menampilkan angka yang sama (dibaca langsung dari kode, jadi tidak bisa berbeda).

### 5.3 Bobot skor tiap modul (draf)

| Modul | Komponen dan bobot |
| --- | --- |
| S (sodium) | pola makan asin atau kemasan 0,45; tekanan darah 0,2; riwayat hipertensi 0,25; keluhan 0,1 |
| L (lipid) | gorengan dan lemak 0,3; serat rendah 0,1; pinggang atau BMI 0,3; riwayat kolesterol 0,3. Bila LDL/HDL/TG diisi, dibagi dua dengan nilai laboratorium |
| M (metabolik) | gula 0,3; keteraturan makan 0,1; pinggang atau BMI 0,25; riwayat diabetes 0,25; keluhan 0,1. Bila gula puasa diisi, dibagi dua dengan nilai laboratorium |

### 5.4 Tanya-jawab produk

Berbasis aturan, tanpa model bahasa dan tanpa jaringan. Urutannya: (1) **triase darurat** (14 kelompok gejala, Indonesia dan Inggris, termasuk salah ketik) selalu lebih dulu dan hanya menampilkan kalimat darurat 119 dan 112; (2) pertanyaan klaim dijawab dengan jawaban tetap; (3) pertanyaan obat, kehamilan, kesulitan menelan, atau kondisi pribadi diarahkan ke tenaga kesehatan; (4) pencocokan kata kunci; (5) bila tidak yakin, web berkata tidak yakin dan tidak menebak. Daftar kata kunci darurat dan teks gejala jantung masih draf menunggu tinjauan dr. Enny.

### 5.5 Offline dan privasi

Service worker menyimpan halaman, gambar, dan berkas aplikasi setelah kunjungan pertama. Yang disimpan hanya berkas publik; jawaban skrining tidak pernah masuk penyimpanan. Tidak ada permintaan jaringan saat skrining dan tanya-jawab dipakai.

## 6. Bahasa yang aman (wajib dipatuhi di slide dan ucapan)

**Boleh:**

- "Decision-support tool, not a diagnosis." (selalu tampil)
- "Formulation priority" atau "for whom" (bukan "indikasi")
- "Rule-based (WHO thresholds), ML-ready"
- "Rule set is a draft, awaiting confirmation by the three experts (Stage B)"
- "Points to note" (bukan "side effects")
- "Estimated values" untuk semua angka gizi
- "Sodium-conscious flavour" untuk S-CUP

**Jangan:**

- Menyebut CUORE menyembuhkan, menurunkan kolesterol, menurunkan tekanan darah, mencegah penyakit, atau menggantikan obat.
- Menyebut S-CUP lebih rendah natrium. Per 55 g (estimasi): S-CUP 17 mg, L-CUP dan M-CUP masing-masing 8 mg. Keunggulan S-CUP adalah rasa umami dari jamur dan bawang tanpa garam tambahan.
- Menyebut model machine learning sudah dilatih atau akurat. Belum ada model ML, belum ada validasi, belum ada angka akurasi. Poster berjudul "Machine Learning-Assisted"; jelaskan bahwa prototipe memakai baseline aturan yang transparan dan model ML hanya akan diadopsi bila terbukti lebih akurat dan tidak kurang adil.
- Menampilkan angka gizi tanpa kata "estimasi" (belum hasil laboratorium).
- Menyebut sleeve cup "Heart Friendly" atau kalimat serupa sebagai klaim; kalimat itu masih menunggu keputusan tim desain.

## 7. Perkiraan pertanyaan juri dan jawaban yang jujur

| Pertanyaan | Jawaban |
| --- | --- |
| Apakah ini AI? | Belum. Web memakai aturan yang transparan dan siap diganti model ML. Model ML hanya akan dipakai bila terbukti lebih akurat dan tidak kurang adil (esai bagian 1.4). |
| Apakah data pengguna dikirim ke server? | Tidak. Semua diproses di perangkat dan tidak disimpan. Dicek lewat test dan pemeriksaan permintaan jaringan saat chat dan skrining dipakai. |
| Apakah hasilnya sudah divalidasi? | Belum. Ambang berstatus draf, menunggu penetapan tiga pakar (Stage B). Belum ada uji akurasi dan audit keadilan; ini dinyatakan di halaman model card. |
| Bagaimana bila pengguna sedang sakit atau darurat? | Jawaban "Ya" pada cek keamanan menghasilkan saran konsultasi. Di tanya-jawab, kata seperti nyeri dada selalu menghasilkan pesan darurat (119 dan 112) tanpa pembahasan produk. |
| Apakah CUORE obat? | Bukan. CUORE adalah pangan. Modul S, L, M adalah prioritas formulasi, bukan pengobatan. Belum ada studi pada manusia yang membuktikan manfaat kesehatan tertentu. |
| Mengapa S-CUP, bukan L atau M, untuk pola makan asin? | Skor S terutama dari pola makan asin atau kemasan, tekanan darah, dan riwayat hipertensi. S-CUP memberi rasa gurih dari jamur dan bawang tanpa garam tambahan. Natrium S-CUP 17 mg, bukan yang terendah. |
| Apakah bisa dipakai tanpa internet? | Bisa, setelah dibuka sekali. Ini sudah diuji, termasuk di HP. |
| Siapa yang tidak sebaiknya memakai? | Yang menjawab "Ya" pada cek keamanan: hamil, penyakit ginjal, alergi kedelai, kesulitan menelan, memakai obat rutin, atau gejala yang perlu pertolongan segera. Semua varian mengandung kedelai (tempe). Serat kental L-CUP mengembang saat terkena air dan tidak untuk yang sulit menelan. |
| Mengapa tidak memakai chatbot AI bebas? | Esai menegaskan tidak ada generative AI untuk saran diet. Jawaban hanya dari kalimat yang sudah ditulis dan ditinjau, supaya tidak ada klaim yang tidak terkendali. |
| Apakah angka gizi sudah diuji laboratorium? | Belum. Semuanya estimasi dan berlabel estimasi di seluruh web. |

## 8. Persiapan demo langsung

1. **Satu hari sebelumnya:** buka https://cuorecup.vercel.app/cup/s di HP sekali dengan internet, tunggu sekitar 10 detik, lalu pasang ke layar utama. Itu memastikan mode offline siap.
2. **Sebelum tampil:** matikan notifikasi, set kecerahan penuh, dan siapkan video demo sebagai cadangan di laptop dan HP.
3. **Demo cepat:** dari beranda tekan *Start*, *Check module priority*, lalu *Use demo data*. Profil contoh (45 tahun, 138/88 mmHg, berlabel "Profil demo: data contoh, bukan orang sungguhan") menghasilkan S-CUP. Tombol demo tidak ada di halaman QR cup, supaya pengguna nyata tidak terkecoh.
4. **Bila internet mati di lokasi:** aktifkan mode pesawat dan lanjutkan, sekaligus jadikan momen untuk menunjukkan langkah 15.
5. **Bila ada yang gagal:** putar video demo yang sesuai (portrait untuk HP, landscape untuk proyektor).

## 9. Status dan batasan (sebutkan dengan jujur bila ditanya)

- Ambang dan bobot skor masih draf; sebagian sudah dikonfirmasi tim dan sisanya menunggu dr. Enny dan penetapan tiga pakar (Stage B).
- Teks edukasi, teks manfaat produk, ringkasan gejala jantung, dan daftar kata kunci darurat belum ditinjau dokter. Teks gejala jantung tampil dengan label "draf".
- Takaran air, suhu, dan waktu tunggu seduh belum ada. Web hanya menulis "takaran masih dalam pengujian, ikuti petunjuk kemasan".
- Model ML belum dilatih; belum ada validasi, angka akurasi, atau audit keadilan antar kelompok.
- Label kemasan perlu diperbaiki sebelum QR dicetak: lencana L-CUP tertulis "S-CUP", Serving Size S-CUP kosong, pernyataan alergen dan label "estimasi" belum ada, QR di label lama bukan alamat halaman ini.
- Belum diuji dengan pembaca layar dan dengan pengguna lansia.
- Foto dan nama anggota tim sengaja tidak ditampilkan di web.

## 10. Bila ada kendala

| Masalah | Penyebab dan tindakan |
| --- | --- |
| Halaman tidak terbuka offline | Belum pernah dibuka online. Buka sekali dengan internet, tunggu sekitar 10 detik, lalu coba lagi. |
| Tampilan tidak berubah setelah pembaruan | Tutup dan buka ulang aplikasi; versi baru terpasang saat kunjungan berikutnya. |
| Chat menjawab "belum yakin" | Itu disengaja untuk pertanyaan di luar cakupan. Gunakan pertanyaan cepat. |
| Tombol Ask CUORE tidak ada di halaman cup | Di /cup/s, /cup/m, dan /cup/l chat berada di tab *Ask*. |
| Ingin merekam ulang demo | `npm run build` lalu `npm run demo` (ponsel) atau `npm run demo -- desktop`. Hasil di deliverables/. |
