# Panduan Komunikasi & Integrasi API (`apiguide.md`)

Dokumen ini menjadi panduan dan kontrak teknis resmi mengenai bagaimana aplikasi **Frontend (ReactJS)**, **Backend (Node.js & Express.js)**, dan **Layanan Eksternal / Modul Analitik (Python)** saling berkomunikasi dalam ekosistem **IN DENTAL CARE Admin Dashboard**.

## 1. Tujuan

Dokumen ini bertujuan untuk:

1. **Menstandarkan Kontrak Komunikasi:** Memastikan keseragaman struktur permintaan (*request*) dan respons (*response*) antara klien (ReactJS) dan server (Express.js).
2. **Mempercepat Integrasi:** Menjadi referensi tunggal bagi tim Frontend dan Backend saat mengembangkan titik akhir (*endpoint*) baru (Reservasi, Jadwal Dokter, dan Rekam Medis Elektronik / EMR).
3. **Menjaga Keamanan & Keandalan:** Mendefinisikan mekanisme autentikasi, penanganan kesalahan (*error handling*), dan pembatasan lalu lintas (*rate limiting*) secara konsisten.

## 2. Konfigurasi Dasar

### 2.1. URL Dasar (*Base URL*)

Seluruh titik akhir REST API berada di bawah awalan `/api/v1` untuk memudahkan manajemen versi di masa mendatang.

* **Pengembangan (*Development*):** `http://localhost:5000/api/v1`
* **Uji Coba (*Staging*):** `https://api-staging.indentalcare.id/api/v1`
* **Produksi (*Production*):** `https://api.indentalcare.id/api/v1`

### 2.2. Protokol & Batas Waktu (*Timeout*)

* **Protokol:** Wajib menggunakan **HTTPS (TLS 1.3)** pada lingkungan Uji Coba dan Produksi.
* **Batas Waktu Permintaan:** Klien (Axios/Fetch di ReactJS) dikonfigurasi dengan batas waktu maksimal **10.000 ms (10 detik)** per permintaan agar memenuhi target performa responsif aplikasi.
* **Format Data:** Seluruh pertukaran data wajib menggunakan format **JSON** (`application/json`) dengan pengodean karakter **UTF-8**.

## 3. Autentikasi

Sistem menggunakan mekanisme berbasis **JSON Web Token (JWT)** dengan kombinasi *Access Token* dan *HttpOnly Cookie* (atau *Bearer Token* di bagian header) sesuai standar keamanan pada `security.md`.

### 3.1. Alur Autentikasi

1. Admin/Staf mengirimkan kredensial (`email` dan `password`) ke `POST /api/v1/auth/login`.
2. Backend memverifikasi kecocokan kata sandi terenkripsi (*hash*) menggunakan **bcrypt** terhadap data di PostgreSQL.
3. Jika valid, server mengembalikan `accessToken` (masa berlaku singkat, misal: `1h`) beserta informasi profil dasar dan peran (*role*) pengguna (`ADMIN`, `DOCTOR`, `OWNER`).
4. Frontend menyertakan token tersebut pada setiap permintaan ke titik akhir yang dilindungi.

## 4. Header Standar

Setiap permintaan HTTP antara Frontend dan Backend wajib menyertakan header standar berikut:

| Nama Header | Nilai / Format | Wajib? | Keterangan |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Ya (untuk POST/PUT/PATCH) | Menandakan muatan data dikirim dalam format JSON. |
| `Accept` | `application/json` | Ya | Memastikan server selalu merespons dalam format JSON. |
| `Authorization` | `Bearer <access_token>` | Ya (kecuali `/auth/login`) | Token JWT untuk verifikasi identitas dan hak akses pengguna. |
| `X-CSRF-Token` | `<csrf_token>` | Kondisional | Wajib disertakan jika autentikasi menggunakan sesi berbasis *cookie* pada metode perubahan data. |
| `X-Request-ID` | `<uuid_v4>` | Opsional (Direkomendasikan) | Identitas unik per permintaan untuk mempermudah pelacakan catatan log antara frontend dan backend. |

