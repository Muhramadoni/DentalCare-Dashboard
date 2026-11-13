// backend/postman/create_clean_sqa.js
const XLSX = require('xlsx');
const path = require('path');

const data = [
  ["DOKUMEN SKENARIO PENGUJIAN (TEST CASE) - APLIKASI KLINIK GIGI", "", "", "", "", "", ""],
  ["Kode Uji", "Modul", "Skenario Pengujian", "Langkah Singkat", "Hasil yang Diharapkan (Expected Result)", "Status (Pass/Fail)", "Catatan / Bukti Uji"],
  ["TC-01", "Login & Akses", "Login dengan data valid", "Masukkan email admindental@gmail.com dan password admindental123, lalu klik Login.", "Berhasil masuk ke halaman utama (Dashboard) dan token JWT tersimpan.", "", ""],
  ["TC-02", "Login & Akses", "Login dengan password salah", "Masukkan email yang benar dan password yang salah, lalu klik Login.", "Sistem menolak akses dan memunculkan pesan gagal login.", "", ""],
  ["TC-03", "Login & Akses", "Login dengan kolom kosong", "Kosongkan kolom email atau password, lalu klik tombol Login.", "Sistem menampilkan peringatan wajib mengisi email dan password.", "", ""],
  ["TC-04", "Login & Akses", "Validasi format email", "Masukkan email tanpa format @ yang benar, lalu klik Login.", "Sistem menolak input dan meminta format email yang valid.", "", ""],
  ["TC-05", "Login & Akses", "Proteksi brute-force login", "Lakukan percobaan login gagal sebanyak 5 kali berturut-turut dalam 15 menit.", "Sistem memblokir sementara login dan memunculkan error 429 Too Many Requests.", "", ""],
  ["TC-06", "Login & Akses", "Fitur Logout", "Klik tombol Logout pada menu Sidebar.", "Sesi berakhir, token dihapus, dan pengguna diarahkan kembali ke halaman login.", "", ""],
  ["TC-07", "Ringkasan Utama", "Tampilkan total reservasi hari ini", "Buka halaman Dashboard setelah login.", "Kartu metrik menampilkan jumlah reservasi pasien hari ini secara real-time.", "", ""],
  ["TC-08", "Ringkasan Utama", "Tampilkan jumlah dokter praktik aktif", "Buka halaman Dashboard dan periksa kartu dokter praktik.", "Kartu metrik menampilkan total dokter gigi yang berstatus aktif bertugas.", "", ""],
  ["TC-09", "Ringkasan Utama", "Tampilkan daftar reservasi dan riwayat", "Periksa tabel reservasi pasien dan daftar riwayat aktivitas di dashboard.", "Sistem menampilkan daftar reservasi terbaru serta log aktivitas operasional.", "", ""],
  ["TC-10", "Ringkasan Utama", "Tampilan saat basis data kosong", "Buka halaman Dashboard ketika belum ada data operasional di database.", "Kartu menampilkan angka 0 dan tabel menampilkan status kosong tanpa emoji.", "", ""],
  ["TC-11", "Kelola Dokter", "Tampilkan daftar dokter", "Buka menu Kelola Dokter pada Sidebar.", "Sistem menampilkan seluruh dokter lengkap dengan cabang dan spesialisasi.", "", ""],
  ["TC-12", "Kelola Dokter", "Tambah dokter baru (valid)", "Isi nama dokter, spesialisasi, cabang tugas, dan jadwal praktik, lalu Simpan.", "Data dokter tersimpan di database dan muncul pada daftar dokter.", "", ""],
  ["TC-13", "Kelola Dokter", "Tambah dokter tanpa nama", "Kosongkan kolom nama dokter, isi data lainnya, lalu klik Simpan.", "Sistem menolak menyimpan dan menampilkan peringatan kolom wajib diisi.", "", ""],
  ["TC-14", "Kelola Dokter", "Ubah jadwal dokter antarcabang", "Ubah cabang klinik atau jam praktik dokter, lalu klik Simpan.", "Jadwal praktik dokter berhasil diperbarui tanpa mengganggu jadwal lain.", "", ""],
  ["TC-15", "Kelola Dokter", "Ubah status keaktifan dokter", "Ubah status dokter menjadi 'Tidak Aktif' saat sedang berhalangan/cuti.", "Status dokter diperbarui dan kuota dokter aktif di dashboard berkurang.", "", ""],
  ["TC-16", "Kelola Reservasi", "Tampilkan daftar reservasi", "Buka menu Kelola Reservasi pada Sidebar.", "Sistem menampilkan daftar reservasi pasien terpaginasi lengkap dengan status.", "", ""],
  ["TC-17", "Kelola Reservasi", "Buat reservasi pasien baru", "Pilih pasien, pilih dokter pemeriksa, tanggal, dan jam reservasi, lalu Simpan.", "Reservasi berhasil dibuat dengan status awal 'Appointment'.", "", ""],
  ["TC-18", "Kelola Reservasi", "Cegah bentrok jadwal dokter", "Buat reservasi pada dokter, tanggal, dan jam yang sudah terisi pasien lain.", "Sistem menolak reservasi dan memberi peringatan jadwal dokter telah penuh.", "", ""],
  ["TC-19", "Kelola Reservasi", "Ubah jadwal reservasi (Reschedule)", "Pilih reservasi aktif, ubah tanggal atau jam reservasi, lalu Simpan.", "Jadwal diperbarui dan status otomatis berubah menjadi 'Reschedule'.", "", ""],
  ["TC-20", "Kelola Reservasi", "Batalkan / hapus reservasi", "Pilih salah satu reservasi pasien, klik tombol Hapus/Batal, dan konfirmasi.", "Reservasi terhapus dari daftar dan slot jadwal dokter terbuka kembali.", "", ""],
  ["TC-21", "Kelola Reservasi", "Filter reservasi berdasarkan status", "Pilih filter status 'Appointment' atau 'Reschedule' pada daftar reservasi.", "Sistem hanya menampilkan daftar reservasi sesuai status yang dipilih.", "", ""],
  ["TC-22", "Rekam Medis (EMR)", "Input rekam medis pasien baru", "Buka form EMR, isi regio gigi, anamnesa, tindakan, resep, dan terapi, lalu Simpan.", "Data rekam medis tersimpan lengkap di database PostgreSQL.", "", ""],
  ["TC-23", "Rekam Medis (EMR)", "Pilih regio gigi (Odontogram)", "Tentukan nomor regio gigi pasien saat mencatat tindakan perawatan medis.", "Nomor regio gigi tercatat dengan tepat pada rekam medis elektronik.", "", ""],
  ["TC-24", "Rekam Medis (EMR)", "Input resep obat dan terapi", "Tuliskan resep obat dan anjuran terapi lanjutan pada form EMR, lalu Simpan.", "Rincian resep obat dan terapi tersimpan aman pada rekam medis pasien.", "", ""],
  ["TC-25", "Rekam Medis (EMR)", "Pencarian riwayat EMR pasien", "Ketik nama pasien pada kolom pencarian riwayat rekam medis.", "Sistem menampilkan seluruh riwayat pemeriksaan masa lalu pasien (<10 detik).", "", ""],
  ["TC-26", "Rekam Medis (EMR)", "Ubah catatan rekam medis", "Buka catatan EMR pasien, perbarui data tindakan medis, lalu klik Simpan.", "Perubahan catatan rekam medis tersimpan dan tercatat di sistem.", "", ""],
  ["TC-27", "Keamanan Sistem", "Proteksi akses tanpa token JWT", "Akses endpoint API dashboard atau EMR tanpa menyertakan Bearer Token.", "Sistem menolak akses dan mengembalikan respons HTTP 401 Unauthorized.", "", ""],
  ["TC-28", "Keamanan Sistem", "Pencegahan SQL Injection", "Masukkan karakter SQL injection pada form pencarian atau parameter URL.", "Sistem aman karena menggunakan Parameterized Query Prisma ORM.", "", ""],
  ["TC-29", "Keamanan Sistem", "Pencegahan Cross-Site Scripting", "Masukkan payload script berbahaya pada form isian teks EMR.", "Script tidak tereksekusi dan tersanitasi otomatis secara aman.", "", ""],
  ["TC-30", "Performa & Navigasi", "Kecepatan navigasi SPA", "Beralih antarmuka antara Dashboard, Dokter, Reservasi, dan EMR pada Sidebar.", "Halaman berpindah secara instan (<300ms) tanpa reload seluruh browser.", "", ""]
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Lebar kolom yang proporsional dan rapi
ws['!cols'] = [
  { wch: 10 }, // Kode Uji
  { wch: 22 }, // Modul
  { wch: 38 }, // Skenario Pengujian
  { wch: 55 }, // Langkah Singkat
  { wch: 60 }, // Hasil yang Diharapkan
  { wch: 18 }, // Status (Pass/Fail)
  { wch: 22 }  // Catatan / Bukti Uji
];

XLSX.utils.book_append_sheet(wb, ws, "Skenario Uji SQA");

const filePath = path.join(__dirname, 'Skenario_Uji_SQA_Klinik_Gigi.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Successfully written clean SQA test case file with 30 cases at:', filePath);

