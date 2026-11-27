// backend/controllers/dashboard-controller.js
// Controller Ringkasan Utama Dashboard (sesuai FR-2, US-2, apiguide.md, database.md)

const prisma = require('../config/prisma');
const { getTodayActivities } = require('../utils/activity-logger');

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

    // Filter rentang waktu reservasi khusus hari ini (00:00 - 23:59 UTC @db.Date)
    const filterHariIni = {
      tanggal_kunjungan: {
        gte: todayUtc,
        lt: tomorrowUtc,
      },
    };

    // 2. Jalankan query agregasi secara paralel (efisiensi respon <300ms sesuai Target G4 & NFR-1)
    const [
      totalReservasiHariIni,
      totalAppointment,
      totalReschedule,
      totalDokter,
      dokterAktifList,
      daftarReservasi,
      emrList,
    ] = await Promise.all([
      // Total reservasi hari ini: hanya menghitung reservasi dengan tanggal kunjungan hari ini
      prisma.reservasi.count({
        where: filterHariIni,
      }),

      // Rekap status: jumlah status 'Appointment' KHUSUS hari ini (tanggal yang sama)
      prisma.reservasi.count({
        where: {
          ...filterHariIni,
          status: 'Appointment',
        },
      }),

      // Rekap status: jumlah status 'Reschedule' KHUSUS hari ini (tanggal yang sama)
      prisma.reservasi.count({
        where: {
          ...filterHariIni,
          status: 'Reschedule',
        },
      }),

      // Total dokter: jumlah seluruh dokter terdaftar di klinik
      prisma.dokter.count(),

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
          { tanggal_kunjungan: 'desc' },
          { id: 'desc' }
        ],
        select: {
          id: true,
          tanggal_kunjungan: true,
          waktu_kunjungan: true,
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

      // Ambil data rekam medis untuk statistik grafik tren (Diagnosa, Regio, Tindakan)
      prisma.rekamMedis.findMany({
        select: {
          anamnesa: true,
          regio: true,
          tindakan: true,
        },
      }),
    ]);

    // 3. Format daftar reservasi untuk dikonsumsi frontend
    const formattedReservasi = daftarReservasi.map((item) => {
      // Format tanggal DD-MM-YYYY
      const d = new Date(item.tanggal_kunjungan);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      return {
        id: item.id,
        namaPasien: item.pasien?.nama || 'Pasien',
        tanggal_kunjungan: formattedDate,
        tanggalKunjungan: formattedDate,
        waktu_kunjungan: item.waktu_kunjungan,
        waktuKunjungan: item.waktu_kunjungan,
        tanggal: formattedDate,
        waktu: item.waktu_kunjungan,
        jadwal: `${formattedDate} ${item.waktu_kunjungan} WIB`,
        dokter: item.dokter?.nama || 'Dokter Umum',
        cabang: item.dokter?.cabang || '-',
        status: item.status,
      };
    });

    // 4. Hitung dokter yang berstatus AKTIF secara REAL-TIME pada hari ini (memiliki jadwal hari ini & jam saat ini belum melewati jam akhir praktik)
    const daysIndo = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayName = daysIndo[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const dokterPraktikHariIni = dokterAktifList.filter((doc) => {
      // Abaikan jika dokter berstatus Tidak Aktif secara manual
      if (doc.status && doc.status.toLowerCase() === 'tidak aktif') {
        return false;
      }

      let schedules = [];
      if (doc.jadwal_json && typeof doc.jadwal_json === 'object') {
        if (Array.isArray(doc.jadwal_json)) {
          schedules = doc.jadwal_json;
        } else if (Array.isArray(doc.jadwal_json.jadwalMuchtar) && doc.jadwal_json.jadwalMuchtar.length > 0) {
          schedules = doc.jadwal_json.jadwalMuchtar;
        } else if (Array.isArray(doc.jadwal_json.jadwal) && doc.jadwal_json.jadwal.length > 0) {
          schedules = doc.jadwal_json.jadwal;
        }
      }

      if (schedules.length === 0) return false;

      // Filter jadwal khusus hari ini
      const todaySchedules = schedules.filter((s) => {
        if (!s || !s.hari) return false;
        const cleanDay = String(s.hari).replace(':', '').trim().toLowerCase();
        return cleanDay.includes(todayName) || todayName.includes(cleanDay);
      });

      if (todaySchedules.length === 0) return false;

      // Realtime: Cek apakah waktu saat ini belum melewati jam akhir praktik dokter
      return todaySchedules.some((s) => {
        if (!s.jam) return false;
        const parts = String(s.jam).split('-');
        if (parts.length < 2) return false;

        const endStr = parts[1].trim().replace('.', ':');
        const timeParts = endStr.split(':');
        const endHours = parseInt(timeParts[0], 10);
        const endMinutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;

        if (isNaN(endHours)) return false;

        const totalEndMinutes = endHours * 60 + (isNaN(endMinutes) ? 0 : endMinutes);
        return currentMinutes <= totalEndMinutes;
      });
    });

    const totalDokterPraktikHariIni = dokterPraktikHariIni.length;

    // 5. Agregasi data tren EMR: Diagnosa (Anamnesa), Regio, dan Tindakan
    const countOccurrences = (items, key, splitByComma = false) => {
      const freq = {};
      (items || []).forEach((item) => {
        const val = item[key];
        if (!val || val === '-' || !val.trim()) return;
        if (splitByComma) {
          String(val).split(/[,;]+/).forEach((sub) => {
            const clean = sub.trim();
            if (clean && clean !== '-') {
              freq[clean] = (freq[clean] || 0) + 1;
            }
          });
        } else {
          const clean = val.trim();
          freq[clean] = (freq[clean] || 0) + 1;
        }
      });
      return Object.entries(freq)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    };

    const trenDiagnosa = countOccurrences(emrList, 'anamnesa', false);
    const trenRegio = countOccurrences(emrList, 'regio', true);
    const trenTindakan = countOccurrences(emrList, 'tindakan', false);

    // 6. Ambil riwayat aktivitas admin khusus HARI INI (In-Memory, otomatis reset jam 00:00)
    const riwayatAktivitas = getTodayActivities(20);

    // 7. Kembalikan respons terstandarisasi sesuai apiguide.md
    return res.status(200).json({
      success: true,
      message: 'Data ringkasan operasional dashboard berhasil diambil.',
      data: {
        totalReservasiHariIni,
        totalDokter,
        totalDokterAktif: dokterAktifList.length,
        totalDokterPraktikHariIni,
        rekapStatus: {
          appointment: totalAppointment,
          reschedule: totalReschedule,
        },
        cards: {
          totalReservasiHariIni,
          totalDokter,
          dokterPraktik: totalDokterPraktikHariIni,
          dokterAktif: dokterAktifList.length,
        },
        daftarReservasi: formattedReservasi,
        reservations: formattedReservasi,
        riwayatAktivitas,
        activities: riwayatAktivitas,
        trenEmr: {
          diagnosa: trenDiagnosa,
          regio: trenRegio,
          tindakan: trenTindakan,
          totalRecords: emrList ? emrList.length : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary };

