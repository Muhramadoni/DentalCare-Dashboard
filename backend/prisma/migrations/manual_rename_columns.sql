-- =============================================================================
-- IN DENTAL CARE - SQL Manual Migration: Rename Kolom Reservasi & Rekam Medis
-- File: backend/prisma/migrations/manual_rename_columns.sql
-- =============================================================================
-- Jalankan skrip ini di Query Tool (pgAdmin / DBeaver / psql) jika ingin
-- memperbarui database PostgreSQL secara langsung tanpa Prisma CLI.
-- Pastikan dijalankan sebagai user superuser (misal: postgres) atau pemilik tabel.
-- =============================================================================

-- 1. (Opsional) Jika mengalami kendala permission "must be owner of table":
-- Sesuaikan nama user dengan yang tertulis di backend/.env Anda (misal: dental_admin):
ALTER TABLE IF EXISTS "pasien" OWNER TO dental_admin;
ALTER TABLE IF EXISTS "reservasi" OWNER TO dental_admin;
ALTER TABLE IF EXISTS "dokter" OWNER TO dental_admin;
ALTER TABLE IF EXISTS "rekam_medis" OWNER TO dental_admin;
ALTER TABLE IF EXISTS "user" OWNER TO dental_admin;
GRANT postgres TO dental_admin;

-- 2. Rename kolom pada tabel reservasi:
-- tanggal_reservasi -> tanggal_kunjungan
-- waktu_reservasi   -> waktu_kunjungan
ALTER TABLE "reservasi" RENAME COLUMN "tanggal_reservasi" TO "tanggal_kunjungan";
ALTER TABLE "reservasi" RENAME COLUMN "waktu_reservasi" TO "waktu_kunjungan";

-- 3. Rename kolom pada tabel rekam_medis (EMR):
-- tanggal_rekam     -> tanggal_pemeriksaan
ALTER TABLE "rekam_medis" RENAME COLUMN "tanggal_rekam" TO "tanggal_pemeriksaan";

-- 4. Perbarui indeks pencarian tanggal pada tabel reservasi:
DROP INDEX IF EXISTS "idx_reservasi_tanggal";
CREATE INDEX IF NOT EXISTS "idx_reservasi_tanggal_kunjungan" ON "reservasi"("tanggal_kunjungan");

-- =============================================================================
-- Selesai! Setelah menjalankan skrip di atas, jangan lupa jalankan di terminal:
-- cd backend
-- npx prisma generate
-- =============================================================================
