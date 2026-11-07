# System Architecture Document (Architecture): IN DENTAL CARE Admin Dashboard

## 1. Ringkasan Arsitektur (Architecture Summary)

Arsitektur sistem **IN DENTAL CARE Admin Dashboard** dirancang menggunakan pendekatan **Full-Stack Monolith / Modular Client-Server Architecture** yang memisahkan antara *Frontend* (Single Page Application berbasis ReactJS dengan styling Tailwind CSS) dan *Backend* (*RESTful API* berbasis Node.js & Express.js). Penyimpanan data terpusat pada relational database **PostgreSQL** dengan penerapan connection pooling serta keamanan autentikasi berbasis *Password Hashing* (misal: `bcrypt`). Selain itu, sistem dilengkapi dengan *Data Analytics Pipeline* terpisah menggunakan **Python** dan **Jupyter Notebook** yang terhubung langsung ke basis data untuk mengolah insight klinis, tren kunjungan, serta rekapitulasi rekam medis elektronik (EMR).

## 2. Tech Stack

* **Frontend:**
  * **Framework:** ReactJS (SPA)
  * **Styling:** Tailwind CSS (via CDN / PostCSS)
  * **Icons & UI Utilities:** Lucide Icons, HTML5 Canvas (untuk signature/modal interaktif)

* **Backend:**
  * **Runtime:** Node.js
  * **Framework:** Express.js (REST API Architecture)
  * **Security & Auth:** Password Hashing (`bcrypt`), CORS, Helmet, JWT (JSON Web Tokens) untuk manajemen sesi admin

* **Database:**
  * **Relational Database:** PostgreSQL (mengelola tabel admin, dokter, pasien, reservasi, dan rekam_medis)

* **Analytics & Data Science:**
  * **Language:** Python 3.x
  * **Environment:** Jupyter Notebook
  * **Libraries:** `pandas`, `psycopg2` / `sqlalchemy`, `matplotlib`, `seaborn`

## 3. Struktur Folder (Project Directory Structure)

Struktur direktori proyek disusun secara modular untuk memisahkan logika frontend, backend API, dan script analitik data:

```
in-dental-care-admin/
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/       # Komponen UI modular (Navbar, Sidebar, Modals, Tables)
│   │   ├── pages/          # Halaman utama (Login, Ringkasan, Reservasi, Dokter, EMR)
│   │   ├── assets/         # Gambar, ikon SVG, dan stylesheet
│   │   ├── App.jsx         # Root component SPA & state management
│   │   └── main.jsx        # Entry point React
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── config/             # Konfigurasi database PostgreSQL & env
│   ├── controllers/        # Business logic (authController, reservationController, doctorController, emrController)
│   ├── middleware/         # Auth verification middleware & error handler
│   ├── models/             # Database queries & schema definitions
│   ├── routes/             # REST API routes endpoints (/api/auth, /api/reservations, etc.)
│   ├── server.js           # Express app entry point
│   └── package.json
├── analytics/
│   ├── notebooks/          # Jupyter Notebook (.ipynb) untuk eksplorasi data & visualisasi tren
│   ├── scripts/            # Skrip Python otomatisasi laporan bulanan (ETL & query PostgreSQL)
│   └── requirements.txt    # Python dependencies (pandas, psycopg2, dll)
└── README.md
```

## 4. Alur Sistem (System Flow & Data Flow)

1. **Autentikasi Admin:**
   * Admin memasukkan kredensial (email & password) pada halaman login frontend ReactJS.
   * Permintaan POST dikirim ke endpoint `/api/auth/login` di server Express.js.
   * Server memvalidasi email di database PostgreSQL dan mencocokkan hash password menggunakan algoritma `bcrypt`.
   * Jika valid, server mengembalikan token akses (JWT) dan sesi admin diinisialisasi.

2. **Manajemen Operasional (Reservasi & Dokter):**
   * Admin melakukan operasi CRUD (Tambah, Edit, Hapus, Filter) melalui antarmuka ReactJS.
   * Klien memanggil REST API Node.js yang mengeksekusi query SQL terstruktur pada PostgreSQL.

