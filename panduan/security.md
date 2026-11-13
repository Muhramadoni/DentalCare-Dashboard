# Kebijakan & Standar Keamanan Sistem (Security Standards & Guidelines)

Dokumen ini merupakan panduan resmi arsitektur, kebijakan, dan implementasi keamanan perangkat lunak untuk sistem **IN DENTAL CARE Admin Dashboard**. Dokumen ini dirancang untuk melindungi aset klinis digital yang sangat berharga, meliputi data identitas pasien, jadwal praktik dokter antar-cabang, data operasional klinik, serta **Rekam Medis Elektronik (Electronic Medical Records / EMR)**.

Dokumen ini mengikat seluruh komponen arsitektur sistem:
1. **Frontend:** ReactJS Single Page Application (SPA)
2. **Backend:** Node.js & Express.js RESTful API
3. **Database:** PostgreSQL Relational Database
4. **Data Analytics:** Skrip Python & Jupyter Notebook

Dasar penyusunan dokumen ini mengacu langsung pada [Product Requirements Document (PRD)](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/prd_in_dental_care_admin_dashboard.md), khususnya **FR-1** (Keamanan Password & Autentikasi), **FR-4** (Penyimpanan Data Terstruktur & Log Aktivitas), **FR-7** (Keamanan Modul EMR), **NFR-2** (Keamanan Enkripsi TLS 1.3 & Hashing), serta skenario pengguna (**US-1** hingga **US-7**).

---

## 1. Filosofi & Prinsip Dasar Keamanan

Pengembangan sistem **IN DENTAL CARE Admin Dashboard** wajib mematuhi 3 prinsip utama keamanan informasi medis:

* **Zero Trust Architecture:** Jangan pernah percaya pada input apa pun yang datang dari sisi klien (ReactJS, HTTP request, URL parameter, maupun query string). Seluruh input wajib divalidasi dan diotorisasi ulang di backend Express.js.
* **Principle of Least Privilege (PoLP):** Setiap persona pengguna (Admin, Dokter, Pemilik Klinik) dan proses komputasi (seperti modul analitik data Python) hanya diberikan izin akses minimum mutlak yang dibutuhkan untuk menjalankan tugasnya.
* **Defense in Depth (Pertahanan Berlapis):** Keamanan tidak boleh hanya bergantung pada satu mekanisme pertahanan tunggal. Jika satu lapisan pertahanan gagal (misalnya penyembunyian menu UI di frontend), lapisan backend dan database tetap wajib mencegah akses ilegal.

---

## 2. Autentikasi & Manajemen Sesi (Authentication & Session)

Sesuai dengan **FR-1** dan **US-1**, sistem wajib menjamin kerahasiaan identitas pengguna klinik saat masuk ke dalam dashboard.

### 2.1. Password Hashing & Penyimpanan Kredensial
* **Algoritma Kriptografi Wajib:** Kata sandi pengguna wajib di-hash menggunakan **bcrypt** dengan faktor biaya (*salt rounds*) minimal **12**, atau menggunakan **Argon2id**.
* **Larangan Keras:** Dilarang keras menyimpan password dalam bentuk teks terbuka (*plain-text*) atau menggunakan algoritma hash usang yang rentan terhadap *collision attack* (seperti MD5, SHA-1, atau SHA-256 polos tanpa salt).
* **Kebijakan Kompleksitas Kata Sandi:**
  * Panjang minimal: 8 karakter (disarankan minimal 10 karakter).
  * Kombinasi wajib: Mengandung huruf besar, huruf kecil, angka, dan karakter khusus/simbol.

### 2.2. Manajemen Token JWT (JSON Web Tokens)
* **Access Token:**
  * Gunakan JWT yang ditandatangani menggunakan algoritma berkekuatan tinggi (HMAC-SHA256 / `HS256` dengan kunci rahasia minimal 256-bit atau RSA-SHA256 / `RS256`).
  * Masa berlaku token (*expiration time*) harus singkat (maksimal **15 menit hingga 1 jam**).
  * Payload JWT hanya boleh memuat identitas non-sensitif (misal: `userId`, `email`, dan `role`). Dilarang keras memasukkan data rahasia seperti hash password, data rekam medis, atau nomor identitas pribadi ke dalam payload token.
* **Penyimpanan Sesi Klien:**
  * Disimpan menggunakan **HttpOnly, Secure, SameSite Cookie** untuk memitigasi risiko pencurian token melalui serangan *Cross-Site Scripting* (XSS).
