// backend/config/prisma.js
// Singleton instance Prisma Client (sesuai database.md Section 4)
// Pola singleton mencegah pembuatan koneksi berlebih ke PostgreSQL

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;

