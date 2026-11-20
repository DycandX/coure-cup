---
schema_version: 1
project: "web-coure-atina"
status: "prototype"
updated: "2026-11-21"
author_harness: "claude-code"
author_model: "Claude Sonnet 5.5"
based_on: "8de5b76 (docs: D-004 in force, D-006 team answers)"
---
# Handoff: web-coure-atina (CUORE Web)

> Dokumen serah terima. Tujuannya: agent atau manusia lain (harness, AI, atau model yang berbeda) bisa melanjutkan pekerjaan tanpa kehilangan konteks. Baca bagian 0 lebih dulu, lalu [AGENTS.md](AGENTS.md).
>
> **Penanda status.** ✅ diverifikasi · ⚠️ diklaim tetapi belum dicek · ❌ rusak atau gagal · ❓ tidak diketahui.

| | |
| :--- | :--- |
| **Pohon kerja** | setelah commit sesi ini bersih (kecuali `src/app/favicon.ico` yang berubah di luar sepengetahuan agent, ukuran 15086 ke 9300 byte; belum dicek pemilik). Sampai `1baaee9` sudah di-push ke `origin/main` (DycandX/coure-cup) dan live, termasuk D-006; commit `44877db` (e2e `BASE_URL`) dan commit T-07 masih lokal. `docs/`, `COURE-CUP/`, dan `deliverables/` ada di `.gitignore` |
| **Test** | ✅ 2026-11-21 di `8de5b76`: `npm run test:run` 127 lulus; `tsc`, `eslint`, `npm run build` bersih; `node scripts/e2e-check.mjs` 33/33 lulus pada build lokal di tiga ukuran (HP 390x780, tablet 768x1024, desktop 1440x900; `VIEWPORT=WxH`). Terhadap domain live (`BASE_URL=https://cuorecup.vercel.app`): 27/27 pada ukuran HP, diuji sebelum T-07 tayang. Skrip e2e menolak berjalan bila port 3101 terpakai |
| **Pemilik** | `atina` / tim CUORE (5th IYC 2026, Diponegoro University). Bahasa percakapan: Indonesia. Kode, nama, dan pesan commit: Inggris |

---

## 0. Mulai di sini (60 detik)

