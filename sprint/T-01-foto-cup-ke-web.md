---
id: T-01
title: Pasang foto cup (sleeve dan label) ke web
status: todo
estimate: S
depends_on: []
---

# T-01: Pasang foto cup ke web

## Latar belakang

Tim mengirim empat gambar cup. Web saat ini belum punya gambar produk (`public/` hanya berisi ikon bawaan Next.js). Brief meminta tiga cup berwarna: S pink, M hijau, L ungu.

| Berkas di `sprint/assets/` | Isi |
| :--- | :--- |
| `cup-sleeves.jpg` | Desain sleeve tiga cup, tanpa QR dan tanpa tabel gizi. Paling cocok untuk web. |
| `label-s-cup.jpg`, `label-m-cup.jpg`, `label-l-cup.jpg` | Label datar dengan tabel gizi dan QR. |

## Lingkup

1. Potong `cup-sleeves.jpg` menjadi tiga gambar per modul (L atas, S tengah, M bawah). Ekspor ke WebP dan simpan di `public/img/cups/` (nama `s.webp`, `m.webp`, `l.webp`), lebar sekitar 1200 px.
2. Tampilkan gambar di `ProductDetail` dan di tab info `CupPage` (`/cup/[variant]`) lewat `next/image`, dengan `alt` dwibahasa dan tanpa pergeseran tata letak (beri `width` dan `height`).
3. Tema warna halaman tetap mengikuti token yang ada (pink, hijau, ungu).
4. Label datar `label-*-cup.jpg` tidak ditampilkan sebagai gambar utama. Tabel gizi di web tetap berupa teks (bisa dibaca pembaca layar dan berlabel estimasi), bukan gambar.

## Di luar lingkup

- Mengubah desain kemasan atau memperbaiki isi label.
- Mencetak QR.

## Kriteria selesai

- [ ] Tiga gambar tampil di halaman produk dan halaman `/cup/s|m|l` pada lebar 390, 768, dan 1440 px, tanpa scroll horizontal.
- [ ] Tiap gambar punya `alt` ID dan EN dan berukuran di bawah 200 KB.
- [ ] `npm run build`, `tsc`, `eslint`, dan `npm run test:run` bersih; `node scripts/e2e-check.mjs` tetap lulus.
- [ ] Teks di samping gambar tidak menambah klaim kesehatan.

## Catatan

- Desain sleeve memuat kalimat pemasaran. Gambar hanya boleh dipakai di web setelah tim menyatakan desainnya final (lihat [../todo.md](../todo.md)).
- Gambar dari tim ber-resolusi sedang (sleeve sekitar 1280 px). Minta berkas sumber beresolusi lebih tinggi bila tampil buram di layar besar.