* **Penanganan Logout & Invalidasi:**
  * Saat admin/dokter melakukan logout, token harus dihapus dari cookie browser dan dicatat pada mekanisme daftar pencabutan (*token blacklist/revocation*) jika diperlukan pemutusan sesi seketika.

### 2.3. Sliding Session & Idle Timeout

Sistem menerapkan mekanisme sesi dinamis (*sliding session*) untuk menjaga keseimbangan antara kenyamanan pengguna dan keamanan sesi. Implementasi terdiri dari dua komponen yang bekerja bersama.

**Komponen 1 — Idle Timeout (Frontend: `src/App.jsx`)**

Frontend memantau aktivitas admin secara pasif melalui event listener pada `window` (`mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`). Setiap ada aktivitas, waktu aktivitas terakhir diperbarui. Sistem memeriksa kondisi idle setiap 1 menit:

* Jika admin tidak melakukan aktivitas apapun selama **60 menit berturut-turut**, sistem melakukan logout otomatis.
* Jika admin masih aktif, timer 60 menit terus direset dan sesi tidak terputus.

**Komponen 2 — Token Refresh Otomatis (Frontend: `src/App.jsx` + Backend: `POST /api/v1/auth/refresh`)**

Karena token JWT memiliki masa berlaku tetap 1 jam sejak diterbitkan, sistem melakukan perpanjangan token secara otomatis sebelum token kadaluarsa:

* Setiap **55 menit**, frontend memeriksa apakah admin masih aktif dalam rentang waktu tersebut.
* Jika admin aktif, frontend mengirimkan request ke endpoint `POST /api/v1/auth/refresh` dengan menyertakan token yang masih berlaku sebagai bukti identitas.
* Backend memvalidasi token melalui middleware `authenticateToken`. Jika valid, backend menerbitkan token baru yang berlaku **1 jam penuh** dari waktu permintaan.
* Token baru disimpan menggantikan token lama di sisi klien. Sesi admin berlanjut tanpa terputus.
* Jika admin tidak aktif selama 55 menit lebih, refresh dilewati dan idle timeout akan menangani logout pada menit ke-60.
* Jika server mengembalikan respons selain `200 OK` (misalnya token sudah tidak valid), sistem langsung melakukan logout paksa.

```javascript
// Konstanta sliding session di src/App.jsx
const IDLE_TIMEOUT_MS     = 60 * 60 * 1000  // 60 menit tidak aktif → auto logout
const REFRESH_INTERVAL_MS = 55 * 60 * 1000  // Refresh token tiap 55 menit jika aktif
const IDLE_CHECK_MS       =      60 * 1000  // Cek idle tiap 1 menit
```

**Endpoint Refresh Token (Backend: `backend/controllers/auth-controller.js`)**

```javascript
// POST /api/v1/auth/refresh
// Memperbarui JWT token jika token masih valid (Sliding Session)
// Dilindungi oleh middleware: globalRateLimiter → authenticateToken
router.post('/refresh', globalRateLimiter, authenticateToken, refresh);
```

Endpoint ini bersifat stateless — tidak memerlukan tabel tambahan di database. Token lama yang masih valid digunakan sebagai satu-satunya bukti otorisasi untuk mendapatkan token baru.

---

## 3. Otorisasi & Kontrol Akses (Role-Based Access Control / RBAC)

Sistem melayani tiga persona pengguna utama sesuai dengan **SECTION 3 PRD**:

### 3.1. Matriks Hak Akses Berdasarkan Persona

| Fitur / Modul | Admin Klinik (Front Office) | Dokter Gigi (Pemeriksa) | Pemilik Klinik / Manajer | Data Analyst (Python) |
| :--- | :---: | :---: | :---: | :---: |
| **Login Dashboard** | Ya | Ya | Ya | Akses DB Khusus |
| **Kelola Reservasi (CRUD)** | Penuh | Hanya Lihat | Hanya Lihat | - |
| **Kelola Jadwal Dokter** | Penuh | Lihat Jadwal Sendiri | Hanya Lihat | - |
| **Entri EMR (Anamnesa, Tindakan, Resep)** | Terbatas / Input Awal | Penuh (Input & Edit) | Hanya Lihat | - |
| **Pencarian Riwayat Pasien** | Ya | Ya | Ya | - |
| **Ringkasan Operasional & Metrik Bisnis** | Ringkasan Harian | - | Penuh (Semua Cabang) | Baca Data Agregat |
| **Akses Log Audit Aktivitas** | Tidak | Tidak | Ya | - |
| **Pipeline Analitik Database (FR-5)** | Tidak | Tidak | Lihat Hasil Laporan | Akses Read-Only SQL |

