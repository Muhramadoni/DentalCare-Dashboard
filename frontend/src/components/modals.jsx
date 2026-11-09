import React, { useState, useEffect } from 'react'
import {
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
    EditIcon,
    ClearIcon,
    CalendarOutlineIcon,
    ClockOutlineIcon,
    ChevronDownIcon,
} from './icon'

/**
 * Modal Tambah / Update Reservasi Pasien
 */
export function ReservationModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
}) {
    const isEdit = Boolean(initialData)

    const [namaPasien, setNamaPasien] = useState('')
    const [tanggal, setTanggal] = useState('')
    const [waktu, setWaktu] = useState('')
    const [dokter, setDokter] = useState('')
    const [status, setStatus] = useState('Appointment')
    const [error, setError] = useState('')

    // Daftar dokter aktif sesuai klinik
    const dokterList = [
        'drg. Indira Nugrahani',
        'drg. Fajar Pratama',
        'drg. Sarah Melati',
        'drg. Budi Santoso',
    ]

    useEffect(() => {
        if (initialData) {
            setNamaPasien(initialData.namaPasien || '')
            if (initialData.jadwal) {
                const parts = initialData.jadwal.split(' ')
                setTanggal(parts[0] || '')
                setWaktu(parts.slice(1).join(' ') || '')
            } else {
                setTanggal(initialData.tanggal || '')
                setWaktu(initialData.waktu || '')
            }
            setDokter(initialData.dokter || '')
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

        const payload = {
            id: initialData?.id || Date.now(),
            namaPasien: namaPasien.trim(),
            jadwal: `${tanggal.trim()} ${waktu.trim()}`,
            dokter,
            status,
        }

        onSubmit(payload)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 sm:p-8">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        {isEdit ? (
                            <div className="w-8 h-8 rounded-lg bg-[#adc91f] text-white flex items-center justify-center">
                                <EditIcon className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#49baff] text-white flex items-center justify-center">
                                <ReservationIcon className="w-4 h-4" />
                            </div>
                        )}
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                            {isEdit ? 'Update Reservasi Pasien' : 'Tambah Reservasi Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-5 h-5" />
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
                                <div className="absolute right-3 text-gray-400 pointer-events-none">
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
                                    {dokterList.map((doc, idx) => (
                                        <option key={idx} value={doc}>
                                            {doc}
                                        </option>
                                    ))}
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
    const [cabangGaruda, setCabangGaruda] = useState(false)
    const [cabangMuchtar, setCabangMuchtar] = useState(false)
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

    const [garudaDays, setGarudaDays] = useState(createEmptyDays)
    const [muchtarDays, setMuchtarDays] = useState(createEmptyDays)

    useEffect(() => {
        if (initialData) {
            setNama(initialData.nama || '')
            setSpesialisasi(initialData.spesialisasi || '')
            const hasGaruda = initialData.cabang
                ? initialData.cabang.toLowerCase().includes('garuda')
                : true
            const hasMuchtar = initialData.cabang
                ? initialData.cabang.toLowerCase().includes('muchtar')
                : false
            setCabangGaruda(hasGaruda)
            setCabangMuchtar(hasMuchtar)

            const mapSchedule = (targetJadwal) =>
                createEmptyDays().map((d) => {
                    const match = targetJadwal.find((j) =>
                        j.hari.toLowerCase().includes(d.key.toLowerCase())
                    )
                    if (match) {
                        const [start, end] = match.jam.split(' - ')
                        return { ...d, active: true, start: start || '', end: end || '' }
                    }
                    return d
                })

            const rawJadwal = initialData.jadwal || []
            setGarudaDays(
                mapSchedule(initialData.jadwalGaruda || (hasGaruda ? rawJadwal : []))
            )
            setMuchtarDays(
                mapSchedule(initialData.jadwalMuchtar || (hasMuchtar && !hasGaruda ? rawJadwal : []))
            )
        } else {
            setNama('')
            setSpesialisasi('')
            setCabangGaruda(false)
            setCabangMuchtar(false)
            setGarudaDays(createEmptyDays())
            setMuchtarDays(createEmptyDays())
        }
        setError('')
    }, [initialData, isOpen])

    if (!isOpen) return null

    // Handler toggle hari & input jam untuk Cabang Garuda
    const handleToggleGarudaDay = (index) => {
        setGarudaDays((prev) =>
            prev.map((day, i) =>
                i === index
                    ? { ...day, active: !day.active }
                    : day
            )
        )
    }

    const handleGarudaTimeChange = (index, field, value) => {
        setGarudaDays((prev) =>
            prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
        )
    }

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
        if (!cabangGaruda && !cabangMuchtar) {
            setError('Silakan pilih minimal satu cabang praktik.')
            return
        }

        const activeGaruda = cabangGaruda
            ? garudaDays
                  .filter((d) => d.active)
                  .map((d) => ({
                      hari: `${d.key}:`,
                      jam: `${d.start.trim() || '09.00'} - ${d.end.trim() || '13.00'}`,
                  }))
            : []

        const activeMuchtar = cabangMuchtar
            ? muchtarDays
                  .filter((d) => d.active)
                  .map((d) => ({
                      hari: `${d.key}:`,
                      jam: `${d.start.trim() || '09.00'} - ${d.end.trim() || '13.00'}`,
                  }))
            : []

        const activeJadwal = [...activeGaruda, ...activeMuchtar]

        const payload = {
            id: initialData?.id || Date.now(),
            nama: nama.trim(),
            spesialisasi: spesialisasi.trim(),
            status: initialData?.status || 'Aktif',
            cabang: [cabangGaruda ? 'Garuda' : '', cabangMuchtar ? 'Muchtar' : '']
                .filter(Boolean)
                .join(', '),
            jadwal:
                activeJadwal.length > 0
                    ? activeJadwal
                    : [
                          { hari: 'Rabu:', jam: '15.00 - 20.00' },
                          { hari: 'Kamis:', jam: '08.00 - 20.00' },
                      ],
            jadwalGaruda: activeGaruda,
            jadwalMuchtar: activeMuchtar,
        }

        onSubmit(payload)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-7 max-h-[92vh] overflow-y-auto my-auto">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#49baff] text-white flex items-center justify-center">
                            <DoctorIcon className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                            {isEdit ? 'Update Data Dokter' : 'Tambah Dokter Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-5 h-5" />
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

                    {/* Card Cabang Garuda */}
                    <div className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-white">
                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm text-slate-800 select-none">
                            <input
                                type="checkbox"
                                checked={cabangGaruda}
                                onChange={(e) => setCabangGaruda(e.target.checked)}
                                className="w-4 h-4 rounded text-[#49baff] focus:ring-[#49baff] accent-[#49baff]"
                            />
                            <span>Praktik di cabang garuda</span>
                        </label>

                        {cabangGaruda && (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-3">
                                    Pilih hari & jam operasional
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {garudaDays.map((day, idx) => (
                                        <div
                                            key={day.key}
                                            className={`rounded-xl border p-2.5 flex flex-col transition-all ${
                                                day.active
                                                    ? 'border-gray-300 bg-white shadow-2xs gap-2'
                                                    : 'border-gray-200 bg-gray-50/60'
                                            }`}
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-800 select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={day.active}
                                                    onChange={() => handleToggleGarudaDay(idx)}
                                                    className="w-3.5 h-3.5 rounded text-[#49baff] focus:ring-[#49baff] accent-[#49baff]"
                                                />
                                                <span>{day.label}</span>
                                            </label>

                                            {day.active && (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={day.start}
                                                        onChange={(e) => handleGarudaTimeChange(idx, 'start', e.target.value)}
                                                        placeholder="09.00"
                                                        className="w-full text-center py-1.5 px-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-[#49baff] focus:outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={day.end}
                                                        onChange={(e) => handleGarudaTimeChange(idx, 'end', e.target.value)}
                                                        placeholder="13.00"
                                                        className="w-full text-center py-1.5 px-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-[#49baff] focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Cabang Muchtar */}
                    <div className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-white">
                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm text-slate-800 select-none">
                            <input
                                type="checkbox"
                                checked={cabangMuchtar}
                                onChange={(e) => setCabangMuchtar(e.target.checked)}
                                className="w-4 h-4 rounded text-[#49baff] focus:ring-[#49baff] accent-[#49baff]"
                            />
                            <span>Praktik di cabang muchtar</span>
                        </label>

                        {cabangMuchtar && (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-3">
                                    Pilih hari & jam operasional
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {muchtarDays.map((day, idx) => (
                                        <div
                                            key={day.key}
                                            className={`rounded-xl border p-2.5 flex flex-col transition-all ${
                                                day.active
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
                        )}
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
            setTanggal(initialData.tanggal || '')
            setRegio(initialData.regio || '')
            setDokter(initialData.dokter || '')
            setAnamnesa(initialData.anamnesa || '')
            setTindakan(initialData.tindakan || '')
            setResep(initialData.resep || '')
            setTerapi(initialData.terapi || '')
        } else {
            setPasien('Pasien 1')
            setTanggal('20-05-2026')
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
            tanggal: tanggal.trim(),
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
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#49baff] text-white flex items-center justify-center">
                            <EMRIcon className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                            {isEdit ? 'Update Rekam Medis (EMR)' : 'Tambah Rekam Medis Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-5 h-5" />
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
