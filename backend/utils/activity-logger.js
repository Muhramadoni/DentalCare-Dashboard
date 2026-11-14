// backend/utils/activity-logger.js
// Pencatatan Log Riwayat Aktivitas Real-Time
// Sesuai dengan instruksi aktivitas admin dan security.md Section 10

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../data/activity-logs.json');
const MAX_LOGS = 50;

/**
 * Memastikan direktori data ada sebelum membaca/menulis file
 */
function ensureDirectoryExistence() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Format waktu lokal Indonesia (contoh: '17:00' atau '09:30')
 */
function getLocalTimeString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Mengambil daftar riwayat aktivitas
 * @param {number} limit - Jumlah maksimal aktivitas yang diambil
 * @returns {Array}
 */
function getActivities(limit = 10) {
  try {
    ensureDirectoryExistence();
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(LOG_FILE, 'utf-8');
    const logs = JSON.parse(raw);
    return Array.isArray(logs) ? logs.slice(0, limit) : [];
  } catch (error) {
    console.error('Error saat membaca activity logs:', error);
    return [];
  }
}

/**
 * Mencatat aktivitas baru secara real-time
 * @param {Object} param0
 * @param {string} param0.type - Tipe aktivitas: 'reservasi' | 'dokter' | 'emr'
 * @param {string} param0.status - Status: 'Tambah' | 'Pembaruan' | 'Menghapus'
 * @param {string} param0.deskripsi - Penjelasan aktivitas
 * @param {string} [param0.waktu] - Waktu aktivitas (otomatis jam real-time saat ini jika kosong)
 */
function recordActivity({ type = 'reservasi', status = 'Pembaruan', deskripsi, waktu }) {
  try {
    ensureDirectoryExistence();
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      try {
        const raw = fs.readFileSync(LOG_FILE, 'utf-8');
        logs = JSON.parse(raw);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }

    const now = new Date();
    const formattedTime = waktu || getLocalTimeString(now);

    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      status, // 'Tambah' | 'Pembaruan' | 'Menghapus'
      deskripsi,
      waktu: formattedTime,
      timestamp: now.toISOString(),
    };

    // Sisipkan aktivitas terbaru ke urutan teratas
    logs.unshift(newActivity);

    // Batasi log maksimal agar hemat memori & disk
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(0, MAX_LOGS);
    }

    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    return newActivity;
  } catch (error) {
    console.error('Error saat mencatat aktivitas:', error);
    return null;
  }
}

module.exports = {
  getActivities,
  recordActivity,
  getLocalTimeString,
};

