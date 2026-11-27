// frontend/src/utils/doctorStatus.js
/**
 * Helper untuk mengambil daftar jadwal operasional dokter (prioritas Muchtar / jadwal umum)
 * @param {Object} doctor
 * @returns {Array}
 */
export function getDoctorSchedule(doctor) {
    if (!doctor) return []
    if (Array.isArray(doctor.jadwalMuchtar) && doctor.jadwalMuchtar.length > 0) {
        return doctor.jadwalMuchtar
    }
    if (Array.isArray(doctor.jadwal) && doctor.jadwal.length > 0) {
        return doctor.jadwal
    }
    if (doctor.jadwal_json) {
        if (Array.isArray(doctor.jadwal_json.jadwalMuchtar) && doctor.jadwal_json.jadwalMuchtar.length > 0) {
            return doctor.jadwal_json.jadwalMuchtar
        }
        if (Array.isArray(doctor.jadwal_json.jadwal) && doctor.jadwal_json.jadwal.length > 0) {
            return doctor.jadwal_json.jadwal
        }
        if (Array.isArray(doctor.jadwal_json)) {
            return doctor.jadwal_json
        }
    }
    return []
}

/**
 * Helper untuk menghitung status dokter (Aktif / Tidak Aktif) secara real-time
 * Ditentukan berdasarkan:
 * 1. Apakah dokter memiliki jadwal praktik pada hari ini?
 * 2. Apakah jam saat ini belum melewati jam akhir praktik dokter pada hari ini?
 *
 * @param {Object} doctor
 * @param {Date} [customNow]
 * @returns {{ isActive: boolean, label: string, reason: string }}
 */
export function calculateDoctorStatus(doctor, customNow) {
    const now = customNow || new Date()
    const daysIndo = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
    const todayName = daysIndo[now.getDay()]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const schedules = getDoctorSchedule(doctor)
    if (!schedules || schedules.length === 0) {
        return {
            isActive: false,
            label: 'Tidak Aktif',
            reason: 'Belum ada jadwal operasional',
        }
    }

    // Filter jadwal khusus hari ini
    const todaySchedules = schedules.filter((s) => {
        if (!s || !s.hari) return false
        const cleanDay = String(s.hari).replace(':', '').trim().toLowerCase()
        return cleanDay.includes(todayName) || todayName.includes(cleanDay)
    })

    // Jika dokter tidak memiliki jadwal sama sekali hari ini -> Tidak Aktif
    if (todaySchedules.length === 0) {
        return {
            isActive: false,
            label: 'Tidak Aktif',
            reason: 'Tidak ada jadwal hari ini',
        }
    }

    // Cek apakah ada sesi jadwal hari ini yang jam akhirnya belum lewat
    const isCurrentlyActive = todaySchedules.some((s) => {
        if (!s.jam) return false
        const parts = String(s.jam).split('-')
        if (parts.length < 2) return false

        // Ambil jam akhir (bagian kedua setelah '-')
        const endStr = parts[1].trim().replace('.', ':')
        const timeParts = endStr.split(':')
        const endHours = parseInt(timeParts[0], 10)
        const endMinutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0

        if (isNaN(endHours)) return false

        const totalEndMinutes = endHours * 60 + (isNaN(endMinutes) ? 0 : endMinutes)

        // Status Aktif selama waktu saat ini belum melewati jam akhir praktik
        return currentMinutes <= totalEndMinutes
    })

    return {
        isActive: isCurrentlyActive,
        label: isCurrentlyActive ? 'Aktif' : 'Tidak Aktif',
        reason: isCurrentlyActive ? 'Sedang dalam jam praktik' : 'Jam praktik hari ini telah berakhir',
    }
}

export const DAYS_ID = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
export const DAYS_CAPITALIZED = {
    minggu: 'Minggu',
    senin: 'Senin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    kamis: 'Kamis',
    jumat: 'Jumat',
    sabtu: 'Sabtu',
}

/**
 * Mendapatkan nama hari (Bahasa Indonesia: 'minggu', 'senin', dst.) dari format tanggal YYYY-MM-DD
 * @param {string} dateString
 * @returns {string}
 */
export function getDayNameFromDate(dateString) {
    if (!dateString) return ''
    const clean = String(dateString).trim()
    const parts = clean.split('-')
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        const d = new Date(year, month, day)
        return DAYS_ID[d.getDay()] || ''
    }
    const d = new Date(clean)
    if (!isNaN(d.getTime())) {
        return DAYS_ID[d.getDay()] || ''
    }
    return ''
}

/**
 * Memeriksa apakah dokter memiliki jadwal praktik pada hari tertentu (contoh: 'minggu')
 * @param {Object} doctor
 * @param {string} dayName
 * @returns {boolean}
 */
export function doctorHasScheduleOnDay(doctor, dayName) {
    if (!doctor || !dayName) return false
    const schedules = getDoctorSchedule(doctor)
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return false

    const targetDay = dayName.toLowerCase().trim()
    return schedules.some((s) => {
        if (!s || !s.hari) return false
        const cleanDay = String(s.hari).replace(':', '').trim().toLowerCase()
        return cleanDay.includes(targetDay) || targetDay.includes(cleanDay)
    })
}

