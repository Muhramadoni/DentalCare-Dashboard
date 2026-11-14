// backend/prisma/seed.js
// Seeding HANYA untuk akun Admin (Autentikasi Login)
// Data dokter, pasien, dan reservasi dibiarkan kosong agar diinput secara manual melalui dashboard

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database IN DENTAL CARE...');

  // 1. Seed Akun Admin
  const passwordHash = await bcrypt.hash('admindental123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admindental@gmail.com' },
    update: {},
    create: {
      email: 'admindental@gmail.com',
      password_hash: passwordHash,
    },
  });

  console.log(`✓ Admin terdaftar: ${adminUser.email}`);

  // 2. Kosongkan data dokter jika ada data dummy sebelumnya agar user bisa input manual
  await prisma.reservasi.deleteMany({});
  await prisma.rekamMedis.deleteMany({});
  await prisma.dokter.deleteMany({});
  await prisma.pasien.deleteMany({});

  console.log('Tabel dokter, pasien, dan reservasi dibiarkan kosong (siap diinput manual melalui dashboard).');
  console.log('\nSeeding selesai dengan sukses!');
}

main()
  .catch((error) => {
    console.error('Error saat seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
