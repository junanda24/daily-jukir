# Proposal: JUKIR! — Raja Parkir

## Apa ini
Game arcade HTML5 canvas: pemain menjadi **tukang parkir (jukir)**, bukan supir.
Mobil-mobil datang ke parkiran; pemain mengetuk mobil lalu mengetuk slot kosong
untuk mengarahkannya parkir (si jukir meniup peluit, mobil jalan sendiri).
Setelah beberapa saat pemilik mobil kembali — pemain harus mengetuk mobil itu
untuk menagih **Rp2.000** sebelum pemiliknya kabur marah. Tiga pelanggan kabur =
shift selesai (game over). Skor = total rupiah terkumpul, tersimpan sebagai
rekor di localStorage.

## Kenapa ide ini mengejutkan
Semua game parkir menempatkan pemain sebagai SUPIR. Tidak ada yang menempatkan
pemain sebagai jukir — sosok yang tiap orang Indonesia temui tiap hari
("terus... terus... kiri dikit!", peluit, uang Rp2.000). Membalik sudut pandang
inilah efek "kok kepikiran sih"-nya. Mekaniknya orisinal: bukan parkir presisi,
melainkan manajemen perhatian — memilih mobil, memilih slot, dan menagih tepat
waktu sebelum pelanggan kabur.

## Kenapa bentuk output = game web artifact (HTML5 canvas)
- Harus langsung dimainkan di browser HP Junan tanpa install — web artifact
  static adalah jalurnya (bisa di-share publik juga).
- Frontend-only, tanpa backend: tidak ada state yang perlu disimpan di server;
  high score cukup di localStorage. Backend tidak dibutuhkan (bukan demi gaya).
- Satu file HTML mandiri (tanpa bundler, tanpa dependency runtime) sesuai
  disiplin single-file untuk game di ARCHITECTURE.md.

## Kenapa tanpa backend
Tidak ada data bersama antar pemain, tidak ada login, tidak ada logic berat.
Semua komputasi (spawn, path mobil, timer) trivial di client.

## Tambahan wajib
- Anti-AI-slop: seluruh copy Bahasa Indonesia natural, gaya santai khas jukir
  ("MANTAP JIWA!", "YAH KABUR!"), tanpa emoji di label UI.
- IP check: SEMUA aset visual digambar prosedural via canvas di kode — tidak ada
  sprite, foto, atau karakter berlisensi.
- Kepatuhan CODE_STANDARDS.md + ARCHITECTURE.md (single-file section discipline,
  tanpa god-function >300 baris per fungsi logika — pecah per sistem).
