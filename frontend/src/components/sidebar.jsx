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
                {/* Logo Klinik Gigi */}
                <div className="flex items-center gap-3 px-2 py-3 mb-6">
                    <img
                        src={logoImg}
                        alt="Logo IN Dental Care"
                        className="w-10 h-10 object-contain shrink-0"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-wide text-white leading-tight">
                            IN DENTAL CARE
                        </span>
                        <span className="text-[10px] font-semibold text-[#49baff] tracking-wider uppercase">
                            Care For Every Smile
                        </span>
                    </div>
                </div>

                {/* List Menu Navigasi */}
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange && onTabChange(item.id)}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#49baff] text-white font-semibold shadow-md shadow-[#49baff]/25'
                                        : 'text-slate-300 hover:text-white hover:bg-[#0a232f]'
                                }`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Bagian Bawah: Profil Admin & Tombol Logout */}
            <div className="pt-6 border-t border-slate-800/80 space-y-4">
                {/* Info Admin */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#49baff] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                        A
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white leading-tight">
                            Admin
                        </span>
                        <span className="text-xs text-slate-400 truncate">
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#e62e2e] hover:bg-[#cf2525] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md shadow-red-900/20"
                >
                    <span>Logout</span>
                    <LogoutIcon className="w-4 h-4" />
                </button>
            </div>
        </aside>
    )
}

