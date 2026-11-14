// backend/controllers/reservasi-controller.js
// Controller Manajemen Reservasi Pasien (sesuai FR-3, FR-6, US-3, apiguide.md, database.md, security.md)

const prisma = require('../config/prisma');
const { recordActivity } = require('../utils/activity-logger');

/**
 * Helper: Mengurai format tanggal masukan menjadi objek Date yang valid
 * Mendukung format YYYY-MM-DD, DD-MM-YYYY, atau ISO string
 * @param {string|Date} dateInput
 * @returns {Date}
 */
const parseReservationDate = (dateInput) => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  const str = String(dateInput).trim();

  // Format DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [day, month, year] = str.split('-');
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(`${str}T00:00:00.000Z`);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Helper: Memformat item reservasi dari Prisma untuk konsumsi frontend
 * @param {Object} item - Objek Reservasi dari Prisma dengan include pasien & dokter
 * @returns {Object}
 */
const formatReservasiItem = (item) => {
  const d = new Date(item.tanggal_reservasi);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  const isoDate = `${year}-${month}-${day}`;

  return {
    id: item.id,
    pasien_id: item.pasien_id,
    dokter_id: item.dokter_id,
    namaPasien: item.pasien?.nama || 'Pasien',
    dokter: item.dokter?.nama || 'Dokter',
    tanggal: formattedDate,
    tanggalIso: isoDate,
    tanggal_reservasi: item.tanggal_reservasi,
    waktu: item.waktu_reservasi,
    waktu_reservasi: item.waktu_reservasi,
    jadwal: `${formattedDate} ${item.waktu_reservasi}`,
    status: item.status,
    pasien: item.pasien,
    dokterDetail: item.dokter,
  };
};

/**
 * GET /api/v1/reservasi
 * Mengambil daftar reservasi menggunakan prisma.reservasi.findMany
 * Mendukung filter tanggal_reservasi, status, dan pencarian nama pasien
 */
