import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/sidebar'
import Pagination from '../components/pagination'
import {
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
    DashboardIcon,
    ActivityIcon,
    CalendarOutlineIcon,
    SpinnerIcon,
    ErrorIcon,
} from '../components/icon'
import { calculateDoctorStatus } from '../utils/doctorStatus'

export default function Dashboard({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('ringkasan')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // State untuk data ringkasan dari backend (awal: 0 / kosong)
    const [summary, setSummary] = useState({
        totalReservasiHariIni: 0,
        totalDokter: 0,
        totalDokterAktif: 0,
        totalDokterPraktikHariIni: 0,
        rekapStatus: { appointment: 0, reschedule: 0 },
        daftarReservasi: [],
        riwayatAktivitas: [],
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Ambil data ringkasan operasional dari Backend API
    const fetchSummary = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
            if (!token) {
                if (onLogout) onLogout()
                return
            }

            const [summaryRes, dokterRes] = await Promise.all([
                fetch('http://localhost:5000/api/v1/dashboard/summary', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }),
                fetch('http://localhost:5000/api/v1/dokter', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }).catch(() => null),
            ])

            const result = await summaryRes.json()

            if (!summaryRes.ok || !result.success) {
                if (summaryRes.status === 401) {
                    if (onLogout) onLogout()
                    return
                }
                throw new Error(result?.error?.message || 'Gagal memuat data ringkasan dashboard.')
            }

            let liveActiveDoctorCount = result.data?.totalDokterPraktikHariIni ?? 0

            // Hitung secara real-time dokter yang berstatus AKTIF hari ini (selaras 100% dengan halaman Dokter)
            if (dokterRes && dokterRes.ok) {
                try {
                    const dokterData = await dokterRes.json()
                    if (dokterData.success && Array.isArray(dokterData.data)) {
                        const activeList = dokterData.data.filter((doc) => calculateDoctorStatus(doc).isActive)
                        liveActiveDoctorCount = activeList.length
                    }
                } catch (e) {
                    // Fallback to backend count
                }
            }

            setSummary({
                ...result.data,
                totalDokterPraktikHariIni: liveActiveDoctorCount,
                totalDokterAktif: liveActiveDoctorCount,
            })
        } catch (err) {
            console.error('Error saat fetch dashboard summary:', err)
            setError(err.message || 'Tidak dapat terhubung ke server backend.')
        } finally {
            setIsLoading(false)
        }
    }, [onLogout])

    useEffect(() => {
        fetchSummary()
    }, [fetchSummary])

    const reservasiList = summary.daftarReservasi || []
    const aktivitasList = summary.riwayatAktivitas || []

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                            Ringkasan Operasional Klinik
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                            Laporan rekapitulasi data harian dan aktivitas pelayanan medis untuk evaluasi kinerja klinik secara berkala.
                        </p>
                    </div>
                </div>

                {/* Penanganan Notifikasi Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <ErrorIcon className="w-5 h-5 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={fetchSummary}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

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
                            {isLoading ? (
                                <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-md"></div>
                            ) : (
                                <span className="text-3xl sm:text-4xl font-bold text-[#49baff] tracking-tight">
                                    {summary.totalReservasiHariIni}
                                </span>
                            )}
                            <span className="bg-[#adc91f] text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-xs">
                                Pasien
                            </span>
                        </div>
                        {/* Rekap Status Sub-informasi */}
                        {!isLoading && summary.rekapStatus && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-4 text-xs text-gray-500">
                                <span>Appointment: <strong className="text-slate-700">{summary.rekapStatus.appointment}</strong></span>
                                <span>Reschedule: <strong className="text-slate-700">{summary.rekapStatus.reschedule}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Stat Card 2: Dokter Praktik Hari Ini */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                                Dokter Praktik Hari Ini
                            </span>
                            <div className="w-10 h-10 rounded-full bg-[#49baff] text-white flex items-center justify-center shadow-xs">
                                <DoctorIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            {isLoading ? (
                                <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-md"></div>
                            ) : (
                                <span className="text-3xl sm:text-4xl font-bold text-[#49baff] tracking-tight">
                                    {summary.totalDokterPraktikHariIni ?? summary.totalDokterAktif ?? 0}
                                </span>
                            )}
                            <span className="bg-[#adc91f] text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-xs">
                                Dokter
                            </span>
                        </div>
                        {!isLoading && (
                            <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500 font-normal">
                                {(summary.totalDokterPraktikHariIni ?? summary.totalDokterAktif) > 0 ? (
                                    <span className="text-emerald-600 font-medium">Dokter memiliki jadwal praktik aktif hari ini</span>
                                ) : (
                                    <span>Tidak ada jadwal praktik dokter hari ini</span>
                                )}
                            </div>
                        )}
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
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <SpinnerIcon className="w-6 h-6 animate-spin text-[#49baff]" />
                                                        <span className="text-xs">Memuat data reservasi...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : reservasiList.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                                        <CalendarOutlineIcon className="w-8 h-8 text-slate-300" />
                                                        <p className="font-medium text-slate-600 text-sm mt-1">Belum ada data reservasi</p>
                                                        <p className="text-gray-400 text-xs">Jadwal reservasi pasien yang dibuat akan otomatis muncul di sini.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reservasiList
                                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                .map((item) => {
                                                    const isAppointment = item.status === 'Appointment'

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-gray-50/70 transition-colors"
                                                        >
                                                            <td className="px-5 py-3.5 text-slate-800 font-medium">
                                                                {item.namaPasien}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center text-slate-700">
                                                                {item.jadwal}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center text-slate-700">
                                                                {item.dokter}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center">
                                                                {isAppointment ? (
                                                                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d2e8ff] text-[#49baff] border-2 border-[#49baff]">
                                                                        Appointment
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#e5ff8f] text-[#adc91f] border-2 border-[#adc91f]">
                                                                        Reschedule
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination jika data lebih dari itemsPerPage */}
                        {reservasiList.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={reservasiList.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
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

                        {/* List Riwayat Aktivitas (Scroll otomatis jika lebih dari 7 item) */}
                        <div className="space-y-4 max-h-[405px] overflow-y-auto pr-1">
                            {isLoading ? (
                                <div className="py-8 text-center text-gray-400 text-xs">
                                    <SpinnerIcon className="w-5 h-5 animate-spin mx-auto text-[#49baff] mb-1" />
                                    <span>Memuat log aktivitas...</span>
                                </div>
                            ) : aktivitasList.length === 0 ? (
                                <div className="py-10 text-center text-gray-400 flex flex-col items-center justify-center gap-1.5">
                                    <ActivityIcon className="w-7 h-7 text-slate-300" />
                                    <p className="font-medium text-slate-600 text-xs mt-1">Belum ada aktivitas tercatat</p>
                                    <p className="text-gray-400 text-[11px]">Log pembaruan sistem akan muncul otomatis saat ada aktivitas.</p>
                                </div>
                            ) : (
                                aktivitasList.map((item) => {
                                    const statusText = item.status || 'Pembaruan'
                                    const isTambah = statusText.toLowerCase() === 'tambah'
                                    const isHapus = statusText.toLowerCase() === 'menghapus' || statusText.toLowerCase() === 'hapus'

                                    // Warna Tag/Badge dan Bg Icon sesuai panduan DESIGN.md dan warna yang sudah digunakan di sistem
                                    const badgeColor = isTambah
                                        ? 'bg-[#d2e8ff] text-[#49baff] border-2 border-[#49baff]'
                                        : isHapus
                                        ? 'bg-[#fddada] text-[#e31e1e] border-2 border-[#fca5a5]'
                                        : 'bg-[#e5ff8f] text-[#adc91f] border-2 border-[#adc91f]'

                                    const iconBg = isTambah
                                        ? 'bg-[#49baff]'
                                        : isHapus
                                        ? 'bg-[#e31e1e]'
                                        : 'bg-[#adc91f]'

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 justify-between py-1"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-8 h-8 rounded-full ${iconBg} text-white flex items-center justify-center shrink-0 shadow-xs transition-colors`}
                                                >
                                                    {item.type === 'dokter' ? (
                                                        <DoctorIcon className="w-4 h-4" />
                                                    ) : item.type === 'emr' ? (
                                                        <EMRIcon className="w-4 h-4" />
                                                    ) : (
                                                        <ReservationIcon className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0 gap-0.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border-2 leading-none shrink-0 ${badgeColor}`}
                                                        >
                                                            {statusText}
                                                        </span>
                                                        <p className="text-xs font-medium text-slate-700 leading-snug truncate">
                                                            {item.deskripsi}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-semibold ml-2 whitespace-nowrap shrink-0">
                                                {item.waktu}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
