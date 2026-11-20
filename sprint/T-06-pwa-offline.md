---
id: T-06
title: Web bisa dibuka offline setelah kunjungan pertama (PWA)
status: done
estimate: M
depends_on: []
---

# T-06: Offline-capable (PWA)

Esai Attachment 2 menjanjikan "lightweight, offline-capable web application; on-device inference". Jawaban tim B5 menjadikannya prioritas demo.

## Lingkup

1. `manifest.webmanifest` (nama, ikon, warna tema marun, `start_url` `/`), ikon 192 dan 512 px.
2. Service worker yang menyimpan halaman `/`, `/about`, `/cup/s|m|l`, aset statis, dan gambar sehingga alur QR dan wizard tetap jalan tanpa sinyal setelah kunjungan pertama.
3. Tidak ada data pengguna di cache; wizard tetap tanpa penyimpanan jawaban.
4. Uji: e2e mode offline (Playwright `context.setOffline(true)`) setelah kunjungan pertama.

## Kriteria selesai

- [x] Setelah sekali dibuka, `/cup/s` dan wizard berjalan tanpa jaringan. Diuji otomatis dengan server dimatikan (e2e bagian 11, 45/45 di tiga ukuran, 2026-11-21). **Belum diuji di HP nyata** (mode pesawat di Android dan iPhone).
- [x] Installable: Chromium tidak melaporkan galat instalasi (`Page.getInstallabilityErrors`, di e2e). **Lighthouse belum dijalankan.**
- [x] Build, test (136), dan e2e bersih. Keputusan: `DECISIONS.md` D-007.
