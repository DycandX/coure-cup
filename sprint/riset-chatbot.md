# Riset: chatbot tanya-jawab produk CUORE

Disusun 2026-11-19. Tanda: ✅ terverifikasi dari berkas atau sumber yang dibuka · ⚠️ tafsiran atau draf saya, perlu dikonfirmasi · ❓ tidak diketahui.

## 1. Permintaan tim

Chatbot yang menjawab seputar produk modul: cara seduh, alergen, siapa yang boleh minum, indikasi minum, serta gejala dan keluhan penyakit jantung.

## 2. Maksud sebenarnya dari permintaan ini ⚠️

Ini tafsiran saya dari permintaan, brief, dan poster; tim belum mengonfirmasinya.

- **Tujuan pengguna:** orang yang memindai QR di cup bisa bertanya dengan bahasa sehari-hari dan langsung mendapat jawaban singkat, tanpa membaca seluruh halaman. Poster memperlihatkan bayangan tim: antarmuka berbentuk gelembung chat bernama "CUORE AI Recommender Assistant".
- **Empat dari lima topik sudah ada di web sebagai teks tetap** ✅ (`src/lib/products.ts`: langkah seduh, alergen, catatan umum, "prioritas untuk siapa"). Yang baru adalah **bentuk tanya-jawabnya**, bukan isinya.
- **"Indikasi minum" perlu diterjemahkan.** "Indikasi" adalah istilah obat (kondisi yang membuat obat diresepkan). CUORE adalah makanan, dan aturan proyek melarang klaim pengobatan. Padanan yang aman adalah **"untuk siapa" dan "prioritas formulasi"**, yang sudah dipakai di web (S: pola makan asin, L: lipid, M: metabolik).
- **"Gejala dan keluhan penyakit jantung" bukan informasi produk.** Ini edukasi kesehatan umum dan bagian paling berisiko: tanpa pagar, chatbot bisa terkesan mendiagnosis, atau mengaitkan produk dengan gejala. Karena itu jawabannya dibatasi pada edukasi dan rujukan ke layanan kesehatan.
- **Kemungkinan salah paham:** kata "AI" di poster bisa berarti tim membayangkan chat bebas bertenaga AI. Brief dan esai menyatakan tidak ada AI generatif untuk saran diet ✅. Perlu dikonfirmasi bahwa chat berbasis aturan dapat diterima (ada di `todo.md`).

## 3. Apakah web sudah punya fitur chatbot? ✅

**Belum.** Penelusuran `chatbot` dan `assistant` di `src/` tidak menemukan apa pun. Yang ada:

- **Wizard skrining** (`src/components/Wizard.tsx`): formulir bertahap (persetujuan, cek keamanan, input, hasil) dengan mesin aturan di `src/lib/recommender/`. Brief menyebutnya "Chatbot / AI Recommender", tetapi bentuknya formulir, bukan percakapan, dan tidak menerima pertanyaan bebas.
- **Halaman produk dan `/cup/s|m|l`:** menampilkan alergen, komposisi, gizi, dan cara seduh sebagai teks statis.

Chatbot tanya-jawab ini melengkapi wizard: wizard menjawab "modul mana untuk saya", chatbot menjawab "apa, bagaimana, siapa" soal produk.

## 4. Hasil riset

### 4.1 Gejala jantung: draf ringkasan edukasi ⚠️ (menunggu tinjauan klinisi)

Diparafrasekan dari WHO dan Kemenkes. Bukan pedoman klinis dan tidak boleh dipakai sebagai alat diagnosis.

