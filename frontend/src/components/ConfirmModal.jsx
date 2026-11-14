import React from 'react'
import { ClearIcon, TrashIcon, LogoutIcon } from './icon'

/**
 * Komponen Modal Dialog Konfirmasi Tindakan Penting (Logout, Hapus Data, dsb)
 */
export default function ConfirmModal({
    isOpen,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'danger', // 'danger' | 'logout' | 'primary'
    isLoading = false,
    onConfirm,
    onClose,
}) {
    if (!isOpen) return null

    const isDanger = type === 'danger'
    const isLogout = type === 'logout'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Poppins'] animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-7 relative my-auto">
                {/* Header Icon & Close Button */}
                <div className="flex items-start justify-between">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                            isLogout
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : isDanger
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-[#e6f7ff] text-[#49baff] border border-[#b8e5ff]'
                        }`}
                    >
                        {isLogout ? (
                            <LogoutIcon className="w-6 h-6" />
                        ) : (
                            <TrashIcon className="w-6 h-6" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <ClearIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                            isLogout || isDanger
                                ? 'bg-[#e31e1e] hover:bg-[#cf1b1b] shadow-red-500/20 active:scale-[0.99]'
                                : 'bg-[#49baff] hover:bg-[#38a9ee] shadow-[#49baff]/30 active:scale-[0.99]'
                        }`}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

