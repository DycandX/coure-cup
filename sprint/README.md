# Sprint: aset resmi dan chatbot tanya-jawab produk

Dibuat 2026-11-19 dari permintaan pemilik dan tim. Tanggal mulai dan selesai belum ditentukan; isi bila pemilik sudah menetapkannya.

Satu berkas = satu task. Hal yang masih perlu dikonfirmasi ke tim **tidak** dimasukkan ke sini; semuanya ada di [../todo.md](../todo.md).

## Daftar task

| ID | Task | Perkiraan | Bergantung pada |
| :--- | :--- | :---: | :--- |
| [T-01](T-01-foto-cup-ke-web.md) | Pasang foto cup (sleeve dan label) ke web | S | none |
| [T-02](T-02-poster-ke-web.md) | Pasang poster ke web sebagai halaman "About" | S | none |
| [T-03](T-03-chatbot-basis-pengetahuan.md) | Chatbot: susun basis pengetahuan (5 topik, ID/EN) | M | none |
| [T-04](T-04-chatbot-mesin-dan-ui.md) | Chatbot: mesin pencocok intent on-device dan UI chat (selesai) | L | T-03 |
| [T-05](T-05-chatbot-guardrail-dan-test.md) | Chatbot: pagar keamanan, rujukan darurat, dan test kepatuhan (selesai) | M | T-03 (dikerjakan bersama T-04) |
| [T-06](T-06-pwa-offline.md) | Web bisa dibuka offline setelah kunjungan pertama (PWA, selesai) | M | none |
| [T-07](T-07-model-card.md) | Halaman model card singkat (selesai) | S | none |

Perkiraan ukuran (S/M/L) adalah tebakan saya dari ukuran kode yang ada, bukan hasil ukur. Status 2026-11-21: T-01, T-02 selesai dan tayang; T-03 selesai. T-04 dan T-05 tidak lagi terhalang (D-004 berlaku, keputusan tim B1). T-06 dan T-07 berasal dari jawaban tim B5 (prioritas demo).

## Berkas pendukung

- [riset-chatbot.md](riset-chatbot.md): arti permintaan, status fitur saat ini, hasil riset, pilihan pendekatan, rancangan penerapan, dan daftar sumber.
- `assets/`: gambar dari tim. `label-*-cup.jpg` (label datar dengan tabel gizi dan QR), `cup-sleeves.jpg` (desain sleeve tiga cup), `poster-5thIYC.webp` (poster lomba). Poster berisi foto dan nama anggota tim, jadi di-ignore git (lihat `.gitignore`).

## Aturan yang berlaku untuk semua task

Ikuti [../AGENTS.md](../AGENTS.md): tanpa klaim medis, natrium S-CUP 17 mg (L dan M 8 mg), angka gizi berlabel estimasi, pakai "Perlu diperhatikan", tampilkan "Alat bantu keputusan, bukan diagnosis.", dan tidak ada data pengguna yang dikirim ke server. Setiap perubahan perilaku disertai test.
