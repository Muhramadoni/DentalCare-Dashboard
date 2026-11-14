import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Sidebar from '../components/sidebar'
import Pagination from '../components/pagination'
import {
    CalendarOutlineIcon,
    ChevronDownIcon,
    CheckIcon,
    ClearIcon,
    FilterResetIcon,
    SearchIcon,
    SpinnerIcon,
    ErrorIcon,
    TrashIcon,
} from '../components/icon'
import { toDateInputValue, toDisplayDate } from '../utils/date'

const API_BASE_URL = 'http://localhost:5000/api/v1/rekam-medis'
const DOKTER_API_URL = 'http://localhost:5000/api/v1/dokter'

export default function EMR({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('emr')

    // State Input Form EMR Bagian Atas
    const [inputPasien, setInputPasien] = useState('')
    const [inputTanggal, setInputTanggal] = useState('')
    const [inputRegio, setInputRegio] = useState('')
    const [inputDokter, setInputDokter] = useState('')
    // Kunci field tanggal & dokter setelah pasien dipilih dari dropdown
    const [isPatientLocked, setIsPatientLocked] = useState(false)
    const [inputAnamnesa, setInputAnamnesa] = useState('')
    const [inputTindakan, setInputTindakan] = useState('')
    const [inputResep, setInputResep] = useState('')
    const [inputTerapi, setInputTerapi] = useState('')

    // State Pasien Search / Combobox pada Form Input (Atas)
    const [isPasienFormOpen, setIsPasienFormOpen] = useState(false)
    const pasienFormRef = useRef(null)

    // State Mode Edit / Update langsung pada form (tanpa pop up)
    const [editingId, setEditingId] = useState(null)
    const [formSuccess, setFormSuccess] = useState('')
    const [formError, setFormError] = useState('')

    // State Konfirmasi Sebelum Simpan & Loading
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pendingPayload, setPendingPayload] = useState(null)

    // State Riwayat Rekam Medis (EMR) - Bersih dari data dummy, siap input manual
    const [emrList, setEmrList] = useState([])
    const [dbPatients, setDbPatients] = useState([])
    const [dokterOptions, setDokterOptions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [apiError, setApiError] = useState(null)

    // State Filter Bagian Bawah
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedPasienFilter, setSelectedPasienFilter] = useState('Semua Pasien')
    const [selectedDokterFilter, setSelectedDokterFilter] = useState('Semua Dokter')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // State Pasien Search / Dropdown pada Filter Riwayat (Bawah)
    const [isPasienFilterOpen, setIsPasienFilterOpen] = useState(false)
    const [pasienFilterSearch, setPasienFilterSearch] = useState('')
    const pasienFilterRef = useRef(null)
    const filterSearchInputRef = useRef(null)

    // Helper: Ambil token JWT dari sessionStorage (atau localStorage)
    const getAuthToken = useCallback(() => {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
        if (!token && onLogout) {
            onLogout()
            return null
        }
        return token
    }, [onLogout])

    // Ambil data EMR dari Backend REST API (GET /api/v1/rekam-medis)
    const fetchEmr = useCallback(async () => {
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
                throw new Error(result?.error?.message || 'Gagal memuat riwayat rekam medis.')
            }

            setEmrList(result.data || [])
        } catch (err) {
            console.error('Error saat fetch EMR:', err)
            setApiError(err.message || 'Tidak dapat terhubung ke server backend.')
        } finally {
            setIsLoading(false)
        }
    }, [getAuthToken, onLogout])

    // Ambil daftar dokter dari Backend REST API (GET /api/v1/dokter)
    const fetchDokterList = useCallback(async () => {
        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch(DOKTER_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()
            if (response.ok && result.success && Array.isArray(result.data)) {
                setDokterOptions(result.data.map((d) => d.nama))
            }
        } catch (err) {
            console.error('Error saat fetch dokter options:', err)
        }
    }, [getAuthToken])

    // Ambil daftar pasien dari Backend REST API (GET /api/v1/rekam-medis/patients)
    const fetchPatients = useCallback(async () => {
        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()
            if (response.ok && result.success && Array.isArray(result.data)) {
                setDbPatients(result.data)
            }
        } catch (err) {
            console.error('Error saat fetch patients list:', err)
        }
    }, [getAuthToken])

    useEffect(() => {
        fetchEmr()
        fetchDokterList()
        fetchPatients()
    }, [fetchEmr, fetchDokterList, fetchPatients])

    // Daftar semua pasien unik beserta status reservasi, tanggal, dan dokter pemeriksa
    const allPasienList = useMemo(() => {
        const patientMap = new Map()

        // 1. Masukkan pasien dari database (dbPatients)
        dbPatients.forEach((p) => {
            const name = typeof p === 'object' ? p.nama : p
            const isRescheduled = typeof p === 'object' ? Boolean(p.isRescheduled) : false
            const status = typeof p === 'object' ? p.status : 'Appointment'
            const tanggal = typeof p === 'object' ? (p.tanggal || '') : ''
            const dokter = typeof p === 'object' ? (p.dokter || '') : ''

            if (name && name.trim()) {
                patientMap.set(name.trim().toLowerCase(), {
                    id: typeof p === 'object' ? p.id : undefined,
                    nama: name.trim(),
                    isRescheduled,
                    status,
                    tanggal,
                    dokter,
                })
            }
        })

        // 2. Gabungkan riwayat EMR jika ada pasien yang belum terdaftar di map atau melengkapi data
        emrList.forEach((item) => {
            if (item.namaPasien && item.namaPasien.trim()) {
                const key = item.namaPasien.trim().toLowerCase()
                const existing = patientMap.get(key)
                if (!existing) {
                    patientMap.set(key, {
                        id: item.pasien_id,
                        nama: item.namaPasien.trim(),
                        isRescheduled: false,
                        status: 'Appointment',
                        tanggal: item.tanggalIso || '',
                        dokter: item.dokter || '',
                    })
                } else {
                    if (!existing.tanggal && item.tanggalIso) {
                        existing.tanggal = item.tanggalIso
                    }
                    if (!existing.dokter && item.dokter) {
                        existing.dokter = item.dokter
                    }
                }
            }
        })

        return Array.from(patientMap.values()).sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
    }, [dbPatients, emrList])

    // Handler ketika admin memilih nama pasien dari autocomplete / dropdown
    const handleSelectPatient = useCallback((patientObj) => {
        if (!patientObj) return

        if (patientObj.isRescheduled) {
            setFormError(`Pasien "${patientObj.nama}" sedang berstatus Reschedule dan belum dapat mengisi rekam medis.`)
            return
        }

        setInputPasien(patientObj.nama)
        setIsPasienFormOpen(false)

        // Otomatis terisi tanggal dan dokter pemeriksa berdasarkan data pasien tersebut
        if (patientObj.tanggal) {
            setInputTanggal(patientObj.tanggal)
        }
        if (patientObj.dokter) {
            setDokterOptions((prev) => (prev.includes(patientObj.dokter) ? prev : [...prev, patientObj.dokter]))
            setInputDokter(patientObj.dokter)
        }
        // Kunci field tanggal & dokter agar tidak bisa diubah manual
        setIsPatientLocked(true)
        setFormError('')
    }, [])

    // Daftar pasien yang terfilter untuk Form Input (Atas)
    const filteredPasienForm = useMemo(() => {
        if (!inputPasien.trim()) return allPasienList
        const q = inputPasien.trim().toLowerCase()
        return allPasienList.filter((p) => p.nama.toLowerCase().includes(q))
    }, [allPasienList, inputPasien])

    // Daftar pasien yang terfilter untuk Filter Riwayat (Bawah)
    const filteredPasienFilter = useMemo(() => {
        if (!pasienFilterSearch.trim()) return allPasienList
        const q = pasienFilterSearch.trim().toLowerCase()
        return allPasienList.filter((p) => p.nama.toLowerCase().includes(q))
    }, [allPasienList, pasienFilterSearch])

    // Tutup dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pasienFormRef.current && !pasienFormRef.current.contains(event.target)) {
                setIsPasienFormOpen(false)
            }
            if (pasienFilterRef.current && !pasienFilterRef.current.contains(event.target)) {
                setIsPasienFilterOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Auto-focus input pencarian saat dropdown filter pasien dibuka
    useEffect(() => {
        if (isPasienFilterOpen && filterSearchInputRef.current) {
            filterSearchInputRef.current.focus()
        }
    }, [isPasienFilterOpen])

    // Reset ke halaman 1 saat filter atau pencarian berubah
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, startDate, endDate, selectedPasienFilter, selectedDokterFilter])

    // Toast notifikasi hilang otomatis setelah 4 detik
    useEffect(() => {
        if (!formSuccess) return
        const timer = setTimeout(() => setFormSuccess(''), 4000)
        return () => clearTimeout(timer)
    }, [formSuccess])

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        if (onNavigate) {
            onNavigate(tabId)
        }
    }

    // Mengisi form di atas ketika salah satu baris tabel diklik untuk di-update
    const handleSelectRowToUpdate = (item) => {
        setEditingId(item.id)
        setInputPasien(item.namaPasien)
        setIsPasienFormOpen(false)
        setInputTanggal(item.tanggalIso || toDateInputValue(item.tanggal))
        setInputRegio(item.regio === '-' ? '' : item.regio)
        setInputDokter(item.dokter)
        setInputAnamnesa(item.anamnesa === '-' ? '' : item.anamnesa)
        setInputTindakan(item.tindakan === '-' ? '' : item.tindakan)
        setInputResep(item.resep === '-' ? '' : item.resep)
        setInputTerapi(item.terapi === '-' ? '' : item.terapi)
        setFormError('')
        setFormSuccess('')
        // Saat edit data lama, field tanggal & dokter bisa diubah bebas
        setIsPatientLocked(false)

        // Scroll halus ke atas menuju form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Reset Form Input
    const handleResetForm = () => {
        setEditingId(null)
        setInputPasien('')
        setIsPasienFormOpen(false)
        setInputTanggal('')
        setInputRegio('')
        setInputDokter('')
        setInputAnamnesa('')
        setInputTindakan('')
        setInputResep('')
        setInputTerapi('')
        setFormError('')
        // Buka kunci field tanggal & dokter saat form direset
        setIsPatientLocked(false)
    }

    // Validasi dan Buka Dialog Konfirmasi sebelum Simpan
    const handlePreSubmit = (e) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')

        if (!inputPasien.trim()) {
            setFormError('Silakan pilih atau ketik nama pasien terlebih dahulu.')
            return
        }

        // Validasi: Pasien berstatus Reschedule tidak boleh dibuatkan EMR
        const chosenPatient = allPasienList.find(
            (p) => p.nama.toLowerCase() === inputPasien.trim().toLowerCase()
        )
        if (chosenPatient && chosenPatient.isRescheduled) {
            setFormError(`Pasien "${chosenPatient.nama}" sedang berstatus Reschedule dan belum dapat mengisi rekam medis. Silakan sesuaikan reservasi terlebih dahulu.`)
            return
        }
        if (!inputTanggal.trim()) {
            setFormError('Silakan isi tanggal rekam medis.')
            return
        }
        if (!inputDokter) {
            setFormError('Silakan pilih dokter pemeriksa.')
            return
        }

        const payload = {
            namaPasien: inputPasien.trim(),
            tanggal: inputTanggal.trim(),
            regio: inputRegio.trim(),
            dokter: inputDokter,
            anamnesa: inputAnamnesa.trim(),
            tindakan: inputTindakan.trim(),
            resep: inputResep.trim(),
            terapi: inputTerapi.trim(),
        }

        setPendingPayload(payload)
        setShowConfirmModal(true)
    }

    // Eksekusi Simpan Data ke Backend setelah dikonfirmasi
    const handleConfirmSave = async () => {
        if (!pendingPayload) return

        setIsSubmitting(true)
        setFormError('')

        try {
            const token = getAuthToken()
            if (!token) return

            const isEdit = Boolean(editingId)
            const url = isEdit ? `${API_BASE_URL}/${editingId}` : API_BASE_URL
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(pendingPayload),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                if (response.status === 401 && onLogout) {
                    onLogout()
                    return
                }
                throw new Error(result?.error?.message || 'Gagal menyimpan rekam medis.')
            }

            setFormSuccess(
                isEdit
                    ? 'Rekam medis berhasil diperbarui!'
                    : 'Rekam medis baru berhasil disimpan!'
            )

            setShowConfirmModal(false)
            setPendingPayload(null)
            handleResetForm()
            fetchEmr()
            fetchPatients()
        } catch (err) {
            console.error('Error saat simpan EMR:', err)
            setFormError(err.message || 'Terjadi kesalahan saat menyimpan rekam medis.')
            setShowConfirmModal(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Hapus Rekam Medis (DELETE /api/v1/rekam-medis/:id)
    const handleDeleteEmr = async (id, nama) => {
        if (!window.confirm(`Hapus rekam medis untuk ${nama}?`)) return

        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
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
                throw new Error(result?.error?.message || 'Gagal menghapus rekam medis.')
            }

            setEmrList((prev) => prev.filter((item) => item.id !== id))
            setFormSuccess(`Rekam medis untuk ${nama} berhasil dihapus.`)

            // Jika sedang mengedit item yang baru dihapus, reset form
            if (editingId === id) {
                handleResetForm()
            }
        } catch (err) {
            console.error('Error saat menghapus rekam medis:', err)
            alert(err.message || 'Terjadi kesalahan saat menghapus data.')
        }
    }

    // Filter data tabel riwayat EMR secara instan (<10 detik sesuai Target G3)
    const filteredEmrList = useMemo(() => {
        return emrList.filter((item) => {
            const query = searchQuery.toLowerCase().trim()
            const matchesSearch =
                !query ||
                item.namaPasien.toLowerCase().includes(query) ||
                item.anamnesa.toLowerCase().includes(query) ||
                item.tindakan.toLowerCase().includes(query) ||
                item.regio.toLowerCase().includes(query) ||
                item.dokter.toLowerCase().includes(query)

            const matchesPasien =
                selectedPasienFilter === 'Semua Pasien' ||
                item.namaPasien.trim().toLowerCase() === selectedPasienFilter.trim().toLowerCase()

            const matchesDokter =
                selectedDokterFilter === 'Semua Dokter' || item.dokter === selectedDokterFilter

            // Bandingkan tanggal menggunakan format ISO (YYYY-MM-DD) → string comparison aman tanpa timezone issue
            let matchesDate = true
            if (startDate || endDate) {
                const itemIso = item.tanggalIso || ''
                if (itemIso) {
                    if (startDate) matchesDate = matchesDate && itemIso >= startDate
                    if (endDate) matchesDate = matchesDate && itemIso <= endDate
                }
            }

            return matchesSearch && matchesPasien && matchesDokter && matchesDate
        })
    }, [emrList, searchQuery, selectedPasienFilter, selectedDokterFilter, startDate, endDate])

    return (
        <div className="flex h-screen w-full bg-[#f9f8ff] font-['Poppins'] select-none overflow-hidden">
            {/* Sidebar Navigasi Kiri */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
            />

            {/* Area Konten Utama EMR */}
            <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col gap-8 pb-12">
                {/* ====================================================
                    1. BAGIAN ATAS: FORM INPUT & UPDATE REKAM MEDIS (EMR)
                   ==================================================== */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight">
                            Rekam Medis Elektronik (EMR) Pasien
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                            Input dan simpan rekam medis pasien lengkap
                        </p>
                    </div>

                    {/* Card Form Input Langsung */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col">
                        {/* Alert Notifikasi Sukses */}
                        {formSuccess && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fadeIn">
                                <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{formSuccess}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormSuccess('')}
                                    className="ml-auto text-emerald-500 hover:text-emerald-700 p-0.5"
                                >
                                    <ClearIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Alert Notifikasi Error */}
                        {formError && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
                                <div className="flex items-center gap-2">
                                    <ErrorIcon className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormError('')}
                                    className="text-red-400 hover:text-red-600 p-0.5"
                                >
                                    <ClearIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Banner Mode Edit */}
                        {editingId && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
                                <span>Sedang mengedit rekam medis pasien terpilih. Ubah data di bawah dan klik "Simpan EMR +".</span>
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="text-xs font-semibold underline text-blue-800 hover:text-blue-950 ml-3 cursor-pointer"
                                >
                                    Batalkan Edit
                                </button>
                            </div>
                        )}

                        <form onSubmit={handlePreSubmit} className="space-y-4">
                            {/* Baris 1: Pilih Pasien, Tanggal, Regio (Gigi) (3 Kolom) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Pilih Pasien (Bisa Ketik / Search) */}
                                <div ref={pasienFormRef} className="relative">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5 flex items-center justify-between">
                                        <span>Pilih Pasien</span>
                                        <span className="text-[11px] text-gray-400 font-normal">Ketik / cari nama</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={inputPasien}
                                            onChange={(e) => {
                                                setInputPasien(e.target.value)
                                                setIsPasienFormOpen(true)
                                            }}
                                            onFocus={() => setIsPasienFormOpen(true)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') {
                                                    setIsPasienFormOpen(false)
                                                } else if (e.key === 'Tab') {
                                                    setIsPasienFormOpen(false)
                                                } else if (e.key === 'Enter') {
                                                    if (isPasienFormOpen && filteredPasienForm.length > 0) {
                                                        const firstAvailable = filteredPasienForm.find((p) => !p.isRescheduled)
                                                        if (firstAvailable) {
                                                            e.preventDefault()
                                                            handleSelectPatient(firstAvailable)
                                                        }
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                setTimeout(() => {
                                                    const exactMatch = allPasienList.find(
                                                        (p) => p.nama.toLowerCase() === inputPasien.trim().toLowerCase()
                                                    )
                                                    if (exactMatch && !exactMatch.isRescheduled) {
                                                        if (exactMatch.tanggal && !inputTanggal) {
                                                            setInputTanggal(exactMatch.tanggal)
                                                        }
                                                        if (exactMatch.dokter && !inputDokter) {
                                                            setDokterOptions((prev) => (prev.includes(exactMatch.dokter) ? prev : [...prev, exactMatch.dokter]))
                                                            setInputDokter(exactMatch.dokter)
                                                        }
                                                    }
                                                }, 200)
                                            }}
                                            placeholder="Ketik atau pilih nama pasien..."
                                            className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all"
                                        />

                                        {/* Action Buttons di dalam input: Clear + Chevron */}
                                        <div className="absolute right-2.5 flex items-center gap-1 text-gray-400">
                                            {inputPasien && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInputPasien('')
                                                        setIsPasienFormOpen(true)
                                                        // Buka kunci field tanggal & dokter saat pasien di-clear
                                                        setIsPatientLocked(false)
                                                        setInputTanggal('')
                                                        setInputDokter('')
                                                    }}
                                                    title="Hapus nama pasien"
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <ClearIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsPasienFormOpen((prev) => !prev)}
                                                title="Buka / tutup daftar pasien"
                                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                <ChevronDownIcon
                                                    className={`w-4 h-4 transition-transform duration-200 ${isPasienFormOpen ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu Pasien untuk Form Input */}
                                    {isPasienFormOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-xs sm:text-sm animate-in fade-in duration-100">
                                            <div className="px-3 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                                                <span>
                                                    {inputPasien.trim()
                                                        ? `Hasil pencarian (${filteredPasienForm.length})`
                                                        : `Daftar Pasien (${allPasienList.length})`}
                                                </span>
                                                <span className="text-[10px] text-gray-400">Klik / Enter</span>
                                            </div>
                                            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                                                {filteredPasienForm.length > 0 ? (
                                                    filteredPasienForm.map((p, idx) => {
                                                        const isSelected =
                                                            inputPasien.trim().toLowerCase() === p.nama.toLowerCase()
                                                        const isRescheduled = Boolean(p.isRescheduled)

                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                disabled={isRescheduled}
                                                                onClick={() => handleSelectPatient(p)}
                                                                className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${isRescheduled
                                                                    ? 'bg-gray-50/80 text-gray-400 cursor-not-allowed opacity-75'
                                                                    : isSelected
                                                                        ? 'bg-blue-50 text-[#1e88e5] font-semibold cursor-pointer'
                                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className={isRescheduled ? 'text-gray-400' : ''}>
                                                                        {p.nama}
                                                                    </span>
                                                                    {isRescheduled && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                                                                            Reschedule
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {isSelected && !isRescheduled && (
                                                                    <CheckIcon className="w-4 h-4 text-[#1e88e5] shrink-0" />
                                                                )}
                                                            </button>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="p-3 text-center">
                                                        <p className="text-gray-500 text-xs">
                                                            Tidak ada pasien bernama "{inputPasien}" di daftar.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsPasienFormOpen(false)}
                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1e88e5] hover:underline cursor-pointer"
                                                        >
                                                            + Tetap gunakan nama "{inputPasien}"
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tanggal */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={inputTanggal}
                                        onChange={(e) => setInputTanggal(e.target.value)}
                                        onClick={(e) => !isPatientLocked && e.target.showPicker?.()}
                                        readOnly={isPatientLocked}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all ${
                                            isPatientLocked
                                                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed pointer-events-none'
                                                : 'border-gray-300 text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none cursor-pointer'
                                        }`}
                                    />
                                </div>

                                {/* Regio (Gigi) */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Regio (Gigi)
                                    </label>
                                    <input
                                        type="text"
                                        value={inputRegio}
                                        onChange={(e) => setInputRegio(e.target.value)}
                                        placeholder="Contoh: 16, 21, Full Arch"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Baris 2: Dokter Pemeriksa */}
                            <div className="w-full sm:w-1/3">
                                <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                    Dokter Pemeriksa
                                </label>
                                <div className="relative flex items-center">
                                    <select
                                        value={inputDokter}
                                        onChange={(e) => setInputDokter(e.target.value)}
                                        disabled={isPatientLocked}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm appearance-none pr-10 transition-all ${
                                            isPatientLocked
                                                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none cursor-pointer'
                                        }`}
                                    >
                                        <option value="" disabled>Pilih Dokter</option>
                                        {dokterOptions.map((doc, idx) => (
                                            <option key={idx} value={doc}>{doc}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3.5 text-gray-400 pointer-events-none">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Baris 3: Anamnesa (Diagnosa) & Tindakan Pelayanan (2 Kolom Textarea) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Anamnesa (Diagnosa)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={inputAnamnesa}
                                        onChange={(e) => setInputAnamnesa(e.target.value)}
                                        placeholder="Diagnosa Utama"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none transition-all"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Tindakan Pelayanan
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={inputTindakan}
                                        onChange={(e) => setInputTindakan(e.target.value)}
                                        placeholder="Masukkan Detail Tindakan"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none transition-all"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Baris 4: PF (Resep) & Terapi (Prosedur) (2 Kolom Textarea) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        PF (Resep)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={inputResep}
                                        onChange={(e) => setInputResep(e.target.value)}
                                        placeholder="Masukkan Resep Obat"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none transition-all"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Terapi (Prosedur)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={inputTerapi}
                                        onChange={(e) => setInputTerapi(e.target.value)}
                                        placeholder="Masukkan Rencana Prosedur Terapi"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none resize-none transition-all"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Tombol Simpan EMR + (di pojok kanan bawah persis seperti di desain) */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleResetForm}
                                        className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 active:scale-[0.99] text-gray-700 font-semibold text-sm transition-all cursor-pointer"
                                    >
                                        Batal Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#49baff]/30 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>Simpan EMR +</span>
                                </button>
                            </div>
                        </form>
                    </div>
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
                            onClick={fetchEmr}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium text-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* ====================================================
                    2. BAGIAN BAWAH: RIWAYAT REKAM MEDIS (EMR)
                   ==================================================== */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                            Riwayat Rekam Medis (EMR)
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Rekapitulasi seluruh rekam medis pasien klinik secara terpusat.
                        </p>
                    </div>

                    {/* Card Tabel & Filter Riwayat EMR */}
                    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col gap-5">
                        {/* Filter Bar */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 flex-wrap">
                            {/* Input Search */}
                            <div className="relative w-full lg:w-72 flex items-center">
                                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                                    <SearchIcon className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari Pasien, Diagnosa, Tindakan..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Filter Rentang Tanggal & Dropdown */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Tgl Mulai */}
                                <div className="relative flex items-center w-36">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="w-full pl-3 pr-2 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-700 bg-white hover:border-gray-400 focus:border-[#49baff] focus:outline-none cursor-pointer"
                                    />
                                </div>

                                <span className="text-gray-400 text-xs">-</span>

                                {/* Tgl Selesai */}
                                <div className="relative flex items-center w-36">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="w-full pl-3 pr-2 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-700 bg-white hover:border-gray-400 focus:border-[#49baff] focus:outline-none cursor-pointer"
                                    />
                                </div>

                                {/* Dropdown Filter Pasien (Bisa Search / Ketik Nama) */}
                                <div ref={pasienFilterRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPasienFilterOpen((prev) => !prev)
                                            setPasienFilterSearch('')
                                        }}
                                        className={`w-full min-w-[160px] max-w-[220px] px-3 py-2 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 transition-all cursor-pointer ${selectedPasienFilter !== 'Semua Pasien'
                                            ? 'bg-blue-50/70 border-[#49baff] text-[#1e88e5] font-semibold'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        title={selectedPasienFilter}
                                    >
                                        <span className="truncate">
                                            {selectedPasienFilter === 'Semua Pasien' ? 'Semua Pasien' : selectedPasienFilter}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {selectedPasienFilter !== 'Semua Pasien' && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedPasienFilter('Semua Pasien')
                                                    }}
                                                    title="Hapus filter pasien"
                                                    className="p-0.5 rounded-full hover:bg-blue-200/60 text-blue-600 cursor-pointer"
                                                >
                                                    <ClearIcon className="w-3 h-3" />
                                                </span>
                                            )}
                                            <ChevronDownIcon
                                                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isPasienFilterOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu Filter Pasien */}
                                    {isPasienFilterOpen && (
                                        <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-xs sm:text-sm animate-in fade-in duration-100">
                                            {/* Input Pencarian Pasien */}
                                            <div className="p-2 border-b border-gray-100 bg-gray-50/60">
                                                <div className="relative flex items-center">
                                                    <div className="absolute left-2.5 text-gray-400 pointer-events-none">
                                                        <SearchIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <input
                                                        ref={filterSearchInputRef}
                                                        type="text"
                                                        value={pasienFilterSearch}
                                                        onChange={(e) => setPasienFilterSearch(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') {
                                                                setIsPasienFilterOpen(false)
                                                            } else if (e.key === 'Enter') {
                                                                if (filteredPasienFilter.length > 0) {
                                                                    setSelectedPasienFilter(filteredPasienFilter[0].nama)
                                                                    setIsPasienFilterOpen(false)
                                                                    setPasienFilterSearch('')
                                                                }
                                                            }
                                                        }}
                                                        placeholder="Cari / ketik nama pasien..."
                                                        className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-1 focus:ring-[#49baff]/30 focus:outline-none"
                                                    />
                                                    {pasienFilterSearch && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPasienFilterSearch('')}
                                                            title="Hapus kata kunci"
                                                            className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                        >
                                                            <ClearIcon className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* List Pilihan Pasien */}
                                            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                                                {/* Opsi Semua Pasien */}
                                                {!pasienFilterSearch.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPasienFilter('Semua Pasien')
                                                            setIsPasienFilterOpen(false)
                                                        }}
                                                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${selectedPasienFilter === 'Semua Pasien'
                                                            ? 'bg-blue-50 text-[#1e88e5] font-semibold'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span>Semua Pasien</span>
                                                        {selectedPasienFilter === 'Semua Pasien' && (
                                                            <CheckIcon className="w-3.5 h-3.5 text-[#1e88e5]" />
                                                        )}
                                                    </button>
                                                )}

                                                {filteredPasienFilter.length > 0 ? (
                                                    filteredPasienFilter.map((p, idx) => {
                                                        const isSelected =
                                                            selectedPasienFilter.trim().toLowerCase() === p.nama.trim().toLowerCase()
                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPasienFilter(p.nama)
                                                                    setIsPasienFilterOpen(false)
                                                                    setPasienFilterSearch('')
                                                                }}
                                                                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${isSelected
                                                                    ? 'bg-blue-50 text-[#1e88e5] font-semibold'
                                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                                    }`}
                                                            >
                                                                <span className="truncate">{p.nama}</span>
                                                                {isSelected && (
                                                                    <CheckIcon className="w-3.5 h-3.5 text-[#1e88e5] shrink-0" />
                                                                )}
                                                            </button>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="px-3 py-4 text-center text-xs text-gray-400">
                                                        Tidak ada pasien yang cocok dengan "{pasienFilterSearch}".
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dropdown Semua Dokter */}
                                <div className="relative flex items-center w-36">
                                    <select
                                        value={selectedDokterFilter}
                                        onChange={(e) => setSelectedDokterFilter(e.target.value)}
                                        className="w-full pl-3 pr-7 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-700 bg-white hover:border-gray-400 focus:border-[#49baff] focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Semua Dokter">Semua Dokter</option>
                                        {dokterOptions.map((d, idx) => (
                                            <option key={idx} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2.5 text-gray-400 pointer-events-none">
                                        <ChevronDownIcon className="w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* Tombol Reset Filter */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStartDate('')
                                        setEndDate('')
                                        setSelectedPasienFilter('Semua Pasien')
                                        setSelectedDokterFilter('Semua Dokter')
                                        setSearchQuery('')
                                        setPasienFilterSearch('')
                                        setIsPasienFilterOpen(false)
                                        setCurrentPage(1)
                                    }}
                                    title="Reset semua filter"
                                    className="flex items-center justify-center p-2 rounded-xl border border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-400 active:scale-95 transition-all cursor-pointer"
                                >
                                    <FilterResetIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Status Loading */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <SpinnerIcon className="w-8 h-8 text-[#49baff] animate-spin" />
                                <span className="text-sm text-gray-500">Memuat riwayat rekam medis pasien...</span>
                            </div>
                        )}

                        {/* Tabel Riwayat EMR (Persis 8 Kolom Sesuai Desain Kelola-EMR.png) */}
                        {!isLoading && (
                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white">
                                                <th className="px-5 py-3.5 whitespace-nowrap">Nama Pasien</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap text-center">Tanggal</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap text-center">Regio</th>
                                                <th className="px-5 py-3.5 min-w-[180px]">Anamnesa (Diagnosa)</th>
                                                <th className="px-5 py-3.5 min-w-[180px]">Tindakan Pelayanan</th>
                                                <th className="px-5 py-3.5 min-w-[160px]">PF (Resep)</th>
                                                <th className="px-5 py-3.5 min-w-[160px]">Terapi (Prosedur)</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap">Dokter</th>
                                                <th className="px-5 py-3.5 whitespace-nowrap text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                            {filteredEmrList.length > 0 ? (
                                                filteredEmrList
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((item) => {
                                                        const isSelected = editingId === item.id

                                                        return (
                                                            <tr
                                                                key={item.id}
                                                                onClick={() => handleSelectRowToUpdate(item)}
                                                                className={`transition-colors cursor-pointer ${isSelected
                                                                    ? 'bg-blue-50/80 text-blue-900 font-semibold'
                                                                    : 'hover:bg-gray-50/80'
                                                                    }`}
                                                                title="Klik untuk mengedit data ini di form atas"
                                                            >
                                                                <td className="px-5 py-3.5 text-slate-800 whitespace-nowrap">
                                                                    {item.namaPasien}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center whitespace-nowrap text-slate-800">
                                                                    {item.tanggal}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center whitespace-nowrap text-slate-800">
                                                                    {item.regio}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-slate-700">
                                                                    {item.anamnesa}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-slate-700">
                                                                    {item.tindakan}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-slate-700">
                                                                    {item.resep}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-slate-700">
                                                                    {item.terapi}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-slate-800 whitespace-nowrap font-normal">
                                                                    {item.dokter}
                                                                </td>
                                                                {/* Kolom 9: Aksi (Hapus Saja) */}
                                                                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                                    <div className="flex items-center justify-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleDeleteEmr(item.id, item.namaPasien)
                                                                            }}
                                                                            className="w-8 h-8 rounded-lg bg-[#e62e2e] hover:bg-[#cf2525] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                                                                            title="Hapus Rekam Medis"
                                                                            aria-label="Hapus Rekam Medis"
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
                                                        colSpan="9"
                                                        className="px-4 py-12 text-center text-gray-400 text-xs sm:text-sm font-normal"
                                                    >
                                                        {emrList.length === 0
                                                            ? 'Belum ada data rekam medis. Silakan masukkan data rekam medis pasien melalui formulir di atas.'
                                                            : 'Tidak ada rekam medis yang sesuai dengan kriteria filter atau pencarian.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination jika data lebih dari itemsPerPage */}
                        {filteredEmrList.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredEmrList.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Dialog Konfirmasi Sebelum Simpan EMR (sesuai FR-7 & security.md) */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-7">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                            {editingId ? 'Konfirmasi Pembaruan EMR' : 'Konfirmasi Simpan EMR'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                            {editingId
                                ? `Apakah Anda yakin ingin memperbarui data rekam medis untuk pasien "${pendingPayload?.namaPasien}"?`
                                : `Apakah Anda yakin ingin menyimpan rekam medis baru untuk pasien "${pendingPayload?.namaPasien}"?`}
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setShowConfirmModal(false)
                                    setPendingPayload(null)
                                }}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleConfirmSave}
                                className="px-6 py-2.5 rounded-xl bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#49baff]/30 transition-all cursor-pointer flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <SpinnerIcon className="w-4 h-4 animate-spin text-white" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Ya, Simpan</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
