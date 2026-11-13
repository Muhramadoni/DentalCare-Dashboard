// backend/routes/auth-routes.js
// Definisi Route Autentikasi (sesuai apiguide.md Section 5.1)

const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/auth-controller');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/auth/login
// Rate limiter diterapkan: maks 5 percobaan gagal per 15 menit per IP
router.post('/login', loginRateLimiter, login);

// POST /api/v1/auth/logout
// Memerlukan token valid untuk logout (mencegah spam)
router.post('/logout', authenticateToken, logout);

module.exports = router;

