import { useState, useRef, useEffect } from 'react'
import { LuCalendarDays } from 'react-icons/lu'
import { ChevronDownIcon, LogoutIcon } from './icon'
import ConfirmModal from './ConfirmModal'

export default function PageHeader({ title, subtitle, actions, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const dropdownRef = useRef(null)

    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    const adminEmail =
        (typeof window !== 'undefined' && sessionStorage.getItem('user_email')) ||
        'admindental@gmail.com'

    // Menutup dropdown ketika klik di luar area akun
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false)
        if (onLogout) {
            onLogout()
        } else {
            window.location.reload()
        }
    }

    return (
        <header className="shrink-0 bg-white border-b border-slate-200/80 px-6 sm:px-8 lg:px-10 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-20">
            <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal leading-snug">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                {/* Badge Tanggal Hari Ini */}
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-[#f9f8ff] border border-slate-100 rounded-xl px-3 py-2">
                    <LuCalendarDays className="w-4 h-4 text-[#49baff] shrink-0" />
                    <span className="whitespace-nowrap capitalize">{todayLabel}</span>
                </div>

                {/* Action Tambahan (jika ada) */}
                {actions}

                {/* Profil Akun Admin dengan Dropdown Logout (Tanpa Card Box) */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 py-1 px-1.5 rounded-xl hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                        aria-expanded={isDropdownOpen}
                        title="Informasi Akun Admin"
                    >
                        {/* 1. Username Statis 'Admin' Terlebih Dahulu */}
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
                            Admin
                        </span>

                        {/* 2. Avatar Profil Akun */}
                        <div className="w-8 h-8 rounded-full bg-[#49baff] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            A
                        </div>

                        {/* 3. Chevron Down Icon */}
                        <ChevronDownIcon
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                isDropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {/* Pop-up Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                            {/* Detail Informasi Akun */}
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-800">Admin</p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={adminEmail}>
                                    {adminEmail}
                                </p>
                            </div>

                            {/* Menu Logout */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDropdownOpen(false)
                                        setShowLogoutConfirm(true)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50/80 font-medium transition-colors cursor-pointer text-left"
                                >
                                    <LogoutIcon className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Dialog Konfirmasi Logout */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                type="logout"
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari sesi admin IN DENTAL CARE?"
                confirmText="Ya, Logout"
                cancelText="Batal"
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
            />
        </header>
    )
}
