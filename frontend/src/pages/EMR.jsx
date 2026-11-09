import React, { useState } from 'react'
import Sidebar from '../components/sidebar'
import {
    CalendarOutlineIcon,
    ChevronDownIcon,
    FilterResetIcon,
    SearchIcon,
} from '../components/icon'

export default function EMR({ onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('emr')

    // State Input Form EMR Bagian Atas
    const [inputPasien, setInputPasien] = useState('')
    const [inputTanggal, setInputTanggal] = useState('')
    const [inputRegio, setInputRegio] = useState('')
    const [inputDokter, setInputDokter] = useState('')
    const [inputAnamnesa, setInputAnamnesa] = useState('')
    const [inputTindakan, setInputTindakan] = useState('')
    const [inputResep, setInputResep] = useState('')
    const [inputTerapi, setInputTerapi] = useState('')

    // State Mode Edit / Update langsung pada form (tanpa pop up)
    const [editingId, setEditingId] = useState(null)
    const [formSuccess, setFormSuccess] = useState('')
    const [formError, setFormError] = useState('')

    // State Riwayat Rekam Medis (EMR)
    const [emrList, setEmrList] = useState([
        {
            id: 1,
            namaPasien: 'Pasien 1',
            tanggal: '20-05-2026',
            regio: '16',
            anamnesa: 'Karies Profunda (Gigi Geraham Kanan)',
            tindakan: 'Penambalan Komposit Light-Curing',
            resep: 'Asam Mefenamat 500mg (3x1)',
            terapi: 'Evaluasi Oklusi & Polis Tambalan',
            dokter: 'drg. Indira Nugrahani',
        },
    ])

    // State Filter Bagian Bawah
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedPasienFilter, setSelectedPasienFilter] = useState('Semua Pasien')
    const [selectedDokterFilter, setSelectedDokterFilter] = useState('Semua Dokter')

    const pasienOptions = ['Pasien 1', 'Pasien 2', 'Budi Santoso', 'Siti Rahma', 'Ahmad Dani']
    const dokterOptions = [
        'drg. Indira Nugrahani',
        'drg. Adria Permana Putra, Sp.BM',
        'drg. Mhay Chyntha Harlyana',
        'drg. Fajar Pratama',
        'drg. Sarah Melati',
    ]

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
        setInputTanggal(item.tanggal)
        setInputRegio(item.regio === '-' ? '' : item.regio)
        setInputDokter(item.dokter)
        setInputAnamnesa(item.anamnesa === '-' ? '' : item.anamnesa)
        setInputTindakan(item.tindakan === '-' ? '' : item.tindakan)
        setInputResep(item.resep === '-' ? '' : item.resep)
        setInputTerapi(item.terapi === '-' ? '' : item.terapi)
        setFormError('')
        setFormSuccess('')

        // Scroll halus ke atas menuju form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Reset Form Input
    const handleResetForm = () => {
        setEditingId(null)
        setInputPasien('')
        setInputTanggal('')
        setInputRegio('')
        setInputDokter('')
        setInputAnamnesa('')
        setInputTindakan('')
        setInputResep('')
        setInputTerapi('')
        setFormError('')
    }

    // Simpan data dari Form (Tambah Baru atau Update data yang dipilih)
    const handleSaveFromForm = (e) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')

        if (!inputPasien) {
            setFormError('Silakan pilih pasien terlebih dahulu.')
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

        if (editingId) {
            // Mode Update langsung pada form atas
            setEmrList((prev) =>
                prev.map((item) =>
                    item.id === editingId
                        ? {
                              ...item,
                              namaPasien: inputPasien,
                              tanggal: inputTanggal.trim(),
                              regio: inputRegio.trim() || '-',
                              dokter: inputDokter,
                              anamnesa: inputAnamnesa.trim() || '-',
                              tindakan: inputTindakan.trim() || '-',
                              resep: inputResep.trim() || '-',
                              terapi: inputTerapi.trim() || '-',
                          }
                        : item
                )
            )
            setFormSuccess('Rekam medis berhasil diperbarui!')
        } else {
            // Mode Tambah Baru
            const newRecord = {
                id: Date.now(),
                namaPasien: inputPasien,
                tanggal: inputTanggal.trim(),
                regio: inputRegio.trim() || '-',
                dokter: inputDokter,
                anamnesa: inputAnamnesa.trim() || '-',
                tindakan: inputTindakan.trim() || '-',
                resep: inputResep.trim() || '-',
                terapi: inputTerapi.trim() || '-',
            }
            setEmrList((prev) => [newRecord, ...prev])
            setFormSuccess('Rekam medis baru berhasil disimpan!')
        }

        handleResetForm()
        setTimeout(() => setFormSuccess(''), 3000)
    }

    // Filter data tabel riwayat EMR
    const filteredEmrList = emrList.filter((item) => {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
            item.namaPasien.toLowerCase().includes(query) ||
            item.anamnesa.toLowerCase().includes(query) ||
            item.tindakan.toLowerCase().includes(query) ||
            item.dokter.toLowerCase().includes(query)

        const matchesPasien =
            selectedPasienFilter === 'Semua Pasien' || item.namaPasien === selectedPasienFilter

        const matchesDokter =
            selectedDokterFilter === 'Semua Dokter' || item.dokter === selectedDokterFilter

        // Konversi tanggal item (DD-MM-YYYY) → Date untuk perbandingan
        let matchesDate = true
        if (startDate || endDate) {
            const [d, m, y] = item.tanggal.split('-')
            const itemDate = new Date(`${y}-${m}-${d}`)
            if (startDate) matchesDate = matchesDate && itemDate >= new Date(startDate)
            if (endDate)   matchesDate = matchesDate && itemDate <= new Date(endDate)
        }

        return matchesSearch && matchesPasien && matchesDokter && matchesDate
    })

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
                        {/* Alert Notifikasi */}
                        {formSuccess && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium">
                                {formSuccess}
                            </div>
                        )}
                        {formError && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
                                {formError}
                            </div>
                        )}
                        {editingId && (
                            <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium flex items-center justify-between">
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

                        <form onSubmit={handleSaveFromForm} className="space-y-4">
                            {/* Baris 1: Pilih Pasien, Tanggal, Regio (Gigi) (3 Kolom) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Pilih Pasien */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5">
                                        Pilih Pasien
                                    </label>
                                    <div className="relative flex items-center">
                                        <select
                                            value={inputPasien}
                                            onChange={(e) => setInputPasien(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="" disabled>Pilih Pasien</option>
                                            {pasienOptions.map((p, idx) => (
                                                <option key={idx} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 text-gray-400 pointer-events-none">
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </div>
                                    </div>
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
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none cursor-pointer"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none appearance-none cursor-pointer pr-10"
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

                                {/* Dropdown Semua Pasien */}
                                <div className="relative flex items-center w-36">
                                    <select
                                        value={selectedPasienFilter}
                                        onChange={(e) => setSelectedPasienFilter(e.target.value)}
                                        className="w-full pl-3 pr-7 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-700 bg-white hover:border-gray-400 focus:border-[#49baff] focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Semua Pasien">Semua Pasien</option>
                                        {pasienOptions.map((p, idx) => (
                                            <option key={idx} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2.5 text-gray-400 pointer-events-none">
                                        <ChevronDownIcon className="w-3.5 h-3.5" />
                                    </div>
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
                                    }}
                                    title="Reset semua filter"
                                    className="flex items-center justify-center p-2 rounded-xl border border-gray-300 bg-white text-gray-500 hover:border-[#49baff] hover:text-[#49baff] hover:bg-[#49baff]/5 active:scale-95 transition-all cursor-pointer"
                                >
                                    <FilterResetIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tabel Riwayat EMR (Persis 8 Kolom Sesuai Desain Kelola-EMR.png) */}
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-slate-700">
                                        {filteredEmrList.length > 0 ? (
                                            filteredEmrList.map((item) => {
                                                const isSelected = editingId === item.id

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => handleSelectRowToUpdate(item)}
                                                        className={`transition-colors cursor-pointer ${
                                                            isSelected
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
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="px-4 py-8 text-center text-gray-400 text-xs font-normal"
                                                >
                                                    Tidak ada rekam medis yang sesuai dengan kriteria filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
