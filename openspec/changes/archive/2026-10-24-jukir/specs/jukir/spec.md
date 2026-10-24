# Spec: JUKIR! — Raja Parkir (game)

## Ringkasan
Pemain = jukir. Ketuk mobil yang datang → ketuk slot kosong → mobil parkir
sendiri. Pemilik kembali → ketuk mobil untuk tagih Rp2.000 sebelum kabur.
3 pelanggan kabur = game over.

## Requirements (SHALL)

### R1 — Layar & alur game
- SHALL ada 3 layar: `menu` (judul, cara main 3 langkah, tombol MULAI JAGA,
  rekor), `playing`, `gameover` (total rupiah, mobil dilayani, pelanggan kabur,
  rekor, tombol JAGA LAGI).
- WHEN pemain mengetuk MULAI JAGA THEN game mulai dari kondisi bersih
  (skor 0, strike 0, tidak ada mobil).
- WHEN game over THEN tombol JAGA LAGI me-reset penuh ke `playing`.

### R2 — Spawn mobil
- SHALL mobil datang lewat pintu masuk bawah dan antre di maksimal 3 titik
  tunggu. WHEN tidak ada slot kosong ATAU antrean penuh THEN spawner menunggu
  (tidak menumpuk mobil tak terlihat).
- SHALL interval spawn mulai 5 detik, memendek seiring level, minimum 2,2 detik.
- SHALL 10% mobil adalah "mobil bos" (emas, tarif Rp5.000); sisanya Rp2.000.

### R3 — Mengarahkan parkir
- WHEN pemain mengetuk mobil yang menunggu THEN mobil terpilih (cincin sorot +
  bunyi peluit) dan ketukan berikutnya memilih slot.
- WHEN pemain mengetuk slot kosong saat ada mobil terpilih THEN mobil berjalan
  sendiri via waypoint (posisi → jalur → slot) dengan partikel debu, lalu
  terparkir; si jukir meneriakkan frasa acak ("TERUS!", "KIRI DIKIT!", "MANTAP!").
- WHEN pemain mengetuk slot yang sudah terisi THEN bubble "SUDAH ADA MOBIL!",
  tidak ada penalti.
- WHEN pemain mengetuk slot tanpa mobil terpilih THEN bubble "PILIH MOBIL DULU!".
- SHALL hanya satu mobil bergerak dalam satu waktu; WHEN pemain memilih mobil
  lain saat ada yang bergerak THEN bubble "TUNGGU!".

### R4 — Pemilik kembali & menagih
- SHALL tiap mobil terparkir punya timer pemilik acak 18–35 detik (memendek
  seiring level), ditunjukkan cincin kesabaran yang menyusut.
- WHEN timer habis THEN mobil masuk status "pemilik menunggu": memantul,
  bubble "!", bunyi klakson, jendela tagih 8 detik (minimum 4 detik di level
  tinggi) dengan cincin merah berdenyut.
- WHEN pemain mengetuk mobil dalam status pemilik-menunggu THEN terkumpul
  tarifnya: partikel koin terbang ke HUD, teks melayang "+Rp2.000",
  mobil pergi dengan puas, skor += tarif.
- WHEN jendela tagih habis tanpa diketuk THEN mobil pergi marah: screen shake,
  teks "KABUR!", strike += 1, bunyi klakson marah.

### R5 — Kalah & skor
- SHALL 3 strike → game over ("SHIFT SELESAI!").
- SHALL skor = total rupiah; format "Rp2.000" (titik ribuan).
- SHALL rekor tersimpan di localStorage key `jukir_high`; WHEN skor > rekor
  THEN tampil "REKOR BARU!" + confetti di layar game over.
- SHALL level = floor(skor / 20000) + 1; WHEN level naik THEN banner
  "LEVEL NAIK! Makin rame!" + bunyi.

### R6 — Kontrol & platform
- SHALL kontrol penuh via ketuk (pointerdown): mouse + sentuhan HP.
- SHALL canvas 480×800 logical, diskalakan responsif memenuhi layar (portrait).
- SHALL tombol bisu (mute) di HUD, persisten di localStorage `jukir_mute`.

### R7 — Suara & game feel
- SHALL semua suara prosedural via WebAudio (peluit, parkir, koin, klakson,
  level-up, game over, klik) — tanpa file audio.
- SHALL ada: partikel debu saat mobil jalan, partikel koin saat menagih,
  screen shake saat pelanggan kabur, bubble teks si jukir.
- SHALL menghormati `prefers-reduced-motion` (matikan shake & partikel).

### R8 — Anti-softlock & anti-error
- SHALL tidak ada kondisi macet: tiap mobil pasti pergi (ditagih atau kabur);
  spawner berhenti saat game over; restart selalu membersihkan semua state.
- SHALL tidak ada console error selama alur: menu → main → tagih → kabur ×3 →
  game over → restart.

### R9 — Kode & arsitektur
- SHALL satu file HTML mandiri, tanpa dependency runtime (single-file section
  discipline per ARCHITECTURE.md); tiap sistem (spawn, gerak, tagih, render,
  suara) fungsi terpisah, tidak ada god-function >300 baris.
- SHALL tanpa secret, tanpa fetch eksternal, tanpa aset pihak ketiga.
