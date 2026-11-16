// backend/utils/activity-logger.js
// Pencatatan Log Riwayat Aktivitas Harian (In-Memory)
// Reset otomatis setiap hari jam 00:00 tanpa menulis ke harddisk/file JSON

let dailyActivities = [];
const MAX_LOGS = 50;

/**
 * Format string tanggal lokal YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format waktu lokal Indonesia (contoh: '14:35 WIB')
 * @param {Date} date
 * @returns {string}
 */
function getLocalTimeString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} WIB`;
}

/**
 * Otomatis membersihkan aktivitas yang bukan berasal dari hari ini (reset jam 00:00)
 */
function cleanOldActivities() {
  const today = getTodayDateString();
  dailyActivities = dailyActivities.filter((act) => act.dateStr === today);
}

/**
 * Mencatat aktivitas baru secara real-time ke memori
 * @param {Object} param0
 * @param {string} param0.type - Tipe: 'reservasi' | 'dokter' | 'emr'
 * @param {string} param0.status - Status: 'Tambah' | 'Pembaruan' | 'Menghapus'
 * @param {string} param0.deskripsi - Penjelasan aktivitas
 * @param {string} [param0.waktu] - Waktu opsional
 * @returns {Object}
 */
function recordActivity({ type = 'reservasi', status = 'Pembaruan', deskripsi, waktu }) {
  try {
    cleanOldActivities();

    const now = new Date();
    const formattedTime = waktu || getLocalTimeString(now);

    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      status, // 'Tambah' | 'Pembaruan' | 'Menghapus'
      deskripsi,
      waktu: formattedTime,
      dateStr: getTodayDateString(now),
      timestamp: now.getTime(),
    };

    // Sisipkan ke urutan teratas
    dailyActivities.unshift(newActivity);

    // Batasi jumlah maksimal log di memori
    if (dailyActivities.length > MAX_LOGS) {
      dailyActivities = dailyActivities.slice(0, MAX_LOGS);
    }

    return newActivity;
  } catch (error) {
    console.error('Error saat mencatat aktivitas in-memory:', error);
    return null;
  }
}

/**
 * Mengambil daftar aktivitas khusus hari ini
 * @param {number} limit
 * @returns {Array}
 */
function getTodayActivities(limit = 20) {
  cleanOldActivities();
  return dailyActivities.slice(0, limit);
}

module.exports = {
  recordActivity,
  getTodayActivities,
  getActivities: getTodayActivities, // kompatibilitas
};