- **Serangan jantung (WHO):** nyeri atau tidak nyaman di tengah dada, atau di lengan, bahu kiri, siku, rahang, atau punggung; bisa disertai sesak napas, mual atau muntah, pusing atau rasa mau pingsan, keringat dingin, wajah pucat. Perempuan lebih sering mengalami sesak napas, mual, serta nyeri punggung atau rahang. Sering tidak ada tanda peringatan sebelumnya.
- **Stroke (WHO):** kelemahan mendadak pada wajah, lengan, atau tungkai, paling sering satu sisi; juga mati rasa mendadak, bingung, sulit bicara atau memahami, gangguan penglihatan, sulit berjalan atau menjaga keseimbangan, sakit kepala hebat tanpa sebab jelas, atau pingsan.
- **Keluhan lain (Kemenkes):** rasa tertekan, sesak, atau terbakar di dada; nyeri menjalar ke lengan, rahang, tenggorokan, atau punggung; kaki bengkak; mudah lelah; jantung berdebar atau detak tidak teratur; batuk menetap dengan dahak merah muda pucat atau berbusa. Gejala dapat berbeda pada tiap orang.
- **Penyakit sering tanpa gejala (WHO):** serangan jantung atau stroke bisa menjadi tanda pertama.
- **Tindakan:** WHO menyatakan orang dengan gejala tersebut harus segera mencari pertolongan medis. Halaman Kemenkes yang saya buka menganjurkan ke dokter bila ada dugaan kuat, tetapi **tidak memuat langkah darurat atau nomor layanan**. Nomor 119 muncul di portal kesehatan swasta, bukan di sumber resmi yang saya buka, jadi nomor darurat harus diverifikasi sebelum dipakai ❓.
- **Faktor risiko diet (WHO):** pola makan berlebih garam, gula, dan lemak adalah faktor risiko perilaku. Halaman WHO yang saya buka tidak menyebut serat. Jangan mengaitkan ini dengan manfaat CUORE.

### 4.2 AI untuk kesehatan

Panduan WHO tentang model multimodal besar (Januari 2024) mencatat risiko keluaran salah atau bias, kerentanan keamanan siber, dan *automation bias*, yaitu pengguna terlalu percaya pada keluaran model. Poster proyek sendiri menyebut pagar yang sama (human override, inferensi on-device). Ini mendukung keputusan tidak memakai model generatif untuk pertanyaan kesehatan ✅ (sumber 3).

### 4.3 Teknologi on-device

- Pencarian semantik di peramban memang bisa dijalankan tanpa server (Transformers.js dan model embedding yang disimpan di IndexedDB), tetapi model multilingual berukuran puluhan hingga ratusan MB. Satu pracetak melaporkan sekitar 124 MiB; ini klaim penulisnya, bukan tolok ukur independen. Untuk pengguna HP dengan data seluler (alur QR), ukuran itu berat.
- Saya tidak menemukan perbandingan mutu pencarian FAQ ID/EN antar model ❓. Bila opsi ini dipilih kelak, harus diuji dengan data FAQ CUORE sendiri.
- Untuk sekitar 15-20 intent terkurasi, pencocokan kata kunci berbobot dengan sinonim sudah memadai dan nyaris tanpa ukuran unduhan.

## 5. Pilihan pendekatan

| | A. Kata kunci + chip (rekomendasi) | B. Pencarian semantik on-device | C. LLM lewat API | 
| :--- | :--- | :--- | :--- |
| Privasi (tanpa kirim data) | ✅ | ✅ | ❌ ketikan pengguna keluar perangkat |
| Sesuai esai ("tanpa AI generatif untuk saran diet") | ✅ | ✅ | ❌ |
| Risiko jawaban salah atau mengarang | rendah: semua jawaban tertulis | rendah: jawaban tertulis, hanya pencocokan yang cerdas | tinggi, sesuai risiko di sumber 3 |
| Beban di HP | hampir nol | unduhan puluhan-ratusan MB | rendah, tetapi butuh jaringan |
| Mutu untuk bahasa bebas dan salah ketik | cukup dengan sinonim dan chip | lebih baik | terbaik |
| Usaha | sedang | tinggi | sedang, plus biaya dan kunci API |

**Rekomendasi: A untuk sprint ini**, dengan antarmuka mesin yang bisa diganti ke B nanti. C tidak direkomendasikan karena bertentangan dengan esai, aturan privasi proyek (`AGENTS.md`), dan risiko kesehatan di atas. Keputusan menunggu pemilik; dicatat sebagai D-004 (diusulkan).