### 3.2. Server-Side Access Enforcement
* **Larangan UI-Only Security:** Jangan pernah mengandalkan penyembunyian tombol, tab, atau modal di ReactJS sebagai pengaman fitur. Seluruh pembatasan akses **wajib ditegakkan di sisi server** Express.js menggunakan *authorization middleware*:
  ```javascript
  // Contoh implementasi middleware otorisasi berbasis peran di Express.js
  const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak: Anda tidak memiliki izin untuk tindakan ini.'
        });
      }
      next();
    };
  };

  // Contoh rute: Hanya dokter yang boleh menyimpan/mengubah EMR
  router.post('/api/v1/emr', authenticateToken, authorizeRoles('DOCTOR'), emrController.createRecord);
  ```
* **Pencegahan IDOR (Insecure Direct Object References):**
  * Setiap endpoint yang menerima parameter ID data pasien atau rekam medis EMR (misal: `/api/v1/emr/:recordId`) wajib memvalidasi apakah pengguna yang meminta memiliki keterkaitan kerja yang sah terhadap data tersebut sebelum data dikembalikan.

---

## 4. Rate Limiting & Proteksi Serangan Brute Force / DoS

Untuk mencegah eksploitasi serangan *Brute Force*, *Credential Stuffing*, dan serangan *Denial of Service (DoS)* terhadap ketersediaan server:

* **Rate Limiting Endpoint Autentikasi (`/api/v1/auth/login`):**
  * Terapkan pembatasan ketat menggunakan pustaka `express-rate-limit`.
  * Maksimal **5 kali percobaan login gagal dalam rentang waktu 15 menit** per alamat IP.
  * Jika kuota terlampaui, server mengembalikan status HTTP `429 Too Many Requests` disertai header `Retry-After`.
* **Rate Limiting Global REST API:**
  * Terapkan batas umum pada seluruh endpoint publik/operasional (misalnya maksimal **100 - 300 permintaan per 15 menit per IP**) untuk mencegah kelebihan beban pada connection pool PostgreSQL.
  * `globalRateLimiter` telah diterapkan pada endpoint `POST /api/v1/auth/logout` dan `POST /api/v1/auth/refresh` dengan batas **100 permintaan per menit per IP**. Middleware ini diletakkan sebelum `authenticateToken` agar request berlebih ditolak di lapisan pertama sebelum validasi token diproses, sesuai prinsip *Defense in Depth* (Section 1).
* **Perlindungan Terhadap DoS di Database:**
  * Terapkan *timeout* query pada PostgreSQL (`statement_timeout = 5000`) untuk mencegah query analitik atau query pencarian EMR yang tidak terindeks membebani CPU database secara berkepanjangan.

---

## 5. Validasi, Sanitasi Input & Pencegahan Injeksi

Data medis EMR (anamnesa, regio gigi, tindakan, dan resep obat) merupakan data teks bebas yang rentan disusupi kode berbahaya jika tidak divalidasi dengan ketat.

### 5.1. Validasi Skema Server-Side
* Setiap data masuk (`req.body`, `req.params`, `req.query`) wajib divalidasi skema dan tipe datanya di sisi server menggunakan pustaka validator seperti **Joi**, **Zod**, atau **express-validator**.
* Tolak request dengan pesan HTTP `400 Bad Request` jika tipe data tidak sesuai (misal: format tanggal reservasi salah, ID bukan UUID/integer valid, atau status reservasi di luar daftar enum).

### 5.2. Pencegahan SQL Injection (SQLi)
* **Penggunaan Prisma ORM:** Seluruh interaksi dengan database PostgreSQL wajib menggunakan metode bawaan **Prisma ORM** (`prisma.user`, `prisma.dokter`, `prisma.reservasi`, dll.) yang secara otomatis mengonversi input pengguna menjadi *Parameterized Queries* / *Prepared Statements*, sehingga kebal terhadap serangan SQL Injection.
  ```javascript
  // AMAN: Menggunakan Prisma ORM Client (Otomatis Parameterized)
  const reservasi = await prisma.reservasi.findMany({
    where: {
      dokter_id: doctorId,
      tanggal_reservasi: new Date(appointmentDate)
    }
  });

  // DILARANG KERAS: Menggunakan $queryRawUnsafe dengan string concatenation
  // const badQuery = await prisma.$queryRawUnsafe(`SELECT * FROM reservasi WHERE dokter_id = ${doctorId}`); // SANGAT RENTAN!
  ```