## 5. Struktur Titik Akhir (*Endpoint*)

Penamaan titik akhir mengikuti konvensi **RESTful API** menggunakan kata benda jamak dalam bahasa Inggris dengan format `kebab-case` (standar teknis industri agar seragam dengan basis kode).

### 5.1. Autentikasi (`/auth`)

* `POST /auth/login` — Autentikasi pengguna dan mendapatkan token akses.
* `POST /auth/logout` — Mengakhiri sesi dan mencabut token/cookie aktif.
* `GET /auth/me` — Mengambil profil pengguna yang sedang masuk.

### 5.2. Ringkasan Dasbor (`/dashboard`)

* `GET /dashboard/summary` — Mengambil statistik harian (total reservasi hari ini, dokter praktik aktif, dan riwayat aktivitas terbaru).

### 5.3. Manajemen Reservasi (`/reservations`)

* `GET /reservations` — Mengambil daftar reservasi (mendukung filter kueri: `?status=Appointment&branch=Kemang&search=Budi&page=1&limit=20`).
* `GET /reservations/:id` — Mengambil detail satu reservasi berdasarkan UUID.
* `POST /reservations` — Membuat jadwal reservasi pasien baru.
* `PUT /reservations/:id` — Memperbarui data reservasi atau mengubah status (`Appointment`, `Reschedule`, `Completed`, `Cancelled`).
* `DELETE /reservations/:id` — Menghapus data reservasi (*soft delete* / arsip).

### 5.4. Manajemen Dokter & Jadwal (`/doctors`)

* `GET /doctors` — Mengambil daftar dokter beserta jadwal praktiknya (filter: `?day=Senin&branch=Ciputat`).
* `POST /doctors` — Menambahkan data dokter dan jadwal praktik baru.
* `PUT /doctors/:id` — Memperbarui profil atau jadwal praktik dokter lintas cabang.
* `DELETE /doctors/:id` — Menonaktifkan data dokter.

### 5.5. Rekam Medis Elektronik / EMR (`/emr`)

* `GET /emr` — Mencari dan memfilter riwayat EMR (`?patientName=...&doctorId=...`).
* `GET /emr/:id` — Mengambil detail lengkap rekam medis (anamnesa, regio gigi, tindakan, resep, dan terapi).
* `POST /emr` — Menyimpan catatan EMR baru setelah pemeriksaan.
* `PUT /emr/:id` — Memperbarui catatan EMR (tercatat otomatis di log audit).

### 5.6. Komunikasi Layanan Eksternal & Analitik

* **Modul Analitik (Python & Jupyter Notebook):** Berkomunikasi melalui koneksi baca-saja (*read-only*) langsung ke replika/tampilan basis data PostgreSQL (atau melalui titik akhir internal `GET /analytics/export` dengan header `X-Internal-API-Key` khusus jaringan lokal/VPN) untuk menarik himpunan data kunjungan, diagnosa, dan resep obat secara berkala.
* **Layanan Eksternal (Persiapan Rilis v2.0 - Gerbang WhatsApp / Notifikasi):** Jika terintegrasi dengan layanan pihak ketiga, seluruh komunikasi keluar wajib melalui lapisan layanan (*service layer*) di Backend (tidak pernah langsung dari ReactJS) menggunakan pola *Webhook* dengan verifikasi tanda tangan digital (*HMAC Signature*).

## 6. Format Permintaan & Respons

Seluruh titik akhir wajib mengembalikan struktur JSON yang seragam (*envelope pattern*) agar mudah diproses secara terpusat di Frontend.

### 6.1. Contoh Permintaan (`POST /api/v1/emr`)

```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "visitDate": "2026-11-12",
  "toothRegion": "16, 17",
  "anamnesis": "Pasien mengeluh nyeri berdenyut pada geraham kanan atas sejak 2 hari lalu.",
  "procedure": "Pembersihan karies dan penambalan sementara (Tumpatan GIC)",
  "prescription": "Asam Mefenamat 500mg (3x1 bila nyeri)",
  "therapy": "Hindari mengunyah makanan keras di sisi kanan selama 24 jam."
}
```

