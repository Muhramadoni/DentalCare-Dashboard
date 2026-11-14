// backend/prisma/seed.js
// Bootstrap akun Admin dari environment variables (.env)
// Tidak menghapus data dokter, pasien, reservasi, atau rekam medis

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database IN DENTAL CARE...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmailOld = process.env.ADMIN_EMAIL_OLD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di file .env sebelum menjalankan seed.'
    );
  }

  // where memakai email lama jika sedang diganti; kalau tidak, pakai email aktif
  const lookupEmail = adminEmailOld || adminEmail;
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: lookupEmail },
    update: {
      email: adminEmail,
      password_hash: passwordHash,
    },
    create: {
      email: adminEmail,
      password_hash: passwordHash,
    },
  });

  console.log(`Admin terdaftar: ${adminUser.email}`);

  if (adminEmailOld && adminEmailOld !== adminEmail) {
    console.log(
      `Email admin diganti dari ${adminEmailOld} ke ${adminEmail}.`
    );
  }
}

main()
  .catch((error) => {
    console.error('Error saat seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