### 5.3. Pencegahan Cross-Site Scripting (XSS)
* Sanitasi seluruh teks bebas pada form EMR (kolom anamnesa, diagnosis, tindakan medis, dan terapi) sebelum disimpan ke PostgreSQL untuk membersihkan tag HTML berbahaya atau payload JavaScript (`<script>`, `onload=`, dll.).
* Pada Frontend ReactJS, pertahankan mekanisme *auto-escaping* bawaan React. Dilarang keras menggunakan `dangerouslySetInnerHTML` tanpa melalui proses sanitasi pustaka khusus (seperti `DOMPurify`).

---

## 6. Keamanan Transportasi & HTTP Security Headers

Sesuai dengan **NFR-2**, seluruh transmisi data wajib dienkripsi selama transit (*in-transit encryption*).

### 6.1. Protokol HTTPS / TLS 1.3
* Seluruh komunikasi data antara klien ReactJS, server Node.js Express, dan PostgreSQL wajib berjalan di atas protokol **HTTPS** menggunakan enkripsi modern **TLS 1.3** (atau minimal TLS 1.2).
* Pengalihan Otomatis (*Redirect*): Seluruh permintaan berbasis HTTP biasa port 80 wajib dialihkan (*redirect 301*) secara otomatis ke HTTPS port 443.

### 6.2. Implementasi HTTP Security Headers via Helmet
* Pasang dan konfigurasikan pustaka **`helmet`** pada aplikasi Express.js untuk menerapkan header keamanan standar industri:
  * **Strict-Transport-Security (HSTS):** Memaksa browser hanya mengakses via HTTPS (`max-age=31536000; includeSubDomains; preload`).
  * **X-Content-Type-Options:** Disetel ke `nosniff` untuk mencegah MIME-sniffing.
  * **X-Frame-Options:** Disetel ke `DENY` atau `SAMEORIGIN` untuk mencegah eksploitasi antarmuka melalui *Clickjacking*.
  * **Content-Security-Policy (CSP):** Membatasi domain sumber pemuatan skrip, style, dan font untuk mencegah injeksi aset eksternal yang tidak terpercaya.
  * **Referrer-Policy:** Disetel ke `strict-origin-when-cross-origin`.

---

## 7. Keamanan Cross-Origin (CORS) & Proteksi CSRF

### 7.1. Konfigurasi Ketat CORS
* Perketat izin komunikasi lintas domain pada Express.js menggunakan paket `cors`.
* **Dilarang Menggunakan Wildcard (`origin: '*'`) di Lingkungan Produksi.**
* Konfigurasikan *whitelist* domain secara eksplisit melalui variabel lingkungan (`ALLOWED_ORIGINS`):
  ```javascript
  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin tidak diizinkan oleh kebijakan CORS IN DENTAL CARE'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true // Mengizinkan cookie sesi jika diperlukan
  };
  app.use(cors(corsOptions));
  ```

### 7.2. Proteksi Cross-Site Request Forgery (CSRF)
* Jika autentikasi dashboard mengandalkan cookie sesi, terapkan perlindungan anti-CSRF (seperti menggunakan token CSRF ganda / `csurf` / *custom header verification*).
* Konfigurasikan atribut cookie dengan parameter `SameSite=Strict` (atau `SameSite=Lax`) dan `Secure=true`.

---

## 8. Perlindungan Kredensial & Manajemen Lingkungan

* **Isolasi Variabel Lingkungan (.env):**
  * Seluruh data rahasia (kredensial database PostgreSQL, `JWT_SECRET`, salt key, port rahasia) wajib disimpan dalam file `.env` di lingkungan server.
  * File `.env` wajib dimasukkan ke dalam `.gitignore` agar tidak pernah terunggah ke repositori Git publik maupun privat.
  * Sediakan berkas `.env.example` yang mencantumkan nama-nama variabel konfigurasi yang diperlukan tanpa mencantumkan nilai rahasia nyata.
* **Batas Keras Keamanan Frontend (No Secrets in Frontend):**
  * **Dilarang keras menaruh rahasia apa pun di dalam kode ReactJS** (seperti database password, JWT secret, atau private API keys). Seluruh kode JavaScript yang dikirim ke browser pengguna dapat dibaca dan diekstrak oleh siapa saja menggunakan Developer Tools.

---

## 9. Keamanan Khusus Pipeline Data Analytics (Python & Jupyter Notebook)

Berdasarkan **US-7** dan **FR-5**, modul analitik Python dan Jupyter Notebook terhubung langsung ke database PostgreSQL untuk mengekstrak tren kunjungan dan performa klinik. Penerapan keamanan pada modul ini meliputi:

