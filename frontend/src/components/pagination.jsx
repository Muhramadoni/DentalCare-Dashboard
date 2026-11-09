import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icon'

/**
 * Reusable Pagination Component
 * Otomatis tampil jika total data melebihi itemsPerPage (default: 5)
 */
export default function Pagination({
    currentPage,
    totalItems,
    itemsPerPage = 5,
    onPageChange,
}) {
    // Jika data tidak lebih dari 5, pagination tidak perlu ditampilkan
    if (totalItems <= itemsPerPage) {
        return null
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Daftar nomor halaman yang akan ditampilkan
    const getPageNumbers = () => {
        const pages = []
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs sm:text-sm select-none">
            {/* Info Range Data */}
            <p className="text-gray-500 font-normal">
                Menampilkan <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
                <span className="font-semibold text-slate-700">{endItem}</span> dari{' '}
                <span className="font-semibold text-slate-700">{totalItems}</span> data
            </p>

            {/* Tombol Navigasi Halaman */}
            <div className="flex items-center gap-1.5">
                {/* Tombol Sebelumnya */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    title="Halaman Sebelumnya"
                >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs font-medium">Sebelumnya</span>
                </button>

                {/* Tombol Nomor Halaman */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page) => {
                        const isActive = page === currentPage
                        return (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-[#49baff] text-white shadow-xs'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    })}
                </div>

                {/* Tombol Selanjutnya */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    title="Halaman Selanjutnya"
                >
                    <span className="hidden sm:inline text-xs font-medium">Selanjutnya</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

