import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/sidebar'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/pagination'
import {
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
    ActivityIcon,
    SpinnerIcon,
    ErrorIcon,
} from '../components/icon'
import { calculateDoctorStatus } from '../utils/doctorStatus'

// Palet warna batang statistik sesuai referensi (Merah, Plum, Cokelat, Ungu, Teal, Violet, Hijau Lemon, Hijau Daun, Indigo, Krem/Peach, Mustard, Hijau Muda)
const CHART_PALETTE = [
    '#49baff', // Sky Blue (primary)
    '#1e88e5', // Bright Blue
    '#0ea5e9', // Light Blue
    '#2563eb', // Royal Blue
    '#38bdf8', // Soft Cyan Blue
    '#3b82f6', // Medium Blue
    '#60a5fa', // Periwinkle Blue
    '#0284c7', // Deep Sky Blue
    '#7dd3fc', // Pale Blue
    '#1d4ed8', // Indigo Blue
    '#93c5fd', // Muted Blue
    '#0369a1', // Dark Ocean Blue
]

// Helper penghitungan skala sumbu Y (Y-Axis ticks) yang rapi
const getYAxisTicks = (maxVal) => {
    const val = Math.max(maxVal, 4)
    let step
    if (val <= 5) step = 1
    else if (val <= 10) step = 2
    else if (val <= 20) step = 4
    else if (val <= 50) step = 10
    else step = Math.ceil(val / 5)

    const topTick = Math.ceil(val / step) * step
    const ticks = []
    for (let i = 0; i <= topTick; i += step) {
        ticks.push(i)
    }
    return { ticks, maxDisplay: topTick }
}

