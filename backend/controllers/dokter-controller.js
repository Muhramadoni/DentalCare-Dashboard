// backend/controllers/dokter-controller.js
// Controller Manajemen Dokter & Jadwal Praktik (sesuai FR-3, FR-6, US-4, apiguide.md, database.md, security.md)

const prisma = require('../config/prisma');
const { recordActivity } = require('../utils/activity-logger');

/**
 * Helper: Memformat item dokter dari Prisma untuk konsumsi frontend
 * Membongkar jadwal_json jika ada agar kompatibel dengan state frontend
 * @param {Object} item - Objek Dokter dari Prisma
 * @returns {Object}
 */
const formatDoctorItem = (item) => {
  let jadwalParsed = {};
  if (item.jadwal_json) {
    if (typeof item.jadwal_json === 'object') {
      if (Array.isArray(item.jadwal_json)) {
        jadwalParsed = { jadwal: item.jadwal_json };
      } else {
        jadwalParsed = item.jadwal_json;
      }
    }
  }

    const hasMuchtar = jadwalParsed.cabangMuchtar !== undefined
    ? jadwalParsed.cabangMuchtar
    : (item.cabang ? item.cabang.toLowerCase().includes('muchtar') : true);

  return {
    id: item.id,
    nama: item.nama,
    spesialisasi: item.spesialisasi || '',
    cabang: item.cabang || '',
    status: item.status || 'Aktif',
    jadwal_json: item.jadwal_json,
    cabangMuchtar: hasMuchtar,
    jadwalMuchtar: jadwalParsed.jadwalMuchtar || jadwalParsed.jadwal || [],
    jadwal: jadwalParsed.jadwal || jadwalParsed.jadwalMuchtar || [],
  };
};

/**
 * GET /api/v1/dokter
 * Mengambil daftar dokter dengan dukungan filter cabang dan status
 */
