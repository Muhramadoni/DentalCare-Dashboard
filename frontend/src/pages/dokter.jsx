import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Sidebar from '../components/sidebar'
import { DoctorModal } from '../components/modals'
import ConfirmModal from '../components/ConfirmModal'
import {
    PlusIcon,
    EditIcon,
    TrashIcon,
    ClockOutlineIcon,
    SpinnerIcon,
    ErrorIcon,
    CheckIcon,
    ClearIcon,
} from '../components/icon'
import { getDoctorSchedule, calculateDoctorStatus } from '../utils/doctorStatus'

const API_BASE_URL = 'http://localhost:5000/api/v1/dokter'

export default function Dokter({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('dokter')

    // State data dokter dari backend REST API
    const [dokterList, setDokterList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [apiError, setApiError] = useState(null)
    const [toastMessage, setToastMessage] = useState(null)

    // State Modal (Tambah & Edit)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState(null)

    // State Modal Konfirmasi Hapus Dokter
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, nama: '' })

    // Helper: Ambil token JWT dari sessionStorage
    const getAuthToken = useCallback(() => {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
        if (!token && onLogout) {
            onLogout()
            return null
        }
        return token
    }, [onLogout])

    // Ambil data dokter dari Backend API (GET /api/v1/dokter)
    const fetchDokter = useCallback(async () => {
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
                throw new Error(result?.error?.message || 'Gagal memuat data dokter.')
            }

            setDokterList(result.data || [])
        } catch (err) {
            console.error('Error saat fetch dokter:', err)
            setApiError(err.message || 'Tidak dapat terhubung ke server backend.')
        } finally {
            setIsLoading(false)
        }
    }, [getAuthToken, onLogout])

    useEffect(() => {
        fetchDokter()
    }, [fetchDokter])

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

    // Daftar dokter yang ditampilkan
    const filteredDokterList = dokterList

    const handleOpenAddModal = () => {
        setEditingDoctor(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (doctor) => {
        setEditingDoctor(doctor)
        setIsModalOpen(true)
    }

    // Simpan Data Dokter (POST Tambah Baru atau PUT Update)
    const handleSaveDoctor = async (data) => {
        const token = getAuthToken()
        if (!token) return

        try {
            if (editingDoctor) {
                // PUT /api/v1/dokter/:id
                const response = await fetch(`${API_BASE_URL}/${editingDoctor.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nama: data.nama,
                        spesialisasi: data.spesialisasi,
                        cabang: data.cabang,
                        status: data.status,
                        cabangGaruda: data.cabangGaruda,
                        cabangMuchtar: data.cabangMuchtar,
                        jadwalGaruda: data.jadwalGaruda,
                        jadwalMuchtar: data.jadwalMuchtar,
                        jadwal: data.jadwal,
                    }),
                })

                const result = await response.json()
                if (!response.ok || !result.success) {
                    throw new Error(result?.error?.message || 'Gagal memperbarui data dokter.')
                }

                setDokterList((prev) =>
                    prev.map((item) => (item.id === editingDoctor.id ? result.data : item))
                )
                setToastMessage({ type: 'success', text: `Data ${data.nama} berhasil diperbarui!` })
            } else {
                // POST /api/v1/dokter
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nama: data.nama,
                        spesialisasi: data.spesialisasi,
                        cabang: data.cabang,
                        status: data.status,
                        cabangGaruda: data.cabangGaruda,
                        cabangMuchtar: data.cabangMuchtar,
                        jadwalGaruda: data.jadwalGaruda,
                        jadwalMuchtar: data.jadwalMuchtar,
                        jadwal: data.jadwal,
                    }),
                })

                const result = await response.json()
                if (!response.ok || !result.success) {
                    throw new Error(result?.error?.message || 'Gagal menambahkan dokter baru.')
                }

                setDokterList((prev) => [...prev, result.data])
                setToastMessage({ type: 'success', text: `Dokter ${data.nama} berhasil ditambahkan!` })
            }
        } catch (err) {
            console.error('Error saat menyimpan dokter:', err)
            alert(err.message || 'Terjadi kesalahan saat menyimpan data dokter.')
        }
    }

    // Trigger Buka Modal Konfirmasi Hapus Dokter
    const handleDeleteDoctor = (id, nama) => {
        setDeleteConfirm({ isOpen: true, id, nama })
    }

    // Eksekusi Hapus Dokter setelah Konfirmasi (DELETE /api/v1/dokter/:id)
    const handleConfirmDeleteDoctor = async () => {
        const { id, nama } = deleteConfirm
        if (!id) return

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
                throw new Error(result?.error?.message || 'Gagal menghapus dokter.')
            }

            setDokterList((prev) => prev.filter((item) => item.id !== id))
            setToastMessage({ type: 'success', text: `Data dokter "${nama}" berhasil dihapus!` })
        } catch (err) {
            console.error('Error saat menghapus dokter:', err)
            alert(err.message || 'Terjadi kesalahan saat menghapus data.')
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, nama: '' })
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

            {/* Area Konten Utama Kelola Dokter */}
            <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col gap-6">
                {/* 1. Header Halaman & Tombol Tambah Dokter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                            Kelola Dokter & Jadwal Praktik
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                            Daftar dokter spesialis, ketersediaan, dan jadwal praktik harian.
                        </p>
                    </div>

                    {/* Tombol Tambah Dokter */}
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-5 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#49baff]/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto shrink-0"
                    >
                        <span>Tambah Dokter</span>
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Toast Alert Notifikasi */}
                {toastMessage && (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium animate-fadeIn shadow-xs">
                        <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{toastMessage.text}</span>
                        <button
                            type="button"
                            onClick={() => setToastMessage(null)}
                            className="ml-auto text-emerald-500 hover:text-emerald-700 p-0.5"
                        >
                            <ClearIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Banner Error jika API gagal */}
                {apiError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <ErrorIcon className="w-5 h-5 text-red-500 shrink-0" />
                            <span>{apiError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={fetchDokter}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium text-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Status Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <SpinnerIcon className="w-8 h-8 text-[#49baff] animate-spin" />
                        <span className="text-sm text-gray-500">Memuat data dokter & jadwal praktik...</span>
                    </div>
                )}

                {/* 2. Grid Card Dokter (3 Kolom sesuai DESIGN.md) */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 items-start">
                        {filteredDokterList.length > 0 ? (
                            filteredDokterList.map((doctor) => {
                                const schedules = getDoctorSchedule(doctor)
                                const statusInfo = calculateDoctorStatus(doctor)

                                return (
                                    <div
                                        key={doctor.id}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow relative"
                                    >
                                        {/* Bagian Atas Card: Info Dokter, Badge Status & Tombol Aksi */}
                                        <div className="mb-3.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h2 className="text-sm sm:text-[15px] font-semibold text-slate-800 leading-tight">
                                                            {doctor.nama}
                                                        </h2>
                                                        {/* Badge Status Real-Time Berdasarkan Hari & Jam Akhir Praktik (Tanpa Titik) */}
                                                        {statusInfo.isActive ? (
                                                            <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#e5ff8f] text-[#637704] border border-[#adc91f] shadow-2xs">
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                                                Tidak Aktif
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11.5px] sm:text-xs text-[#adc91f] font-medium mt-1 leading-none">
                                                        {doctor.spesialisasi}
                                                    </p>
                                                </div>

                                                {/* Tombol Aksi (Lingkaran Hijau Lime & Lingkaran Merah Muda) */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(doctor)}
                                                        className="w-7 h-7 rounded-full bg-[#e5ff8f] hover:bg-[#d6f552] text-[#728905] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                                        title="Edit Dokter"
                                                        aria-label="Edit Dokter"
                                                    >
                                                        <EditIcon className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDoctor(doctor.id, doctor.nama)}
                                                        className="w-7 h-7 rounded-full bg-[#fddada] hover:bg-[#fca5a5] text-[#e31e1e] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                                        title="Hapus Dokter"
                                                        aria-label="Hapus Dokter"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bagian Bawah Card: Jadwal Praktek (Hanya Cabang Muchtar) */}
                                        <div className="border-t border-gray-100 pt-3 space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                <ClockOutlineIcon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                                <span>Jadwal Praktek Cabang Muchtar</span>
                                            </div>
                                            <div className="space-y-1">
                                                {schedules.length > 0 ? (
                                                    schedules.map((j, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between text-xs text-slate-600 font-normal"
                                                        >
                                                            <span>{j.hari}</span>
                                                            <span className="font-medium text-slate-700">{j.jam}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-gray-400 italic">
                                                        Belum ada jadwal operasional
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                                Belum ada data dokter. Silakan tambah dokter baru dengan menekan tombol "Tambah Dokter".
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Pop-up Tambah & Update Dokter */}
            <DoctorModal
                isOpen={isModalOpen}
                initialData={editingDoctor}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveDoctor}
            />

            {/* Modal Konfirmasi Hapus Dokter */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                type="danger"
                title="Konfirmasi Hapus Dokter"
                message={`Apakah Anda yakin ingin menghapus data dokter "${deleteConfirm.nama}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, nama: '' })}
                onConfirm={handleConfirmDeleteDoctor}
            />
        </div>
    )
}
