---
id: T-02
title: Pasang poster ke web sebagai halaman About
status: todo
estimate: S
depends_on: []
---

# T-02: Pasang poster ke web

## Latar belakang

Poster 5th IYC 2026 (`sprint/assets/poster-5thIYC.webp`, sekitar 1412 x 2000 px) merangkum latar belakang, bahan, gizi estimasi, cara kerja, validasi, dan keamanan pangan. Isinya selaras dengan esai dan brief, jadi bisa jadi sumber halaman "About / Science".

Poster memuat foto dan nama anggota tim. Karena itu berkas aslinya di-ignore git, dan versi untuk web harus dipotong tanpa strip foto tim sampai pemilik memutuskan lain (lihat [../todo.md](../todo.md)).

## Lingkup

1. Buat versi web poster tanpa strip foto dan nama tim di bagian bawah. Simpan sebagai WebP di `public/img/poster.webp`.
2. Tambah tampilan "About" (rute baru atau modal dari `AppShell`) dengan:
   - poster yang bisa di-zoom (ketuk untuk memperbesar, geser untuk menggulir);
   - ringkasan teks 4-6 poin (tujuan, tiga modul, cara kerja, keamanan data) dalam ID/EN, supaya isi tetap terbaca tanpa gambar;
   - `alt` yang menjelaskan isi poster.
3. Beri satu kalimat penjelas bahwa versi web saat ini berbasis aturan (*rule-based*, siap ML) dan model ML belum dilatih. Judul poster menyebut *Machine Learning-Assisted*, jadi kalimat ini mencegah salah paham.

## Di luar lingkup

- Mengubah isi poster.
- Menyalin angka dari poster ke kode. Angka gizi tetap bersumber dari `src/lib/products.ts`.

## Kriteria selesai

- [ ] Tampilan About bisa dibuka dari navigasi dan dapat dipakai pada lebar 390 px.
- [ ] Poster versi web tidak memuat foto atau nama anggota tim.
- [ ] Ringkasan teks tersedia ID dan EN, dan tidak memuat klaim menyembuhkan, menurunkan kolesterol, atau mencegah penyakit.
- [ ] Kalimat "berbasis aturan, model ML belum dilatih" tampil di halaman.
- [ ] Gambar di bawah 400 KB; build, `tsc`, `eslint`, dan test bersih.