const getDokter = async (req, res, next) => {
  try {
    const { cabang, status, search } = req.query;

    const where = {};

    // Filter status jika diberikan
    if (status && status !== 'Semua Status') {
      where.status = status;
    }

    // Filter cabang jika diberikan
    if (cabang && cabang !== 'Semua Cabang') {
      where.cabang = {
        contains: cabang,
        mode: 'insensitive',
      };
    }

    // Filter pencarian nama dokter jika ada
    if (search && search.trim()) {
      where.nama = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const doctors = await prisma.dokter.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    const formattedDoctors = doctors.map(formatDoctorItem);

    return res.status(200).json({
      success: true,
      message: 'Daftar dokter berhasil diambil.',
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dokter/:id
 * Mengambil detail dokter berdasarkan ID
 */
const getDokterById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID dokter tidak valid.',
        },
      });
    }

    const doctor = await prisma.dokter.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data dokter tidak ditemukan.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data dokter berhasil diambil.',
      data: formatDoctorItem(doctor),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/dokter
 * Membuat dokter baru
 */
const createDokter = async (req, res, next) => {
  try {
    const { nama, spesialisasi, cabang, status } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nama dokter wajib diisi.',
          details: [{ field: 'nama', issue: 'Nama dokter tidak boleh kosong.' }],
        },
      });
    }

    // Validasi Anti Duplikasi Data Dokter
    const existingDoctor = await prisma.dokter.findFirst({
      where: {
        nama: { equals: nama.trim(), mode: 'insensitive' },
      },
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_DATA',
          message: `Duplikasi Data: Dokter dengan nama "${nama.trim()}" sudah pernah didaftarkan sebelumnya.`,
        },
      });
    }

    // Susun jadwal_json
    let jadwal_json = req.body.jadwal_json;
    if (!jadwal_json) {
      jadwal_json = {
        jadwal: req.body.jadwal || [],
        jadwalMuchtar: req.body.jadwalMuchtar || [],
        cabangMuchtar: Boolean(req.body.cabangMuchtar),
      };
    }

    const newDoctor = await prisma.dokter.create({
      data: {
        nama: nama.trim(),
        spesialisasi: (spesialisasi || 'Dokter Gigi Umum').trim(),
        cabang: (cabang || 'Muchtar').trim(),
        jadwal_json,
        status: status || 'Aktif',
      },
    });

    // Catat riwayat aktivitas admin hari ini (In-Memory)
    recordActivity({
      type: 'dokter',
      status: 'Tambah',
      deskripsi: `Menambahkan dokter baru: ${newDoctor.nama} (${newDoctor.spesialisasi || 'Dokter Gigi'})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Data dokter berhasil ditambahkan.',
      data: formatDoctorItem(newDoctor),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/dokter/:id
 * Memperbarui data dokter
 */
const updateDokter = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID dokter tidak valid.',
        },
      });
    }

    const existingDoctor = await prisma.dokter.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data dokter tidak ditemukan.',
        },
      });
    }

    const dataToUpdate = {};
    if (req.body.nama && req.body.nama.trim()) {
      dataToUpdate.nama = req.body.nama.trim();
    }
    if (req.body.spesialisasi !== undefined) {
      dataToUpdate.spesialisasi = req.body.spesialisasi.trim();
    }
    if (req.body.cabang !== undefined) {
      dataToUpdate.cabang = req.body.cabang.trim();
    }
    if (req.body.status !== undefined) {
      dataToUpdate.status = req.body.status.trim();
    }

    // Perbarui jadwal_json jika ada perubahan
    if (req.body.jadwal_json !== undefined) {
      dataToUpdate.jadwal_json = req.body.jadwal_json;
    } else if (
      req.body.jadwal ||
      req.body.jadwalMuchtar ||
      req.body.cabangMuchtar !== undefined
    ) {
      const currentJson = existingDoctor.jadwal_json && typeof existingDoctor.jadwal_json === 'object'
        ? existingDoctor.jadwal_json
        : {};

      dataToUpdate.jadwal_json = {
        ...currentJson,
        jadwal: req.body.jadwal !== undefined ? req.body.jadwal : currentJson.jadwal || [],
        jadwalMuchtar: req.body.jadwalMuchtar !== undefined ? req.body.jadwalMuchtar : currentJson.jadwalMuchtar || [],
        cabangMuchtar: req.body.cabangMuchtar !== undefined ? Boolean(req.body.cabangMuchtar) : currentJson.cabangMuchtar,
      };
    }

    const updatedDoctor = await prisma.dokter.update({
      where: { id },
      data: dataToUpdate,
    });

    // Catat riwayat aktivitas admin hari ini (In-Memory)
    recordActivity({
      type: 'dokter',
      status: 'Pembaruan',
      deskripsi: `Pembaruan data dokter: ${updatedDoctor.nama} (${updatedDoctor.status || 'Aktif'})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Data dokter berhasil diperbarui.',
      data: formatDoctorItem(updatedDoctor),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/dokter/:id
 * Menghapus data dokter
 */
const deleteDokter = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID dokter tidak valid.',
        },
      });
    }

    const existingDoctor = await prisma.dokter.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data dokter tidak ditemukan.',
        },
      });
    }

    // Ambil daftar ID pasien yang terhubung dengan dokter ini
    const relatedReservasis = await prisma.reservasi.findMany({
      where: { dokter_id: id },
      select: { pasien_id: true },
    });
    const relatedEmrs = await prisma.rekamMedis.findMany({
      where: { dokter_id: id },
      select: { pasien_id: true },
    });

    const candidatePatientIds = [
      ...new Set([
        ...relatedReservasis.map((r) => r.pasien_id),
        ...relatedEmrs.map((e) => e.pasien_id),
      ]),
    ];

    // Hapus data dokter (PostgreSQL CASCADE otomatis menghapus reservasi & rekam_medis dokter ini)
    await prisma.dokter.delete({
      where: { id },
    });

    // Bersihkan data pasien di tabel pasien jika pasien tersebut sudah tidak memiliki
    // reservasi maupun rekam medis lain (mencegah orphan record)
    for (const pId of candidatePatientIds) {
      const remainingReservasi = await prisma.reservasi.count({
        where: { pasien_id: pId },
      });
      const remainingEmr = await prisma.rekamMedis.count({
        where: { pasien_id: pId },
      });
      if (remainingReservasi === 0 && remainingEmr === 0) {
        await prisma.pasien.delete({
          where: { id: pId },
        }).catch(() => null);
      }
    }

    // Catat riwayat aktivitas admin hari ini (In-Memory)
    recordActivity({
      type: 'dokter',
      status: 'Menghapus',
      deskripsi: `Menghapus dokter: ${existingDoctor.nama}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Data dokter berhasil dihapus.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDokter,
  getDokterById,
  createDokter,
  updateDokter,
  deleteDokter,
};

