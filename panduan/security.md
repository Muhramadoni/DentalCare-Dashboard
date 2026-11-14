# Kebijakan & Standar Keamanan Sistem (Security Standards & Guidelines)

Dokumen ini merupakan panduan resmi arsitektur, kebijakan, dan implementasi keamanan perangkat lunak untuk sistem **IN DENTAL CARE Admin Dashboard**. Dokumen ini dirancang untuk melindungi aset klinis digital yang sangat berharga, meliputi data identitas pasien, jadwal praktik dokter antar-cabang, data operasional klinik, serta **Rekam Medis Elektronik (Electronic Medical Records / EMR)**.

Dokumen ini mengikat seluruh komponen arsitektur sistem:
1. **Frontend:** ReactJS Single Page Application (SPA)
2. **Backend:** Node.js & Express.js RESTful API
3. **Database:** PostgreSQL Relational Database
4. **Data Analytics:** Skrip Python & Jupyter Notebook

Dasar penyusunan dokumen ini mengacu langsung pada [Product Requirements Document (PRD)](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/prd_in_dental_care_admin_dashboard.md), khususnya **FR-1** (Keamanan Password & Autentikasi), **FR-4** (Penyimpanan Data Terstruktur & Log Aktivitas), **FR-7** (Keamanan Modul EMR), **NFR-2** (Keamanan Enkripsi TLS 1.3 & Hashing), serta skenario pengguna (**US-1** hingga **US-7**).

**Peran pengguna website ini hanya Admin.** Dokter dan pasien adalah data yang dikelola admin, bukan akun yang bisa login. Tidak ada portal dokter, portal pemilik klinik, atau portal pasien.

---

## 1. Filosofi & Prinsip Dasar Keamanan

Pengembangan sistem **IN DENTAL CARE Admin Dashboard** wajib mematuhi 3 prinsip utama keamanan informasi medis:

* **Zero Trust Architecture:** Jangan pernah percaya pada input apa pun yang datang dari sisi klien (ReactJS, HTTP request, URL parameter, maupun query string). Seluruh input wajib divalidasi dan diotorisasi ulang di backend Express.js.
* **Principle of Least Privilege (PoLP):** Satu-satunya akun yang boleh masuk ke dashboard adalah Admin. Akun itu hanya boleh melakukan tugas operasional klinik: melihat ringkasan, mengubah dan menghapus data dokter, mengubah dan menghapus data reservasi, serta melihat, mengisi, dan mengubah EMR. Proses lain (misalnya skrip analitik, jika nanti dibuat) tidak memakai akun admin dan tidak mendapat hak menulis data.
* **Defense in Depth (Pertahanan Berlapis):** Keamanan tidak boleh hanya bergantung pada satu mekanisme pertahanan tunggal. Jika satu lapisan pertahanan gagal (misalnya penyembunyian menu UI di frontend), lapisan backend dan database tetap wajib mencegah akses ilegal.

---

## 2. Autentikasi & Manajemen Sesi (Authentication & Session)

Sesuai dengan **FR-1** dan **US-1**, sistem wajib menjamin kerahasiaan akun admin saat masuk ke dalam dashboard.

### 2.1. Password Hashing & Penyimpanan Kredensial
* **Algoritma Kriptografi Wajib:** Kata sandi pengguna wajib di-hash menggunakan **bcrypt** dengan faktor biaya (*salt rounds*) minimal **12**, atau menggunakan **Argon2id**.
* **Larangan Keras:** Dilarang keras menyimpan password dalam bentuk teks terbuka (*plain-text*) atau menggunakan algoritma hash usang yang rentan terhadap *collision attack* (seperti MD5, SHA-1, atau SHA-256 polos tanpa salt).
* **Kebijakan Kompleksitas Kata Sandi:**
  * Panjang minimal: 8 karakter (disarankan minimal 10 karakter).
  * Kombinasi wajib: Mengandung huruf besar, huruf kecil, angka, dan karakter khusus/simbol.

### 2.2. Manajemen Token JWT (JSON Web Tokens)
* **Access Token:**
  * Gunakan JWT yang ditandatangani menggunakan algoritma berkekuatan tinggi (HMAC-SHA256 / `HS256` dengan kunci rahasia minimal 256-bit atau RSA-SHA256 / `RS256`).
  * Masa berlaku token selama 24h (24 jam)
  * Payload JWT hanya boleh memuat identitas non-sensitif (misal: `userId` dan `email`). Jika field `role` ikut disimpan, nilainya hanya `ADMIN`. Dilarang keras memasukkan data rahasia seperti hash password, data rekam medis, atau nomor identitas pribadi ke dalam payload token.