- **Tujuan projek:** Membangun ulang website **CUORE** (bubur instan gurih modular: 35 g Universal Base + 20 g modul S/L/M) agar terasa seperti aplikasi (*app-like*, mobile-first, transisi halus), dilengkapi wizard skrining *rule-based* on-device dan halaman QR per modul (`/cup/s`, `/cup/m`, `/cup/l`).
- **Status sekarang:** Aplikasi Next.js berjalan dengan alur QR-first (`/cup/s|m|l` langsung membuka skrining; `D-003`), bahasa bawaan Inggris, tata letak responsif (HP/tablet/desktop), mode demo, QR stiker di `deliverables/qr/`. Kode sudah di-commit dan di-push. **Sudah live di `https://cuorecup.vercel.app`** (project Vercel `cuore-cup`, akun pribadi, tersambung ke `DycandX/coure-cup`, auto-deploy tiap push ke `main`; `/cup/s|m|l` = 200 per 2026-11-19). Domain lama `cuorecup.vercel.app` bukan milik project ini. Repo referensi `COURE-CUP` sudah di-clone ke `COURE-CUP/` (berisi halaman statis `index.html` dan mockup Streamlit `app.py`), sementara dokumen brief dan esai ilmiah sudah dikonversi ke Markdown di `docs/`.
- **Sedang dikerjakan:** Tidak ada. Menunggu: uji ketiga URL di HP (data seluler), konfirmasi dr. Enny atas ambang (`D-002`, `D-003`), pengecekan label kemasan sebelum QR dicetak. Tenggat 18 Nov 2026 sudah lewat menurut tanggal 2026-11-19; tahap berikutnya belum diketahui.
- **Sprint:** T-01 (gambar sleeve) dan T-02 (halaman `/about`) sudah di-push dan tayang di `cuorecup.vercel.app` (2026-11-20). T-03 (basis pengetahuan chatbot, `src/lib/chat/`) selesai dan tayang (`fc8d75c`); T-07 (halaman `/model`, model card) selesai dan di-commit; T-04 (mesin dan UI chat) dan T-05 (triase darurat dan pagar keamanan) belum dimulai, rencananya menunggu persetujuan pemilik; T-06 (PWA) belum dimulai; jawaban cara seduh menunggu data tim (`BREW_DETAILS`), konten jantung berstatus draf. Sleeve T-01 masih memuat kalimat yang bisa terbaca klaim kesehatan ("Heart Friendly" dst.), tertanam di gambar; keputusan tim ada di `todo.md`. Sisa: `sprint/README.md` (T-04 dan T-05 chatbot, `D-004` sudah berlaku; T-06 PWA). Konfirmasi ke tim ada di `todo.md` dan `deliverables/Pertanyaan_untuk_Tim_CUORE.md` (lokal; memuat perbandingan esai vs web).
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
| Layanan luar | Vercel (project `cuore-cup`, domain utama `cuorecup.vercel.app`; `cuore-cup.vercel.app` dialihkan 307) |

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
sprint/       Task sprint (T-01..T-05), riset-chatbot.md, assets/ (foto cup, poster)
todo.md       Konfirmasi ke tim dan hal di luar sprint
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
| Recommender v2 `src/lib/recommender/` (consent, safety, skor S/L/M, "tidak ada prioritas", template) | ✅ | 106 test lulus (seluruh proyek, 2026-11-21), termasuk tes kepatuhan bahasa (`src/lib/compliance.test.ts`) |
| UI app-like + wizard 1-2-3 + `/cup/s`, `/cup/m`, `/cup/l` (QR-first) | ⚠️ | `scripts/e2e-check.mjs` 27/27 pada build produksi lokal (2026-11-21) (alur QR, catatan cup dipindai vs hasil, "See product", darurat, tidak ada prioritas + pointer gula darah, TD parsial, demo berlabel, ID/EN); belum diuji di perangkat nyata, Lighthouse, atau pembaca layar |
| Tata letak responsif | ✅ | Grid 2-3 kolom dari lebar 768 px, tanpa scroll horizontal (dicek otomatis), tangkapan layar tablet dan desktop diperiksa; belum diuji di perangkat tablet/desktop nyata |
| QR stiker `deliverables/qr/` | ⚠️ | 3 QR dan 12 stiker di PDF dibuat ulang 2026-11-19 dan terbaca kembali ke `https://cuorecup.vercel.app/cup/s|m|l` (200); label kemasan belum dicek tim |
| Ambang rule layer | ⚠️ | `D-005` + `D-006` (2026-11-21): BMI Asia, TD hanya 140/90, lipid NCEP ATP III, HDL <40, kolom lipid aktif, pinggang atau BMI. Diterapkan atas instruksi pemilik; menunggu konfirmasi dr. Enny |
| Mockup lama `COURE-CUP/index.html` & `app.py` | ⚠️ | Diinspeksi secara statis; tidak dijalankan di browser/Streamlit |

Masalah yang diketahui:
- `COURE-CUP/index.html` belum memenuhi brief: masih long-scroll, chatbot hanya 2 input tanpa *consent* maupun *safety check* (hamil, ginjal, alergi kedelai, sulit menelan), dan belum ada rute QR `/cup/s`, `/cup/m`, `/cup/l`.
- Pada gambar kemasan `docs/L-CUP.png` masih terdapat typo `CARBOHYDARTE` dan `FLUOR` serta belum ada keterangan alergen kedelai pada S-CUP dan M-CUP (perlu diperbaiki tim desain sebelum QR dicetak).

---

## 5. Langkah berikutnya (urut prioritas)

