import React, { useState } from 'react'
import Sidebar from '../components/sidebar'
import {
    ReservationIcon,
    DoctorIcon,
    DashboardIcon,
    ActivityIcon,
} from '../components/icon'

export default function Dashboard({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('ringkasan')

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Data Mock untuk Daftar Reservasi Pasien (sesuai referensi desain & dokumen PRD)
    const reservasiList = [
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
            status: 'Appointment',
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
    ]

    // Data Mock untuk Riwayat Aktivitas Real-time
    const aktivitasList = [
        {
            id: 1,
            type: 'status',
            deskripsi: 'Perubahan Status Reservasi Pasien',
            waktu: '19.42',
        },
        {
            id: 2,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
        {
            id: 3,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
        {
            id: 4,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
        {
            id: 5,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
        {
            id: 6,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
        {
            id: 7,
            type: 'dokter',
            deskripsi: 'Perubahan Jadwal Dokter drg. Indira Nugrahani',
            waktu: '19.42',
        },
    ]

    return (
        <div className="flex h-screen w-full bg-[#f9f8ff] font-['Poppins'] select-none overflow-hidden">
            {/* Sidebar Navigasi Kiri (Fixed w-64) */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
            />

            {/* Area Konten Utama Dashboard (Scrollable) */}
            <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col gap-6">
                {/* 1. Header Halaman */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                        Ringkasan Operasional Klinik
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                        Laporan rekapitulasi data harian dan aktivitas pelayanan medis untuk evaluasi kinerja klinik secara berkala.
                    </p>
                </div>

                {/* 2. Top Stat Cards (2 Kolom) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stat Card 1: Total Reservasi Hari Ini */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                                Total Reservasi Hari Ini
                            </span>
                            <div className="w-10 h-10 rounded-full bg-[#49baff] text-white flex items-center justify-center shadow-xs">
                                <ReservationIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl sm:text-4xl font-bold text-[#49baff] tracking-tight">
                                100
                            </span>
                            <span className="bg-[#adc91f] text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-xs">
                                Pasien
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 2: Dokter Praktik */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                                Dokter Pratik
                            </span>
                            <div className="w-10 h-10 rounded-full bg-[#49baff] text-white flex items-center justify-center shadow-xs">
                                <DoctorIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl sm:text-4xl font-bold text-[#49baff] tracking-tight">
                                7
                            </span>
                            <span className="bg-[#adc91f] text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-xs">
                                Dokter
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Grid Bagian Bawah: Tabel Reservasi Pasien (Kiri) & Riwayat Aktivitas (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-6">
                    {/* Kolom Kiri: Tabel Daftar Reservasi Pasien (span 2) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                                Daftar Reservasi Pasien
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Ringkasan Data Reservasi Pasien Berdasarkan Reservasi Via WA
                            </p>
                        </div>

                        {/* Tabel Kontainer Bordered */}
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white">
                                            <th className="px-5 py-3.5">Nama Pasien</th>
                                            <th className="px-5 py-3.5 text-center">Tanggal & Waktu</th>
                                            <th className="px-5 py-3.5 text-center">Dokter</th>
                                            <th className="px-5 py-3.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                        {reservasiList.map((item, index) => {
                                            const isAppointment = item.status === 'Appointment'

                                            return (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50/70 transition-colors"
                                                >
                                                    <td className="px-5 py-3.5 text-slate-800">
                                                        {item.namaPasien}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center text-slate-800">
                                                        {item.jadwal}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center text-slate-800">
                                                        {item.dokter}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        {isAppointment ? (
                                                            /* Badge Appointment (Cyan Style sesuai DESIGN.md) */
                                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d2e8ff] text-[#49baff] border-2 border-[#49baff]">
                                                                Appointment
                                                            </span>
                                                        ) : (
                                                            /* Badge Reschedule (Lime Style sesuai DESIGN.md) */
                                                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#e5ff8f] text-[#adc91f] border-2 border-[#adc91f]">
                                                                Reschedule
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Riwayat Aktivitas Real-time (span 1) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="mb-5">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-slate-700 shrink-0" />
                                <span>Riwayat Aktivitas</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Log pembaruan sistem secara real-time
                            </p>
                        </div>

                        {/* List Riwayat Aktivitas */}
                        <div className="space-y-4">
                            {aktivitasList.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 justify-between"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-[#49baff] text-white flex items-center justify-center shrink-0 shadow-xs">
                                            {item.type === 'status' ? (
                                                <DashboardIcon className="w-4 h-4" />
                                            ) : (
                                                <DoctorIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 leading-snug line-clamp-2">
                                            {item.deskripsi}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium ml-2 whitespace-nowrap shrink-0">
                                        {item.waktu}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

