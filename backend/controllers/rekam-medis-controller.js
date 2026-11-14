// backend/controllers/rekam-medis-controller.js
// Controller Manajemen Rekam Medis Elektronik (EMR) Pasien
// Mengacu pada: FR-4, FR-7, US-5, US-6, apiguide.md, database.md, security.md

const prisma = require('../config/prisma');
const { sanitizeText } = require('../utils/sanitizer');

/**
 * Helper: Mengonversi string tanggal ke format Date UTC murni (00:00:00 UTC)
 * untuk kolom PostgreSQL @db.Date agar bebas masalah zona waktu
 * @param {string} str - String tanggal (YYYY-MM-DD atau DD-MM-YYYY)
 * @returns {Date}
 */
const parseEmrDate = (str) => {
  if (!str) return new Date();

  const clean = String(str).trim();

  // Format DD-MM-YYYY (contoh: 21-05-2026)
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(clean)) {
    const [day, month, year] = clean.split('-');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`);
  }

  // Format YYYY-MM-DD (contoh: 2026-05-21)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return new Date(`${clean}T00:00:00.000Z`);
  }

  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Helper: Memformat item EMR dari Prisma untuk konsumsi frontend
 * @param {Object} item - Objek RekamMedis dari Prisma dengan include pasien & dokter
 * @returns {Object}
 */
const formatEmrItem = (item) => {
  const d = new Date(item.tanggal_rekam);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  const formattedDate = `${month}-${day}-${year}`;
  const isoDate = `${year}-${month}-${day}`;

  return {
    id: item.id,
    pasien_id: item.pasien_id,
    dokter_id: item.dokter_id,
    namaPasien: item.pasien?.nama || 'Pasien',
    dokter: item.dokter?.nama || 'Dokter',
    tanggal: formattedDate,
    tanggalIso: isoDate,
    tanggal_rekam: item.tanggal_rekam,
    regio: item.regio || '-',
    anamnesa: item.anamnesa || '-',
    tindakan: item.tindakan || '-',
    resep: item.resep || '-',
    terapi: item.terapi || '-',
    pasien: item.pasien,
    dokterDetail: item.dokter,
  };
};

/**
 * GET /api/v1/rekam-medis
 * Mengambil daftar rekam medis dengan dukungan:
 * - Pencarian nama pasien, dokter, diagnosa/anamnesa, tindakan (`search`)
 * - Filter dokter (`dokter_id` atau `dokter`)
 * - Filter nama pasien (`pasien` atau `pasien_id`)
 * - Filter rentang tanggal (`startDate`, `endDate`)
 */
const getRekamMedis = async (req, res, next) => {
  try {
    const { search, dokter, dokter_id, pasien, pasien_id, startDate, endDate } = req.query;

    const where = {};

    // 1. Filter Pencarian Cepat (<10 detik sesuai Target G3)
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { pasien: { nama: { contains: q, mode: 'insensitive' } } },
        { dokter: { nama: { contains: q, mode: 'insensitive' } } },
        { anamnesa: { contains: q, mode: 'insensitive' } },
        { tindakan: { contains: q, mode: 'insensitive' } },
        { regio: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 2. Filter Dokter
    if (dokter_id && !isNaN(Number(dokter_id))) {
      where.dokter_id = Number(dokter_id);
    } else if (dokter && dokter !== 'Semua Dokter') {
      where.dokter = {
        nama: {
          contains: dokter.trim(),
          mode: 'insensitive',
        },
      };
    }

    // 3. Filter Pasien
    if (pasien_id && !isNaN(Number(pasien_id))) {
      where.pasien_id = Number(pasien_id);
    } else if (pasien && pasien !== 'Semua Pasien') {
      where.pasien = {
        nama: {
          equals: pasien.trim(),
          mode: 'insensitive',
        },
      };
    }

    // 4. Filter Rentang Tanggal
    if (startDate || endDate) {
      where.tanggal_rekam = {};
      if (startDate) {
        where.tanggal_rekam.gte = parseEmrDate(startDate);
      }
      if (endDate) {
        const endD = parseEmrDate(endDate);
        endD.setUTCDate(endD.getUTCDate() + 1);
        where.tanggal_rekam.lt = endD;
      }
    }

    const records = await prisma.rekamMedis.findMany({
      where,
      include: {
        pasien: {
          select: { id: true, nama: true },
        },
        dokter: {
          select: { id: true, nama: true, spesialisasi: true, cabang: true },
        },
      },
      orderBy: [
        { tanggal_rekam: 'desc' },
        { id: 'desc' },
      ],
    });

    const formattedRecords = records.map(formatEmrItem);

    return res.status(200).json({
      success: true,
      message: 'Daftar rekam medis berhasil diambil.',
      data: formattedRecords,
      meta: {
        total: formattedRecords.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rekam-medis/:id
 * Mengambil detail 1 data rekam medis berdasarkan ID
 */
const getRekamMedisById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID rekam medis tidak valid.',
        },
      });
    }

    const item = await prisma.rekamMedis.findUnique({
      where: { id },
      include: {
        pasien: {
          select: { id: true, nama: true },
        },
        dokter: {
          select: { id: true, nama: true, spesialisasi: true, cabang: true },
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Data rekam medis dengan ID ${id} tidak ditemukan.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data rekam medis berhasil ditemukan.',
      data: formatEmrItem(item),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/rekam-medis
 * Menyimpan data rekam medis baru ke database
 * Dilengkapi sanitasi XSS pada teks bebas: anamnesa, tindakan, resep, terapi, regio
 */
const createRekamMedis = async (req, res, next) => {
  try {
    const namaPasien = req.body.namaPasien || req.body.pasien_nama || req.body.pasien;
    const pasienId = req.body.pasien_id || req.body.pasienId;
    const dokterNama = req.body.dokter_nama || req.body.dokter || req.body.doctorName;
    const dokterId = req.body.dokter_id || req.body.dokterId;
    const tanggalRekam = req.body.tanggal_rekam || req.body.tanggal || req.body.visitDate;

    // 1. Validasi input wajib
    if ((!namaPasien || !namaPasien.trim()) && !pasienId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nama pasien atau ID pasien wajib diisi.',
          details: [{ field: 'namaPasien', issue: 'Silakan pilih atau ketik nama pasien.' }],
        },
      });
    }

    if (!tanggalRekam) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tanggal rekam medis wajib diisi.',
          details: [{ field: 'tanggal', issue: 'Silakan isi tanggal rekam medis.' }],
        },
      });
    }

    if (!dokterNama && !dokterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dokter pemeriksa wajib dipilih.',
          details: [{ field: 'dokter', issue: 'Silakan pilih dokter pemeriksa.' }],
        },
      });
    }

    // 2. Sanitasi teks bebas untuk mencegah XSS (sesuai security.md Section 5.3)
    const cleanRegio = sanitizeText(req.body.regio || req.body.toothRegion);
    const cleanAnamnesa = sanitizeText(req.body.anamnesa || req.body.anamnesis);
    const cleanTindakan = sanitizeText(req.body.tindakan || req.body.procedure);
    const cleanResep = sanitizeText(req.body.resep || req.body.prescription);
    const cleanTerapi = sanitizeText(req.body.terapi || req.body.therapy);

    // 3. Cari atau buat pasien via prisma.pasien.findFirst / create
    let pasien = null;
    if (pasienId && !isNaN(Number(pasienId))) {
      pasien = await prisma.pasien.findUnique({ where: { id: Number(pasienId) } });
    }

    if (!pasien && namaPasien && namaPasien.trim()) {
      const cleanName = namaPasien.trim();
      pasien = await prisma.pasien.findFirst({
        where: {
          nama: { equals: cleanName, mode: 'insensitive' },
        },
      });

      if (!pasien) {
        pasien = await prisma.pasien.create({
          data: { nama: cleanName },
        });
      }
    }

    if (!pasien) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data pasien tidak valid.',
        },
      });
    }

    // Validasi: Pasien berstatus Reschedule tidak dapat dibuatkan rekam medis
    const latestRes = await prisma.reservasi.findFirst({
      where: { pasien_id: pasien.id },
      orderBy: { id: 'desc' },
      select: { status: true },
    });
    if (latestRes && latestRes.status?.toLowerCase() === 'reschedule') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Pasien "${pasien.nama}" sedang berstatus Reschedule dan belum dapat mengisi rekam medis.`,
          details: [{ field: 'namaPasien', issue: 'Pasien berstatus Reschedule.' }],
        },
      });
    }

    // 4. Cari dokter pemeriksa
    let dokter = null;
    if (dokterId && !isNaN(Number(dokterId))) {
      dokter = await prisma.dokter.findUnique({ where: { id: Number(dokterId) } });
    }

    if (!dokter && dokterNama && dokterNama.trim()) {
      const cleanDocName = dokterNama.trim();
      dokter = await prisma.dokter.findFirst({
        where: {
          nama: { equals: cleanDocName, mode: 'insensitive' },
        },
      });

      // Jika dokter belum ada di database, buat master dokter baru secara otomatis
      if (!dokter) {
        dokter = await prisma.dokter.create({
          data: {
            nama: cleanDocName,
            spesialisasi: 'Dokter Gigi Umum',
            cabang: 'Garuda',
            status: 'Aktif',
          },
        });
      }
    }

    if (!dokter) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dokter pemeriksa tidak valid.',
        },
      });
    }

    // 5. Simpan ke database via prisma.rekamMedis.create
    const parsedDate = parseEmrDate(tanggalRekam);

    const newEmr = await prisma.rekamMedis.create({
      data: {
        pasien_id: pasien.id,
        dokter_id: dokter.id,
        tanggal_rekam: parsedDate,
        regio: cleanRegio || null,
        anamnesa: cleanAnamnesa || null,
        tindakan: cleanTindakan || null,
        resep: cleanResep || null,
        terapi: cleanTerapi || null,
      },
      include: {
        pasien: { select: { id: true, nama: true } },
        dokter: { select: { id: true, nama: true, spesialisasi: true, cabang: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Data rekam medis berhasil disimpan.',
      data: formatEmrItem(newEmr),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/rekam-medis/:id
 * Memperbarui data rekam medis
 * Dilengkapi sanitasi XSS pada teks bebas
 */
const updateRekamMedis = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID rekam medis tidak valid.',
        },
      });
    }

    const existingEmr = await prisma.rekamMedis.findUnique({
      where: { id },
      include: { pasien: true, dokter: true },
    });

    if (!existingEmr) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Data rekam medis dengan ID ${id} tidak ditemukan.`,
        },
      });
    }

    const dataToUpdate = {};

    // 1. Sanitasi dan update data klinis jika ada
    if (req.body.regio !== undefined) {
      dataToUpdate.regio = sanitizeText(req.body.regio) || null;
    }
    if (req.body.anamnesa !== undefined) {
      dataToUpdate.anamnesa = sanitizeText(req.body.anamnesa) || null;
    }
    if (req.body.tindakan !== undefined) {
      dataToUpdate.tindakan = sanitizeText(req.body.tindakan) || null;
    }
    if (req.body.resep !== undefined) {
      dataToUpdate.resep = sanitizeText(req.body.resep) || null;
    }
    if (req.body.terapi !== undefined) {
      dataToUpdate.terapi = sanitizeText(req.body.terapi) || null;
    }

    // 2. Perbarui tanggal jika ada
    if (req.body.tanggal_rekam || req.body.tanggal) {
      dataToUpdate.tanggal_rekam = parseEmrDate(req.body.tanggal_rekam || req.body.tanggal);
    }

    // 3. Perbarui pasien jika nama pasien diganti
    const namaPasien = req.body.namaPasien || req.body.pasien_nama || req.body.pasien;
    if (namaPasien && namaPasien.trim() && namaPasien.trim() !== existingEmr.pasien?.nama) {
      const cleanName = namaPasien.trim();
      let pasien = await prisma.pasien.findFirst({
        where: { nama: { equals: cleanName, mode: 'insensitive' } },
      });
      if (!pasien) {
        pasien = await prisma.pasien.create({ data: { nama: cleanName } });
      }
      dataToUpdate.pasien_id = pasien.id;
    } else if (req.body.pasien_id && Number(req.body.pasien_id) > 0) {
      dataToUpdate.pasien_id = Number(req.body.pasien_id);
    }

    // 4. Perbarui dokter jika diganti
    const dokterNama = req.body.dokter_nama || req.body.dokter;
    if (dokterNama && dokterNama.trim() && dokterNama.trim() !== existingEmr.dokter?.nama) {
      const cleanDoc = dokterNama.trim();
      let dokter = await prisma.dokter.findFirst({
        where: { nama: { equals: cleanDoc, mode: 'insensitive' } },
      });
      if (!dokter) {
        dokter = await prisma.dokter.create({
          data: { nama: cleanDoc, spesialisasi: 'Dokter Gigi Umum', cabang: 'Garuda', status: 'Aktif' },
        });
      }
      dataToUpdate.dokter_id = dokter.id;
    } else if (req.body.dokter_id && Number(req.body.dokter_id) > 0) {
      dataToUpdate.dokter_id = Number(req.body.dokter_id);
    }

    const updatedEmr = await prisma.rekamMedis.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pasien: { select: { id: true, nama: true } },
        dokter: { select: { id: true, nama: true, spesialisasi: true, cabang: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Data rekam medis berhasil diperbarui.',
      data: formatEmrItem(updatedEmr),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/rekam-medis/:id
 * Menghapus data rekam medis berdasarkan ID
 */
const deleteRekamMedis = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID rekam medis tidak valid.',
        },
      });
    }

    const existing = await prisma.rekamMedis.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Data rekam medis dengan ID ${id} tidak ditemukan.`,
        },
      });
    }

    await prisma.rekamMedis.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Data rekam medis berhasil dihapus.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rekam-medis/patients
 * Mengambil daftar pasien beserta tanggal reservasi dan dokter pemeriksa terkait untuk auto-fill pada form EMR
 */
