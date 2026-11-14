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
    // 1. Tentukan tanggal hari ini (format YYYY-MM-DD sesuai waktu lokal)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    // Gunakan tanggal UTC 00:00:00 agar cocok sempurna dengan kolom PostgreSQL @db.Date
    const todayUtc = new Date(`${todayDateStr}T00:00:00.000Z`);
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);

    // 2. Jalankan query agregasi secara paralel (efisiensi respon <300ms sesuai Target G4 & NFR-1)
    const [
      totalReservasiHariIni,
      totalAppointment,
      totalReschedule,
      dokterAktifList,
      daftarReservasi,
      dokterTerbaru
    ] = await Promise.all([
      // Total reservasi hari ini: hanya menghitung reservasi dengan tanggal_reservasi hari ini (otomatis reset = 0 besoknya)
      prisma.reservasi.count({
        where: {
          tanggal_reservasi: {
            gte: todayUtc,
            lt: tomorrowUtc,
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

      // Ambil daftar dokter aktif beserta jadwal untuk memfilter dokter yang praktik pada hari ini
      prisma.dokter.findMany({
        where: {
          status: 'Aktif',
        },
        select: {
          id: true,
          nama: true,
          jadwal_json: true,
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

    // 4. Hitung dokter yang memiliki jadwal praktik pada hari ini
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = daysIndo[now.getDay()].toLowerCase();

    const dokterPraktikHariIni = dokterAktifList.filter((doc) => {
      let schedules = [];
      if (doc.jadwal_json && typeof doc.jadwal_json === 'object') {
        if (Array.isArray(doc.jadwal_json)) {
          schedules = doc.jadwal_json;
        } else {
          const garuda = Array.isArray(doc.jadwal_json.jadwalGaruda) ? doc.jadwal_json.jadwalGaruda : [];
          const muchtar = Array.isArray(doc.jadwal_json.jadwalMuchtar) ? doc.jadwal_json.jadwalMuchtar : [];
          if (Array.isArray(doc.jadwal_json.jadwal) && doc.jadwal_json.jadwal.length > 0) {
            schedules = doc.jadwal_json.jadwal;
          } else {
            schedules = [...garuda, ...muchtar];
          }
        }
      }

      if (schedules.length === 0) return false;

      return schedules.some((s) => {
        if (!s || !s.hari) return false;
        const cleanDay = String(s.hari).replace(':', '').trim().toLowerCase();
        return cleanDay === todayName;
      });
    });

    const totalDokterPraktikHariIni = dokterPraktikHariIni.length;

    // 5. Susun riwayat aktivitas dinamis dari data transaksional terkini
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

    // Aktivitas dari dokter yang berpraktik hari ini (atau dokter terbaru)
    const dokterAktivitasSource = dokterPraktikHariIni.length > 0 ? dokterPraktikHariIni : dokterTerbaru;
    dokterAktivitasSource.slice(0, 3).forEach((item) => {
      riwayatAktivitas.push({
        id: `doc-${item.id}`,
        type: 'dokter',
        deskripsi: `Jadwal Praktik Dokter: ${item.nama} (${item.cabang || 'Klinik'})`,
        waktu: 'Aktif Praktik Hari Ini',
      });
    });

    // 6. Kembalikan respons terstandarisasi sesuai apiguide.md
    return res.status(200).json({
      success: true,
      message: 'Data ringkasan operasional dashboard berhasil diambil.',
      data: {
        totalReservasiHariIni,
        totalDokterAktif: totalDokterPraktikHariIni,
        totalDokterPraktikHariIni,
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