3. **Pencatatan EMR (Rekam Medis Elektronik):**
   * Dokter/Admin mengisi form EMR (regio gigi, anamnesa/diagnosa, tindakan, resep, terapi) yang langsung tersimpan secara aman ke tabel relasional rekam medis.

4. **Pipeline Analisis Data:**
   * Skrip Python atau Jupyter Notebook terhubung ke PostgreSQL menggunakan koneksi `psycopg2`/`SQLAlchemy` untuk menarik rekap data kunjungan dan rekam medis guna menghasilkan laporan analitik.

## 5. Database Schema (PostgreSQL)

Berikut adalah rancangan skema relasional tabel utama di PostgreSQL menggunakan penamaan tabel bahasa Indonesia:

* **Table: `admin`**
  * `id` (SERIAL, Primary Key)
  * `email` (VARCHAR, Unique, Not Null)
  * `password_hash` (VARCHAR, Not Null) — *Menyimpan string hasil hashing password*
  * `created_at` (TIMESTAMP)

* **Table: `dokter`**
  * `id` (SERIAL, Primary Key)
  * `nama` (VARCHAR, Not Null)
  * `spesialisasi` (VARCHAR)
  * `cabang` (VARCHAR) — *Contoh: Garuda, Muchtar Raya*
  * `jadwal_json` (JSONB) — *Menyimpan konfigurasi hari & jam praktik fleksibel*
  * `status` (VARCHAR)

* **Table: `pasien`**
  * `id` (SERIAL, Primary Key)
  * `nama` (VARCHAR, Not Null)
  * `created_at` (TIMESTAMP)

* **Table: `reservasi`**
  * `id` (SERIAL, Primary Key)
  * `pasien_id` (INT, Foreign Key references `pasien(id)`)
  * `dokter_id` (INT, Foreign Key references `dokter(id)`)
  * `tanggal_reservasi` (DATE, Not Null)
  * `waktu_reservasi` (VARCHAR, Not Null)
  * `status` (VARCHAR) — *Appointment atau Reschedule*

* **Table: `rekam_medis`**
  * `id` (SERIAL, Primary Key)
  * `pasien_id` (INT, Foreign Key references `pasien(id)`)
  * `dokter_id` (INT, Foreign Key references `dokter(id)`)
  * `tanggal_rekam` (DATE, Not Null)
  * `regio` (VARCHAR) — *Nomor gigi / area*
  * `anamnesa` (TEXT)
  * `tindakan` (TEXT)
  * `resep` (TEXT) — *PF (Resep)*
  * `terapi` (TEXT)

## 6. Skalabilitas & Performance (Scalability)

* **Database Connection Pooling:** Menggunakan `pg-pool` di Node.js untuk mengelola koneksi database secara efisien, mencegah lonjakan koneksi saat beban tinggi (menjamin respon API <200ms).
* **Indexed Queries:** Pembuatan indeks pada kolom pencarian sering (seperti `pasien_id`, `tanggal_rekam`, dan `status`) di PostgreSQL untuk memastikan pencarian data EMR dan reservasi instan.
* **Modular Analytics:** Pemrosesan data analitik dipisahkan ke lingkungan Python/Jupyter terisolasi agar tidak membebani performa operasional server Express.js utama.

## 7. Feature Considerations & Future Roadmap

* **v1.0 (Current Scope):** Full-stack SPA dashboard, autentikasi berbasis password hashing, manajemen reservasi, kelola dokter lintas cabang, input & filter EMR, serta integrasi analitik dasar dengan Python.
* **v1.1+ (Future Considerations):**
  * Integrasi WhatsApp Gateway API otomatis untuk konfirmasi reservasi pasien.
  * Multi-role permissions (Admin, Doctor Portal mandiri, Patient Portal).
  * Ekspor laporan klinis otomatis format PDF langsung dari dashboard.