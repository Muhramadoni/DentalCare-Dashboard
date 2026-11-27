import logoImg from '../assets/image/logo-indentalcare.png'
import {
    DashboardIcon,
    ReservationIcon,
    DoctorIcon,
    EMRIcon,
} from './icon'

export default function Sidebar({ activeTab = 'ringkasan', onTabChange }) {
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
        <aside className="w-64 lg:w-[260px] h-screen bg-[#001e2f] text-white flex flex-col p-5 select-none shrink-0 sticky top-0 overflow-y-auto z-30 font-['Poppins']">
            {/* Bagian Atas: Logo & Branding */}
            <div>
                {/* Logo Klinik Gigi & Teks Branding Seimbang */}
                <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
                    <img
                        src={logoImg}
                        alt="Logo IN Dental Care"
                        loading="lazy"
                        decoding="async"
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
        </aside>
    )
}
