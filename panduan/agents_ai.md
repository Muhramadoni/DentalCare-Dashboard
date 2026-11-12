# AI Agent Operational Guidelines (`agents.md`)

Dokumen ini mendefinisikan instruksi operasional, batasan perilaku, standar penulisan kode, serta alat (*tools*) yang wajib dipatuhi oleh seluruh **AI Coding Assistant / AI Agents** (seperti GitHub Copilot, Cursor, Claude, Gemini, dll.) saat berkontribusi pada pengembangan **IN DENTAL CARE Admin Dashboard**.

---

## 1. Purpose (Tujuan)

Tujuan dari dokumen `agents.md` ini adalah:
1. **Menyelaraskan Konteks AI:** Memastikan AI memahami arsitektur, kebutuhan bisnis klinik gigi, dan batasan teknis proyek sejak awal interaksi.
2. **Menjaga Konsistensi Output:** Memastikan setiap baris kode yang dihasilkan oleh AI langsung mematuhi standar di `code_styles.md` dan kontrak API di `apiguide.md`.
3. **Mencegah Halusinasi & Kerentanan:** Mencegah AI menyarankan pustaka yang tidak relevan, mengubah skema database tanpa izin, atau memperkenalkan celah keamanan pada data **Rekam Medis Elektronik (EMR)** pasien.

---

## 2. Before You Start (Sebelum Memulai)

Sebelum menulis, memodifikasi, atau menghapus kode apa pun, AI Agent **wajib** melakukan langkah-langkah persiapan berikut:

1. **Baca Dokumen Konteks Utama:** Pahami kebutuhan fitur dan batasan rilis dari file-file berikut di dalam repositori:
   * `prd_in_dental_care_admin_dashboard.md` (Kebutuhan fungsional, persona, dan cakupan *In-Scope / Out-of-Scope* v1.0).
   * `appflow.md` (Alur kerja operasional klinik, siklus antrean, transisi status reservasi & EMR).
   * `system_architecture_document.md` (Arsitektur sistem, struktur folder, dan tumpukan teknologi).
   * `database.md` (Skema PostgreSQL, relasi ERD, kamus data, dan indeks performa).
   * `code_styles.md` (Konvensi penamaan, clean code, keterbacaan, dan arsitektur kode).
   * `security.md` (Kebijakan keamanan sistem, proteksi data EMR, dan 8 pilar standar keamanan).
   * `apiguide.md` (Struktur endpoint REST API, format payload JSON, dan penanganan error).
2. **Periksa Struktur Proyek & Dependensi:** Cek `package.json` (untuk Frontend ReactJS & Backend Node.js/Express.js) atau `requirements.txt` (untuk modul analitik Python) sebelum mengimpor pustaka pihak ketiga baru.
3. **Klarifikasi Ambiguitas:** Jika instruksi pengguna bertentangan dengan spesifikasi di PRD (misalnya meminta fitur *Out-of-Scope* v1.0 seperti integrasi WhatsApp gateway otomatis atau multi-role login pasien), ajukan pertanyaan klarifikasi sebelum mengeksekusi perubahan.

---

## 3. General Rules (Aturan Umum)

Dalam setiap interaksi dan generasi kode, AI Agent wajib mematuhi aturan berikut:

* **Tumpukan Teknologi Wajib (Tech Stack):**
  * **Frontend:** ReactJS (SPA, komponen fungsional dengan React Hooks).
  * **Backend:** Node.js & Express.js (RESTful API).
  * **Database:** PostgreSQL (relasional).
  * **Data Analytics:** Python & Jupyter Notebook.
  * *Dilarang mengganti stack utama ini (misal: beralih ke MongoDB, Next.js, atau PHP) tanpa instruksi eksplisit.*
* **Perubahan Minimal & Terarah (Surgical Edits):** Hanya ubah bagian kode yang berkaitan langsung dengan tugas yang diminta. Jangan melakukan *refactoring* besar-besaran pada file yang tidak terkait.
* **Pertahankan Fitur Eksisting:** Pastikan setiap perubahan tidak merusak alur utama klinik: **Login**, **Ringkasan Utama**, **Kelola Reservasi**, **Kelola Dokter**, dan **Rekam Medis Elektronik (EMR)**.
* **Bahasa Komunikasi vs Bahasa Kode:** Gunakan **Bahasa Indonesia** yang profesional saat berdiskusi dengan developer, namun gunakan **Bahasa Inggris** untuk penamaan variabel, fungsi, komponen, endpoint, dan tabel database sesuai `code_styles.md`.

---

## 4. Code Guidelines & Tools (Panduan Kode & Alat yang Digunakan)

AI Agent wajib menghasilkan kode yang bersih, terstruktur, dan menggunakan ekosistem alat yang telah ditetapkan dalam proyek ini:

### 4.1. Tools & Ekosistem Standar
* **Backend & API:** Express.js, `pg` (node-postgres) / ORM terkonfigurasi, `bcrypt` (password hashing), `jsonwebtoken` (JWT), `zod` atau `joi` (validasi skema), `helmet`, `cors`, dan `express-rate-limit`.
* **Frontend:** ReactJS, Axios / Fetch API (dengan *interceptor* terpusat sesuai `apiguide.md`), Tailwind CSS / CSS modular proyek.
* **Analytics:** Python 3, `pandas`, `sqlalchemy` / `psycopg2` (koneksi *read-only* ke PostgreSQL), dan Jupyter Notebook (`.ipynb`).
* **Linter & Formatter:** Selalu ikuti aturan **ESLint** dan **Prettier** (untuk JS/JSX) serta **PEP 8** (untuk Python).