const getPatients = async (req, res, next) => {
  try {
    const patients = await prisma.pasien.findMany({
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
        reservasi: {
          orderBy: [
            { tanggal_reservasi: 'desc' },
            { id: 'desc' },
          ],
          select: {
            id: true,
            status: true,
            tanggal_reservasi: true,
            dokter_id: true,
            dokter: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        rekam_medis: {
          orderBy: [
            { tanggal_rekam: 'desc' },
            { id: 'desc' },
          ],
          take: 1,
          select: {
            id: true,
            tanggal_rekam: true,
            dokter: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    const data = patients.map((p) => {
      // Prioritas 1: Ambil data reservasi terbaru pasien
      const latestReservasi = p.reservasi && p.reservasi.length > 0 ? p.reservasi[0] : null;
      const isRescheduled = latestReservasi
        ? String(latestReservasi.status).toLowerCase() === 'reschedule'
        : false;

      let tanggalIso = '';
      let dokterNama = '';
      let dokterId = null;

      if (latestReservasi) {
        if (latestReservasi.tanggal_reservasi) {
          const d = new Date(latestReservasi.tanggal_reservasi);
          const day = String(d.getUTCDate()).padStart(2, '0');
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const year = d.getUTCFullYear();
          tanggalIso = `${year}-${month}-${day}`;
        }
        if (latestReservasi.dokter) {
          dokterNama = latestReservasi.dokter.nama;
          dokterId = latestReservasi.dokter.id;
        }
      } else if (p.rekam_medis && p.rekam_medis.length > 0) {
        // Fallback: Gunakan data rekam medis terakhir jika belum ada reservasi baru
        const latestEmr = p.rekam_medis[0];
        if (latestEmr.tanggal_rekam) {
          const d = new Date(latestEmr.tanggal_rekam);
          const day = String(d.getUTCDate()).padStart(2, '0');
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const year = d.getUTCFullYear();
          tanggalIso = `${year}-${month}-${day}`;
        }
        if (latestEmr.dokter) {
          dokterNama = latestEmr.dokter.nama;
          dokterId = latestEmr.dokter.id;
        }
      }

      return {
        id: p.id,
        nama: p.nama,
        status: latestReservasi?.status || 'Appointment',
        isRescheduled,
        tanggal: tanggalIso,
        dokter: dokterNama,
        dokter_id: dokterId,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar pasien berhasil diambil.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRekamMedis,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  deleteRekamMedis,
  getPatients,
};

