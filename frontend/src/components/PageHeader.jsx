import { LuCalendarDays } from 'react-icons/lu'

export default function PageHeader({ title, subtitle, actions }) {
    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

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
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-[#f9f8ff] border border-slate-100 rounded-xl px-3 py-2">
                    <LuCalendarDays className="w-4 h-4 text-[#49baff] shrink-0" />
                    <span className="whitespace-nowrap capitalize">{todayLabel}</span>
                </div>
                {actions}
            </div>
        </header>
    )
}
