# Design: JUKIR! — Raja Parkir

## Stack
- Satu file `jukir.html`: HTML + CSS + vanilla JS, tanpa bundler, tanpa
  dependency runtime, tanpa fetch eksternal. (Pengecualian disiplin React di
  ARCHITECTURE.md: game = single-file section discipline.)

## Layout canvas (logical 480×800, portrait)
- HUD (0–64): "JUKIR!" kecil kiri, rupiah tengah, strike (ikon marah ×3) +
  tombol bisu kanan.
- Area parkir (64–600): 8 slot, 2 baris × 4 kolom. Slot 104×150, gap 8.
  Baris 1 y=110, baris 2 y=300 (slot = rect parkir P). Jalur horizontal y=560
  untuk mobil bergerak.
- Zona bawah (600–800): pintu masuk tengah-bawah (gapura "MASUK"), 3 titik
  antre di y=690 (x=110, 240, 370), karakter jukir di (240, 620) — badan,
  topi, peluit, tangan melambai saat mobil parkir.

## State machine
- `screen`: menu | playing | gameover.
- Mobil: `waiting` → `moving` → `parked` → `ownerWaiting` → `leaving`
  (bahagia) | `leavingAngry`. Field: id, warna, bos?, x, y, angle, slot,
  queueIdx, ownerTimer, collectTimer, waypoints[], wpIndex, speed.
- Global: rupiah, strikes, level, selectedCarId, spawnTimer, movingCarId,
  muted, high.

## Sistem (fungsi terpisah)
1. `spawnCar()` — pilih warna palet, 10% bos; isi titik antre bebas.
2. `selectCar(id)` / `directToSlot(car, slot)` — bangun waypoints:
   (x,y) → (x, 600) → (slotX, 600) → (slotX, slotY).
3. `update(dt)` — gerakkan mobil (speed 230 px/s, angle lerp ke arah gerak),
   hitung mundur ownerTimer & collectTimer, spawnTimer, partikel, bubble,
   shake decay.
4. `collect(car)` / `angryLeave(car)` — ekonomi & strike.
5. `render()` — background (langit sore → aspal), slot, mobil (top-down:
   body rounded-rect, kaca depan/belakang, 4 roda, lampu), jukir, HUD,
   partikel, bubble, overlay menu/gameover.
6. `sfx` — WebAudio: `whistle()` (dua nada 2200→2700 Hz), `thunk()`,
   `coin()` (dua blip naik), `honk()` (sawtooth 170 Hz), `levelup()`,
   `gameoverJingle()`, `click()`. Dibuat sekali via AudioContext lazy
   (butuh gesture — init saat MULAI JAGA).
7. `input` — pointerdown → konversi ke koordinat logical via
   `getBoundingClientRect`; hit-test: tombol, mobil (radius), slot (rect).

## Lima keranjang state (ARCHITECTURE.md)
- Server cache: tidak ada (tanpa backend).
- Global client: rupiah, strikes, level, screen, muted.
- Local/UI: selectedCarId, bubble teks, shake, partikel, banner.
- URL: tidak ada (satu layar).
- Form: tidak ada.

## Keseimbangan difficulty
- spawnInterval = max(2.2, 5 − 0.35 × (level−1)) detik.
- ownerTime = rand(18, 35) − level detik, min 12.
- collectWindow = max(4, 8 − 0.5 × (level−1)) detik.
- level = floor(rupiah / 20000) + 1.

## Copy (Bahasa Indonesia, anti-AI-slop)
- Menu: judul "JUKIR!", sub "Raja Parkir", cara main: "1. Ketuk mobil yang
  datang 2. Ketuk slot kosong — mobil jalan sendiri 3. Ketuk mobil yang
  ditunggu pemiliknya sebelum kabur! Tarif: Rp2.000/mobil."
- Teriakan jukir: "TERUS!", "KIRI DIKIT!", "MANTAP!", "BAGUS!", "AWAS!".
- Kabur: "YAH KABUR!", tagih: "+Rp2.000!", game over: "SHIFT SELESAI!",
  "Rekor baru!".

## Verifikasi
- Harness Node: stub canvas/DOM, tangkap pointer handler, clock palsu —
  simulasikan: mulai → spawn → pilih → arahkan → tunggu owner → tagih →
  biarkan kabur ×3 → game over → restart. Assert tiap transisi.
- Cek statis: tidak ada console error, tidak ada god-function.