* **Akun Database Read-Only Khusus Analisis:**
  * Skrip analitik Python wajib menggunakan kredensial koneksi database tersendiri yang **hanya memiliki hak akses `SELECT` (Read-Only)**.
  * Akun analitik tidak boleh memiliki izin `INSERT`, `UPDATE`, `DELETE`, `DROP`, atau `ALTER` untuk mencegah kerusakan data transaksional klinik secara tidak sengaja.
* **De-identifikasi & Anonimisasi Data Pasien (Data Masking):**
  * Sebelum data diekstraksi ke dalam DataFrame Pandas untuk dianalisis atau divisualisasikan, informasi identitas pribadi (Personally Identifiable Information / PII) seperti nama lengkap pasien, nomor telepon, dan alamat wajib disamarkan (*masked*) atau di-hash menjadi ID anonim (misal: `PATIENT_HASH_A89F`).
* **Pembersihan Output Notebook Sebelum Komit:**
  * Dilarang keras melakukan *commit* berkas `.ipynb` ke repositori Git dengan sel keluaran (*output cells*) yang masih menampilkan tabel data medis pasien atau visualisasi data mentah yang belum disamarkan. Jalankan *Clear All Outputs* sebelum menyimpan notebook ke version control.

---

## 10. Audit Logging, Monitoring & Penanganan Error yang Aman

Sesuai dengan **FR-4** dan kebutuhan manajer klinik (**Persona 3**):

### 10.1. Pencatatan Jejak Audit (Audit Logging)
* Sistem mencatat aktivitas kritis ke dalam tabel `audit_logs` di PostgreSQL, meliputi:
  * Percobaan autentikasi (login berhasil maupun login gagal).
  * Pembuatan, perubahan, dan pembatalan reservasi pasien.
  * Pembuatan dan modifikasi catatan Rekam Medis Elektronik (EMR).
  * Perubahan status atau kuota jadwal dokter antarcabang.
* Data yang dicatat mencakup: `timestamp`, `user_id`, `action`, `resource_type`, `resource_id`, dan `ip_address`.
* **Sanitasi Log:** Dilarang keras mencatat kata sandi, token otorisasi, atau nomor kartu identitas ke dalam file log aplikasi maupun konsol server (*console.log*).

### 10.2. Penanganan Error yang Aman (Information Disclosure Prevention)
* Pada lingkungan *production*, nonaktifkan pencetakan detail error internal (*stack trace*) ke klien.
* Respons kegagalan server wajib menggunakan pesan ramah yang terstandarisasi (misal: *"Terjadi kesalahan internal pada sistem. Silakan hubungi administrator."*) dengan kode status HTTP `500`, sementara rincian galat teknis hanya dicatat ke logger internal server.

---

## 11. Kepatuhan OWASP Top 10 & Prosedur Audit Dependensi

Seluruh pengembang wajib menguji implementasi kode terhadap daftar risiko keamanan standar **OWASP Top 10**:

1. **A01: Broken Access Control:** Diverifikasi dengan pengujian endpoint IDOR dan penegakan middleware RBAC.
2. **A02: Cryptographic Failures:** Diverifikasi dengan implementasi TLS 1.3 dan hashing password via bcrypt/Argon2.
3. **A03: Injection:** Diverifikasi melalui penggunaan 100% Parameterized Queries PostgreSQL dan sanitasi input.
4. **A04: Insecure Design:** Diverifikasi melalui penerapan rate limiting pada rute autentikasi dan alur bisnis reservasi.
5. **A05: Security Misconfiguration:** Diverifikasi dengan pemanfaatan `helmet`, penonaktifan *stack trace*, dan pengetatan CORS.
6. **A06: Vulnerable and Outdated Components:**
   * Wajib menjalankan audit dependensi berkala:
     ```bash
     # Untuk Frontend & Backend Node.js
     npm audit
     
     # Untuk Modul Analitik Python
     pip-audit
     ```
   * Paket yang memiliki status kerentanan berisiko *High* atau *Critical* wajib segera diperbarui (*patched*).
7. **A07: Identification and Authentication Failures:** Diverifikasi dengan penguncian rate limiting login dan masa berlaku JWT yang singkat.
8. **A08: Software and Data Integrity Failures:** Diverifikasi dengan pemeriksaan integritas *lockfile* (`package-lock.json` dan `requirements.txt`).
9. **A09: Security Logging and Monitoring Failures:** Diverifikasi melalui pencatatan mutasi EMR dan aktivitas operasional di database PostgreSQL.
10. **A10: Server-Side Request Forgery (SSRF):** Membatasi panggilan HTTP keluar hanya ke layanan yang terverifikasi dan telah terdaftar secara eksplisit.

