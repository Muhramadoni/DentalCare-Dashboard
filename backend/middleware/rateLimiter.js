// backend/middleware/rateLimiter.js
// Rate Limiter untuk proteksi endpoint login dari brute-force (sesuai security.md Section 4)

const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter untuk endpoint login:
 * Maksimal 5 percobaan gagal dalam 15 menit per IP
 * Sesuai security.md Section 4 & apiguide.md Section 8
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit dalam milidetik
  max: 5, // Maksimal 5 request per window per IP
  standardHeaders: true, // Kirim X-RateLimit-* headers standar
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Hanya hitung request yang gagal (non-2xx)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message:
        'Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 15 menit.',
    },
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter global untuk seluruh endpoint API:
 * Maksimal 100 request per menit per IP
 * Sesuai apiguide.md Section 8
 */
const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak permintaan. Silakan coba lagi setelah beberapa saat.',
    },
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

module.exports = { loginRateLimiter, globalRateLimiter };

