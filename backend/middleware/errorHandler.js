// backend/middleware/errorHandler.js
// Centralized Error Handler Middleware (sesuai apiguide.md Section 7)

/**
 * Global Error Handler - harus didaftarkan TERAKHIR di Express app
 * Mencegah stack trace bocor ke client di production (sesuai security.md Section 10.2)
 */
const errorHandler = (err, req, res, next) => {
  // Log error detail di server (hanya untuk developer, tidak dikirim ke client)
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Error dari Prisma: Record tidak ditemukan
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Data yang diminta tidak ditemukan.',
      },
    });
  }

  // Error dari Prisma: Unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Data sudah ada di sistem.',
      },
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token tidak valid atau sudah kadaluarsa.',
      },
    });
  }

  // Default: Internal Server Error (sembunyikan detail di production)
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan internal pada sistem. Silakan hubungi administrator.'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
  });
};

/**
 * 404 Not Found Handler - untuk route yang tidak terdaftar
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
    },
  });
};

module.exports = { errorHandler, notFoundHandler };