* **Penyimpanan Sesi Klien:**
  * Disimpan menggunakan **HttpOnly, Secure, SameSite Cookie** untuk memitigasi risiko pencurian token melalui serangan *Cross-Site Scripting* (XSS).
* **Penanganan Logout & Invalidasi:**
  * Saat admin melakukan logout, token harus dihapus dari cookie browser dan dicatat pada mekanisme daftar pencabutan (*token blacklist/revocation*) jika diperlukan pemutusan sesi seketika.

## 3. Otorisasi & Kontrol Akses

Website ini hanya punya **satu peran yang boleh login: Admin**. Tidak ada akun dokter, pemilik klinik, atau pasien di dashboard.

Dokter, pasien, reservasi, dan rekam medis tetap ada sebagai data klinik. Yang membuka, mengubah, dan menghapus data itu adalah admin.

### 3.1. Hak akses Admin

| Modul | Yang boleh dilakukan Admin |
| :--- | :--- |
| **Ringkasan dashboard** | Melihat rekap operasional (jumlah reservasi, dokter aktif, dan ringkasan hari ini). |
| **Data dokter** | Melihat, mengubah, dan menghapus data dokter beserta jadwalnya. |
| **Data reservasi** | Melihat, mengubah, dan menghapus data reservasi pasien. |
| **EMR** | Melihat, mengisi, dan mengubah catatan rekam medis (regio gigi, anamnesa, tindakan, resep, dan terapi). |

Di luar tabel ini, tidak ada peran lain yang mendapat akses. Pengunjung yang belum login tidak boleh melihat atau mengubah satupun data di atas.

### 3.2. Penegakan di server
* **Larangan UI-Only Security:** Menyembunyikan menu di ReactJS tidak cukup. Setiap endpoint selain login wajib menolak permintaan yang tidak membawa token admin yang masih berlaku.
  ```javascript
  // Semua rute data klinik wajib lewat authenticateToken.
  // Peran yang diterima hanya ADMIN. Tidak ada peran DOCTOR atau OWNER.
  const requireAdmin = (req, res, next) => {
    if (!req.user || (req.user.role && req.user.role !== 'ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: hanya admin yang boleh melakukan tindakan ini.'
      });
    }
    next();
  };

  // Contoh: mengubah EMR hanya untuk admin yang sudah login
  router.put('/api/v1/emr/:id', authenticateToken, requireAdmin, emrController.updateRecord);

  // Contoh: menghapus dokter dan reservasi juga hanya untuk admin
  router.delete('/api/v1/doctors/:id', authenticateToken, requireAdmin, doctorController.deleteDoctor);
  router.delete('/api/v1/reservations/:id', authenticateToken, requireAdmin, reservationController.deleteReservation);
  ```
* **Pencegahan akses tanpa login:** Karena hanya ada satu admin dan admin boleh melihat seluruh data klinik, pembatasan bukan “dokter A tidak boleh membuka pasien dokter B”. Pembatasannya adalah: tanpa token admin yang valid, server mengembalikan `401` atau `403` dan tidak mengirim data dokter, reservasi, maupun EMR. ID yang dikirim tetap divalidasi (harus ada di database) sebelum data diubah atau dihapus.

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
 
### 6.1. Protokol HTTPS / TLS 1.3 (belum saatnya diterapkan)
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

## 7. Keamanan Cross-Origin (CORS) & Proteksi CSRF (wajib diterapkan)

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

### 7.2. Proteksi Cross-Site Request Forgery (CSRF) (belum saatnya diterapkan)
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

## 9. Keamanan Khusus Pipeline Data Analytics (Python & Jupyter Notebook) (belum saatnya diterapkan)

Modul analitik Python **bukan akun website** dan **bukan peran login**. Yang masuk ke dashboard tetap hanya admin. Jika modul ini dibuat nanti, skripnya memakai akun database terpisah, bukan email dan password admin. Aturan akun itu:

* **Akun Database Read-Only Khusus Analisis:**
  * Skrip analitik Python wajib menggunakan kredensial koneksi database tersendiri yang **hanya memiliki hak akses `SELECT` (Read-Only)**.
  * Akun analitik tidak boleh memiliki izin `INSERT`, `UPDATE`, `DELETE`, `DROP`, atau `ALTER` untuk mencegah kerusakan data transaksional klinik secara tidak sengaja.