### 4.2. Aturan Struktur Kode
* **Pemisahan Tanggung Jawab (Separation of Concerns):**
  * Di Backend: Pisahkan antara `routes`, `controllers`, `services` (logika bisnis), dan `middlewares` (autentikasi, validasi, rate limit). Jangan menaruh query SQL langsung di dalam file route.
  * Di Frontend: Pisahkan antara komponen UI (`components`), halaman (`pages`), pemanggilan API (`services/api`), dan logika state reusable (`hooks`).
* **Kontrak API Seragam:** Seluruh endpoint baru atau yang dimodifikasi wajib mengikuti format respons JSON standar (`{ success, message, data, meta }` atau `{ success, error }`) seperti yang diatur dalam `apiguide.md`.
* **Performa:** Hindari *N+1 query* pada PostgreSQL dan pastikan interaksi UI ReactJS tetap ringan untuk memenuhi target respon `<300ms` (G4) dan API `<200ms` (NFR-1).

---

## 5. Security & Best Practices (Keamanan & Praktik Terbaik)

Karena aplikasi ini mengelola data sensitif pasien (**EMR**), AI Agent **dilarang keras** menghasilkan kode yang melanggar standar keamanan pada `security.md`:

1. **Zero Hardcoded Secrets:** Jangan pernah menuliskan password database, `JWT_SECRET`, API Key, atau kredensial nyata di dalam kode atau contoh respons. Selalu gunakan `process.env.NAMA_VARIABEL`.
2. **Parameterized Queries Wajib:** Saat menulis query PostgreSQL di Node.js atau Python, selalu gunakan *parameterized queries* (`$1, $2, ...`). Dilarang keras menggunakan *string concatenation* atau *template literals* langsung untuk nilai input user guna mencegah **SQL Injection**.
3. **Validasi Input di Sisi Server:** Setiap endpoint `POST`, `PUT`, atau `PATCH` yang dibuat oleh AI wajib dilengkapi skema validasi dan sanitasi input di backend untuk mencegah **XSS** dan data korup.
4. **Proteksi Endpoint & RBAC:** Setiap endpoint baru (selain `/auth/login`) wajib menyertakan middleware verifikasi JWT dan pengecekan hak akses (*Role-Based Access Control*).
5. **Konfigurasi Aman:** Jangan pernah menyarankan `cors({ origin: '*' })` atau menonaktifkan verifikasi SSL/TLS di lingkungan *production*.
6. **Penanganan Error Aman:** Blok `catch (error)` di backend tidak boleh mengirimkan `error.stack` atau pesan error mentah PostgreSQL ke klien; kembalikan kode error standar sesuai `apiguide.md`.

---

## 6. Useful Comments (Standar Komentar yang Bermanfaat)

Saat menghasilkan atau memperbarui kode, AI Agent wajib menerapkan aturan komentar berikut:

* **Fokus pada Konteks Bisnis & "Mengapa":** Berikan komentar singkat untuk menjelaskan aturan bisnis klinik yang tidak terlihat langsung dari nama fungsi (contoh: *aturan pencegahan bentrok jadwal dokter lintas cabang* atau *format penomoran regio gigi*).
* **JSDoc & Python Docstrings:** Sertakan **JSDoc** pada setiap fungsi *service*, *controller*, atau *custom hook* baru yang memiliki parameter kompleks, serta **Docstring** pada setiap fungsi analisis data Python.
* **Bersih dari Sampah Kode:** Jangan pernah meninggalkan kode lama dalam bentuk komentar (*commented-out code*) atau komentar placeholder kosong seperti `// tulis logika di sini` pada hasil akhir kode.

---

## 7. Need Help? (Prosedur Eskalasi & Bantuan)

AI Agent wajib berhenti dan meminta konfirmasi atau bantuan kepada developer manusia apabila menemui situasi berikut:

1. **Perubahan Skema Database (DDL):** Ketika penyelesaian tugas memerlukan pembuatan tabel baru, penghapusan kolom, atau perubahan relasi di PostgreSQL (misalnya pada tabel pasien, jadwal dokter, atau EMR).
2. **Keputusan Arsitektur & Keamanan Kritis:** Ketika diminta mengubah mekanisme autentikasi, durasi kedaluwarsa token, kebijakan *CORS*, atau konfigurasi *rate limiting*.
3. **Ambiguitas Aturan Medis / Operasional Klinik:** Ketika terdapat keraguan mengenai alur kerja klinik (misalnya aturan status `Reschedule` vs `Cancelled`, atau validasi input rekam medis dokter).
4. **Konflik Antar Dokumen:** Jika ditemukan ketidaksesuaian antara instruksi pengguna saat ini dengan dokumen `prd_in_dental_care_admin_dashboard.md`, `appflow.md`, `system_architecture_document.md`, `database.md`, `code_styles.md`, `security.md`, atau `apiguide.md`.