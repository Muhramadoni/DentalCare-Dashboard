# Product Requirements Document (PRD): IN DENTAL CARE Admin Dashboard

SECTION 1 Problem Statement | Kenapa produk ini perlu dibuat?
Problem Statement
Klinik gigi seringkali masih menggunakan sistem pencatatan manual, spreadsheet terpisah, atau aplikasi chatting (WhatsApp) yang tercecer untuk mencatat reservasi pasien, mengatur jadwal dokter lintas cabang, serta merekam rekam medis elektronik (EMR). Akibatnya: reservasi pasien terlewat atau dobel, jadwal praktik dokter tidak terpusat, dan riwayat rekam medis sulit dicari secara cepat saat konsultasi.
Solusi enterprise yang ada (seperti sistem HIS rumah sakit besar) terlalu rumit dan mahal untuk klinik gigi skala menengah, sementara catatan biasa/manual terlalu berisiko hilang dan tidak terstruktur. Celahnya ada di dashboard admin klinik gigi yang terpusat, ringan, mudah digunakan, dan terintegrasi dari login hingga pencatatan EMR.
Data Pendukung:

* Survey internal operasional klinik: 75% staf admin mengeluhkan pencatatan reservasi via WhatsApp yang sering terlewat di jam sibuk.

* Efisiensi waktu: Pencarian rekam medis manual memakan waktu >5 menit per pasien.

* Kebutuhan mendesak: Dashboard operasional harian yang menampilkan rekapitulasi pasien dan jadwal dokter secara real-time.

SECTION 2 Goals | Gimana cara ukur kesuksesan?
Goals
Produk ini sukses kalo mencapai hasil terukur ini:

| ID | Tujuan | Metrik Kesuksesan | 
| ----- | ----- | ----- | 
| G1 | Memusatkan manajemen reservasi | Admin dapat mencatat/memperbarui reservasi dalam <30 detik. | 
| G2 | Mengurangi miskomunikasi jadwal dokter | 0 kesalahan jadwal dokter antar cabang per bulan. | 
| G3 | Kecepatan rekap EMR | Rekam medis pasien baru tersimpan dan tercari dalam <10 detik. | 
| G4 | Performa responsif | Semua aksi perpindahan tab dan modal merespon <300ms di koneksi normal. | 

SECTION 3 Target Users / Personas | Siapa yang bakal pake?
Target Users / Personas

| Persona | Deskripsi | 
| ----- | ----- | 
| Persona 1:   Admin Klinik (Front Office) | 22-35 tahun, pengelola operasional harian.   Mengatur 50-100 reservasi/hari via WhatsApp & walk-in.   Butuh: tambah/edit reservasi cepat, filter status kunjungan.   Waktu operasional: cepat, tanpa kendala navigasi. | 
| Persona 2:   Dokter Gigi (Pemeriksa) | 28-50 tahun, tenaga medis profesional.   Melihat jadwal praktik, mengisi rekam medis elektronik (EMR) meliputi anamnesa, tindakan, resep, dan terapi.   Butuh: antarmuka input EMR yang rapi dan akses riwayat medis pasien instan. | 
| Persona 3:   Pemilik Klinik / Manajer | 35-55 tahun, pengambil keputusan bisnis.   Butuh: ringkasan operasional harian (total pasien, jumlah dokter aktif, log riwayat aktivitas real-time). | 

SECTION 4 User Stories | Apa yang pengguna mau lakuin?
User Stories
Diurutin dari prioritas tertinggi:

