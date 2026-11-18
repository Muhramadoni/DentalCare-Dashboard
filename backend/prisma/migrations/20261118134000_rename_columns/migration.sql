-- AlterTable reservasi: tanggal_reservasi -> tanggal_kunjungan, waktu_reservasi -> waktu_kunjungan
ALTER TABLE "reservasi" RENAME COLUMN "tanggal_reservasi" TO "tanggal_kunjungan";
ALTER TABLE "reservasi" RENAME COLUMN "waktu_reservasi" TO "waktu_kunjungan";

-- AlterTable rekam_medis: tanggal_rekam -> tanggal_pemeriksaan
ALTER TABLE "rekam_medis" RENAME COLUMN "tanggal_rekam" TO "tanggal_pemeriksaan";

-- Rename Index on reservasi
DROP INDEX IF EXISTS "idx_reservasi_tanggal";
CREATE INDEX "idx_reservasi_tanggal_kunjungan" ON "reservasi"("tanggal_kunjungan");
