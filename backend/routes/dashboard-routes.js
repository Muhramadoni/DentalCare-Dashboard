// backend/routes/dashboard-routes.js
// Rute untuk Ringkasan Dashboard (sesuai apiguide.md Section 5.2)

const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboard-controller');
const { authenticateToken } = require('../middleware/auth');

// GET /api/v1/dashboard/summary
// Dilindungi dengan middleware verifikasi JWT (authenticateToken)
router.get('/summary', authenticateToken, getSummary);

module.exports = router;