| ID | Pri | User Story | 
| ----- | ----- | ----- | 
| US-1 | P1 | Sebagai admin, saya ingin login aman menggunakan email dan password yang terenkripsi metode hash (seperti bcrypt) pada backend Express.js dan PostgreSQL agar data kredensial aman. | 
| US-2 | P1 | Sebagai pemilik klinik, saya ingin melihat ringkasan jumlah total reservasi dan dokter praktik hari ini di halaman utama yang dirender oleh ReactJS. | 
| US-3 | P1 | Sebagai admin, saya ingin mengelola reservasi pasien (tambah, cari, edit, hapus, filter status Appointment/Reschedule) melalui REST API Node.js. | 
| US-4 | P1 | Sebagai admin, saya ingin mengelola data dokter dan jadwal praktiknya secara spesifik berdasarkan hari dan cabang yang tersimpan di database PostgreSQL. | 
| US-5 | P1 | Sebagai dokter/admin, saya ingin mengisi dan menyimpan rekam medis elektronik (EMR) lengkap dengan pilihan pasien, tanggal, regio gigi, anamnesa, tindakan, resep, dan terapi. | 
| US-6 | P2 | Sebagai staf klinik, saya ingin mencari dan memfilter riwayat EMR berdasarkan nama pasien atau dokter pemeriksa. | 
| US-7 | P2 | Sebagai data analyst, saya ingin memanfaatkan Python dan Jupyter Notebook untuk menganalisis tren kunjungan pasien, diagnosa, resep obat, tindakan pelayanan dan performa klinik secara mendalam. | 

SECTION 5 Functional Requirements | Apa yang sistem harus lakuin?
Functional Requirements
Tiap kebutuhan bisa dites sendiri. Prioritas: P1 (wajib rilis), P2 (penting), P3 (nice-to-have).

| ID | Kebutuhan | Pri | 
| ----- | ----- | ----- | 
| FR-1 | Halaman Login & Keamanan Password: Validasi kredensial admin dengan pencocokan password menggunakan algoritma Hashing (misal: bcrypt) di Node.js/Express.js, terhubung ke tabel pengguna di PostgreSQL. | P1 | 
| FR-2 | Navigasi SPA (ReactJS): Menu interaktif frontend untuk beralih antar Ringkasan Utama, Kelola Reservasi, Kelola Dokter, dan EMR secara dinamis. | P1 | 
| FR-3 | RESTful API (Node.js & Express.js): Menyediakan endpoint backend untuk operasi CRUD reservasi, manajemen dokter, dan pengelolaan EMR. | P1 | 
| FR-4 | Database Relasional (PostgreSQL): Penyimpanan terstruktur untuk data pasien, rekam medis EMR, jadwal dokter, dan log aktivitas operasional klinik. | P1 | 
| FR-5 | Data Analytics Pipeline (Python & Jupyter Notebook): Skrip analisis data dan notebook interaktif untuk mengekstrak insight bisnis dan tren kunjungan dari database PostgreSQL. | P2 | 
| FR-6 | Modul Kelola Reservasi & Dokter: Antarmuka ReactJS untuk pencarian, filter status, dan modal manajemen data interaktif. | P1 | 
| FR-7 | Modul EMR & Keamanan: Form input rekam medis elektronik terintegrasi backend serta dialog konfirmasi dan toast notifikasi. | P1 | 

SECTION 6 Non-Functional Requirements | Gimana sistem berperilaku?
Non-Functional Requirements

| ID | Kebutuhan | Pri | 
| ----- | ----- | ----- | 
| NFR-1 | Performa API: Respon endpoint Express.js <200ms (p95) pada koneksi standar. | P1 | 
| NFR-2 | Keamanan Data: Penyimpanan password wajib menggunakan metode Hashing (seperti bcrypt/Argon2) dan transmisi data diamankan dengan TLS 1.3 antara klien ReactJS dan server Node.js. | P1 | 
| NFR-3 | Ketersediaan Database: PostgreSQL connection pooling yang optimal untuk mencegah bottleneck saat query data EMR bersamaan. | P1 | 
| NFR-4 | Skalabilitas Analitik: Jupyter Notebook dan script Python yang modular untuk memproses dataset klinik secara berkala. | P2 | 

SECTION 7 Scope (In/Out) | Batasan rilis ini apa aja?
Scope
In Scope v1.0

* Full-stack architecture menggunakan ReactJS (frontend), Node.js & Express.js (backend), serta PostgreSQL (database).

* Implementasi sistem keamanan autentikasi dengan password hashing.

* Modul analitik data menggunakan Python dan Jupyter Notebook.

* Manajemen reservasi, kelola dokter, dan rekam medis elektronik (EMR) lengkap.

Out of Scope v1.0 (Rilis Selanjutnya)

* Multi-role login tingkat lanjut (Pasien dan Dokter mandiri).

* Integrasi WhatsApp gateway otomatis.

* Deployment model machine learning prediktif berbasis real-time di production.