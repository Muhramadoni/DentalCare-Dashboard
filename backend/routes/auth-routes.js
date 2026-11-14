// backend/routes/auth-routes.js
// Definisi Route Autentikasi (sesuai apiguide.md Section 5.1)

const express = require('express');
const router = express.Router();
const { login, logout, refresh } = require('../controllers/auth-controller');
const { loginRateLimiter, globalRateLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/auth/login
// Rate limiter diterapkan: maks 5 percobaan gagal per 15 menit per IP
router.post('/login', loginRateLimiter, login);

// POST /api/v1/auth/logout
// Memerlukan token valid untuk logout (mencegah spam)
// globalRateLimiter: maks 100 request/menit per IP (sesuai security.md Section 4)
router.post('/logout', globalRateLimiter, authenticateToken, logout);

// POST /api/v1/auth/refresh
// Memperbarui token (sliding session) - hanya bisa jika token masih valid
router.post('/refresh', globalRateLimiter, authenticateToken, refresh);

module.exports = router;

