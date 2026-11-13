# Dokumentasi Basis Data (database.md)

Dokumen ini berisi spesifikasi skema basis data relasional **PostgreSQL** resmi untuk aplikasi **IN DENTAL CARE Admin Dashboard**. Seluruh struktur tabel dan penamaan kolom menggunakan **Bahasa Indonesia** yang sederhana, terarah, dan sesuai dengan kebutuhan nyata proyek.

---

## 1. Ringkasan Tabel Proyek

Sistem ini hanya menggunakan **5 tabel utama** tanpa penambahan tabel atau kolom yang tidak diperlukan:

1. **`user`**: Menyimpan kredensial email dan password terenkripsi untuk login ke dashboard.
2. **`dokter`**: Menyimpan master data dokter, cabang tempat bertugas, dan konfigurasi jadwal praktik fleksibel (`jadwal_json`).
3. **`pasien`**: Menyimpan data identitas pasien berobat.
4. **`reservasi`**: Mencatat jadwal pemesanan konsultasi pasien dengan dokter terkait status kunjungan.
5. **`rekam_medis`**: Menyimpan data Rekam Medis Elektronik (EMR) hasil konsultasi pasien (regio gigi, anamnesa, tindakan, resep, dan terapi).

---

## 2. Diagram Relasi Antar Tabel (ERD)

```mermaid
erDiagram
    PASIEN ||--o{ RESERVASI : memiliki
    DOKTER ||--o{ RESERVASI : menangani
    PASIEN ||--o{ REKAM_MEDIS : memiliki
    DOKTER ||--o{ REKAM_MEDIS : memeriksa

    USER {
        serial id PK
        varchar email UK
        varchar password_hash
        timestamp created_at
    }

    DOKTER {
        serial id PK
        varchar nama
        varchar spesialisasi
        varchar cabang
        jsonb jadwal_json
        varchar status
    }

    PASIEN {
        serial id PK
        varchar nama
        timestamp created_at
    }

    RESERVASI {
        serial id PK
        int pasien_id FK
        int dokter_id FK
        date tanggal_reservasi
        varchar waktu_reservasi
        varchar status
    }

    REKAM_MEDIS {
        serial id PK
        int pasien_id FK
        int dokter_id FK
        date tanggal_rekam
        varchar regio
        text anamnesa
        text tindakan
        text resep
        text terapi
    }
```

---

## 3. Rincian Skema Tabel

### 3.1. Tabel: `user`
Menyimpan data pengguna untuk autentikasi ke dalam dashboard.

* `id` (`SERIAL`, Primary Key)
* `email` (`VARCHAR`, Unique, Not Null) — Alamat email login
* `password_hash` (`VARCHAR`, Not Null) — Menyimpan string hasil hashing password (bcrypt)
* `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

---

### 3.2. Tabel: `dokter`
Menyimpan data dokter gigi dan jadwal fleksibelnya.

* `id` (`SERIAL`, Primary Key)
* `nama` (`VARCHAR`, Not Null) — Nama lengkap dokter gigi
* `spesialisasi` (`VARCHAR`) — Spesialisasi bidang medis gigi
* `cabang` (`VARCHAR`) — Lokasi cabang klinik (Contoh: Garuda, Muchtar Raya)
* `jadwal_json` (`JSONB`) — Menyimpan konfigurasi hari & jam praktik fleksibel
* `status` (`VARCHAR`) — Status dokter (misal: Aktif / Tidak Aktif)

---

### 3.3. Tabel: `pasien`
Menyimpan data pasien klinik gigi.

* `id` (`SERIAL`, Primary Key)
* `nama` (`VARCHAR`, Not Null) — Nama lengkap pasien
* `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

---

### 3.4. Tabel: `reservasi`
Mencatat antrean janji temu pasien dengan dokter pemeriksa.

* `id` (`SERIAL`, Primary Key)
* `pasien_id` (`INT`, Foreign Key references `pasien(id)`)
* `dokter_id` (`INT`, Foreign Key references `dokter(id)`)
* `tanggal_reservasi` (`DATE`, Not Null) — Tanggal janji temu
* `waktu_reservasi` (`VARCHAR`, Not Null) — Sesi jam janji temu
* `status` (`VARCHAR`) — Status reservasi (*Appointment* atau *Reschedule*)

---

### 3.5. Tabel: `rekam_medis`
Menyimpan catatan medis pemeriksaan gigi (EMR).

* `id` (`SERIAL`, Primary Key)
* `pasien_id` (`INT`, Foreign Key references `pasien(id)`)
* `dokter_id` (`INT`, Foreign Key references `dokter(id)`)
* `tanggal_rekam` (`DATE`, Not Null) — Tanggal pemeriksaan
* `regio` (`VARCHAR`) — Nomor gigi / area (odontogram)
* `anamnesa` (`TEXT`) — Keluhan utama dan riwayat penyakit pasien
* `tindakan` (`TEXT`) — Tindakan penanganan medis yang dilakukan
* `resep` (`TEXT`) — PF (Resep obat yang diberikan)
* `terapi` (`TEXT`) — Rencana anjuran dan terapi lanjutan

