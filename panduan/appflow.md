# Alur Aplikasi & Siklus Pengguna (Application & User Flow)

Dokumen ini mendefinisikan seluruh alur kerja operasional, perjalanan pengguna (*user journeys*), siklus hidup data, serta interaksi sistem antara **Frontend (ReactJS)**, **Backend (Node.js & Express.js)**, dan **Database (PostgreSQL)** pada ekosistem **IN DENTAL CARE Admin Dashboard**.

Dokumen ini berfungsi sebagai peta acuan bagi pengembang dan AI Agent untuk memahami urutan logika (*step-by-step logic*) di balik setiap aksi pengguna, mencegah ambiguitas alur kerja klinik gigi, serta menjadi jembatan antara [prd_in_dental_care_admin_dashboard.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/prd_in_dental_care_admin_dashboard.md), [apiguide.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/apiguide.md), dan [security.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/security.md).

---

## 1. Peta Navigasi Global Berdasarkan Persona

Sistem membedakan alur navigasi dan hak akses antarmuka berdasarkan tiga persona utama sesuai spesifikasi PRD:

```mermaid
flowchart TD
    Login["Halaman Login (/login)"] --> AuthCheck{"Validasi Kredensial & Role"}
    
    AuthCheck -->|"Role: ADMIN (Front Office)"| AdminNav["Navigasi Admin:
    - Ringkasan Utama
    - Kelola Reservasi (CRUD)
    - Kelola Jadwal Dokter
    - Registrasi & Data Pasien
    - Akses Awal EMR"]
    
    AuthCheck -->|"Role: DOCTOR (Pemeriksa)"| DoctorNav["Navigasi Dokter:
    - Ringkasan Jadwal Praktik
    - Antrean Pasien Hari Ini
    - Form Input EMR Lengkap
    - Riwayat Rekam Medis Pasien"]
    
    AuthCheck -->|"Role: OWNER (Manajer)"| OwnerNav["Navigasi Pemilik:
    - Ringkasan Eksekutif Real-time
    - Rekapitulasi Pasien Semua Cabang
    - Audit Log Aktivitas Klinik"]
```

---

## 2. Alur 1: Autentikasi, Verifikasi Token, & Manajemen Sesi

Alur ini mengamankan pintu masuk sistem dashboard sesuai kebutuhan **FR-1**, **US-1**, dan standar keamanan pada [security.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/security.md).

### 2.1. Alur Kerja Login & Pengalihan Sesi

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Admin/Dokter/Pemilik)
    participant UI as ReactJS Frontend
    participant API as Express.js Backend
    participant DB as PostgreSQL Database

    User->>UI: Membuka dashboard & mengisi Email + Password
    UI->>API: POST /api/v1/auth/login (Payload: email, password)
    Note over API: Rate Limiter Cek (Max 5x gagal / 15 menit)
    API->>DB: Query user berdasarkan email
    DB-->>API: Mengembalikan hash password & data role
    Note over API: Komparasi password menggunakan bcrypt
    alt Password Cocok
        API-->>UI: 200 OK + JWT Access Token + HttpOnly Cookie + User Info (Role)
        UI->>UI: Simpan status auth & arahkan ke halaman sesuai Role
    else Kredensial Salah
        API->>DB: Catat percobaan gagal ke tabel audit_logs
        API-->>UI: 401 Unauthorized ("Email atau password salah")
        UI->>User: Tampilkan toast alert error
    end
