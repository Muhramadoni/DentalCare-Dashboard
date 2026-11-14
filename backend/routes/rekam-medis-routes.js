// backend/routes/rekam-medis-routes.js
// Definisi Rute REST API Rekam Medis Elektronik (EMR)
// Sesuai apiguide.md, security.md Section 3, dan prd_in_dental_care_admin_dashboard.md FR-3 & FR-7

const express = require('express');
const router = express.Router();
const {
  getRekamMedis,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  deleteRekamMedis,
  getPatients,
} = require('../controllers/rekam-medis-controller');
const { authenticateToken } = require('../middleware/auth');
const { globalRateLimiter } = require('../middleware/rateLimiter');

// Seluruh endpoint rekam medis dilindungi autentikasi JWT admin & rate limiter
router.use(globalRateLimiter);
router.use(authenticateToken);

// GET /api/v1/rekam-medis/patients - Autocomplete daftar pasien
router.get('/patients', getPatients);

// GET /api/v1/rekam-medis - Daftar seluruh rekam medis dengan filter & pencarian
router.get('/', getRekamMedis);

// GET /api/v1/rekam-medis/:id - Detail 1 data rekam medis
router.get('/:id', getRekamMedisById);

// POST /api/v1/rekam-medis - Tambah rekam medis baru (dengan sanitasi XSS)
router.post('/', createRekamMedis);

// PUT /api/v1/rekam-medis/:id - Update data rekam medis (dengan sanitasi XSS)
router.put('/:id', updateRekamMedis);

// DELETE /api/v1/rekam-medis/:id - Hapus data rekam medis
router.delete('/:id', deleteRekamMedis);

module.exports = router;

