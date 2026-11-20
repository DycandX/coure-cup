---
id: T-07
title: Halaman model card singkat
status: done
estimate: S
depends_on: []
---

# T-07: Model card

Esai Attachment 2 menyebut "model card" dan audit keadilan. Jawaban tim B5 meminta versi singkat untuk demo.

## Lingkup

Satu halaman (atau bagian di `/about`), ID dan EN, berisi: tujuan (prioritas formulasi, bukan diagnosis); input Tier 1 dan Tier 2; aturan saat ini dan sumber ambang (WHO, WHO Asia, WHO/IDF, NCEP ATP III) dengan status **draf, menunggu penetapan tiga pakar (Stage B)**; pengecualian keamanan; yang belum ada (model ML belum dilatih, belum ada validasi, belum ada audit subkelompok); privasi on-device. Angka dibaca dari `scoring.ts` dan `safety.ts`, bukan diketik ulang.

## Kriteria selesai

- [x] Angka di halaman sama dengan `THRESHOLDS` dan `SAFETY_LIMITS` (dicek test, `src/lib/model-card.test.ts`). Halaman: `/model`, isi di `src/lib/model-card.ts`, tautan dari `/about`.
- [x] Tidak ada klaim akurasi atau validasi yang belum dilakukan (test menolak persentase dan kata "telah divalidasi").
- [x] Build, test (127), dan e2e (33/33 di HP, tablet, desktop) bersih, 2026-11-21.
