---
schema_version: 1
project: "web-coure-atina"
status: "prototype"
updated: "2026-11-19"
author_harness: "claude-code"
author_model: "Claude Sonnet 5.5"
based_on: "4f9fbad (docs: update handoff, decisions D-002/D-003 and commands)"
---
# Handoff: web-coure-atina (CUORE Web)

> Dokumen serah terima. Tujuannya: agent atau manusia lain (harness, AI, atau model yang berbeda) bisa melanjutkan pekerjaan tanpa kehilangan konteks. Baca bagian 0 lebih dulu, lalu [AGENTS.md](AGENTS.md).
>
> **Penanda status.** ✅ diverifikasi · ⚠️ diklaim tetapi belum dicek · ❌ rusak atau gagal · ❓ tidak diketahui.

| | |
| :--- | :--- |
| **Pohon kerja** | bersih; 7 commit sudah di-push ke `origin/main` (DycandX/coure-cup). `docs/`, `COURE-CUP/`, dan `deliverables/` ada di `.gitignore` |
| **Test** | ✅ 2026-11-19: `npm run test:run` 70 lulus; `tsc`, `eslint`, `npm run build` bersih; `node scripts/e2e-check.mjs` 19/19 lulus di tiga ukuran (HP 390x780, tablet 768x1024, desktop 1440x900; `VIEWPORT=WxH`) |
| **Pemilik** | `atina` / tim CUORE (5th IYC 2026, Diponegoro University). Bahasa percakapan: Indonesia. Kode, nama, dan pesan commit: Inggris |

---

## 0. Mulai di sini (60 detik)

- **Tujuan projek:** Membangun ulang website **CUORE** (bubur instan gurih modular: 35 g Universal Base + 20 g modul S/L/M) agar terasa seperti aplikasi (*app-like*, mobile-first, transisi halus), dilengkapi wizard skrining *rule-based* on-device dan halaman QR per modul (`/cup/s`, `/cup/m`, `/cup/l`).
- **Status sekarang:** Aplikasi Next.js berjalan dengan alur QR-first (`/cup/s|m|l` langsung membuka skrining; `D-003`), bahasa bawaan Inggris, tata letak responsif (HP/tablet/desktop), mode demo, QR stiker di `deliverables/qr/`. Kode sudah di-commit dan di-push. **`cuorecup.vercel.app/cup/s` masih 404** karena versi baru belum di-deploy. Repo referensi `COURE-CUP` sudah di-clone ke `COURE-CUP/` (berisi halaman statis `index.html` dan mockup Streamlit `app.py`), sementara dokumen brief dan esai ilmiah sudah dikonversi ke Markdown di `docs/`.
- **Sedang dikerjakan:** Tidak ada. Menunggu: deploy oleh pemilik Vercel, konfirmasi dr. Enny atas ambang (`D-002`, `D-003`), pengecekan label kemasan sebelum QR dicetak. Tenggat 18 Nov 2026 sudah lewat menurut tanggal 2026-11-19; tahap berikutnya belum diketahui.
- **Langkah pertama yang disarankan:** Lihat bagian 5 (tinjau dan commit kode, tinjauan klinisi atas `D-002`, uji aksesibilitas, aset resmi).
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
| Lokasi | `E:\_PROJECT\web-coure-atina` (repo `origin`: github.com/DycandX/coure-cup, branch `main`) |
| OS dan runtime | Windows, Node `v24.18.0`, Python `3.14.6`, Git `2.42.0.windows.2` |
| Bahasa dan framework | Next.js 16 (App Router) + TypeScript + Tailwind 4 + Framer Motion + Vitest. `COURE-CUP/` (HTML statis + Streamlit) hanya referensi lama dan di-ignore |
| Variabel lingkungan | `TIDAK ADA` (pemrosesan direncanakan 100% on-device) |
| Layanan luar | Vercel (`cuorecup.vercel.app` sebagai target deploy) |

```bash
# npm install && npm run dev | npm run test:run | npm run build
# Untuk menjalankan mockup Streamlit lama di COURE-CUP/ (belum dicoba ⚠️):
# pip install -r COURE-CUP/requirement.txt && streamlit run COURE-CUP/app.py
```

---

## 3. Peta projek

```text
docs/         (di-ignore git, hanya lokal) Brief & esai ilmiah (.pdf & .md), poster, desain cup
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
| Setup Next.js 16 + Tailwind 4 + Framer Motion + Vitest | ✅ | `npm run build` lulus; `D-001` Berlaku |
| Recommender v2 `src/lib/recommender/` (consent, safety, skor S/L/M, "tidak ada prioritas", template) | ✅ | 70 test lulus, termasuk tes kepatuhan bahasa (`src/lib/compliance.test.ts`) |
| UI app-like + wizard 1-2-3 + `/cup/s`, `/cup/m`, `/cup/l` (QR-first) | ⚠️ | `scripts/e2e-check.mjs` 16/16 pada build produksi (alur QR, catatan cup dipindai vs hasil, "See product", darurat, tidak ada prioritas + pointer gula darah, TD parsial, demo berlabel, ID/EN); belum diuji di perangkat nyata, Lighthouse, atau pembaca layar |
| Tata letak responsif | ✅ | Grid 2-3 kolom dari lebar 768 px, tanpa scroll horizontal (dicek otomatis), tangkapan layar tablet dan desktop diperiksa; belum diuji di perangkat tablet/desktop nyata |
| QR stiker `deliverables/qr/` | ⚠️ | 3 QR dan 12 stiker di PDF terbaca kembali ke `https://cuorecup.vercel.app/cup/s|m|l`; URL itu belum aktif (404) dan label kemasan belum dicek tim |
| Ambang rule layer | ⚠️ | Draf sementara (`D-002`), perlu tinjauan klinisi |
| Mockup lama `COURE-CUP/index.html` & `app.py` | ⚠️ | Diinspeksi secara statis; tidak dijalankan di browser/Streamlit |

