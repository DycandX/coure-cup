---
id: T-06
title: Web bisa dibuka offline setelah kunjungan pertama (PWA)
status: todo
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

- [ ] Setelah sekali dibuka, `/cup/s` dan wizard berjalan dalam mode pesawat (diuji otomatis dan di HP nyata).
- [ ] Lighthouse PWA "installable" lulus.
- [ ] Build, test, dan e2e bersih.
