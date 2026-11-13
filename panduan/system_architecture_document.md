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

* **Database & ORM:**
  * **Relational Database:** PostgreSQL (mengelola tabel `user`, `dokter`, `pasien`, `reservasi`, dan `rekam_medis`)
  * **ORM (Object-Relational Mapping):** Prisma ORM (`@prisma/client` & Prisma Migrate)

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
│   │   ├── components/       # Komponen UI modular (Sidebar, Modals, Icons)
│   │   ├── pages/          # Halaman utama (Login, Ringkasan, Reservasi, Dokter, EMR)
│   │   ├── assets/         # Gambar, ikon SVG, dan stylesheet
│   │   ├── App.jsx         # Root component SPA & state management
│   │   └── main.jsx        # Entry point React
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── config/             # Konfigurasi Prisma Client & environment
│   ├── controllers/        # Business logic (authController, reservationController, doctorController, emrController)
│   ├── middleware/         # Auth verification middleware & error handler
│   ├── prisma/             # Skema Prisma (schema.prisma) & file migrasi database
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

## 5. Basis Data & Skema Relasional (Database)

Seluruh rancangan skema relasional tabel, Entity Relationship Diagram (ERD), kamus data, strategi indexing, konfigurasi connection pooling, serta skrip DDL migrasi SQL lengkap dikelola secara terpusat pada dokumen tersendiri:

**[database.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/database.md)**

Ringkasan 5 tabel utama yang dikelola pada basis data PostgreSQL:
* **`user`:** Akun login email dan password terenkripsi (`password_hash`).
* **`dokter`:** Master data dokter, cabang tempat praktik, dan konfigurasi jadwal (`jadwal_json`).
* **`pasien`:** Data nama pasien klinik gigi.
* **`reservasi`:** Jadwal janji temu pasien dengan dokter (`pasien_id`, `dokter_id`, `tanggal_reservasi`, `waktu_reservasi`, `status`).
* **`rekam_medis`:** Data rekam medis elektronik / EMR (`pasien_id`, `dokter_id`, `tanggal_rekam`, `regio`, `anamnesa`, `tindakan`, `resep`, `terapi`).

## 6. Skalabilitas & Performance (Scalability)

* **Database Connection Pooling:** Menggunakan mekanisme connection pooling bawaan **Prisma Client** (dikonfigurasi dengan parameter `connection_limit` pada `DATABASE_URL`) untuk mengelola koneksi PostgreSQL secara optimal dan mencegah lonjakan beban (menjamin respon API <200ms).
* **Indexed Queries:** Pembuatan indeks melalui Prisma (`@@index`) pada kolom pencarian sering (seperti `tanggal_reservasi` dan `pasien_id`) di PostgreSQL untuk memastikan pencarian data EMR dan reservasi instan.
* **Modular Analytics:** Pemrosesan data analitik dipisahkan ke lingkungan Python/Jupyter terisolasi agar tidak membebani performa operasional server Express.js utama.

## 7. Feature Considerations & Future Roadmap

* **v1.0 (Current Scope):** Full-stack SPA dashboard, autentikasi berbasis password hashing, manajemen reservasi, kelola dokter lintas cabang, input & filter EMR, serta integrasi analitik dasar dengan Python.
* **v1.1+ (Future Considerations):**
  * Integrasi WhatsApp Gateway API otomatis untuk konfirmasi reservasi pasien.
  * Multi-role permissions (Admin, Doctor Portal mandiri, Patient Portal).
  * Ekspor laporan klinis otomatis format PDF langsung dari dashboard.