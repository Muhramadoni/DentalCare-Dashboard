import { useState, useEffect, useMemo } from 'react'
import {
    ReservationIcon,
    DoctorIcon,
    ClearIcon,
    ClockOutlineIcon,
    ChevronDownIcon,
} from './icon'
import { toDateInputValue, toDisplayDate } from '../utils/date'
import {
    getDayNameFromDate,
    doctorHasScheduleOnDay,
    DAYS_CAPITALIZED,
} from '../utils/doctorStatus'

/**
 * Modal Tambah / Update Reservasi Pasien
 */
export function ReservationModal({
    isOpen,
    onClose,
    onSubmit,
    onNoChange,
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

    const selectedDayName = getDayNameFromDate(tanggal)

    // Daftar dokter yang ditampilkan: HANYA dokter yang memiliki jadwal praktik di hari kunjungan yang dipilih
    // Berlaku untuk seluruh kondisi: Tambah Reservasi Baru, Update Reservasi, Status Appointment, maupun Reschedule
    const displayedDoctors = useMemo(() => {
        if (!selectedDayName) return []

        return activeDoctorList.filter((doc) => {
            if (typeof doc === 'object' && doc !== null) {
                const isStatusAktif = doc.status ? doc.status.toLowerCase() === 'aktif' : true
                return isStatusAktif && doctorHasScheduleOnDay(doc, selectedDayName)
            }
            return false
        })
    }, [activeDoctorList, selectedDayName])

    // Saat tanggal kunjungan dipilih atau berubah:
    // Jika dokter yang sedang terpilih tidak memiliki jadwal di hari tersebut, reset pilihan dokter
    useEffect(() => {
        if (selectedDayName) {
            if (dokter) {
                const isDocAvailable = displayedDoctors.some((d) =>
                    (typeof d === 'object' ? d.nama : d) === dokter
                )
                if (!isDocAvailable) {
                    setDokter('')
                }
            }
        } else if (!tanggal) {
            if (dokter) {
                setDokter('')
            }
        }
    }, [selectedDayName, displayedDoctors, dokter, tanggal])

    useEffect(() => {
        Promise.resolve().then(() => {
            if (initialData) {
                setNamaPasien(initialData.namaPasien || '')
                if (initialData.tanggalIso) {
                    setTanggal(initialData.tanggalIso)
                } else if (initialData.tanggal_kunjungan) {
                    setTanggal(toDateInputValue(initialData.tanggal_kunjungan))
                } else if (initialData.tanggalKunjungan) {
                    setTanggal(toDateInputValue(initialData.tanggalKunjungan))
                } else if (initialData.jadwal) {
                    const parts = initialData.jadwal.split(' ')
                    setTanggal(toDateInputValue(parts[0] || ''))
                } else {
                    setTanggal(toDateInputValue(initialData.tanggal || ''))
                }
                const rawTime = initialData.waktu_kunjungan || initialData.waktuKunjungan || initialData.waktu || initialData.waktu_reservasi || ''
                const sanitizedTime = typeof rawTime === 'string' ? (rawTime.replace(':', '.').match(/\d+(\.\d+)?/)?.[0] || '') : (rawTime ?? '')
                setWaktu(sanitizedTime)
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
        })
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
            setError('Tanggal kunjungan wajib diisi.')
            return
        }
        if (!String(waktu).trim()) {
            setError('Waktu kunjungan wajib diisi.')
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

        if (typeof selectedDocObj === 'object') {
            const isStatusNonAktif = selectedDocObj.status && selectedDocObj.status.toLowerCase() !== 'aktif'
            if (isStatusNonAktif) {
                setError('Dokter yang dipilih berstatus tidak aktif.')
                return
            }

            if (selectedDayName && !doctorHasScheduleOnDay(selectedDocObj, selectedDayName)) {
                setError(`Dokter ${selectedDocObj.nama} tidak memiliki jadwal praktik pada hari ${DAYS_CAPITALIZED[selectedDayName] || selectedDayName}.`)
                return
            }
        }

        const displayDate = toDisplayDate(tanggal.trim())
        const cleanWaktu = String(waktu).trim()
        const selectedDoctorName = typeof selectedDocObj === 'object' ? selectedDocObj.nama : dokter

        if (isEdit) {
            const isSameNama = namaPasien.trim().toLowerCase() === (initialData?.namaPasien || '').trim().toLowerCase()
            const initTanggal = initialData?.tanggalIso || toDateInputValue(initialData?.tanggal_kunjungan || initialData?.tanggalKunjungan || initialData?.tanggal || '')
            const isSameTanggal = tanggal.trim() === initTanggal.trim()

            const rawTime = initialData?.waktu_kunjungan || initialData?.waktuKunjungan || initialData?.waktu || initialData?.waktu_reservasi || ''
            const sanitizedInitTime = typeof rawTime === 'string' ? (rawTime.replace(':', '.').match(/\d+(\.\d+)?/)?.[0] || '') : (rawTime ?? '')
            const isSameWaktu = cleanWaktu === String(sanitizedInitTime).trim()

            const initDokter = initialData?.dokter || initialData?.dokterDetail?.nama || ''
            const isSameDokter = selectedDoctorName === initDokter

            const initStatus = initialData?.status || 'Appointment'
            const isSameStatus = status === initStatus

            if (isSameNama && isSameTanggal && isSameWaktu && isSameDokter && isSameStatus) {
                const noChangeMsg = 'Anda belum mengubah data apapun pada reservasi ini.'
                setError(noChangeMsg)
                if (onNoChange) {
                    onNoChange(noChangeMsg)
                }
                return
            }
        }

        const payload = {
            id: initialData?.id,
            namaPasien: namaPasien.trim(),
            tanggal: tanggal.trim(),
            tanggal_kunjungan: tanggal.trim(),
            tanggalKunjungan: tanggal.trim(),
            waktu: cleanWaktu,
            waktu_kunjungan: cleanWaktu,
            waktuKunjungan: cleanWaktu,
            jadwal: cleanWaktu ? `${displayDate} ${cleanWaktu}` : displayDate,
            dokter: selectedDoctorName,
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
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs sm:text-sm font-medium text-gray-800">
                                Nama Pasien
                            </label>
                            {isEdit && (
                                <span className="text-[10px] text-gray-400 font-normal">
                                    (Tidak dapat diubah)
                                </span>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={namaPasien}
                                onChange={(e) => setNamaPasien(e.target.value)}
                                placeholder="Nama Lengkap Pasien"
                                disabled={isEdit}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all pr-10 ${isEdit
                                    ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed select-none'
                                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-300 hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none'
                                    }`}
                            />
                            {!isEdit && namaPasien && (
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

                    {/* Grid 2 Kolom: Tanggal Kunjungan & Waktu Kunjungan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tanggal Kunjungan */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Tanggal Kunjungan
                            </label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                onClick={(e) => e.target.showPicker?.()}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all cursor-pointer"
                            />
                        </div>

                        {/* Waktu Kunjungan */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                Waktu Kunjungan
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="number"
                                    step="any"
                                    value={waktu}
                                    onChange={(e) => setWaktu(e.target.value)}
                                    placeholder="09.42"
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
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs sm:text-sm font-medium text-gray-800">
                                    Dokter
                                </label>
                                {selectedDayName && (
                                    <span className="text-[10px] text-[#0584bc] font-medium bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                                        Praktik Hari {DAYS_CAPITALIZED[selectedDayName]}
                                    </span>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <select
                                    value={dokter}
                                    onChange={(e) => setDokter(e.target.value)}
                                    disabled={!tanggal}
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all appearance-none pr-10 cursor-pointer ${!tanggal
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed select-none'
                                        : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none'
                                        }`}
                                >
                                    <option value="" disabled>
                                        {!tanggal
                                            ? 'Pilih tanggal kunjungan terlebih dahulu'
                                            : displayedDoctors.length === 0
                                                ? `Tidak ada dokter praktik di hari ${DAYS_CAPITALIZED[selectedDayName] || ''}`
                                                : 'Pilih Dokter'}
                                    </option>
                                    {displayedDoctors.map((doc, idx) => {
                                        const isObj = typeof doc === 'object' && doc !== null
                                        const name = isObj ? doc.nama : doc
                                        const spec = isObj && doc.spesialisasi ? ` - ${doc.spesialisasi}` : ''

                                        return (
                                            <option
                                                key={isObj ? (doc.id || idx) : idx}
                                                value={name}
                                                className="text-gray-800"
                                            >
                                                {name}{spec}
                                            </option>
                                        )
                                    })}
                                </select>
                                <div className="absolute right-3 text-gray-400 pointer-events-none">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                            {tanggal && displayedDoctors.length === 0 && (
                                <p className="mt-1 text-[11px] text-amber-600">
                                    * Tidak ada dokter yang memiliki jadwal praktik di hari {DAYS_CAPITALIZED[selectedDayName]}. Silakan pilih tanggal kunjungan lain.
                                </p>
                            )}
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
    onNoChange,
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
        Promise.resolve().then(() => {
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
                            : [])

                setMuchtarDays(mapSchedule(rawJadwal))
            } else {
                setNama('')
                setSpesialisasi('')
                setMuchtarDays(createEmptyDays())
            }
            setError('')
        })
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

        const activeDays = muchtarDays.filter((d) => d.active)
        if (activeDays.length === 0) {
            setError('Silakan pilih minimal satu hari jadwal praktik dokter.')
            return
        }

        for (const day of activeDays) {
            if (!day.start || !day.start.trim() || !day.end || !day.end.trim()) {
                setError(`Jam mulai dan jam selesai untuk hari ${day.label} wajib diisi.`)
                return
            }
        }

        const activeMuchtar = activeDays.map((d) => ({
            hari: `${d.key}:`,
            jam: `${d.start.trim()} - ${d.end.trim()}`,
        }))

        if (isEdit) {
            const isSameNama = nama.trim().toLowerCase() === (initialData?.nama || '').trim().toLowerCase()
            const isSameSpesialisasi = spesialisasi.trim().toLowerCase() === (initialData?.spesialisasi || '').trim().toLowerCase()

            const origJadwal = (initialData?.jadwalMuchtar || initialData?.jadwal || [])
                .map((j) => `${(j.hari || '').toLowerCase()}_${(j.jam || '').replace(/\s+/g, '')}`)
                .sort()
                .join('|')
            const newJadwal = activeMuchtar
                .map((j) => `${(j.hari || '').toLowerCase()}_${(j.jam || '').replace(/\s+/g, '')}`)
                .sort()
                .join('|')
            const isSameSchedule = origJadwal === newJadwal

            if (isSameNama && isSameSpesialisasi && isSameSchedule) {
                const noChangeMsg = 'Anda belum mengubah data apapun pada dokter ini.'
                setError(noChangeMsg)
                if (onNoChange) {
                    onNoChange(noChangeMsg)
                }
                return
            }
        }

        const payload = {
            id: initialData?.id || Date.now(),
            nama: nama.trim(),
            spesialisasi: spesialisasi.trim(),
            status: initialData?.status || 'Aktif',
            cabang: 'Muchtar',
            cabangMuchtar: true,
            jadwal: activeMuchtar,
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
                        <div className="mb-1">
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
                                                type="number"
                                                value={day.start}
                                                onChange={(e) => handleMuchtarTimeChange(idx, 'start', e.target.value)}
                                                placeholder="09.00"
                                                className="w-full text-center py-1.5 px-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:border-[#49baff] focus:outline-none"
                                            />
                                            <input
                                                type="number"
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

