// backend/routes/reservasi-routes.js
// Rute REST API Kelola Reservasi Pasien (sesuai FR-3, US-3, apiguide.md, security.md)

const express = require('express');
const router = express.Router();
const {
  getReservasi,
  createReservasi,
  updateReservasi,
  deleteReservasi,
  getDoctors,
} = require('../controllers/reservasi-controller');
const { authenticateToken } = require('../middleware/auth');

// Seluruh endpoint reservasi dilindungi oleh JWT authentication middleware (sesuai security.md Section 2)
router.use(authenticateToken);

// GET /api/v1/reservasi/doctors - Daftar dokter aktif untuk pilihan dropdown
router.get('/doctors', getDoctors);

// GET /api/v1/reservasi - Daftar reservasi dengan filter tanggal & status
router.get('/', getReservasi);

// POST /api/v1/reservasi - Membuat reservasi baru
router.post('/', createReservasi);

// PUT /api/v1/reservasi/:id - Memperbarui jadwal waktu atau status reservasi
router.put('/:id', updateReservasi);

// DELETE /api/v1/reservasi/:id - Menghapus data reservasi
router.delete('/:id', deleteReservasi);

module.exports = router;

