/**
 * Mengubah format tanggal apapun (DD-MM-YYYY, YYYY-MM-DD, dsb)
 * menjadi format YYYY-MM-DD agar selalu valid & terisi pada <input type="date">
 */
export function toDateInputValue(dateStr) {
    if (!dateStr) return ''
    const clean = String(dateStr).trim()
    // Format DD-MM-YYYY (contoh: 20-05-2026)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(clean)) {
        const [d, m, y] = clean.split('-')
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    // Format DD/MM/YYYY (contoh: 20/05/2026)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
        const [d, m, y] = clean.split('/')
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    // Format YYYY-MM-DD (sudah standar HTML5 input date)
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return clean
    }
    return clean
}

/**
 * Mengubah format tanggal (YYYY-MM-DD, ISO string, dsb) menjadi format tampilan standar DD-MM-YYYY (hari-bulan-tahun)
 */
export function toDisplayDate(dateStr) {
    if (!dateStr) return '-'
    const clean = String(dateStr).trim()
    // Format YYYY-MM-DD (misal: 2026-11-14 atau ISO string 2026-11-14T...)
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
        const [y, m, d] = clean.slice(0, 10).split('-')
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
    }
    // Format dengan pemisah dash: DD-MM-YYYY atau MM-DD-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(clean)) {
        const [p1, p2, y] = clean.split('-')
        // Jika angka kedua > 12 dan angka pertama <= 12 (format lama MM-DD-YYYY), balik menjadi DD-MM-YYYY
        if (Number(p1) <= 12 && Number(p2) > 12) {
            return `${p2.padStart(2, '0')}-${p1.padStart(2, '0')}-${y}`
        }
        return `${p1.padStart(2, '0')}-${p2.padStart(2, '0')}-${y}`
    }
    // Format dengan pemisah slash: DD/MM/YYYY atau MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
        const [p1, p2, y] = clean.split('/')
        if (Number(p1) <= 12 && Number(p2) > 12) {
            return `${p2.padStart(2, '0')}-${p1.padStart(2, '0')}-${y}`
        }
        return `${p1.padStart(2, '0')}-${p2.padStart(2, '0')}-${y}`
    }
    return clean
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai waktu lokal
 */
export function getTodayDateString() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}