export default function Dashboard({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('ringkasan')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedTrendTab, setSelectedTrendTab] = useState('diagnosa')
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
        trenEmr: {
            diagnosa: [],
            regio: [],
            tindakan: [],
            totalRecords: 0,
        },
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Helper untuk mengolah tren EMR secara client-side jika diperlukan
    const computeEmrTrends = (records) => {
        const countMap = (key, splitComma = false) => {
            const map = {}
                ; (records || []).forEach((r) => {
                    const val = r[key]
                    if (!val || val === '-' || !val.trim()) return
                    if (splitComma && val.includes(',')) {
                        val.split(',').forEach((s) => {
                            const clean = s.trim()
                            if (clean && clean !== '-') map[clean] = (map[clean] || 0) + 1
                        })
                    } else {
                        const clean = val.trim()
                        map[clean] = (map[clean] || 0) + 1
                    }
                })
            return Object.entries(map)
                .map(([label, count]) => ({ label, count }))
                .sort((a, b) => b.count - a.count)
        }
        return {
            diagnosa: countMap('anamnesa', false),
            regio: countMap('regio', true),
            tindakan: countMap('tindakan', false),
            totalRecords: (records || []).length,
        }
    }

    // Ambil data ringkasan operasional dari Backend API secara real-time
    const fetchSummary = useCallback(async (isSilent = false) => {
        if (!isSilent) {
            setIsLoading(true)
        }
        setError(null)

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
            if (!token) {
                if (onLogout) onLogout()
                return
            }

            const [summaryRes, dokterRes, emrRes] = await Promise.all([
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
                fetch('http://localhost:5000/api/v1/rekam-medis', {
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
                } catch {
                    // Fallback to backend count
                }
            }

            // Dapatkan tren EMR dari backend atau olah langsung dari endpoint rekam-medis
            let trenEmr = result.data?.trenEmr
            if (!trenEmr || !trenEmr.diagnosa || trenEmr.diagnosa.length === 0) {
                if (emrRes && emrRes.ok) {
                    try {
                        const emrData = await emrRes.json()
                        if (emrData.success && Array.isArray(emrData.data)) {
                            trenEmr = computeEmrTrends(emrData.data)
                        }
                    } catch {
                        // ignore
                    }
                }
            }

            setSummary({
                ...result.data,
                totalDokterPraktikHariIni: liveActiveDoctorCount,
                totalDokterAktif: liveActiveDoctorCount,
                trenEmr: trenEmr || {
                    diagnosa: [],
                    regio: [],
                    tindakan: [],
                    totalRecords: 0,
                },
            })
        } catch (err) {
            console.error('Error saat fetch dashboard summary:', err)
            setError(err.message || 'Tidak dapat terhubung ke server backend.')
        } finally {
            setIsLoading(false)
        }
    }, [onLogout])

    useEffect(() => {
        let isMounted = true

        // Ambil data pertama kali secara async agar tidak memicu setState sinkron di body effect
        Promise.resolve().then(() => {
            if (isMounted) {
                fetchSummary()
            }
        })

        // 1. Refetch otomatis saat jendela/tab browser difokuskan kembali
        const handleFocus = () => {
            fetchSummary(true)
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchSummary(true)
            }
        }
        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // 2. Refetch berkala (polling halus setiap 8 detik) agar grafik langsung ter-update jika ada data baru
        const intervalId = setInterval(() => {
            fetchSummary(true)
        }, 8000)

        return () => {
            isMounted = false
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(intervalId)
        }
    }, [fetchSummary])

    const reservasiList = summary.daftarReservasi || []
    const aktivitasList = summary.riwayatAktivitas || []

    // Data tren EMR aktif berdasarkan filter tab (menampilkan semua data tanpa dipotong)
    const trenData = summary.trenEmr || { diagnosa: [], regio: [], tindakan: [] }
    const currentChartItems =
        selectedTrendTab === 'diagnosa'
            ? trenData.diagnosa || []
            : selectedTrendTab === 'regio'
                ? trenData.regio || []
                : trenData.tindakan || []

    const maxChartCount = Math.max(...currentChartItems.map((item) => item.count), 0)
    const { ticks: yAxisTicks, maxDisplay: chartMaxDisplay } = getYAxisTicks(maxChartCount)
    const trendLabelName =
        selectedTrendTab === 'diagnosa'
            ? 'Diagnosa'
            : selectedTrendTab === 'regio'
                ? 'Regio (Gigi)'
                : 'Tindakan'

    // Lebar minimum area chart agar seluruh batang dan label tegak tetap lega, tidak terpotong, dan dapat di-scroll horizontal jika banyak
    const chartMinInnerWidth = Math.max(currentChartItems.length * 88, 360)

    return (
        <div className="flex h-screen w-full bg-[#f9f8ff] font-['Poppins'] select-none overflow-hidden">
            {/* Sidebar Navigasi Kiri (Fixed w-64) */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
            />

            <div className="flex-1 min-w-0 h-screen flex flex-col">
                <PageHeader
                    title="Ringkasan Operasional Klinik"
                    subtitle="Laporan rekapitulasi data harian dan aktivitas pelayanan medis untuk evaluasi kinerja klinik secara berkala."
                />

                {/* Area Konten Utama Dashboard (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col gap-6">

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
                                    Jadwal Kunjungan Hari Ini
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

                    {/* 3. Baris Grid Tengah: Grafik Batang Tren EMR (Kiri, span 2) & Riwayat Aktivitas (Kanan, span 1) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* Card Grafik Batang Tren EMR (span 2) */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
                            {/* Header Card Grafik dengan Filter Switcher */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <EMRIcon className="w-5 h-5 text-slate-700 shrink-0" />
                                        <span>Tren Pelayanan Medis</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Visualisasi tren frekuensi kasus terbanyak pasien klinik
                                    </p>
                                </div>

                                {/* Filter Switcher: Diagnosa | Regio | Tindakan */}
                                <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTrendTab('diagnosa')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedTrendTab === 'diagnosa'
                                            ? 'bg-[#49baff] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                            }`}
                                    >
                                        Diagnosa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTrendTab('regio')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedTrendTab === 'regio'
                                            ? 'bg-[#49baff] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                            }`}
                                    >
                                        Regio (Gigi)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTrendTab('tindakan')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedTrendTab === 'tindakan'
                                            ? 'bg-[#49baff] text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                            }`}
                                    >
                                        Tindakan
                                    </button>
                                </div>
                            </div>

                            {/* Area Visualisasi Grafik Batang */}
                            <div className="flex-1 flex flex-col justify-end pt-4 min-h-[320px]">
                                {isLoading ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <SpinnerIcon className="w-6 h-6 animate-spin text-[#49baff]" />
                                        <span className="text-xs">Memuat data grafik tren EMR...</span>
                                    </div>
                                ) : currentChartItems.length === 0 ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <EmptyState
                                            compact
                                            icon={EMRIcon}
                                            title={`Belum ada data tren ${trendLabelName}`}
                                            description="Data rekam medis yang dicatat di EMR akan otomatis dianalisis dan divisualisasikan grafiknya di sini."
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full">
                                        {/* Judul Grafik di Tengah Sesuai Gambar Referensi */}
                                        <h3 className="text-center font-bold text-slate-800 text-sm sm:text-base mb-4 select-none tracking-wide">
                                            Grafik Tren {trendLabelName}
                                        </h3>

                                        {/* Container Utama: Y-Axis di Kiri & Plot Area + X-Axis di Kanan */}
                                        <div className="flex w-full items-start">
                                            {/* Sumbu Y (Angka Nilai di Kiri Sesuai Referensi) */}
                                            <div className="w-7 sm:w-9 shrink-0 h-56 flex flex-col justify-between items-end pr-2 text-[10px] sm:text-[11px] font-semibold text-slate-500 select-none">
                                                {yAxisTicks.slice().reverse().map((tick, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`leading-none ${idx === 0 ? 'translate-y-1' : idx === yAxisTicks.length - 1 ? '-translate-y-1' : ''}`}
                                                    >
                                                        {tick}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Area Grid Chart & Batang (Scrollable jika data banyak/layar kecil) */}
                                            <div className="flex-1 min-w-0 overflow-x-auto pb-2">
                                                <div style={{ minWidth: `${chartMinInnerWidth}px` }} className="w-full">
                                                    {/* Box Plotting dengan Border Kiri & Bawah + Background Putih */}
                                                    <div className="relative h-56 border-l-2 border-b-2 border-slate-300 bg-white shadow-2xs">
                                                        {/* Garis Grid Horizontal Lembut */}
                                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                            {yAxisTicks.map((_, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`w-full border-b ${idx === yAxisTicks.length - 1 ? 'border-transparent' : 'border-slate-100'}`}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Grid Vertikal & Batang Warna-Warni Sesuai Referensi */}
                                                        <div className="absolute inset-0 flex items-end">
                                                            {currentChartItems.map((item, idx) => {
                                                                const barColor = CHART_PALETTE[idx % CHART_PALETTE.length]
                                                                const heightPercent = chartMaxDisplay > 0 ? (item.count / chartMaxDisplay) * 100 : 0
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex-1 h-full flex flex-col items-center justify-end relative group border-r border-slate-100 last:border-r-0 px-1 sm:px-1.5"
                                                                    >
                                                                        {/* Tooltip Hover Nilai Detail */}
                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 z-30 pointer-events-none">
                                                                            <div className="bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
                                                                                {item.label}: <span className="text-yellow-300 font-bold">{item.count} kasus</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Angka Ringkas di Atas Batang */}
                                                                        {item.count > 0 && (
                                                                            <span className="mb-1 text-[10px] sm:text-[11px] font-bold text-slate-600 select-none">
                                                                                {item.count}
                                                                            </span>
                                                                        )}

                                                                        {/* Batang Solid Persegi Bergaya Statistik */}
                                                                        <div
                                                                            style={{
                                                                                height: `${Math.max(heightPercent, 2)}%`,
                                                                                backgroundColor: barColor,
                                                                            }}
                                                                            className="w-full max-w-[34px] sm:max-w-[46px] rounded-t-[2px] transition-all duration-300 group-hover:brightness-110 shadow-xs"
                                                                        />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Sumbu X: Label Kategori Tegak (Tidak Miring & Teks Lengkap Tanpa Terpotong) */}
                                                    <div className="flex items-start pt-2.5 pb-2 min-h-[52px]">
                                                        {currentChartItems.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex-1 flex flex-col items-center justify-start px-1 text-center"
                                                            >
                                                                <span
                                                                    title={item.label}
                                                                    className="text-[10px] sm:text-[11px] font-semibold text-slate-700 leading-snug break-words text-center w-full hover:text-[#49baff] transition-colors cursor-default"
                                                                >
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keterangan Footer Chart */}
                                        <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-gray-400 px-1 border-t border-slate-100 pt-2.5">
                                            <span>* Berdasarkan catatan rekam medis terdaftar</span>
                                            <span className="font-semibold text-slate-500">Satuan: Kasus Pasien</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Riwayat Aktivitas Real-time (span 1) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <ActivityIcon className="w-5 h-5 text-slate-700 shrink-0" />
                                        <span>Riwayat Aktivitas</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Log pembaruan sistem secara real-time
                                    </p>
                                </div>

                                {/* List Riwayat Aktivitas */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {isLoading ? (
                                        <div className="py-8 text-center text-gray-400 text-xs">
                                            <SpinnerIcon className="w-5 h-5 animate-spin mx-auto text-[#49baff] mb-1" />
                                            <span>Memuat log aktivitas...</span>
                                        </div>
                                    ) : aktivitasList.length === 0 ? (
                                        <div className="py-10 flex items-center justify-center">
                                            <EmptyState
                                                compact
                                                icon={ActivityIcon}
                                                title="Belum ada aktivitas tercatat"
                                                description="Log pembaruan sistem akan muncul otomatis saat ada aktivitas."
                                            />
                                        </div>
                                    ) : (
                                        aktivitasList.map((item) => {
                                            const statusText = item.status || 'Pembaruan'
                                            const isTambah = statusText.toLowerCase() === 'tambah'
                                            const isHapus = statusText.toLowerCase() === 'menghapus' || statusText.toLowerCase() === 'hapus'

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
                    </div>

                    {/* 4. Baris Bagian Bawah: Tabel Reservasi Pasien (Full Width di bawah Grafik & Aktivitas) */}
                    <div className="w-full bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col pb-6">
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
                                            <th className="px-5 py-3.5 text-center">Tanggal Kunjungan</th>
                                            <th className="px-5 py-3.5 text-center">Waktu Kunjungan</th>
                                            <th className="px-5 py-3.5 text-center">Dokter</th>
                                            <th className="px-5 py-3.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <SpinnerIcon className="w-6 h-6 animate-spin text-[#49baff]" />
                                                        <span className="text-xs">Memuat data reservasi...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : reservasiList.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center">
                                                    <EmptyState
                                                        icon={ReservationIcon}
                                                        title="Belum ada data reservasi"
                                                        description="Jadwal reservasi pasien yang dibuat akan otomatis muncul di sini."
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            reservasiList
                                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                .map((item) => {
                                                    const isAppointment = item.status === 'Appointment'
                                                    const rawTime = item.waktuKunjungan || item.waktu_kunjungan || item.waktu || ''
                                                    const displayTime = rawTime ? (rawTime.includes('WIB') ? rawTime : `${rawTime} WIB`) : '-'

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-gray-50/70 transition-colors"
                                                        >
                                                            <td className="px-5 py-3.5 text-slate-800 font-medium">
                                                                {item.namaPasien}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center text-slate-700">
                                                                {item.tanggalKunjungan || item.tanggal_kunjungan || item.tanggal || '-'}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center text-slate-700">
                                                                {displayTime}
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
                </main>
            </div>
        </div>
    )
}
