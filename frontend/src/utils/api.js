// frontend/src/utils/api.js
// Konstanta URL endpoint backend REST API
// Ubah BASE_URL di sini jika port/host backend berubah — tidak perlu edit tiap halaman

export const BASE_URL = 'http://localhost:5000/api/v1'

export const API = {
    auth: {
        login: `${BASE_URL}/auth/login`,
        logout: `${BASE_URL}/auth/logout`,
    },
    dashboard: {
        summary: `${BASE_URL}/dashboard/summary`,
    },
    reservasi: {
        base: `${BASE_URL}/reservasi`,
        doctors: `${BASE_URL}/reservasi/doctors`,
    },
    dokter: {
        base: `${BASE_URL}/dokter`,
        byId: (id) => `${BASE_URL}/dokter/${id}`,
    },
    emr: {
        base: `${BASE_URL}/rekam-medis`,
        patients: `${BASE_URL}/rekam-medis/patients`,
        byId: (id) => `${BASE_URL}/rekam-medis/${id}`,
    },
}
