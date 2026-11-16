---
schema_version: 1
project: "web-course-atina"
status: "prototype"
updated: "2026-11-17"
author_harness: "agy"
author_model: "Gemini 4 Hydrogen (Medium)"
based_on: "UNINITIALIZED (belum ada commit di master)"
---
# Handoff: web-course-atina (CUORE Web)

> Dokumen serah terima. Tujuannya: agent atau manusia lain (harness, AI, atau model yang berbeda) bisa melanjutkan pekerjaan tanpa kehilangan konteks. Baca bagian 0 lebih dulu, lalu [AGENTS.md](AGENTS.md).
>
> **Penanda status.** ✅ diverifikasi · ⚠️ diklaim tetapi belum dicek · ❌ rusak atau gagal · ❓ tidak diketahui.

| | |
| :--- | :--- |
| **Pohon kerja** | ada perubahan belum di-commit: `docs/`, `COURE-CUP/`, berkas handoff kit (repo root belum memiliki commit) |
| **Test** | belum dijalankan (belum ada aplikasi/test suite di root) |
| **Pemilik** | `atina` / tim CUORE (5th IYC 2026, Diponegoro University). Bahasa percakapan: Indonesia. Kode, nama, dan pesan commit: Inggris |

---

## 0. Mulai di sini (60 detik)

- **Tujuan projek:** Membangun ulang website **CUORE** (bubur instan gurih modular: 35 g Universal Base + 20 g modul S/L/M) agar terasa seperti aplikasi (*app-like*, mobile-first, transisi halus), dilengkapi wizard skrining *rule-based* on-device dan halaman QR per modul (`/cup/s`, `/cup/m`, `/cup/l`).
- **Status sekarang:** Prototipe awal / tahap persiapan. Repo referensi `COURE-CUP` sudah di-clone ke `COURE-CUP/` (berisi halaman statis `index.html` dan mockup Streamlit `app.py`), sementara dokumen brief dan esai ilmiah sudah dikonversi ke Markdown di `docs/`.
- **Sedang dikerjakan:** Penyusunan handoff kit dan konversi dokumen spesifikasi ke Markdown selesai; siap masuk tahap pemilihan tech stack & implementasi web baru.
- **Langkah pertama yang disarankan:** Konfirmasi keputusan di `DECISIONS.md` (`D-001`: tech stack Next.js/React + Framer Motion vs lainnya, dan struktur repo root vs `COURE-CUP/`), lalu inisialisasi proyek web di root.
- **Jangan lakukan:** Jangan menulis klaim medis/menyembuhkan/menurunkan kolesterol/mencegah penyakit, jangan menyebut S-CUP paling rendah natrium (L & M = 8 mg vs S = 17 mg), jangan menghilangkan label **estimasi** pada angka gizi, dan jangan mengirim data skrining ke server.

---

## 1. Projek ini apa

Website etalase produk, edukasi kardiovaskular, rekomendasi modul berbasis aturan (*rule-based* non-diagnostik), dan halaman info kemasan via QR untuk produk **CUORE** (*Local comfort, thoughtfully engineered*). Web awal (`cuorecup.vercel.app`) masih berupa satu halaman panjang yang di-scroll (`COURE-CUP/index.html`). Target baru meniru alur *app-like* seperti `bluehorizon-pi.vercel.app` dengan transisi layar halus, kartu interaktif (modal/slide), wizard 3 langkah, aksesibilitas ramah lansia, dan dukungan dwibahasa ID/EN (bonus).

Prinsip yang dipegang:
- **Non-diagnostik & non-klaim:** Wajib menampilkan *"Alat bantu keputusan, bukan diagnosis"*; gunakan *"Perlu diperhatikan"* (bukan "efek samping").
- **Privasi on-device:** Data profil dan skrining diproses di perangkat pengguna (selaras UU PDP 2022), bukan generative AI bebas.

---

## 2. Lingkungan dan cara menjalankan

| Hal | Nilai |
| :--- | :--- |
| Lokasi | `E:\_PROJECT\web-course-atina` |
| OS dan runtime | Windows, Node `v24.18.0`, Python `3.14.6`, Git `2.42.0.windows.2` |
| Bahasa dan framework | Target: React / Next.js + Tailwind CSS + Framer Motion atau GSAP (menunggu `D-001`). Saat ini di `COURE-CUP/`: HTML statis + Streamlit |
| Variabel lingkungan | `TIDAK ADA` (pemrosesan direncanakan 100% on-device) |
| Layanan luar | Vercel (`cuorecup.vercel.app` sebagai target deploy) |

```bash
# Belum ada proyek Node di root.
# Untuk menjalankan mockup Streamlit lama di COURE-CUP/ (belum dicoba ⚠️):
# pip install -r COURE-CUP/requirement.txt && streamlit run COURE-CUP/app.py
```

---

## 3. Peta projek

```text
docs/         Brief & esai ilmiah (.pdf & .md), poster (5thIYC...png), desain cup (L-CUP.png)
COURE-CUP/    Clone repo referensi (cef94cd): index.html (567 baris), app.py (247 baris), requirement.txt
HANDOFF.md    Dokumen serah terima ini
AGENTS.md     Aturan kerja agent & larangan bahasa/klaim CUORE
DECISIONS.md  Log keputusan arsitektur & produk
```

Alur utama target: Landing → Home / Edukasi (modal kartu) / Produk (detail 3 cup) / Wizard Skrining (Consent → Safety Check → Tier 1/2 → Output Template) + Rute QR (`/cup/s`, `/cup/m`, `/cup/l`).

