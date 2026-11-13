// backend/server.js
// Entry Point Server Express.js - IN DENTAL CARE Admin Dashboard Backend
// Sesuai: system_architecture_document.md, security.md, apiguide.md

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth-routes');
const dashboardRoutes = require('./routes/dashboard-routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE KEAMANAN (sesuai security.md Section 6 & 7)
// ============================================================

// 1. Helmet: Set HTTP Security Headers (X-Frame-Options, CSP, HSTS, dll)
app.use(helmet());

// 2. CORS: Izinkan hanya origin yang terdaftar (sesuai security.md 7.1)
const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, curl) di development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin tidak diizinkan oleh kebijakan CORS IN DENTAL CARE.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
};
app.use(cors(corsOptions));

// 3. JSON Parser: Baca req.body sebagai JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Global Rate Limiter: Maks 100 req/menit per IP (sesuai apiguide.md Section 8)
app.use('/api/', globalRateLimiter);

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IN DENTAL CARE Backend API berjalan normal.',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
});

// ============================================================
// ROUTES API (Base: /api/v1 sesuai apiguide.md Section 2.1)
// ============================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ============================================================
// ERROR HANDLERS (harus di akhir, setelah semua route)
// ============================================================
app.use(notFoundHandler); // 404 untuk route yang tidak ada
app.use(errorHandler);    // Global error handler

// ============================================================
// START SERVER
// ============================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log(`Status  : Berjalan`);
    console.log(`Port    : ${PORT}`);
    console.log(`Mode    : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Base URL: http://localhost:${PORT}/api/v1`);
    console.log('');
  });
}

module.exports = app;