### 6.2. Format Respons Berhasil (HTTP `200 OK` atau `201 Created`)

```json
{
  "success": true,
  "message": "Data rekam medis berhasil disimpan.",
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "visitDate": "2026-11-12",
    "createdAt": "2026-11-12T06:04:00.000Z"
  },
  "meta": null
}
```

### 6.3. Format Respons Daftar dengan Penomoran Halaman (`GET /api/v1/reservations`)

```json
{
  "success": true,
  "message": "Daftar reservasi berhasil diambil.",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patientName": "Siti Aminah",
      "doctorName": "drg. Pratama",
      "branch": "Kemang",
      "scheduleTime": "2026-11-12T09:00:00.000Z",
      "status": "Appointment"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 85,
    "totalPages": 5
  }
}
```

## 7. Penanganan Kesalahan (*Error Handling*)

Ketika terjadi kesalahan, Backend dilarang mengirimkan rincian pelacakan kode (*stack trace*) mentah ke klien. Server wajib mengembalikan Kode Status HTTP yang akurat beserta struktur JSON standar berikut:

### 7.1. Struktur Respons Kesalahan

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirimkan tidak valid.",
    "details": [
      {
        "field": "toothRegion",
        "issue": "Regio gigi wajib diisi."
      }
    ]
  }
}
```

### 7.2. Daftar Kode Status HTTP & Kode Kesalahan Internal

| Status HTTP | Kode Kesalahan Internal | Penyebab & Penanganan di Frontend |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Data masukan tidak sesuai ketentuan. Tampilkan pesan kesalahan pada kolom formulir terkait. |
| `401 Unauthorized` | `UNAUTHORIZED` | Token hilang, tidak valid, atau kedaluwarsa. Arahkan pengguna kembali ke halaman Masuk (*Login*). |
| `403 Forbidden` | `FORBIDDEN_ACCESS` | Pengguna berhasil masuk, tetapi perannya tidak memiliki izin mengakses fitur tersebut. Tampilkan notifikasi akses ditolak. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | ID pasien, dokter, atau EMR tidak ditemukan di basis data. |
| `409 Conflict` | `SCHEDULE_CONFLICT` | Terjadi bentrok jadwal reservasi pada dokter dan jam yang sama. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Jumlah permintaan melampaui batas. Tampilkan peringatan agar pengguna menunggu sejenak. |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | Kesalahan tak terduga di server/basis data. Tampilkan pesan umum yang ramah pengguna dan catat log di backend. |

## 8. Pembatasan Lalu Lintas (*Rate Limiting*)

Untuk menjaga stabilitas server dan mencegah penyalahgunaan API (seperti serangan *brute-force login* atau pengambilan paksa data pasien), server Express.js menerapkan pembatasan permintaan berdasarkan alamat IP dan/atau ID Pengguna:

1. **Titik Akhir API Umum (`/api/v1/*`):**
   * **Batas:** Maksimal **100 permintaan per 1 menit** per IP/pengguna.
2. **Titik Akhir Autentikasi (`/api/v1/auth/login`):**
   * **Batas:** Maksimal **5 kali percobaan gagal per 15 menit** per IP.
3. **Titik Akhir Ekspor & Analitik (`/api/v1/analytics/*`):**
   * **Batas:** Maksimal **10 permintaan per 5 menit**.

### 8.1. Header Informasi Pembatasan Lalu Lintas

Setiap respons API akan menyertakan header standar berikut agar Frontend dapat memantau sisa kuota permintaan:

* `X-RateLimit-Limit`: Jumlah maksimal permintaan yang diizinkan dalam jendela waktu tertentu.
* `X-RateLimit-Remaining`: Sisa kuota permintaan yang masih tersedia.
* `Retry-After`: Waktu tunggu (dalam satuan detik) sebelum klien diizinkan mengirim permintaan kembali saat terkena status `429`.