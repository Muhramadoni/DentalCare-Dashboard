// backend/prisma/seed.js
// Seed admin account: admindental@gmail.com / admindental123

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  // Hash password dengan bcrypt salt rounds 12 (sesuai security.md)
  const passwordHash = await bcrypt.hash('admindental123', 12);

  // Upsert: buat jika belum ada, skip jika sudah ada
  const adminUser = await prisma.user.upsert({
    where: { email: 'admindental@gmail.com' },
    update: {},
    create: {
      email: 'admindental@gmail.com',
      password_hash: passwordHash,
    },
  });

  console.log(`Admin berhasil di-seed: ${adminUser.email}`);
  console.log(`ID: ${adminUser.id}`);
  console.log(`Created At: ${adminUser.created_at}`);
  console.log('');
  console.log('Seeding selesai! Gunakan kredensial berikut untuk login:');
  console.log('Email    : admindental@gmail.com');
  console.log('Password : admindental123');
}

main()
  .catch((error) => {
    console.error('Error saat seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

