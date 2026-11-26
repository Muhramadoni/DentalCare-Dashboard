// frontend/src/utils/auth.js
// Helper autentikasi — ambil & hapus token JWT dari sessionStorage
// (sessionStorage otomatis bersih saat tab/browser ditutup)

/**
 * Ambil token JWT dari sessionStorage.
 * @param {Function} [onLogout] - Callback logout jika token tidak ditemukan
 * @returns {string|null} Token JWT atau null
 */
export function getAuthToken(onLogout) {
    const token = sessionStorage.getItem('auth_token')
    if (!token && onLogout) {
        onLogout()
        return null
    }
    return token
}

/**
 * Simpan token dan email user ke sessionStorage setelah login berhasil.
 * @param {string} token
 * @param {string} email
 */
export function saveAuthSession(token, email) {
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('user_email', email)
}

/**
 * Hapus semua data sesi dari sessionStorage (dipakai saat logout).
 */
export function clearAuthSession() {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_email')
}
