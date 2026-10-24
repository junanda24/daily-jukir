# JUKIR! — Raja Parkir

Game arcade HTML5 canvas: kamu bukan supirnya — kamu **tukang parkirnya**.
Ketuk mobil yang datang, ketuk slot kosong, si jukir meniup peluit dan mobil
jalan sendiri ke slotnya. Begitu pemilik mobil kembali, ketuk mobilnya untuk
menagih **Rp2.000** sebelum dia kabur marah. Tiga pelanggan kabur = shift
selesai. Jalan langsung di browser HP, tanpa install, tanpa login.

**Kenapa ide ini dipilih:** semua game parkir menempatkan pemain sebagai supir.
Tidak ada yang menempatkan pemain sebagai jukir — sosok yang tiap orang
Indonesia temui tiap hari ("terus... terus... kiri dikit!", peluit, uang
Rp2.000). Membalik sudut pandang inilah efek "kok kepikiran sih"-nya: bukan
parkir presisi, melainkan manajemen perhatian — memilih mobil, memilih slot,
dan menagih tepat waktu.

## Fitur

- **Loop jukir penuh**: mobil antre di pintu masuk → ketuk mobil (peluit +
  cincin sorot) → ketuk slot kosong → mobil jalan sendiri via jalur
  (partikel debu) → terparkir → pemilik kembali → ketuk untuk tagih
- **Ekonomi**: Rp2.000/mobil; 10% "mobil bos" emas bertarif Rp5.000; koin
  beterbangan ke HUD + teks melayang "+Rp2.000"
- **Sistem pelanggan marah**: jendela tagih 8 detik (cincin merah berdenyut);
  kedaluwarsa = "KABUR!" + screen shake + strike; **3 strike = game over**
  ("SHIFT SELESAI!")
- **Level**: naik tiap Rp20.000 — spawn makin rapat (5 → 2,2 dtk), pemilik
  makin tak sabaran, jendela tagih menyusut (min 4 dtk); banner
  "LEVEL NAIK! Makin rame!"
- **Teriakan jukir**: bubble acak "TERUS!", "KIRI DIKIT!", "MANTAP!", "BAGUS!"
  tiap mobil parkir; bubble panduan "PILIH MOBIL DULU!", "SUDAH ADA MOBIL!",
  "TUNGGU!" (tanpa penalti)
- **High score persisten** di localStorage (`jukir_high`) + "REKOR BARU!" +
  confetti di layar game over
- **Game feel**: suara 100% prosedural WebAudio (peluit dua-nada, klakson,
  koin, jingle; AudioContext lazy saat gestur pertama), tombol bisu persisten
  (`jukir_mute`), hormat `prefers-reduced-motion`
- **Layar**: menu (cara main 3 langkah + rekor) → main (HUD rupiah/strike/
  level) → game over (statistik: total rupiah, mobil dilayani, pelanggan
  kabur, rekor) → main lagi
- Kontrol ketuk penuh (mouse + sentuhan HP); canvas 480×800 diskalakan
  responsif portrait
- Semua aset visual original dari kode (canvas) — tanpa gambar/sprite pihak
  ketiga; tanpa fetch eksternal sama sekali

## Cara main

1. Buka `src/jukir.html` di browser (HP atau desktop) — atau versi artifact di
   link bawah.
2. Ketuk **MULAI JAGA**. Mobil datang dan antre di bawah.
3. Ketuk mobil yang antre (peluit!), lalu ketuk slot kosong — mobil parkir
   sendiri. Hanya satu mobil bisa diarahkan dalam satu waktu.
4. Saat cincin kesabaran mobil habis dan muncul "!" + cincin merah, SEGERA
   ketuk mobil itu untuk menagih sebelum pemiliknya kabur.
5. Tiga pelanggan kabur = shift selesai. Pecahkan rekormu!

## Menjalankan dari source

Tidak perlu build step — satu file HTML mandiri:

```bash
# cara termudah: buka langsung
xdg-open src/jukir.html        # Linux
open src/jukir.html            # macOS
# atau sajikan via server lokal
python3 -m http.server -d src 8080  # lalu buka http://localhost:8080/jukir.html
```

## Tech stack

- HTML5 canvas + vanilla JS (satu file, tanpa bundler, tanpa dependency runtime)
- WebAudio API untuk semua efek suara (prosedural, tanpa file audio)
- localStorage untuk high score + preferensi bisu
- Semua aset visual original dari kode — tanpa gambar atau sprite pihak ketiga

## Struktur folder

```
.
├── README.md
├── src/
│   └── jukir.html          # game lengkap, satu file mandiri
├── verify/
│   └── harness.cjs         # harness verifikasi headless (Node, stub DOM/canvas)
└── openspec/changes/
    └── 2026-10-24-jukir/   # proposal, spec, design, tasks
```

## Link hasil

- Artifact: slug `jukir-raja-parkir` (card widget:
  `web-artifact-build-completed-fcb83ccd-59b0-4069-ae4c-ac072a14c99a`)
- Rilis: 2026-10-24

## Catatan saat build

- Keputusan penting: satu mobil bergerak dalam satu waktu — disengaja, ini
  jadi mekanik inti (manajemen antrean ala jukir beneran) sekaligus
  menghilangkan seluruh kelas bug tabrakan/pathfinding.
- Tidak ada backend: tidak ada state bersama antar pemain; localStorage cukup.
- Verifikasi: 15 cek headless via `node verify/harness.cjs` — alur penuh
  menu → tagih → kabur ×3 → game over → restart, semua lolos di file yang
  di-push ini. Builder juga lolos 39 cek independen sebelum handoff.
- Yang disengaja tidak dibuat: mode multiplayer/leaderboard (butuh backend —
  di luar kontrak harian frontend-only), peta parkir lebih besar (8 slot
  adalah sweet spot kesulitan satu sesi).