## 6. Rancangan penerapan

Berkas baru di `src/lib/chat/` dan `src/components/`, mengikuti pola `src/lib/recommender/` (logika murni, bisa diuji, dipisah dari UI).

```text
src/lib/chat/
  knowledge.ts    jawaban dwibahasa, dibangun dari products.ts   (T-03)
  heart-info.ts   edukasi jantung, status draf                   (T-03)
  triage.ts       deteksi gejala akut -> jawaban darurat tetap    (T-05)
  engine.ts       normalisasi -> triase -> skor intent -> jawaban (T-04)
  chat.test.ts    kepatuhan, triase, pencocokan intent            (T-05)
src/components/ChatPanel.tsx   UI gelembung chat + chip            (T-04)
```

Alur satu pesan:

1. Normalisasi teks.
2. **Triase darurat dulu.** Bila gejala akut terdeteksi, tampilkan rujukan darurat tetap dan berhenti.
3. Pagar: pertanyaan klaim, obat, kehamilan, atau penyakit tertentu mendapat jawaban tetap atau rujukan konsultasi.
4. Skor intent dari kata kunci dan sinonim; di bawah ambang berarti "belum yakin" dengan chip topik.
5. Tampilkan jawaban dalam bahasa aplikasi, dengan chip lanjutan dan teks tetap "Alat bantu keputusan, bukan diagnosis."

Daftar intent awal (sekitar 15): cara seduh umum, volume air dan suhu (menunggu data), alergen kedelai, alergen per modul, peringatan L-CUP, siapa yang boleh minum, siapa yang perlu konsultasi dulu, untuk siapa modul ini, perbandingan S/M/L, nilai gizi estimasi, bahan, klaim kesehatan (jawaban tetap), gejala jantung, kapan ke layanan darurat, mulai skrining, dan fallback.

Prinsip: tanpa jaringan, tanpa log, tanpa penyimpanan pesan, modul yang dipindai menjadi konteks awal, dan chip adalah jalur utama (cocok untuk lansia dan layar kecil).

## 7. Risiko dan hal yang belum diketahui

- ❓ Volume air, suhu, dan waktu tunggu seduh belum ada di brief maupun poster; chatbot tidak boleh mengarang angka.
- ⚠️ Konten gejala jantung berasal dari ringkasan WHO dan Kemenkes oleh agent dan belum ditinjau klinisi.
- ⚠️ Daftar kata kunci triase pasti tidak menutup semua ungkapan. Untuk itu ada jawaban pengaman tetap di semua jawaban jantung dan test dengan set frasa yang bisa diperluas.
- ⚠️ Pengguna bisa mengetik data kesehatan pribadi ke chat. Karena tidak ada pengiriman dan penyimpanan, risikonya rendah, tetapi teks di UI harus menyatakannya.
- ⚠️ Wizard dan chatbot bisa memberi kesan berbeda untuk pertanyaan "modul mana untuk saya"; chatbot harus mengarahkan ke wizard dan tidak merekomendasikan sendiri.

## 8. Sumber

1. WHO, Cardiovascular diseases (CVDs): https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)
2. Kemenkes RI, Kenali Gejala Jantung Sejak Dini: https://www.kemkes.go.id/id/kenali-gejala-jantung-sejak-dini
3. WHO, Ethics and governance of artificial intelligence for health: Guidance on large multi-modal models (2024): https://www.who.int/publications-detail-redirect/9789240084759
4. Pencarian web tentang pencarian semantik di peramban (EmbeddingGemma dengan Transformers.js, Bekko Embedding di arXiv): hasil mentah, bukan tolok ukur; verifikasi sebelum dipakai.
5. Nomor 119 sebagai layanan darurat: disebut portal kesehatan swasta (mis. Klikdokter) dalam hasil pencarian; belum diverifikasi ke sumber resmi.
6. Berkas proyek: `docs/Brief_Web_CUORE.md` bagian 4 dan 6, `src/lib/products.ts`, `src/components/Wizard.tsx`, `DECISIONS.md`.
