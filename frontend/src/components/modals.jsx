import React, { useState, useEffect } from 'react'
import {
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
    ClearIcon,
    CalendarOutlineIcon,
    ClockOutlineIcon,
    ChevronDownIcon,
} from './icon'
import { toDateInputValue, toDisplayDate, getTodayDateString } from '../utils/date'

/**
 * Helper: Dapatkan nama hari dalam Bahasa Indonesia dari format tanggal YYYY-MM-DD
 */
export function getDayNameFromDate(dateStr) {
    if (!dateStr) return null
    const clean = String(dateStr).trim()
    const parts = clean.split('-')
    if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        return days[d.getDay()]
    }
    const d = new Date(clean)
    if (isNaN(d.getTime())) return null
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[d.getDay()]
}

/**
 * Helper: Ubah string jam ("15.00", "20:00 WIB", "09.42", dsb) menjadi total menit sejak tengah malam
 */
export function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null
    const clean = String(timeStr).trim()
    const match = clean.match(/(\d{1,2})[:.](\d{2})/)
    if (match) {
        const h = parseInt(match[1], 10)
        const m = parseInt(match[2], 10)
        return h * 60 + m
    }
    const singleMatch = clean.match(/^(\d{1,2})$/)
    if (singleMatch) {
        return parseInt(singleMatch[1], 10) * 60
    }
    return null
}

/**
 * Helper: Ambil seluruh daftar jadwal praktik dokter tanpa data dummy
 */
export function getDoctorScheduleList(doctor) {
    if (!doctor || typeof doctor !== 'object') return []

    // 1. Array langsung dari doctor.jadwal
    if (Array.isArray(doctor.jadwal) && doctor.jadwal.length > 0) {
        return doctor.jadwal
    }

    // 2. Gabungan dari jadwalGaruda dan jadwalMuchtar jika ada
    const combinedBranches = [
        ...(Array.isArray(doctor.jadwalGaruda) ? doctor.jadwalGaruda : []),
        ...(Array.isArray(doctor.jadwalMuchtar) ? doctor.jadwalMuchtar : []),
    ]
    if (combinedBranches.length > 0) {
        return combinedBranches
    }

    // 3. Dari objek jadwal_json
    if (doctor.jadwal_json) {
        if (Array.isArray(doctor.jadwal_json)) {
            return doctor.jadwal_json
        }
        if (typeof doctor.jadwal_json === 'object') {
            if (Array.isArray(doctor.jadwal_json.jadwal) && doctor.jadwal_json.jadwal.length > 0) {
                return doctor.jadwal_json.jadwal
            }
            const jsonBranches = [
                ...(Array.isArray(doctor.jadwal_json.jadwalGaruda) ? doctor.jadwal_json.jadwalGaruda : []),
                ...(Array.isArray(doctor.jadwal_json.jadwalMuchtar) ? doctor.jadwal_json.jadwalMuchtar : []),
            ]
            if (jsonBranches.length > 0) {
                return jsonBranches
            }
        }
    }

    return []
}

/**
 * Helper: Cek ketersediaan dokter berdasarkan hari praktik
 * Menghasilkan { isAvailable: boolean, reason: string }
 * Jika dokter tidak memiliki jadwal praktik pada hari yang bersangkutan,
 * dokter dinonaktifkan (disabled) dan label menunjukkan alasan.
 */
export function checkDoctorAvailability(doctor, tanggal) {
    if (!doctor) return { isAvailable: false, reason: 'Data dokter tidak valid' }

    // 1. Cek status dasar dokter
    if (doctor.status && doctor.status.toLowerCase() !== 'aktif') {
        return { isAvailable: false, reason: 'Tidak Aktif' }
    }

    const schedules = getDoctorScheduleList(doctor)

    // Jika dokter belum memiliki konfigurasi jadwal sama sekali
    if (!schedules || schedules.length === 0) {
        return {
            isAvailable: false,
            reason: 'Tidak Praktik',
        }
    }

    // Tentukan hari dan apakah sedang mengecek hari ini
    const todayStr = getTodayDateString()
    const targetDate = tanggal || todayStr
    const dayName = getDayNameFromDate(targetDate)
    const isTodayCheck = !tanggal || tanggal === todayStr

    if (!dayName) {
        return { isAvailable: true, reason: '' }
    }

    // Cari jadwal praktik dokter pada hari yang bersangkutan
    const daySchedules = schedules.filter((s) => {
        if (!s || !s.hari) return false
        const cleanDay = s.hari.replace(':', '').trim().toLowerCase()
        return cleanDay === dayName.toLowerCase()
    })

    // Jika dokter tidak memiliki jadwal praktik sama sekali pada hari tersebut
    if (daySchedules.length === 0) {
        return {
            isAvailable: false,
            reason: isTodayCheck ? 'Tidak Praktik Hari Ini' : `Tidak Praktik Hari ${dayName}`,
        }
    }

    return { isAvailable: true, reason: '' }
}