---

## 4. Konfigurasi Koneksi Database Menggunakan Prisma ORM

Aplikasi backend menggunakan **Prisma ORM** (`@prisma/client`) untuk berinteraksi dengan database PostgreSQL. Inisialisasi koneksi dikelola secara tunggal (*singleton instance*) di file `backend/config/prisma.js` (atau `backend/config/db.js`):

```javascript
// backend/config/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

module.exports = prisma;
```

Variabel lingkungan koneksi diatur pada `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/indentalcare_db?schema=public&connection_limit=10"
```

---

## 5. Skema Prisma (`schema.prisma`) & Migrasi

Seluruh model tabel didefinisikan pada file `backend/prisma/schema.prisma` yang dipetakan langsung ke 5 nama tabel PostgreSQL dalam bahasa Indonesia:

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 1. Tabel user (untuk autentikasi)
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique @db.VarChar(255)
  password_hash String   @db.VarChar(255)
  created_at    DateTime @default(now()) @db.Timestamp

  @@map("user")
}

// 2. Tabel dokter
model Dokter {
  id           Int           @id @default(autoincrement())
  nama         String        @db.VarChar(255)
  spesialisasi String?       @db.VarChar(255)
  cabang       String?       @db.VarChar(255)
  jadwal_json  Json?         @db.JsonB
  status       String?       @default("Aktif") @db.VarChar(50)
  
  reservasi    Reservasi[]
  rekam_medis  RekamMedis[]

  @@map("dokter")
}

// 3. Tabel pasien
model Pasien {
  id          Int           @id @default(autoincrement())
  nama        String        @db.VarChar(255)
  created_at  DateTime      @default(now()) @db.Timestamp

  reservasi   Reservasi[]
  rekam_medis RekamMedis[]

  @@map("pasien")
}

// 4. Tabel reservasi
model Reservasi {
  id                Int      @id @default(autoincrement())
  pasien_id         Int
  dokter_id         Int
  tanggal_reservasi DateTime @db.Date
  waktu_reservasi   String   @db.VarChar(100)
  status            String   @default("Appointment") @db.VarChar(50)

  pasien            Pasien   @relation(fields: [pasien_id], references: [id], onDelete: Cascade)
  dokter            Dokter   @relation(fields: [dokter_id], references: [id], onDelete: Cascade)

  @@index([tanggal_reservasi], map: "idx_reservasi_tanggal")
  @@map("reservasi")
}

// 5. Tabel rekam_medis
model RekamMedis {
  id            Int      @id @default(autoincrement())
  pasien_id     Int
  dokter_id     Int
  tanggal_rekam DateTime @default(now()) @db.Date
  regio         String?  @db.VarChar(100)
  anamnesa      String?  @db.Text
  tindakan      String?  @db.Text
  resep         String?  @db.Text
  terapi        String?  @db.Text

  pasien        Pasien   @relation(fields: [pasien_id], references: [id], onDelete: Cascade)
  dokter        Dokter   @relation(fields: [dokter_id], references: [id], onDelete: Cascade)

  @@index([pasien_id], map: "idx_rekam_medis_pasien")
  @@map("rekam_medis")
}
```

### 5.1. Perintah Migrasi Prisma CLI
Jalankan perintah berikut di folder `backend/` untuk menghasilkan tabel dan Prisma Client:
```bash
# 1. Inisialisasi skema dan terapkan migrasi ke database PostgreSQL
npx prisma migrate dev --name init

# 2. Generate Prisma Client setelah ada perubahan skema
npx prisma generate

# 3. (Opsional) Buka GUI Prisma Studio untuk mengecek isi database
npx prisma studio
```

### 5.2. Skrip SQL Murni (DDL Manual jika diperlukan)
Jika ingin menginisialisasi tabel secara manual di PostgreSQL tanpa migrasi CLI:
```sql
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dokter (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    spesialisasi VARCHAR(255),
    cabang VARCHAR(255),
    jadwal_json JSONB,
    status VARCHAR(50) DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS pasien (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservasi (
    id SERIAL PRIMARY KEY,
    pasien_id INT NOT NULL REFERENCES pasien(id) ON DELETE CASCADE,
    dokter_id INT NOT NULL REFERENCES dokter(id) ON DELETE CASCADE,
    tanggal_reservasi DATE NOT NULL,
    waktu_reservasi VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Appointment'
);

CREATE TABLE IF NOT EXISTS rekam_medis (
    id SERIAL PRIMARY KEY,
    pasien_id INT NOT NULL REFERENCES pasien(id) ON DELETE CASCADE,
    dokter_id INT NOT NULL REFERENCES dokter(id) ON DELETE CASCADE,
    tanggal_rekam DATE NOT NULL DEFAULT CURRENT_DATE,
    regio VARCHAR(100),
    anamnesa TEXT,
    tindakan TEXT,
    resep TEXT,
    terapi TEXT
);

CREATE INDEX IF NOT EXISTS idx_reservasi_tanggal ON reservasi (tanggal_reservasi);
CREATE INDEX IF NOT EXISTS idx_rekam_medis_pasien ON rekam_medis (pasien_id);
```
