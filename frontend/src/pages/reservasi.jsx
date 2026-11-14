import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '../components/sidebar'
import { ReservationModal } from '../components/modals'
import Pagination from '../components/pagination'
import {
    SearchIcon,
    ChevronDownIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    SpinnerIcon,
    ErrorIcon,
    CheckIcon,
    ClearIcon,
} from '../components/icon'

const API_BASE_URL = 'http://localhost:5000/api/v1/reservasi'

export default function Reservasi({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('reservasi')

    // State data reservasi dari backend (awal: kosong total sesuai instruksi)
    const [reservasiList, setReservasiList] = useState([])
    const [doctors, setDoctors] = useState([])

    // State Loading & Error & Toast
    const [isLoading, setIsLoading] = useState(true)
    const [apiError, setApiError] = useState(null)
    const [toastMessage, setToastMessage] = useState(null)

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // State Modal Pop-up (Tambah & Update)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Helper: Ambil token JWT dari sessionStorage
    const getAuthToken = useCallback(() => {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
        if (!token && onLogout) {
            onLogout()
            return null
        }
        return token
    }, [onLogout])

    // 1. Ambil daftar reservasi dari REST API (GET /api/v1/reservasi)
    const fetchReservasi = useCallback(async () => {
        setIsLoading(true)
        setApiError(null)

        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                if (response.status === 401 && onLogout) {
                    onLogout()
                    return
                }
                throw new Error(result?.error?.message || 'Gagal memuat data reservasi.')
            }

            setReservasiList(result.data || [])
        } catch (err) {
            console.error('Error saat fetch reservasi:', err)
            setApiError(err.message || 'Tidak dapat terhubung ke server backend.')
        } finally {
            setIsLoading(false)
        }
    }, [getAuthToken, onLogout])

    // 2. Ambil daftar dokter aktif untuk dropdown modal (GET /api/v1/reservasi/doctors)
    const fetchDoctors = useCallback(async () => {
        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch(`${API_BASE_URL}/doctors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()
            if (response.ok && result.success && Array.isArray(result.data)) {
                setDoctors(result.data)
            }
        } catch (err) {
            console.error('Error saat fetch doctors:', err)
        }
    }, [getAuthToken])

    useEffect(() => {
        fetchReservasi()
        fetchDoctors()
    }, [fetchReservasi, fetchDoctors])

    // Reset ke halaman 1 saat pencarian atau filter status berubah
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    // Notifikasi toast otomatis hilang setelah 4 detik
    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => {
            setToastMessage(null)
        }, 4000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Filter pencarian cepat nama pasien (<30 detik sesuai Target G1) & status filter
    const filteredList = useMemo(() => {
        return reservasiList.filter((item) => {
            const patientName = (item.namaPasien || '').toLowerCase()
            const matchesSearch = patientName.includes(searchQuery.toLowerCase().trim())
            const matchesStatus =
                statusFilter === 'Semua Status' || item.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [reservasiList, searchQuery, statusFilter])

    // Buka Modal Tambah
    const handleOpenAddModal = () => {
        setEditingItem(null)
        setIsModalOpen(true)
        fetchDoctors()
    }

    // Buka Modal Edit
    const handleOpenEditModal = (item) => {
        setEditingItem(item)
        setIsModalOpen(true)
        fetchDoctors()
    }

    // Simpan Data (POST Tambah Baru atau PUT Update)
    const handleSaveReservasi = async (data) => {
        const token = getAuthToken()
        if (!token) return

        try {
            if (editingItem) {
                // PUT /api/v1/reservasi/:id
                const response = await fetch(`${API_BASE_URL}/${editingItem.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        namaPasien: data.namaPasien,
                        tanggal: data.tanggal,
                        waktu: data.waktu,
                        dokter: data.dokter,
                        dokter_id: data.dokter_id,
                        status: data.status,
                    }),
                })

                const result = await response.json()
                if (!response.ok || !result.success) {
                    throw new Error(result?.error?.message || 'Gagal memperbarui reservasi.')
                }

                // Update list state lokal
                setReservasiList((prev) =>
                    prev.map((item) => (item.id === editingItem.id ? result.data : item))
                )
                setToastMessage({ type: 'success', text: 'Data reservasi berhasil diperbarui!' })
            } else {
                // POST /api/v1/reservasi
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        namaPasien: data.namaPasien,
                        tanggal: data.tanggal,
                        waktu: data.waktu,
                        dokter: data.dokter,
                        dokter_id: data.dokter_id,
                        status: data.status,
                    }),
                })

                const result = await response.json()
                if (!response.ok || !result.success) {
                    throw new Error(result?.error?.message || 'Gagal membuat reservasi baru.')
                }

                // Tambahkan reservasi baru di paling atas
                setReservasiList((prev) => [result.data, ...prev])
                setToastMessage({ type: 'success', text: 'Reservasi baru berhasil ditambahkan!' })
            }
        } catch (err) {
            console.error('Error saat menyimpan reservasi:', err)
            alert(err.message || 'Terjadi kesalahan saat menyimpan data.')
        }
    }

    // Hapus Reservasi (DELETE /api/v1/reservasi/:id)
    const handleDeleteReservasi = async (id, nama) => {
        if (!window.confirm(`Hapus reservasi untuk ${nama}?`)) return

        const token = getAuthToken()
        if (!token) return

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result?.error?.message || 'Gagal menghapus reservasi.')
            }

            setReservasiList((prev) => prev.filter((item) => item.id !== id))
            setToastMessage({ type: 'success', text: `Reservasi untuk ${nama} berhasil dihapus.` })
        } catch (err) {
            console.error('Error saat menghapus reservasi:', err)
            alert(err.message || 'Terjadi kesalahan saat menghapus data.')
        }
    }

    return (
        <div className="flex h-screen w-full bg-[#f9f8ff] font-['Poppins'] select-none overflow-hidden">
            {/* Sidebar Navigasi Kiri */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
            />

            {/* Area Konten Utama Kelola Reservasi */}
            <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col gap-6">
                {/* 1. Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                            Kelola Reservasi Pasien
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                            Kelola seluruh daftar reservasi, jadwal kedatangan, dan status kunjungan pasien secara terpusat.
                        </p>
                    </div>

                    {/* Toast Alert Notifikasi */}
                    {toastMessage && (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium animate-fadeIn shadow-xs">
                            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{toastMessage.text}</span>
                            <button
                                type="button"
                                onClick={() => setToastMessage(null)}
                                className="ml-2 text-emerald-500 hover:text-emerald-700 p-0.5"
                            >
                                <ClearIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Banner Error jika API gagal */}
                {apiError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <ErrorIcon className="w-5 h-5 text-red-500 shrink-0" />
                            <span>{apiError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={fetchReservasi}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium text-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* 2. Top Filter & Action Bar Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Sisi Kiri: Filter Search & Status */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Input Pencarian Nama Pasien (<30 detik Target G1) */}
                        <div className="relative w-full sm:w-72 flex items-center">
                            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                                <SearchIcon className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama pasien"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600"
                                    title="Hapus pencarian"
                                >
                                    <ClearIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown Filter Status */}
                        <div className="relative w-full sm:w-44 flex items-center">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="Semua Status">Semua Status</option>
                                <option value="Appointment">Appointment</option>
                                <option value="Reschedule">Reschedule</option>
                            </select>
                            <div className="absolute right-3.5 text-gray-400 pointer-events-none">
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Tombol Tambah Reservasi */}
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-5 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#49baff]/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                    >
                        <span>Tambah Reservasi</span>
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* 3. Card Tabel Daftar Reservasi (Nama Pasien, Dokter, Tanggal, Waktu, Status, Aksi) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col mb-6">
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white">
                                        <th className="px-5 py-3.5">Nama Pasien</th>
                                        <th className="px-5 py-3.5 text-center">Dokter</th>
                                        <th className="px-5 py-3.5 text-center">Tanggal</th>
                                        <th className="px-5 py-3.5 text-center">Waktu</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                        <th className="px-5 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <SpinnerIcon className="w-6 h-6 text-[#49baff] animate-spin" />
                                                    <span className="text-xs text-gray-500">Memuat data reservasi...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredList.length > 0 ? (
                                        filteredList
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((item) => {
                                                const isAppointment = item.status === 'Appointment'

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-gray-50/70 transition-colors"
                                                    >
                                                        {/* Kolom 1: Nama Pasien */}
                                                        <td className="px-5 py-3.5 text-slate-800 font-medium">
                                                            {item.namaPasien}
                                                        </td>

                                                        {/* Kolom 2: Dokter */}
                                                        <td className="px-5 py-3.5 text-center text-slate-800">
                                                            {item.dokter}
                                                        </td>

                                                        {/* Kolom 3: Tanggal */}
                                                        <td className="px-5 py-3.5 text-center text-slate-800 whitespace-nowrap">
                                                            {item.tanggal}
                                                        </td>

                                                        {/* Kolom 4: Waktu */}
                                                        <td className="px-5 py-3.5 text-center text-slate-800 whitespace-nowrap">
                                                            {item.waktu}
                                                        </td>

                                                        {/* Kolom 5: Status */}
                                                        <td className="px-5 py-3.5 text-center">
                                                            {isAppointment ? (
                                                                /* Badge Appointment (Cyan Style) */
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d2e8ff] text-[#49baff] border-2 border-[#49baff]">
                                                                    Appointment
                                                                </span>
                                                            ) : (
                                                                /* Badge Reschedule (Lime Style) */
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#e5ff8f] text-[#adc91f] border-2 border-[#adc91f]">
                                                                    Reschedule
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Kolom 6: Aksi */}
                                                        <td className="px-5 py-3.5 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {/* Tombol Edit (Hijau Lime #adc91f) */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenEditModal(item)}
                                                                    className="w-8 h-8 rounded-lg bg-[#adc91f] hover:bg-[#98c51a] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                                                                    title="Edit Reservasi"
                                                                    aria-label="Edit Reservasi"
                                                                >
                                                                    <EditIcon className="w-4 h-4" />
                                                                </button>

                                                                {/* Tombol Delete (Merah #e62e2e) */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteReservasi(item.id, item.namaPasien)}
                                                                    className="w-8 h-8 rounded-lg bg-[#e62e2e] hover:bg-[#cf2525] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                                                                    title="Hapus Reservasi"
                                                                    aria-label="Hapus Reservasi"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-10 text-center text-gray-400 text-sm font-normal"
                                            >
                                                {reservasiList.length === 0
                                                    ? 'Belum ada data reservasi. Silakan buat reservasi baru dengan menekan tombol "Tambah Reservasi".'
                                                    : 'Tidak ada data reservasi yang sesuai dengan pencarian atau filter status.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination jika data lebih dari itemsPerPage */}
                    {filteredList.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredList.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </main>

            {/* Modal Pop-up Tambah & Update Reservasi */}
            <ReservationModal
                isOpen={isModalOpen}
                initialData={editingItem}
                doctors={doctors}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveReservasi}
            />
        </div>
    )
}
