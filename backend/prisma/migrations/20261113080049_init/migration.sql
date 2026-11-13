-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokter" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "spesialisasi" VARCHAR(255),
    "cabang" VARCHAR(255),
    "jadwal_json" JSONB,
    "status" VARCHAR(50) DEFAULT 'Aktif',

    CONSTRAINT "dokter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasien" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pasien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservasi" (
    "id" SERIAL NOT NULL,
    "pasien_id" INTEGER NOT NULL,
    "dokter_id" INTEGER NOT NULL,
    "tanggal_reservasi" DATE NOT NULL,
    "waktu_reservasi" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Appointment',

    CONSTRAINT "reservasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekam_medis" (
    "id" SERIAL NOT NULL,
    "pasien_id" INTEGER NOT NULL,
    "dokter_id" INTEGER NOT NULL,
    "tanggal_rekam" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regio" VARCHAR(100),
    "anamnesa" TEXT,
    "tindakan" TEXT,
    "resep" TEXT,
    "terapi" TEXT,

    CONSTRAINT "rekam_medis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_reservasi_tanggal" ON "reservasi"("tanggal_reservasi");

-- CreateIndex
CREATE INDEX "idx_rekam_medis_pasien" ON "rekam_medis"("pasien_id");

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_pasien_id_fkey" FOREIGN KEY ("pasien_id") REFERENCES "pasien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_dokter_id_fkey" FOREIGN KEY ("dokter_id") REFERENCES "dokter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekam_medis" ADD CONSTRAINT "rekam_medis_pasien_id_fkey" FOREIGN KEY ("pasien_id") REFERENCES "pasien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekam_medis" ADD CONSTRAINT "rekam_medis_dokter_id_fkey" FOREIGN KEY ("dokter_id") REFERENCES "dokter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
