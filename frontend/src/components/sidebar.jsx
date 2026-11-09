import React from 'react'
import logoImg from '../assets/image/logo-indentalcare.png'
import {
    DashboardIcon,
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
    LogoutIcon,
} from './icon'

export default function Sidebar({ activeTab = 'ringkasan', onTabChange, onLogout }) {
    const menuItems = [
        {
            id: 'ringkasan',
            label: 'Ringkasan Utama',
            icon: DashboardIcon,
        },
        {
            id: 'reservasi',
            label: 'Kelola Reservasi',
            icon: ReservationIcon,
        },
        {
            id: 'dokter',
            label: 'Kelola Dokter',
            icon: DoctorIcon,
        },
        {
            id: 'emr',
            label: 'EMR',
            icon: EMRIcon,
        },
    ]

    return (
        <aside className="w-64 lg:w-[260px] h-screen bg-[#001e2f] text-white flex flex-col justify-between p-5 select-none shrink-0 sticky top-0 overflow-y-auto z-30 font-['Poppins']">
            {/* Bagian Atas: Logo & Menu Navigasi */}
            <div>
                {/* Logo Klinik Gigi & Teks Branding Seimbang */}
                <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
                    <img
                        src={logoImg}
                        alt="Logo IN Dental Care"
                        className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="flex flex-col justify-center gap-0.5 min-w-0">
                        <span className="text-[14px] sm:text-[15px] font-semibold tracking-wide leading-tight">
                            <span className="text-[#0584bc]">IN DENTAL </span>
                            <span className="text-[#adc91f]">CARE</span>
                        </span>
                        <span className="text-[9px] sm:text-[9.5px] font-medium text-[#49baff] tracking-wider uppercase leading-tight">
                            Care For Every Smile
                        </span>
                    </div>
                </div>

                {/* List Menu Navigasi */}
                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange && onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#0584bc] text-white font-semibold shadow-sm'
                                        : 'text-slate-300 font-medium hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="tracking-normal">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Bagian Bawah: Profil Admin & Tombol Logout */}
            <div className="pt-5 border-t border-slate-800/80 space-y-4">
                {/* Info Admin */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#49baff] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        A
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white leading-tight">
                            Admin
                        </span>
                        <span className="text-xs font-normal text-slate-400 truncate mt-0.5">
                            admin@gmail.com
                        </span>
                    </div>
                </div>

                {/* Tombol Logout */}
                <button
                    type="button"
                    onClick={() => {
                        if (onLogout) {
                            onLogout()
                        } else {
                            if (window.confirm('Apakah Anda yakin ingin logout?')) {
                                window.location.reload()
                            }
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-[#e31e1e] hover:bg-[#cf1b1b] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md shadow-red-950/20"
                >
                    <span>Logout</span>
                    <LogoutIcon className="w-4 h-4" />
                </button>
            </div>
        </aside>
    )
}

