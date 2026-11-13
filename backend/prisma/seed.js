// backend/prisma/seed.js
// Seeding HANYA untuk akun Admin (Autentikasi Login)
// Data pasien, dokter, dan reservasi dibiarkan kosong sesuai instruksi

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Seed Admin Account
  const passwordHash = await bcrypt.hash('admindental123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admindental@gmail.com' },
    update: {},
    create: {
      email: 'admindental@gmail.com',
      password_hash: passwordHash,
    },
  });

  console.log(`Admin terdaftar: ${adminUser.email}`);
  console.log('Tabel dokter, pasien, dan reservasi tetap kosong (siap untuk integrasi modul masing-masing).');
  console.log('\n🎉 Seeding selesai dengan sukses!');
}

main()
  .catch((error) => {
    console.error('Error saat seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
