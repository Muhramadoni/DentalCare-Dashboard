// backend/controllers/auth-controller.js
// Controller Autentikasi: Login & Logout
// Sesuai panduan: apiguide.md, security.md, appflow.md (Alur 1: Autentikasi)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * POST /api/v1/auth/login
 * Autentikasi admin dengan email dan password
 * Mengembalikan JWT token jika berhasil
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Validasi input dasar ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email dan password wajib diisi.',
          details: [
            !email && { field: 'email', issue: 'Email tidak boleh kosong.' },
            !password && { field: 'password', issue: 'Password tidak boleh kosong.' },
          ].filter(Boolean),
        },
      });
    }

    // --- Validasi format email dasar ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Format email tidak valid.',
          details: [{ field: 'email', issue: 'Masukkan format email yang benar.' }],
        },
      });
    }

    // --- Cari user di database menggunakan Prisma (sesuai instruksi prompt) ---
    // AMAN: Prisma otomatis menggunakan Parameterized Queries (sesuai security.md 5.2)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // --- Verifikasi user & password ---
    // Gunakan pesan error generik untuk mencegah user enumeration attack
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Email atau password yang Anda masukkan salah.',
        },
      });
    }

    // Cocokkan password dengan hash di database menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Email atau password yang Anda masukkan salah.',
        },
      });
    }

    // --- Buat JWT Token ---
    // Payload hanya memuat data non-sensitif (sesuai security.md 2.2)
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256',
    });

    // --- Respons berhasil ---
    return res.status(200).json({
      success: true,
      message: 'Login berhasil. Selamat datang di IN DENTAL CARE Dashboard.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error); // Diteruskan ke errorHandler middleware
  }
};

/**
 * POST /api/v1/auth/logout
 * Mengakhiri sesi login
 * Karena menggunakan stateless JWT, logout cukup menghapus token di sisi client
 * Backend memberi konfirmasi untuk memandu frontend menghapus token
 */
const logout = async (req, res, next) => {
  try {
    // Dengan stateless JWT, invalidasi dilakukan di sisi client
    // Backend memberi respons konfirmasi bahwa logout diterima
    return res.status(200).json({
      success: true,
      message: 'Logout berhasil. Sampai jumpa!',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout };

