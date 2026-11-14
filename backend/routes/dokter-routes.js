// backend/routes/dokter-routes.js
// Rute REST API Kelola Dokter & Jadwal Praktik (sesuai FR-3, US-4, apiguide.md, security.md)

const express = require('express');
const router = express.Router();
const {
  getDokter,
  getDokterById,
  createDokter,
  updateDokter,
  deleteDokter,
} = require('../controllers/dokter-controller');
const { authenticateToken } = require('../middleware/auth');

// Seluruh endpoint dokter dilindungi oleh middleware verifikasi JWT (sesuai security.md Section 2)
router.use(authenticateToken);

// GET /api/v1/dokter - Daftar seluruh dokter (dukung filter cabang & status)
router.get('/', getDokter);

// GET /api/v1/dokter/:id - Detail data satu dokter
router.get('/:id', getDokterById);

// POST /api/v1/dokter - Tambah data dokter baru
router.post('/', createDokter);

// PUT /api/v1/dokter/:id - Perbarui data dokter
router.put('/:id', updateDokter);

// DELETE /api/v1/dokter/:id - Hapus data dokter
router.delete('/:id', deleteDokter);

module.exports = router;