Masalah yang diketahui:
- `COURE-CUP/index.html` belum memenuhi brief: masih long-scroll, chatbot hanya 2 input tanpa *consent* maupun *safety check* (hamil, ginjal, alergi kedelai, sulit menelan), dan belum ada rute QR `/cup/s`, `/cup/m`, `/cup/l`.
- Pada gambar kemasan `docs/L-CUP.png` masih terdapat typo `CARBOHYDARTE` dan `FLUOR` serta belum ada keterangan alergen kedelai pada S-CUP dan M-CUP (perlu diperbaiki tim desain sebelum QR dicetak).

---

## 5. Langkah berikutnya (urut prioritas)

| # | Langkah | Berkas utama | Selesai bila |
| :---: | :--- | :--- | :--- |
| 1 | Hubungkan repo ke project Vercel baru (domain `cuore-cup.vercel.app`, akun pribadi pemilik, lewat plugin Vercel/MCP) | n/a | Deploy produksi hijau |
| 2 | Deploy ke project Vercel baru milik pemilik (nama/domain, akun, dan sumber deploy masih ditanyakan; belum ada yang dibuat), lalu buat ulang QR dengan domain final dan uji `https://cuorecup.vercel.app/cup/s|m|l` di HP (data seluler) | n/a | Ketiga URL membuka skrining (bukan 404) |
| 3 | dr. Enny mengonfirmasi ambang (`D-002`, `D-003`), tekanan darah opsional, dan teks edukasi/manfaat | `safety.ts`, `scoring.ts`, `copy.ts`, `products.ts` | Angka dan teks final; test diperbarui |
| 4 | Cek label kemasan (typo, alergen kedelai, label L-CUP, nilai gizi berlabel estimasi), baru cetak QR | `deliverables/qr/` | Tim menyatakan label aman |
| 5 | Pasang aset resmi (logo, foto cup, poster); uji aksesibilitas dan perangkat nyata (Android, iPhone, lansia) | `public/`, `src/components/*` | Tidak ada isu kritis |

---

## 6. Keputusan

Keputusan lengkap dicatat di [DECISIONS.md](DECISIONS.md). `D-001` dan `D-003` Berlaku; angka klinis (`D-002`, `D-003`) masih draf dan menunggu dr. Enny. Keputusan akhir produk: Atina; keputusan klinis dan teks kesehatan: dr. Enny.

---

## 7. Hal yang mudah keliru

- **`docs/` tidak ada di git** (`.gitignore`): klon baru tidak punya brief. Salinan ada di mesin pemilik; putuskan apakah `Brief_Web_CUORE.md` boleh di-commit.
- **Teks edukasi dan teks manfaat produk ditulis agent** (termasuk angka pedoman WHO) dan perlu ditinjau tim sebelum rilis.
- **Skrip ulang:** `npm run demo` merekam video (`deliverables/CUORE_demo.webm`, di-ignore git), `python scripts/make_qr.py [BASE_URL]` membuat ulang QR, `node scripts/e2e-check.mjs` menguji alur.
- **Model ML belum ada.** Web hanya boleh menyebut "Rule-based (WHO thresholds), ML-ready"; skrip presentasi yang menyebut "machine learning ranks" tidak cocok dengan web.
- `next dev` menulis ulang blok aturan Next.js ke `AGENTS.md`; periksa diff sebelum commit.

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
| 2026-11-19 | claude-code / Claude Sonnet 5.5 | Alur QR-first (`D-003`), recommender v2, bahasa bawaan EN, mode demo, QR stiker, `scripts/e2e-check.mjs`, rekaman demo baru | sudah di-push |
| 2026-11-17 | claude-code / Claude Sonnet 5.5 | PDF daftar pertanyaan wawancara (`deliverables/`) + rekaman demo Playwright (`npm run demo`, `scripts/record-demo.mjs`) | sudah di-push |
| 2026-11-17 | claude-code / Claude Sonnet 5.5 | `.gitignore` + commit awal + push; setup Next.js; recommender + 49 test; UI app-like, wizard, `/cup/*` | commit awal (docs); kode belum di-commit |
| 2026-11-17 | agy / Gemini 4 Hydrogen (Medium) | Clone `COURE-CUP`, analisis gap vs brief, konversi 2 PDF di `docs/` ke Markdown, buat handoff kit | `UNINITIALIZED` |

---

## 10. Cek apakah dokumen ini masih segar

```bash
git status -sb
git log $(git log -1 --format=%H -- HANDOFF.md)..HEAD --oneline
```
*(Catatan: karena repo root belum memiliki commit pertama, perintah kedua baru berlaku setelah commit awal dibuat).*