/**
 * Modal Tambah / Update Reservasi Pasien
 */
export function ReservationModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    doctors = [],
}) {
    const isEdit = Boolean(initialData)

    const [namaPasien, setNamaPasien] = useState('')
    const [tanggal, setTanggal] = useState('')
    const [waktu, setWaktu] = useState('')
    const [dokter, setDokter] = useState('')
    const [status, setStatus] = useState('Appointment')
    const [error, setError] = useState('')

    // Daftar dokter aktif dari backend (tanpa data dummy, siap input manual)
    const activeDoctorList = doctors || []

    useEffect(() => {
        if (initialData) {
            setNamaPasien(initialData.namaPasien || '')
            if (initialData.tanggalIso) {
                setTanggal(initialData.tanggalIso)
            } else if (initialData.jadwal) {
                const parts = initialData.jadwal.split(' ')
                setTanggal(toDateInputValue(parts[0] || ''))
            } else {
                setTanggal(toDateInputValue(initialData.tanggal || ''))
            }
            setWaktu(initialData.waktu || initialData.waktu_reservasi || '')
            setDokter(initialData.dokter || initialData.dokterDetail?.nama || '')
            setStatus(initialData.status || 'Appointment')
        } else {
            setNamaPasien('')
            setTanggal('')
            setWaktu('')
            setDokter('')
            setStatus('Appointment')
        }
        setError('')
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!namaPasien.trim()) {
            setError('Nama pasien wajib diisi.')
            return
        }
        if (!tanggal.trim()) {
            setError('Tanggal reservasi wajib diisi.')
            return
        }
        if (!waktu.trim()) {
            setError('Waktu reservasi wajib diisi.')
            return
        }
        if (!dokter) {
            setError('Silakan pilih dokter.')
            return
        }
        if (!status) {
            setError('Silakan pilih status reservasi.')
            return
        }

        const selectedDocObj = activeDoctorList.find((d) =>
            (typeof d === 'object' ? d.nama === dokter : d === dokter)
        )

        if (!selectedDocObj) {
            setError('Silakan pilih dokter yang valid.')
            return
        }

        const displayDate = toDisplayDate(tanggal.trim())
        const payload = {
            id: initialData?.id,
            namaPasien: namaPasien.trim(),
            tanggal: tanggal.trim(),
            waktu: waktu.trim(),
            jadwal: waktu.trim() ? `${displayDate} ${waktu.trim()}` : displayDate,
            dokter: typeof selectedDocObj === 'object' ? selectedDocObj.nama : dokter,
            dokter_id: typeof selectedDocObj === 'object' ? selectedDocObj.id : undefined,
            status,
        }

        if (onSubmit) {
            onSubmit(payload)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 sm:p-8">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <ReservationIcon className="w-5 h-5 text-slate-700 shrink-0" />
                        <h2 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
                            {isEdit ? 'Update Reservasi Pasien' : 'Tambah Reservasi Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="mt-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Input: Nama Pasien */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                            Nama Pasien
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={namaPasien}
                                onChange={(e) => setNamaPasien(e.target.value)}
                                placeholder="Nama Lengkap Pasien"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                            />
                            {namaPasien && (
                                <button
                                    type="button"
                                    onClick={() => setNamaPasien('')}
                                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <ClearIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grid 2 Kolom: Tanggal & Waktu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tanggal */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                onClick={(e) => e.target.showPicker?.()}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all cursor-pointer"
                            />
                        </div>

                        {/* Waktu */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Waktu
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={waktu}
                                    onChange={(e) => setWaktu(e.target.value)}
                                    placeholder="09.42 WIB"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                                />
                                <div className="absolute right-3 text-gray-800 pointer-events-none">
                                    <ClockOutlineIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid 2 Kolom: Dokter & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dokter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Dokter
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    value={dokter}
                                    onChange={(e) => setDokter(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                                >
                                    <option value="" disabled>
                                        Pilih Dokter
                                    </option>
                                    {activeDoctorList.map((doc, idx) => {
                                        const name = typeof doc === 'object' ? doc.nama : doc
                                        return (
                                            <option key={idx} value={name}>
                                                {name}
                                            </option>
                                        )
                                    })}
                                </select>
                                <div className="absolute right-3 text-gray-400 pointer-events-none">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Status
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                                >
                                    <option value="Appointment">Appointment</option>
                                    <option value="Reschedule">Reschedule</option>
                                </select>
                                <div className="absolute right-3 text-gray-400 pointer-events-none">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-[#e62e2e] hover:bg-[#cf2525] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-md shadow-[#49baff]/30 flex items-center gap-1.5"
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Tambah +'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/**
 * Modal Tambah / Update Dokter & Jadwal Praktik
 */
export function DoctorModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
}) {
    const isEdit = Boolean(initialData)

    const [nama, setNama] = useState('')
    const [spesialisasi, setSpesialisasi] = useState('')
    const [error, setError] = useState('')

    // Template 7 hari operasional klinik (Senin - Minggu)
    const createEmptyDays = () => [
        { key: 'Senin', label: 'Senin', active: false, start: '', end: '' },
        { key: 'Selasa', label: 'Selasa', active: false, start: '', end: '' },
        { key: 'Rabu', label: 'Rabu', active: false, start: '', end: '' },
        { key: 'Kamis', label: 'Kamis', active: false, start: '', end: '' },
        { key: 'Jumat', label: 'Jumat', active: false, start: '', end: '' },
        { key: 'Sabtu', label: 'Sabtu', active: false, start: '', end: '' },
        { key: 'Minggu', label: 'Minggu', active: false, start: '', end: '' },
    ]

    const [muchtarDays, setMuchtarDays] = useState(createEmptyDays)

    useEffect(() => {
        if (initialData) {
            setNama(initialData.nama || '')
            setSpesialisasi(initialData.spesialisasi || '')

            const mapSchedule = (targetJadwal) =>
                createEmptyDays().map((d) => {
                    if (!targetJadwal || !Array.isArray(targetJadwal)) return d
                    const match = targetJadwal.find((j) =>
                        j.hari && j.hari.toLowerCase().includes(d.key.toLowerCase())
                    )
                    if (match && match.jam) {
                        const parts = match.jam.split('-')
                        const start = parts[0] ? parts[0].trim() : ''
                        const end = parts[1] ? parts[1].trim() : ''
                        return { ...d, active: true, start: start || '', end: end || '' }
                    }
                    return d
                })

            const rawJadwal =
                (Array.isArray(initialData.jadwalMuchtar) && initialData.jadwalMuchtar.length > 0)
                    ? initialData.jadwalMuchtar
                    : ((Array.isArray(initialData.jadwal) && initialData.jadwal.length > 0)
                        ? initialData.jadwal
                        : (initialData.jadwalGaruda || []))

            setMuchtarDays(mapSchedule(rawJadwal))
        } else {
            setNama('')
            setSpesialisasi('')
            setMuchtarDays(createEmptyDays())
        }
        setError('')
    }, [initialData, isOpen])

    if (!isOpen) return null

    // Handler toggle hari & input jam untuk Cabang Muchtar
    const handleToggleMuchtarDay = (index) => {
        setMuchtarDays((prev) =>
            prev.map((day, i) =>
                i === index
                    ? { ...day, active: !day.active }
                    : day
            )
        )
    }

    const handleMuchtarTimeChange = (index, field, value) => {
        setMuchtarDays((prev) =>
            prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!nama.trim()) {
            setError('Nama lengkap dokter wajib diisi.')
            return
        }
        if (!spesialisasi.trim()) {
            setError('Spesialisasi wajib diisi.')
            return
        }

        const activeMuchtar = muchtarDays
            .filter((d) => d.active)
            .map((d) => ({
                hari: `${d.key}:`,
                jam: `${d.start.trim() || '09.00'} - ${d.end.trim() || '13.00'}`,
            }))

        const payload = {
            id: initialData?.id || Date.now(),
            nama: nama.trim(),
            spesialisasi: spesialisasi.trim(),
            status: initialData?.status || 'Aktif',
            cabang: 'Muchtar',
            cabangGaruda: false,
            cabangMuchtar: true,
            jadwal:
                activeMuchtar.length > 0
                    ? activeMuchtar
                    : [
                        { hari: 'Rabu:', jam: '15.00 - 20.00' },
                        { hari: 'Kamis:', jam: '08.00 - 20.00' },
                    ],
            jadwalGaruda: [],
            jadwalMuchtar: activeMuchtar,
        }

        onSubmit(payload)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-7 max-h-[92vh] overflow-y-auto my-auto">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <DoctorIcon className="w-5 h-5 text-slate-700 shrink-0" />
                        <h2 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
                            {isEdit ? 'Update Data Dokter' : 'Tambah Dokter Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="mt-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* Formulir */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Grid 2 Kolom: Nama Lengkap & Spesialisasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Input Nama Lengkap */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Nama Lengkap Dokter
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    placeholder="Nama Lengkap Dokter"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                                />
                                {nama && (
                                    <button
                                        type="button"
                                        onClick={() => setNama('')}
                                        className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <ClearIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Input Spesialisasi */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Spesialisasi
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={spesialisasi}
                                    onChange={(e) => setSpesialisasi(e.target.value)}
                                    placeholder="Masukkan Spesialisasi"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                                />
                                {spesialisasi && (
                                    <button
                                        type="button"
                                        onClick={() => setSpesialisasi('')}
                                        className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <ClearIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Jadwal Praktik Cabang Muchtar */}
                    <div className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-white">
                        <div className="flex items-center gap-2 mb-1">
                            <ClockOutlineIcon className="w-4 h-4 text-[#49baff]" />
                            <span className="font-semibold text-sm text-slate-800">
                                Jadwal Praktek Cabang Muchtar
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3.5 font-normal">
                            Centang hari aktif dan tentukan jam mulai serta jam berakhir praktik.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {muchtarDays.map((day, idx) => (
                                <div
                                    key={day.key}
                                    className={`rounded-xl border p-2.5 flex flex-col transition-all ${day.active
                                            ? 'border-gray-300 bg-white shadow-2xs gap-2'
                                            : 'border-gray-200 bg-gray-50/60'
                                        }`}
                                >
                                    <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-800 select-none">
                                        <input
                                            type="checkbox"
                                            checked={day.active}
                                            onChange={() => handleToggleMuchtarDay(idx)}
                                            className="w-3.5 h-3.5 rounded text-[#49baff] focus:ring-[#49baff] accent-[#49baff]"
                                        />
                                        <span>{day.label}</span>
                                    </label>

                                    {day.active && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={day.start}
                                                onChange={(e) => handleMuchtarTimeChange(idx, 'start', e.target.value)}
                                                placeholder="09.00"
                                                className="w-full text-center py-1.5 px-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-[#49baff] focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={day.end}
                                                onChange={(e) => handleMuchtarTimeChange(idx, 'end', e.target.value)}
                                                placeholder="13.00"
                                                className="w-full text-center py-1.5 px-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-[#49baff] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-[#e62e2e] hover:bg-[#cf2525] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-md shadow-[#49baff]/30 flex items-center gap-1.5"
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Tambah +'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/**
 * Modal Tambah / Update Rekam Medis Elektronik (EMR)
 */
export function EMRModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
}) {
    const isEdit = Boolean(initialData)

    const [pasien, setPasien] = useState('')
    const [tanggal, setTanggal] = useState('')
    const [regio, setRegio] = useState('')
    const [dokter, setDokter] = useState('')
    const [anamnesa, setAnamnesa] = useState('')
    const [tindakan, setTindakan] = useState('')
    const [resep, setResep] = useState('')
    const [terapi, setTerapi] = useState('')
    const [error, setError] = useState('')

    const pasienList = ['Pasien 1', 'Pasien 2', 'Budi Santoso', 'Siti Rahma', 'Ahmad Dani']
    const dokterList = [
        'drg. Indira Nugrahani',
        'drg. Adria Permana Putra, Sp.BM',
        'drg. Mhay Chyntha Harlyana',
        'drg. Fajar Pratama',
        'drg. Sarah Melati',
    ]

    useEffect(() => {
        if (initialData) {
            setPasien(initialData.namaPasien || '')
            setTanggal(toDateInputValue(initialData.tanggal) || '')
            setRegio(initialData.regio || '')
            setDokter(initialData.dokter || '')
            setAnamnesa(initialData.anamnesa || '')
            setTindakan(initialData.tindakan || '')
            setResep(initialData.resep || '')
            setTerapi(initialData.terapi || '')
        } else {
            setPasien('Pasien 1')
            setTanggal('2026-05-20')
            setRegio('16')
            setDokter('drg. Indira Nugrahani')
            setAnamnesa('')
            setTindakan('')
            setResep('')
            setTerapi('')
        }
        setError('')
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!pasien) {
            setError('Silakan pilih nama pasien.')
            return
        }
        if (!tanggal.trim()) {
            setError('Tanggal rekam medis wajib diisi.')
            return
        }
        if (!dokter) {
            setError('Silakan pilih dokter pemeriksa.')
            return
        }

        const payload = {
            id: initialData?.id || Date.now(),
            namaPasien: pasien,
            tanggal: toDisplayDate(tanggal.trim()),
            regio: regio.trim() || '-',
            dokter,
            anamnesa: anamnesa.trim() || '-',
            tindakan: tindakan.trim() || '-',
            resep: resep.trim() || '-',
            terapi: terapi.trim() || '-',
        }

        onSubmit(payload)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-7 max-h-[92vh] overflow-y-auto my-auto">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <EMRIcon className="w-5 h-5 text-slate-700 shrink-0" />
                        <h2 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
                            {isEdit ? 'Update Rekam Medis (EMR)' : 'Tambah Rekam Medis Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="mt-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Baris 1: Pasien, Tanggal, Regio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Pilih Pasien */}
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Pilih Pasien
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    value={pasien}
                                    onChange={(e) => setPasien(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none appearance-none cursor-pointer pr-8"
                                >
                                    <option value="" disabled>Pilih Pasien</option>
                                    {pasienList.map((p, idx) => (
                                        <option key={idx} value={p}>{p}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2.5 text-gray-400 pointer-events-none">
                                    <ChevronDownIcon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                onClick={(e) => e.target.showPicker?.()}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Regio (Gigi) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Regio (Gigi)
                            </label>
                            <input
                                type="text"
                                value={regio}
                                onChange={(e) => setRegio(e.target.value)}
                                placeholder="Contoh: 16, 21"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Baris 2: Dokter Pemeriksa */}
                    <div className="sm:w-1/2">
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                            Dokter Pemeriksa
                        </label>
                        <div className="relative flex items-center">
                            <select
                                value={dokter}
                                onChange={(e) => setDokter(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none appearance-none cursor-pointer pr-8"
                            >
                                <option value="" disabled>Pilih Dokter</option>
                                {dokterList.map((d, idx) => (
                                    <option key={idx} value={d}>{d}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 text-gray-400 pointer-events-none">
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>

                    {/* Baris 3: Anamnesa & Tindakan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Anamnesa (Diagnosa)
                            </label>
                            <textarea
                                rows="3"
                                value={anamnesa}
                                onChange={(e) => setAnamnesa(e.target.value)}
                                placeholder="Diagnosa Utama"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Tindakan Pelayanan
                            </label>
                            <textarea
                                rows="3"
                                value={tindakan}
                                onChange={(e) => setTindakan(e.target.value)}
                                placeholder="Masukkan Detail Tindakan"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Baris 4: Resep & Terapi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                PF (Resep)
                            </label>
                            <textarea
                                rows="3"
                                value={resep}
                                onChange={(e) => setResep(e.target.value)}
                                placeholder="Masukkan Resep Obat"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-800 mb-1">
                                Terapi (Prosedur)
                            </label>
                            <textarea
                                rows="3"
                                value={terapi}
                                onChange={(e) => setTerapi(e.target.value)}
                                placeholder="Masukkan Rencana Prosedur Terapi"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-[#e62e2e] hover:bg-[#cf2525] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white text-sm font-semibold transition-all cursor-pointer shadow-md shadow-[#49baff]/30 flex items-center gap-1.5"
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Simpan EMR +'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
