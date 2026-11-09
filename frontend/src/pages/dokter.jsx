import React, { useState } from 'react'
import Sidebar from '../components/sidebar'
import { DoctorModal } from '../components/modals'
import {
    PlusIcon,
    EditIcon,
    TrashIcon,
    ClockOutlineIcon,
} from '../components/icon'

export default function Dokter({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('dokter')

    // Data Dokter & Jadwal Praktik (sesuai referensi desain & dokumen PRD)
    const [dokterList, setDokterList] = useState([
        {
            id: 1,
            nama: 'drg. Indira Nugrahani',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 2,
            nama: 'drg. Adria Permana Putra, Sp.BM',
            spesialisasi: 'Dokter Gigi Spesialis Beda Mulut',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 3,
            nama: 'drg. Mhay Chyntha Harlyana',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 4,
            nama: 'drg. Larena',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 5,
            nama: 'drg. R. Sherly',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 6,
            nama: 'drg. Fara',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
        {
            id: 7,
            nama: 'drg. Sarah',
            spesialisasi: 'Dokter Gigi Umum',
            status: 'Aktif',
            cabang: 'Garuda',
            jadwal: [
                { hari: 'Rabu:', jam: '15.00 - 20.00' },
                { hari: 'Kamis:', jam: '08.00 - 20.00' },
            ],
        },
    ])

    // State Modal (Tambah & Edit)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState(null)

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    const handleOpenAddModal = () => {
        setEditingDoctor(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (doctor) => {
        setEditingDoctor(doctor)
        setIsModalOpen(true)
    }

    const handleSaveDoctor = (data) => {
        if (editingDoctor) {
            // Update dokter yang sedang diedit
            setDokterList((prev) =>
                prev.map((item) => (item.id === editingDoctor.id ? { ...item, ...data } : item))
            )
        } else {
            // Tambahkan dokter baru
            setDokterList((prev) => [data, ...prev])
        }
    }

    const handleDeleteDoctor = (id, nama) => {
        if (window.confirm(`Hapus data dokter ${nama}?`)) {
            setDokterList((prev) => prev.filter((item) => item.id !== id))
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

                {/* 2. Grid Card Dokter (3 Kolom sesuai DESIGN.md) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                    {dokterList.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                        >
                            {/* Bagian Atas Card: Info Dokter & Tombol Aksi */}
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col min-w-0 pr-2">
                                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-tight truncate">
                                            {doctor.nama}
                                        </h2>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5 leading-snug">
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

                                {/* Status Badge Aktif */}
                                <div className="mt-2.5 mb-4">
                                    <span className="inline-block bg-[#adc91f] text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-xs">
                                        {doctor.status}
                                    </span>
                                </div>
                            </div>

                            {/* Bagian Bawah Card: Jadwal Praktek */}
                            <div className="border-t border-gray-100 pt-3.5">
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                                    <ClockOutlineIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>Jadwal Praktek</span>
                                </div>

                                <div className="space-y-1">
                                    {doctor.jadwal.map((j, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-xs sm:text-sm text-slate-700 font-medium"
                                        >
                                            <span>{j.hari}</span>
                                            <span>{j.jam}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal Pop-up Tambah & Update Dokter */}
            <DoctorModal
                isOpen={isModalOpen}
                initialData={editingDoctor}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveDoctor}
            />
        </div>
    )
}