const getReservasi = async (req, res, next) => {
  try {
    const { tanggal_reservasi, status, search } = req.query;

    const where = {};

    // Filter status ('Appointment' atau 'Reschedule')
    if (status && status !== 'Semua Status') {
      where.status = status;
    }

    // Filter tanggal_reservasi spesifik
    if (tanggal_reservasi) {
      const targetDate = parseReservationDate(tanggal_reservasi);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.tanggal_reservasi = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter pencarian nama pasien (case-insensitive)
    if (search && search.trim()) {
      where.pasien = {
        nama: {
          contains: search.trim(),
          mode: 'insensitive',
        },
      };
    }

    const reservasiList = await prisma.reservasi.findMany({
      where,
      include: {
        pasien: true,
        dokter: true,
      },
      orderBy: [
        { tanggal_reservasi: 'desc' },
        { id: 'desc' },
      ],
    });

    const formattedData = reservasiList.map(formatReservasiItem);

    return res.status(200).json({
      success: true,
      message: 'Daftar reservasi berhasil diambil.',
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/reservasi
 * Membuat reservasi baru:
 * 1. Cek apakah nama pasien sudah ada via prisma.pasien.findFirst, jika belum buat via prisma.pasien.create
 * 2. Cek dokter pemeriksa (berdasarkan dokter_id atau nama dokter)
 * 3. Simpan reservasi via prisma.reservasi.create
 */
const createReservasi = async (req, res, next) => {
  try {
    const namaPasien = req.body.nama_pasien || req.body.namaPasien || req.body.nama;
    const tanggalReservasi = req.body.tanggal_reservasi || req.body.tanggalReservasi || req.body.tanggal;
    const waktuReservasi = req.body.waktu_reservasi || req.body.waktuReservasi || req.body.waktu;
    const dokterId = req.body.dokter_id || req.body.dokterId;
    const dokterNama = req.body.dokter_nama || req.body.dokterNama || req.body.dokter;
    const cabang = req.body.cabang;
    const status = req.body.status || 'Appointment';

    // 1. Validasi input wajib
    if (!namaPasien || !namaPasien.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nama pasien wajib diisi.',
          details: [{ field: 'namaPasien', issue: 'Nama pasien tidak boleh kosong.' }],
        },
      });
    }

    if (!tanggalReservasi) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tanggal reservasi wajib diisi.',
          details: [{ field: 'tanggalReservasi', issue: 'Tanggal reservasi tidak boleh kosong.' }],
        },
      });
    }

    if (!waktuReservasi || !waktuReservasi.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Waktu reservasi wajib diisi.',
          details: [{ field: 'waktuReservasi', issue: 'Waktu reservasi tidak boleh kosong.' }],
        },
      });
    }

    // 2. Cek atau buat data pasien via prisma.pasien.findFirst & create
    const cleanPatientName = namaPasien.trim();
    let pasien = await prisma.pasien.findFirst({
      where: {
        nama: {
          equals: cleanPatientName,
          mode: 'insensitive',
        },
      },
    });

    if (!pasien) {
      pasien = await prisma.pasien.create({
        data: {
          nama: cleanPatientName,
        },
      });
    }

    // 3. Tentukan dokter pemeriksa
    let selectedDokter = null;
    const docIdNum = Number(dokterId);
    if (!isNaN(docIdNum) && docIdNum > 0) {
      selectedDokter = await prisma.dokter.findUnique({
        where: { id: docIdNum },
      });
    }

    if (!selectedDokter && dokterNama && dokterNama.trim()) {
      const cleanDoctorName = dokterNama.trim();
      selectedDokter = await prisma.dokter.findFirst({
        where: {
          nama: {
            equals: cleanDoctorName,
            mode: 'insensitive',
          },
        },
      });

      if (!selectedDokter) {
        selectedDokter = await prisma.dokter.create({
          data: {
            nama: cleanDoctorName,
            spesialisasi: 'Dokter Gigi Umum',
            cabang: cabang || 'Garuda',
            status: 'Aktif',
          },
        });
      }
    }

    // Jika dokter belum terpilih, fallback ke dokter aktif yang ada atau buat default
    if (!selectedDokter) {
      selectedDokter = await prisma.dokter.findFirst({
        where: { status: 'Aktif' },
      });

      if (!selectedDokter) {
        selectedDokter = await prisma.dokter.create({
          data: {
            nama: 'drg. Indira Nugrahani',
            spesialisasi: 'Konservasi Gigi (Sp.KG)',
            cabang: cabang || 'Garuda',
            status: 'Aktif',
          },
        });
      }
    }

    // 4. Simpan reservasi via prisma.reservasi.create
    const parsedDate = parseReservationDate(tanggalReservasi);
    const validStatus = status === 'Reschedule' ? 'Reschedule' : 'Appointment';

    const newReservasi = await prisma.reservasi.create({
      data: {
        pasien_id: pasien.id,
        dokter_id: selectedDokter.id,
        tanggal_reservasi: parsedDate,
        waktu_reservasi: waktuReservasi.trim(),
        status: validStatus,
      },
      include: {
        pasien: true,
        dokter: true,
      },
    });

    const formattedData = formatReservasiItem(newReservasi);

    // Catat riwayat aktivitas real-time: status 'Tambah'
    recordActivity({
      type: 'reservasi',
      status: 'Tambah',
      deskripsi: `Menambahkan reservasi pasien: ${newReservasi.pasien?.nama || 'Pasien'} (${newReservasi.status})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Reservasi berhasil dibuat.',
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/reservasi/:id
 * Memperbarui data via prisma.reservasi.update
 * (mengubah waktu atau status 'Appointment'/'Reschedule', tanggal, dokter, atau nama pasien)
 */
const updateReservasi = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID reservasi tidak valid.',
        },
      });
    }

    const existing = await prisma.reservasi.findUnique({
      where: { id },
      include: { pasien: true, dokter: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data reservasi tidak ditemukan.',
        },
      });
    }

    const dataToUpdate = {};

    // 1. Update waktu_reservasi
    const waktuInput = req.body.waktu_reservasi || req.body.waktuReservasi || req.body.waktu;
    if (waktuInput && waktuInput.trim()) {
      dataToUpdate.waktu_reservasi = waktuInput.trim();
    }

    // 2. Update status ('Appointment' atau 'Reschedule')
    if (req.body.status) {
      if (['Appointment', 'Reschedule'].includes(req.body.status)) {
        dataToUpdate.status = req.body.status;
      }
    }

    // 3. Update tanggal_reservasi jika disediakan
    const tanggalInput = req.body.tanggal_reservasi || req.body.tanggalReservasi || req.body.tanggal;
    if (tanggalInput) {
      dataToUpdate.tanggal_reservasi = parseReservationDate(tanggalInput);
    }

    // 4. Update dokter jika disediakan
    const dokterIdInput = req.body.dokter_id || req.body.dokterId;
    const dokterNamaInput = req.body.dokter_nama || req.body.dokterNama || req.body.dokter;

    if (dokterIdInput) {
      const docIdNum = Number(dokterIdInput);
      if (!isNaN(docIdNum) && docIdNum > 0) {
        dataToUpdate.dokter_id = docIdNum;
      }
    } else if (dokterNamaInput && dokterNamaInput.trim()) {
      const cleanDoctorName = dokterNamaInput.trim();
      let doc = await prisma.dokter.findFirst({
        where: {
          nama: {
            equals: cleanDoctorName,
            mode: 'insensitive',
          },
        },
      });

      if (!doc) {
        doc = await prisma.dokter.create({
          data: {
            nama: cleanDoctorName,
            spesialisasi: 'Dokter Gigi Umum',
            cabang: req.body.cabang || 'Garuda',
            status: 'Aktif',
          },
        });
      }
      dataToUpdate.dokter_id = doc.id;
    }

    // 5. Update nama pasien jika diubah
    const namaPasienInput = req.body.nama_pasien || req.body.namaPasien || req.body.nama;
    if (namaPasienInput && namaPasienInput.trim()) {
      const cleanPatientName = namaPasienInput.trim();
      let pasien = await prisma.pasien.findFirst({
        where: {
          nama: {
            equals: cleanPatientName,
            mode: 'insensitive',
          },
        },
      });

      if (!pasien) {
        pasien = await prisma.pasien.create({
          data: {
            nama: cleanPatientName,
          },
        });
      }
      dataToUpdate.pasien_id = pasien.id;
    }

    const updatedReservasi = await prisma.reservasi.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pasien: true,
        dokter: true,
      },
    });

    const formattedData = formatReservasiItem(updatedReservasi);

    // Catat riwayat aktivitas real-time: status 'Pembaruan'
    recordActivity({
      type: 'reservasi',
      status: 'Pembaruan',
      deskripsi: `Pembaruan reservasi pasien: ${updatedReservasi.pasien?.nama || 'Pasien'} (${updatedReservasi.status})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Data reservasi berhasil diperbarui.',
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/reservasi/:id
 * Menghapus data reservasi via prisma.reservasi.delete({ where: { id: Number(id) } })
 */
const deleteReservasi = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID reservasi tidak valid.',
        },
      });
    }

    const existing = await prisma.reservasi.findUnique({
      where: { id },
      include: {
        pasien: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data reservasi tidak ditemukan.',
        },
      });
    }

    const patientName = existing.pasien?.nama || 'Pasien';

    await prisma.reservasi.delete({
      where: { id },
    });

    // Catat riwayat aktivitas real-time: status 'Menghapus'
    recordActivity({
      type: 'reservasi',
      status: 'Menghapus',
      deskripsi: `Menghapus reservasi pasien: ${patientName}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Data reservasi berhasil dihapus.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reservasi/doctors
 * Mengambil daftar dokter aktif untuk pilihan dropdown pada form reservasi
 */
const getDoctors = async (req, res, next) => {
  try {
    // Ambil daftar dokter aktif beserta jadwal praktiknya
    const doctors = await prisma.dokter.findMany({
      where: { status: 'Aktif' },
      select: {
        id: true,
        nama: true,
        spesialisasi: true,
        cabang: true,
        status: true,
        jadwal_json: true,
      },
      orderBy: { id: 'asc' },
    });

    const formattedDoctors = doctors.map((doc) => {
      let jadwalList = [];
      let garudaList = [];
      let muchtarList = [];

      if (doc.jadwal_json && typeof doc.jadwal_json === 'object') {
        if (Array.isArray(doc.jadwal_json)) {
          jadwalList = doc.jadwal_json;
        } else {
          garudaList = Array.isArray(doc.jadwal_json.jadwalGaruda) ? doc.jadwal_json.jadwalGaruda : [];
          muchtarList = Array.isArray(doc.jadwal_json.jadwalMuchtar) ? doc.jadwal_json.jadwalMuchtar : [];
          if (Array.isArray(doc.jadwal_json.jadwal) && doc.jadwal_json.jadwal.length > 0) {
            jadwalList = doc.jadwal_json.jadwal;
          } else {
            jadwalList = [...garudaList, ...muchtarList];
          }
        }
      }

      return {
        id: doc.id,
        nama: doc.nama,
        spesialisasi: doc.spesialisasi || '',
        cabang: doc.cabang || '',
        status: doc.status || 'Aktif',
        jadwal_json: doc.jadwal_json,
        jadwal: jadwalList,
        jadwalGaruda: garudaList,
        jadwalMuchtar: muchtarList,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar dokter berhasil diambil.',
      data: formattedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReservasi,
  createReservasi,
  updateReservasi,
  deleteReservasi,
  getDoctors,
};

