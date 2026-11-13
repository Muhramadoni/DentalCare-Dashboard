// backend/controllers/dashboard-controller.js
// Controller Ringkasan Utama Dashboard (sesuai FR-2, US-2, apiguide.md, database.md)

const prisma = require('../config/prisma');

/**
 * GET /api/v1/dashboard/summary
 * Mengambil rekap statistik harian:
 * - Total reservasi hari ini
 * - Rekap status reservasi ('Appointment' dan 'Reschedule')
 * - Jumlah dokter aktif
 * - Daftar reservasi terbaru untuk tabel ringkasan
 * - Riwayat aktivitas operasional
 */
const getSummary = async (req, res, next) => {
  try {
    // 1. Tentukan tanggal hari ini (jam 00:00:00:000)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. Jalankan query agregasi secara paralel (efisiensi respon <300ms sesuai Target G4 & NFR-1)
    const [
      totalReservasiHariIni,
      totalAppointment,
      totalReschedule,
      totalDokterAktif,
      daftarReservasi,
      dokterTerbaru
    ] = await Promise.all([
      // Total reservasi hari ini (sesuai instruksi prompt: prisma.reservasi.count)
      prisma.reservasi.count({
        where: {
          tanggal_reservasi: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Rekap status: jumlah status 'Appointment'
      prisma.reservasi.count({
        where: {
          status: 'Appointment',
        },
      }),

      // Rekap status: jumlah status 'Reschedule'
      prisma.reservasi.count({
        where: {
          status: 'Reschedule',
        },
      }),

      // Jumlah dokter aktif (sesuai instruksi prompt: prisma.dokter.count)
      prisma.dokter.count({
        where: {
          status: 'Aktif',
        },
      }),

      // Daftar reservasi untuk tabel overview (menggunakan select spesifik sesuai code_styles.md Bagian 7)
      prisma.reservasi.findMany({
        take: 15,
        orderBy: [
          { tanggal_reservasi: 'desc' },
          { id: 'desc' }
        ],
        select: {
          id: true,
          tanggal_reservasi: true,
          waktu_reservasi: true,
          status: true,
          pasien: {
            select: {
              id: true,
              nama: true,
            },
          },
          dokter: {
            select: {
              id: true,
              nama: true,
              spesialisasi: true,
              cabang: true,
            },
          },
        },
      }),

      // Ambil daftar dokter untuk menghasilkan riwayat aktivitas operasional terkini
      prisma.dokter.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          nama: true,
          cabang: true,
        },
      }),
    ]);

    // 3. Format daftar reservasi untuk dikonsumsi frontend
    const formattedReservasi = daftarReservasi.map((item) => {
      // Format tanggal DD-MM-YYYY
      const d = new Date(item.tanggal_reservasi);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      return {
        id: item.id,
        namaPasien: item.pasien?.nama || 'Pasien',
        jadwal: `${formattedDate} ${item.waktu_reservasi} WIB`,
        dokter: item.dokter?.nama || 'Dokter Umum',
        cabang: item.dokter?.cabang || '-',
        status: item.status,
      };
    });

    // 4. Susun riwayat aktivitas dinamis dari data transaksional terkini
    const riwayatAktivitas = [];

    // Aktivitas dari reservasi
    formattedReservasi.slice(0, 4).forEach((item, idx) => {
      riwayatAktivitas.push({
        id: `res-${item.id}`,
        type: 'status',
        deskripsi: `Pembaruan Reservasi: ${item.namaPasien} (${item.status})`,
        waktu: item.jadwal.split(' ')[1] || 'Hari ini',
      });
    });

    // Aktivitas dari dokter
    dokterTerbaru.slice(0, 3).forEach((item) => {
      riwayatAktivitas.push({
        id: `doc-${item.id}`,
        type: 'dokter',
        deskripsi: `Jadwal Praktik Dokter: ${item.nama} (${item.cabang || 'Klinik'})`,
        waktu: 'Aktif',
      });
    });

    // 5. Kembalikan respons terstandarisasi sesuai apiguide.md
    return res.status(200).json({
      success: true,
      message: 'Data ringkasan operasional dashboard berhasil diambil.',
      data: {
        totalReservasiHariIni,
        totalDokterAktif,
        rekapStatus: {
          appointment: totalAppointment,
          reschedule: totalReschedule,
        },
        daftarReservasi: formattedReservasi,
        riwayatAktivitas,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary };

