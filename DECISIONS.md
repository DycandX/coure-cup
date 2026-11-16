# DECISIONS: web-course-atina (CUORE Web)

Catatan keputusan teknis dan produk. Satu entri per keputusan, terbaru di atas. Tujuannya agar agent berikutnya tidak membuka ulang keputusan yang sudah diambil, dan tahu alasannya bila perlu mengubahnya.

Aturan:
- Catat saat memilih library, arsitektur, format data, atau menolak sebuah pendekatan.
- Jangan menghapus entri lama. Bila keputusan berubah, tambahkan entri baru dan tandai yang lama `Digantikan oleh D-nnn`.
- Satu entri maksimal 10 baris.

---

## D-001: Pilihan Tech Stack, Lokasi Source Code, dan Bahasa Default UI

| | |
| :--- | :--- |
| **Tanggal** | 2026-11-17 |
| **Status** | Menunggu pemilik |
| **Diputuskan oleh** | Menunggu pemilik (diusulkan oleh agy / Gemini 4 Hydrogen (Medium)) |

- **Konteks:** `COURE-CUP/` saat ini hanya berisi `index.html` statis dan mockup `app.py` (Streamlit), sedangkan `docs/Brief_Web_CUORE.md` meminta web *app-like* dengan transisi Framer Motion/GSAP, wizard 3 langkah on-device, rute QR `/cup/s`, `/cup/m`, `/cup/l`, dan deploy di Vercel.
- **Keputusan (usulan):** Membangun aplikasi baru di root `web-course-atina` menggunakan **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**, dengan dukungan dwibahasa ID/EN (default ID).
- **Alasan:** Mendukung routing `/cup/[variant]`, animasi ringan di mobile, static/client-side execution untuk privasi on-device, dan integrasi native ke Vercel.
- **Pilihan yang ditolak:** Melanjutkan `index.html` tunggal (sulit mengelola rute `/cup/*`, state wizard, dan i18n secara bersih) atau Streamlit (tidak cocok untuk mobile-first UX & Vercel).
- **Konsekuensi:** Folder `COURE-CUP/` dipertahankan sebagai referensi/arsip lama sampai pemilik memutuskan apakah kode baru akan di-push ke repo tersebut atau repo baru.
