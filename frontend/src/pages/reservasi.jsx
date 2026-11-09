import React, { useState } from 'react'
import Sidebar from '../components/sidebar'
import { ReservationModal } from '../components/modals'
import {
    SearchIcon,
    ChevronDownIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
} from '../components/icon'

export default function Reservasi({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('reservasi')

    // State untuk Daftar Reservasi Pasien
    const [reservasiList, setReservasiList] = useState([
        {
            id: 1,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Appointment',
        },
        {
            id: 2,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Appointment',
        },
        {
            id: 3,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Reschedule',
        },
        {
            id: 4,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Reschedule',
        },
        {
            id: 5,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Reschedule',
        },
        {
            id: 6,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Reschedule',
        },
        {
            id: 7,
            namaPasien: 'Pasien 1',
            jadwal: '20-05-2026 09.42 WIB',
            dokter: 'drg. Indira Nugrahani',
            status: 'Reschedule',
        },
    ])

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua Status')

    // State Modal Pop-up (Tambah & Update)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Filter daftar berdasarkan teks pencarian dan pilihan status
    const filteredList = reservasiList.filter((item) => {
        const matchesSearch = item.namaPasien
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus =
            statusFilter === 'Semua Status' || item.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Buka Modal Tambah
    const handleOpenAddModal = () => {
        setEditingItem(null)
        setIsModalOpen(true)
    }

    // Buka Modal Edit
    const handleOpenEditModal = (item) => {
        setEditingItem(item)
        setIsModalOpen(true)
    }

    // Simpan Data (Tambah atau Update)
    const handleSaveReservasi = (data) => {
        if (editingItem) {
            // Update item yang sedang diedit
            setReservasiList((prev) =>
                prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
            )
        } else {
            // Tambahkan reservasi baru di atas
            setReservasiList((prev) => [data, ...prev])
        }
    }

    // Hapus Reservasi
    const handleDeleteReservasi = (id, nama) => {
        if (window.confirm(`Hapus reservasi untuk ${nama}?`)) {
            setReservasiList((prev) => prev.filter((item) => item.id !== id))
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
                <div>
                    <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                        Kelola Reservasi Pasien
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                        Kelola seluruh daftar reservasi, jadwal kedatangan, dan status kunjungan pasien secara terpusat.
                    </p>
                </div>

                {/* 2. Top Filter & Action Bar Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Sisi Kiri: Filter Search & Status */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Input Pencarian Nama Pasien */}
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

                {/* 3. Card Tabel Daftar Reservasi */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col mb-6">
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white">
                                        <th className="px-5 py-3.5">Nama Pasien</th>
                                        <th className="px-5 py-3.5 text-center">Tanggal & Waktu</th>
                                        <th className="px-5 py-3.5 text-center">Dokter</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                        <th className="px-5 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                    {filteredList.length > 0 ? (
                                        filteredList.map((item) => {
                                            const isAppointment = item.status === 'Appointment'

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50/70 transition-colors"
                                                >
                                                    <td className="px-5 py-3.5 text-slate-800">
                                                        {item.namaPasien}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center text-slate-800">
                                                        {item.jadwal}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center text-slate-800 font-normal">
                                                        {item.dokter}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        {isAppointment ? (
                                                            /* Badge Appointment (Cyan Style sesuai dashboard) */
                                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d2e8ff] text-[#49baff] border-2 border-[#49baff]">
                                                                Appointment
                                                            </span>
                                                        ) : (
                                                            /* Badge Reschedule (Lime Style sesuai dashboard) */
                                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#e5ff8f] text-[#adc91f] border-2 border-[#adc91f]">
                                                                Reschedule
                                                            </span>
                                                        )}
                                                    </td>
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
                                                colSpan="5"
                                                className="px-6 py-8 text-center text-gray-400 text-sm font-normal"
                                            >
                                                Tidak ada data reservasi yang sesuai dengan pencarian atau filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Pop-up Tambah & Update Reservasi */}
            <ReservationModal
                isOpen={isModalOpen}
                initialData={editingItem}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveReservasi}
            />
        </div>
    )
}