---

## 4. Kondisi saat ini

| Bagian | Status | Bukti atau catatan |
| :--- | :---: | :--- |
| Clone repo `COURE-CUP` | ✅ | 2026-11-17, commit `cef94cd` di `COURE-CUP/` |
| Dokumen `docs/Brief_Web_CUORE.md` | ✅ | 2026-11-17, dikonversi lengkap dari `Brief_Web_CUORE.pdf` |
| Dokumen `docs/Food_5th_IYC_CUORE_Scientific_Essay.md` | ✅ | 2026-11-17, dikonversi lengkap dari esai PDF 31 halaman |
| Web baru (app-like + wizard + rute QR `/cup/*`) | ❌ | Belum dibuat; masih menunggu keputusan `D-001` |
| Mockup lama `COURE-CUP/index.html` & `app.py` | ⚠️ | Diinspeksi secara statis; tidak dijalankan di browser/Streamlit |

Masalah yang diketahui:
- `COURE-CUP/index.html` belum memenuhi brief: masih long-scroll, chatbot hanya 2 input tanpa *consent* maupun *safety check* (hamil, ginjal, alergi kedelai, sulit menelan), dan belum ada rute QR `/cup/s`, `/cup/m`, `/cup/l`.
- Pada gambar kemasan `docs/L-CUP.png` masih terdapat typo `CARBOHYDARTE` dan `FLUOR` serta belum ada keterangan alergen kedelai pada S-CUP dan M-CUP (perlu diperbaiki tim desain sebelum QR dicetak).

---

## 5. Langkah berikutnya (urut prioritas)

| # | Langkah | Berkas utama | Selesai bila |
| :---: | :--- | :--- | :--- |
| 1 | Konfirmasi keputusan `D-001` dengan pemilik (framework, lokasi source code, bahasa UI default) | `DECISIONS.md` | Status `D-001` menjadi `Berlaku` |
| 2 | Inisialisasi proyek web (Next.js App Router + Tailwind + Framer Motion) | `package.json` | `npm run dev` dan `npm run build` berjalan tanpa error |
| 3 | Implementasi modul *rule-based* skrining (Consent + Safety Rule Layer + Tier 1/2 scoring + template output) beserta unit test | `src/lib/recommender/*` | Test rule layer (eksklusi hamil/ginjal/kedelai/disfagia) & skor S/M/L lulus semua |
| 4 | Implementasi UI app-like (Landing, Edukasi modal, Produk 3 cup, Wizard 1-2-3) & halaman QR `/cup/s`, `/cup/m`, `/cup/l` | `src/app/*` | Semua rute `/cup/s`, `/cup/m`, `/cup/l` render mobile-first sesuai warna tema & aturan non-klaim |

---

## 6. Keputusan

Keputusan lengkap dicatat di [DECISIONS.md](DECISIONS.md).
Menunggu pemilik (jangan diputuskan sendiri oleh agent):
- **D-001:** Tech stack & struktur repo — apakah proyek baru dibangun di root `web-course-atina` memakai Next.js (App Router) + Tailwind CSS + Framer Motion lalu di-push ke `COURE-CUP` atau repo baru? Rekomendasi: Next.js App Router + Tailwind + Framer Motion di root agar rute `/cup/s`, `/cup/m`, `/cup/l` dan deploy Vercel berjalan mulus.

---

## 7. Hal yang mudah keliru

- **Salah klaim natrium S-CUP:** Jangan tulis S-CUP lebih rendah natrium daripada L-CUP/M-CUP. Tabel gizi estimasi di `docs/Brief_Web_CUORE.md`: S-CUP = **17 mg**, sedangkan L-CUP dan M-CUP = **8 mg**. Keunggulan S-CUP adalah rasa umami tanpa garam tambahan.
- **Generative AI di chatbot:** Esai menegaskan **tidak ada generative AI** untuk saran diet. Gunakan logika *rule-based* modular + kalimat template tertulis.
- **Peringatan khusus L-CUP:** Wajib menyertakan peringatan serat kental mengembang (tidak untuk kesulitan menelan, siapkan dengan cairan cukup) dan info pengolahan kalsium oksalat porang.
- **Subfolder `COURE-CUP/` memiliki `.git` sendiri:** Hati-hati saat melakukan `git add` di root agar tidak memperlakukan `COURE-CUP/` sebagai nested git repo tanpa sengaja.

---

## 8. Batas kerja

- **Jangan sentuh:** File PDF/PNG asli di `docs/`, riwayat git di `COURE-CUP/.git` tanpa izin.
- **Perlu izin pemilik:** `git push`, deploy ke Vercel produksi, mengubah aturan klinis/ambang batas *rule layer* di luar `docs/Brief_Web_CUORE.md`.
- **Aman dilakukan sendiri:** Membaca `docs/`, menulis kode aplikasi & unit test di `src/`, menjalankan build/test lokal.

---

## 9. Riwayat sesi (terbaru di atas, simpan 5 terakhir)

| Tanggal | Agent / model | Dikerjakan | Commit |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | agy / Gemini 4 Hydrogen (Medium) | Clone `COURE-CUP`, analisis gap vs brief, konversi 2 PDF di `docs/` ke Markdown, buat handoff kit | `UNINITIALIZED` |

---

## 10. Cek apakah dokumen ini masih segar

```bash
git status -sb
git log $(git log -1 --format=%H -- HANDOFF.md)..HEAD --oneline
```
*(Catatan: karena repo root belum memiliki commit pertama, perintah kedua baru berlaku setelah commit awal dibuat).*