```

### 2.2. Aturan Sesi & Route Protection
* **Pengecekan Token Berkala:** Setiap perpindahan tab atau pengiriman request API menyertakan header `Authorization: Bearer <token>`.
* **Token Expired (401):** Jika token kedaluwarsa, axios interceptor di ReactJS otomatis menghapus state lokal pengguna dan mengalihkan layar ke `/login` dengan notifikasi *"Sesi Anda telah berakhir, silakan masuk kembali."*

---

## 3. Alur 2: Manajemen Reservasi & Penjadwalan Dokter

Alur ini memusatkan pencatatan reservasi pasien (baik dari pesan WhatsApp maupun pasien datang langsung / *walk-in*) serta mengatur kuota praktik dokter lintas cabang sesuai **FR-3**, **FR-6**, **US-3**, dan **US-4**.

### 3.1. Alur Pendaftaran Reservasi Baru

```mermaid
flowchart TD
    Start(["Pasien Menghubungi Klinik (WA / Walk-in)"]) --> AdminOpen["Admin membuka menu 'Kelola Reservasi'"]
    AdminOpen --> ClickAdd["Klik tombol '+ Tambah Reservasi'"]
    ClickAdd --> InputPatient{"Pasien Sudah Terdaftar?"}
    
    InputPatient -->|"Ya (Pasien Lama)"| SearchPatient["Ketik Nama / No. Rekam Medis pada Autocomplete"]
    InputPatient -->|"Tidak (Pasien Baru)"| CreatePatient["Isi Data Pasien Baru:
    - Nama Lengkap
    - No. Telepon
    - Tanggal Lahir & Jenis Kelamin"]
    
    SearchPatient --> SelectBranchDoctor["Pilih Cabang Klinik & Dokter Pemeriksa"]
    CreatePatient --> SelectBranchDoctor
    
    SelectBranchDoctor --> SelectDate["Pilih Tanggal & Sesi Jam Praktik"]
    SelectDate --> CheckQuota{"Sistem Cek Kuota & Bentrok Jadwal"}
    
    CheckQuota -->|"Kuota Penuh / Bentrok"| ShowWarning["Tampilkan Peringatan Kuota Penuh / Saran Jam Lain"]
    ShowWarning --> SelectDate
    
    CheckQuota -->|"Tersedia"| ConfirmSave["Admin Klik 'Konfirmasi Simpan'"]
    ConfirmSave --> APISave["POST /api/v1/reservations"]
    APISave --> DBInsert[("Insert ke tabel reservations (Status: SCHEDULED)")]
    DBInsert --> GenerateQueue["Sistem generate Nomor Antrean Kunjungan"]
    GenerateQueue --> RefreshTable["Tabel Reservasi Terbarui & Kirim Konfirmasi ke Pasien"]
    RefreshTable --> End(["Reservasi Berhasil Dicatat (<30 Detik)"])
```

### 3.2. Alur Reschedule & Pembatalan (Cancellation)
1. **Penjadwalan Ulang (Reschedule):**
   * Admin membuka detail reservasi $\rightarrow$ klik **"Reschedule"**.
   * Admin memilih tanggal/jam baru dokter yang sama atau mengganti dokter lain.
   * Backend memverifikasi ketersediaan jadwal baru $\rightarrow$ memperbarui status reservasi menjadi `RESCHEDULED`.
2. **Pembatalan (Cancel):**
   * Pasien konfirmasi batal $\rightarrow$ Admin mengubah status menjadi `CANCELLED`.
   * Sistem otomatis mengembalikan kuota dokter pada slot waktu yang dibatalkan.

---

## 4. Alur 3: Kunjungan Pasien & Pengisian Rekam Medis Elektronik (EMR)

Alur inti klinis dokter untuk memeriksa pasien dan mencatat riwayat medis secara real-time sesuai **FR-7**, **US-5**, dan **US-6**.

```mermaid
flowchart TD
    PatientArrives(["Pasien Tiba di Klinik"]) --> AdminCheckin["Admin klik tombol 'Check-In' pada Reservasi"]
    AdminCheckin --> StatusInWaiting["Status Reservasi berubah menjadi: CHECKED_IN (Dalam Antrean)"]
    
    StatusInWaiting --> DoctorCalls["Dokter memanggil pasien & klik 'Mulai Pemeriksaan'"]
    DoctorCalls --> StatusInConsultation["Status Reservasi berubah menjadi: IN_CONSULTATION"]
    DoctorCalls --> OpenEMR["Sistem membuka Form EMR Pasien"]
    
    OpenEMR --> FetchHistory["Sistem memuat riwayat medis pasien sebelumnya (<10 detik)"]
    FetchHistory --> Consultation["Dokter melakukan konsultasi & tindakan medis"]
    
    Consultation --> FillAnamnesa["1. Input Anamnesa (Keluhan & Riwayat)"]
    FillAnamnesa --> SelectToothRegion["2. Pilih Regio Gigi / Odontogram (misal: 11, 16, 46)"]
    SelectToothRegion --> FillTreatment["3. Input Tindakan Medis (Scaling, Tambal, dll.)"]
    FillTreatment --> FillPrescription["4. Input Resep Obat & Rencana Terapi Lanjutan"]
    
    FillPrescription --> ClickSave["Dokter klik tombol 'Simpan & Selesaikan Rekam Medis'"]
    ClickSave --> SecurityValidation{"Validasi Sanitasi Input & RBAC Server"}
    
    SecurityValidation -->|"Lolos"| SaveEMR[("1. Insert ke medical_records
    2. Update reservations status -> COMPLETED
    3. Catat audit_logs PostgreSQL")]
    
    SaveEMR --> ToastSuccess["Tampilkan Notifikasi Berhasil & Dialog Ringkasan"]
    ToastSuccess --> FinishConsultation(["Kunjungan Selesai & Pasien Pulang"])
```

---

## 5. Alur 4: Pemantauan Operasional & Audit Log oleh Pemilik Klinik

Alur bagi Pemilik Klinik / Manajer untuk memantau performa harian dan keamanan sistem sesuai kebutuhan **Persona 3** dan **US-2**.

```mermaid
flowchart LR
    OwnerLogin["Pemilik Klinik Login"] --> ExecutiveDashboard["Dashboard Utama"]
    
    ExecutiveDashboard --> Metric1["Lihat Rekap Harian:
    - Total Pasien Selesai vs Batal
    - Utilisasi Dokter Praktik"]
    
    ExecutiveDashboard --> BranchFilter["Filter Berdasarkan Cabang Klinik"]
    
    ExecutiveDashboard --> AuditLogMenu["Buka Menu 'Audit Log Keamanan'"]
    AuditLogMenu --> ViewAudit["Melihat Riwayat Mutasi Data:
    - Pembuatan & Perubahan EMR
    - Riwayat Login Berhasil/Gagal
    - Perubahan Jadwal Dokter"]
```

---

## 6. Alur 5: Siklus Modul Analitik Data (Python & Jupyter Notebook)

Alur ekstraksi dan pengolahan data klinik untuk menghasilkan wawasan bisnis mendalam sesuai **FR-5** dan **US-7**.

```mermaid
flowchart TD
    StartAnalytics(["Jadwal Analisis Data Berkala"]) --> ConnectDB["Jalankan skrip Python: Koneksi PostgreSQL (Kredensial Read-Only)"]
    ConnectDB --> QueryData["Ekstraksi Data Transaksional (reservations & medical_records)"]
    QueryData --> Masking["De-identifikasi Data: Masking Nama Pasien & Nomor Telepon (PII Anonymization)"]
    Masking --> DataProcessing["Pemrosesan Data dengan Pandas:
    - Agregasi tren diagnosa dan tindakan gigi
    - Frekuensi resep obat terbanyak
    - Pola jam sibuk kunjungan per cabang"]
    DataProcessing --> Visualization["Generasi Grafik Visualisasi (Matplotlib / Seaborn)"]
    Visualization --> SaveInsight["Simpan Ringkasan Laporan & Bersihkan Output Sel Notebook"]
    SaveInsight --> EndAnalytics(["Laporan Tren Siap Ditinjau Pemilik Klinik"])
```

---

## 7. Diagram Mesin Status Data (State Machine Diagrams)

### 7.1. Siklus Hidup Status Reservasi Pasien (`reservations.status`)

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Admin membuat reservasi baru
    SCHEDULED --> RESCHEDULED: Pasien meminta ganti jadwal
    RESCHEDULED --> SCHEDULED: Jadwal baru terkonfirmasi
    SCHEDULED --> CHECKED_IN: Pasien tiba di klinik (Check-In)
    SCHEDULED --> CANCELLED: Pasien membatalkan janji
    
    CHECKED_IN --> IN_CONSULTATION: Dokter memanggil pasien ke ruang praktik
    IN_CONSULTATION --> COMPLETED: Dokter selesai memeriksa & simpan EMR
    
    COMPLETED --> [*]
    CANCELLED --> [*]
```

### 7.2. Siklus Hidup Rekam Medis Elektronik (`medical_records.status`)

```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS: Dokter mulai mengisi form EMR pasien
    IN_PROGRESS --> FINALIZED: Dokter klik 'Simpan & Selesaikan'
    FINALIZED --> AMENDED: Dokter menambahkan koreksi catatan medis (dengan log audit)
    FINALIZED --> [*]
    AMENDED --> [*]
```

---

## 8. Penanganan Skenario Tepi & Error Operasional (Edge Cases)

| Skenario Anomali / Tepi | Dampak pada Sistem | Prosedur Solusi Sistem (Fallback & Recovery) |
| :--- | :--- | :--- |
| **Dokter Berhalangan Mendadak** | Jadwal praktik aktif memiliki 10 reservasi pasien hari itu. | Sistem menandai dokter sebagai `UNAVAILABLE`. Admin menerima notifikasi peringatan untuk melakukan *mass-reschedule* atau pengalihan pasien ke dokter pengganti di cabang yang sama. |
| **Koneksi Internet Terputus Saat Input EMR** | Form EMR yang sedang diisi berisiko hilang. | Frontend ReactJS menerapkan penyimpanan sementara di *Local Cache/IndexedDB*. Saat koneksi pulih, tombol simpan aktif kembali tanpa kehilangan data anamnesa/resep. |
| **Sesi Token Habis Saat Form EMR Terbuka** | Request simpan ditolak dengan status HTTP `401`. | Modal autentikasi ulang (*Re-authentication modal*) muncul di atas form EMR tanpa melakukan reload halaman, sehingga data yang sudah diketik tidak hilang. |
| **Pasien Walk-in Tanpa Kontak WA** | Data nomor telepon kosong. | Sistem mengizinkan kolom kontak opsional dengan mencentang opsi *"Pasien Walk-in Offline"*, namun ID pasien dan nomor rekam medis tetap dibuat otomatis di PostgreSQL. |