* **De-identifikasi & Anonimisasi Data Pasien (Data Masking):**
  * Sebelum data diekstraksi ke dalam DataFrame Pandas untuk dianalisis atau divisualisasikan, informasi identitas pribadi (Personally Identifiable Information / PII) seperti nama lengkap pasien, nomor telepon, dan alamat wajib disamarkan (*masked*) atau di-hash menjadi ID anonim (misal: `PATIENT_HASH_A89F`).
* **Pembersihan Output Notebook Sebelum Komit:**
  * Dilarang keras melakukan *commit* berkas `.ipynb` ke repositori Git dengan sel keluaran (*output cells*) yang masih menampilkan tabel data medis pasien atau visualisasi data mentah yang belum disamarkan. Jalankan *Clear All Outputs* sebelum menyimpan notebook ke version control.

---

## 10. Audit Logging, Monitoring & Penanganan Error yang Aman

Sesuai dengan **FR-4**. Jejak ini untuk mengetahui apa yang dilakukan akun admin. Tidak ada peran manajer terpisah yang login hanya untuk membaca log.

### 10.1. Pencatatan Jejak Audit (Audit Logging)
* Sistem mencatat aktivitas kritis admin ke dalam tabel `audit_logs` di PostgreSQL, meliputi:
  * Percobaan autentikasi (login berhasil maupun login gagal).
  * Perubahan dan penghapusan data reservasi.
  * Perubahan dan penghapusan data dokter.
  * Pengisian dan perubahan catatan Rekam Medis Elektronik (EMR).
* Data yang dicatat mencakup: `timestamp`, `user_id`, `action`, `resource_type`, `resource_id`, dan `ip_address`.
* **Sanitasi Log:** Dilarang keras mencatat kata sandi, token otorisasi, atau nomor kartu identitas ke dalam file log aplikasi maupun konsol server (*console.log*).

### 10.2. Penanganan Error yang Aman (Information Disclosure Prevention)
* Pada lingkungan *production*, nonaktifkan pencetakan detail error internal (*stack trace*) ke klien.
* Respons kegagalan server wajib menggunakan pesan ramah yang terstandarisasi (misal: *"Terjadi kesalahan internal pada sistem. Silakan hubungi administrator."*) dengan kode status HTTP `500`, sementara rincian galat teknis hanya dicatat ke logger internal server.

---

## 11. Kepatuhan OWASP Top 10 & Prosedur Audit Dependensi

Seluruh pengembang wajib menguji implementasi kode terhadap daftar risiko keamanan standar **OWASP Top 10**:

1. **A01: Broken Access Control:** Diverifikasi bahwa endpoint dokter, reservasi, ringkasan, dan EMR menolak permintaan tanpa token admin, dan tidak membuka peran login lain.
2. **A02: Cryptographic Failures:** Diverifikasi dengan implementasi TLS 1.3 dan hashing password via bcrypt/Argon2.
3. **A03: Injection:** Diverifikasi melalui penggunaan 100% Parameterized Queries PostgreSQL dan sanitasi input.
4. **A04: Insecure Design:** Diverifikasi melalui penerapan rate limiting pada rute autentikasi dan alur bisnis reservasi.
5. **A05: Security Misconfiguration:** Diverifikasi dengan pemanfaatan `helmet`, penonaktifan *stack trace*, dan pengetatan CORS.
6. **A06: Vulnerable and Outdated Components:** (belum saatnya diimplementasikan)
   * Wajib menjalankan audit dependensi berkala:
     ```bash
     # Untuk Frontend & Backend Node.js
     npm audit
     
     # Untuk Modul Analitik Python
     pip-audit
     ```
   * Paket yang memiliki status kerentanan berisiko *High* atau *Critical* wajib segera diperbarui (*patched*).
7. **A07: Identification and Authentication Failures:** Diverifikasi dengan penguncian rate limiting login dan masa berlaku JWT yang singkat.
8. **A08: Software and Data Integrity Failures:** Diverifikasi dengan pemeriksaan integritas *lockfile* (`package-lock.json` dan `requirements.txt`). (jangan diterapkan)
9. **A09: Security Logging and Monitoring Failures:** Diverifikasi melalui pencatatan mutasi EMR dan aktivitas operasional di database PostgreSQL.
10. **A10: Server-Side Request Forgery (SSRF):** Membatasi panggilan HTTP keluar hanya ke layanan yang terverifikasi dan telah terdaftar secara eksplisit. (jangan diterapkan)