| # | Langkah | Berkas utama | Selesai bila |
| :---: | :--- | :--- | :--- |
| 1 | ✅ Selesai 2026-11-19: project `cuore-cup` dibuat via Vercel MCP, deploy READY, QR dibuat ulang untuk `https://cuorecup.vercel.app/cup/s|m|l` | n/a | n/a |
| 2 | Uji `https://cuorecup.vercel.app/cup/s|m|l` di HP (data seluler) dan jalankan `scripts/e2e-check.mjs` terhadap domain live | n/a | Ketiga URL membuka skrining di perangkat nyata |
| 3 | Tutup tiga hal terbuka `D-005` (BMI, tingkat TD 130-139, angka lipid) dan teks edukasi/manfaat oleh dr. Enny | `safety.ts`, `scoring.ts`, `copy.ts`, `products.ts` | Angka dan teks final; test diperbarui |
| 4 | Cek label kemasan (typo, alergen kedelai, label L-CUP, nilai gizi berlabel estimasi), baru cetak QR | `deliverables/qr/` | Tim menyatakan label aman |
| 5 | Pasang aset resmi (logo, foto cup, poster); uji aksesibilitas dan perangkat nyata (Android, iPhone, lansia) | `public/`, `src/components/*` | Tidak ada isu kritis |

---

## 6. Keputusan

Keputusan lengkap dicatat di [DECISIONS.md](DECISIONS.md). `D-001` dan `D-003` Berlaku; `D-005` mengonfirmasi sebagian angka klinis, tiga hal masih menunggu dr. Enny; `D-004` (chatbot) diusulkan. Keputusan akhir produk: Atina; keputusan klinis dan teks kesehatan: dr. Enny.

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
| 2026-11-21 | claude-code / Claude Sonnet 5.5 | T-07: halaman `/model` (model card ID/EN, angka dibaca dari `THRESHOLDS` dan `SAFETY_LIMITS`, 21 test, e2e 33/33); skrip e2e menerima `BASE_URL`; audit kode terhadap dokumen jawaban tim; tinjau ulang status; verifikasi `8de5b76` (106 test, tsc, eslint, build, e2e 27/27 lokal); perbarui HANDOFF (hash, status commit, angka test) | belum di-commit |
| 2026-11-21 | claude-code / Claude Opus 5.5 | Domain utama `cuorecup.vercel.app` (QR dibuat ulang); jawaban tim diterapkan (D-006: BMI Asia, TD tanpa tingkat tengah, HDL <40, kolom lipid, pinggang atau BMI, bobot keluhan 0,1, nomor darurat 119/112, peringatan L, 4 nilai gizi); D-004 berlaku; T-06/T-07 ditambahkan; e2e diperbaiki (server tertinggal saat browser gagal) | `0aa2a39`, `855d2f1`, `4d88c8f`, `17e70bb`, `8de5b76` |
| 2026-11-20 | claude-code / Claude Sonnet 5.5 | Push `main` (deploy produksi READY, semua halaman 200); T-03 basis pengetahuan chatbot: `src/lib/chat/` (types, knowledge, heart-info, 27 test), `src/lib/compliance-rules.ts` dibagi dengan `compliance.test.ts` | `fc8d75c`, `f6a765d` |
| 2026-11-20 | claude-code / Claude Sonnet 5.5 lalu Opus 5.5 | T-01 (agy Hydrogen High) dan T-02 (agy Argon High) di worktree `E:\_PROJECT\web-coure-atina-wt	01|t02`, ditinjau subagent Opus lalu diperbaiki: alt dekoratif, tes ukuran WebP, poster tanpa foto/nama tim (sudut ditutup panel tagline), angka gizi About dari `products.ts`, penampil poster aksesibel, e2e `/about`, perbaikan `scripts/e2e-check.mjs` (server lama tidak dimatikan di Windows sehingga e2e bisa menguji build lain) | digabung ke `main` lokal (belum di-push): `f3b2c40` |
| 2026-11-19 | claude-code / Claude Sonnet 5.5 | Folder `sprint/` (5 task, riset chatbot, aset cup dan poster), `todo.md`, usulan D-004, D-005 (pinggang pria 90 cm) | 87cab9d + commit docs berikutnya |

---

## 10. Cek apakah dokumen ini masih segar

```bash
git status -sb
git log $(git log -1 --format=%H -- HANDOFF.md)..HEAD --oneline
```
*(Catatan: karena repo root belum memiliki commit pertama, perintah kedua baru berlaku setelah commit awal dibuat).*


