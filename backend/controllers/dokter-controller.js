// backend/controllers/dokter-controller.js
// Controller Manajemen Dokter & Jadwal Praktik (sesuai FR-3, FR-6, US-4, apiguide.md, database.md, security.md)

const prisma = require('../config/prisma');

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

  const hasGaruda = jadwalParsed.cabangGaruda !== undefined
    ? jadwalParsed.cabangGaruda
    : (item.cabang ? item.cabang.toLowerCase().includes('garuda') : true);

  const hasMuchtar = jadwalParsed.cabangMuchtar !== undefined
    ? jadwalParsed.cabangMuchtar
    : (item.cabang ? item.cabang.toLowerCase().includes('muchtar') : false);

  return {
    id: item.id,
    nama: item.nama,
    spesialisasi: item.spesialisasi || '',
    cabang: item.cabang || '',
    status: item.status || 'Aktif',
    jadwal_json: item.jadwal_json,
    cabangGaruda: hasGaruda,
    cabangMuchtar: hasMuchtar,
    jadwalGaruda: jadwalParsed.jadwalGaruda || [],
    jadwalMuchtar: jadwalParsed.jadwalMuchtar || [],
    jadwal: jadwalParsed.jadwal || [],
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

    // Susun jadwal_json
    let jadwal_json = req.body.jadwal_json;
    if (!jadwal_json) {
      jadwal_json = {
        jadwal: req.body.jadwal || [],
        jadwalGaruda: req.body.jadwalGaruda || [],
        jadwalMuchtar: req.body.jadwalMuchtar || [],
        cabangGaruda: Boolean(req.body.cabangGaruda),
        cabangMuchtar: Boolean(req.body.cabangMuchtar),
      };
    }

    const newDoctor = await prisma.dokter.create({
      data: {
        nama: nama.trim(),
        spesialisasi: (spesialisasi || 'Dokter Gigi Umum').trim(),
        cabang: (cabang || 'Garuda').trim(),
        jadwal_json,
        status: status || 'Aktif',
      },
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
      req.body.jadwalGaruda ||
      req.body.jadwalMuchtar ||
      req.body.cabangGaruda !== undefined ||
      req.body.cabangMuchtar !== undefined
    ) {
      const currentJson = existingDoctor.jadwal_json && typeof existingDoctor.jadwal_json === 'object'
        ? existingDoctor.jadwal_json
        : {};

      dataToUpdate.jadwal_json = {
        ...currentJson,
        jadwal: req.body.jadwal !== undefined ? req.body.jadwal : currentJson.jadwal || [],
        jadwalGaruda: req.body.jadwalGaruda !== undefined ? req.body.jadwalGaruda : currentJson.jadwalGaruda || [],
        jadwalMuchtar: req.body.jadwalMuchtar !== undefined ? req.body.jadwalMuchtar : currentJson.jadwalMuchtar || [],
        cabangGaruda: req.body.cabangGaruda !== undefined ? Boolean(req.body.cabangGaruda) : currentJson.cabangGaruda,
        cabangMuchtar: req.body.cabangMuchtar !== undefined ? Boolean(req.body.cabangMuchtar) : currentJson.cabangMuchtar,
      };
    }

    const updatedDoctor = await prisma.dokter.update({
      where: { id },
      data: dataToUpdate,
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

    await prisma.dokter.delete({
      where: { id },
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

