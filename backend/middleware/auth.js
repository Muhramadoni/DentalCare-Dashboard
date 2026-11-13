// backend/middleware/auth.js
// Middleware verifikasi JWT untuk proteksi endpoint (sesuai security.md Section 2)

const jwt = require('jsonwebtoken');

/**
 * Middleware: authenticateToken
 * Memverifikasi JWT dari header Authorization: Bearer <token>
 * Jika valid, menyuntikkan data user (id, email) ke req.user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        },
      });
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token tidak valid. Silakan login kembali.',
      },
    });
  }
};

module.exports = { authenticateToken };

