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
 * Mengubah format tanggal YYYY-MM-DD menjadi format tampilan DD-MM-YYYY
 */
export function toDisplayDate(dateStr) {
    if (!dateStr) return ''
    const clean = String(dateStr).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const [y, m, d] = clean.split('-')
        return `${d}-${m}-${y}`
    }
    return clean
}

