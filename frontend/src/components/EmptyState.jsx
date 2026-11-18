export default function EmptyState({ icon: Icon, title, description, compact = false }) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            <Icon className={`text-gray-400 ${compact ? 'w-7 h-7' : 'w-9 h-9'}`} />
            <p className={`font-medium text-slate-600 ${compact ? 'text-xs mt-1' : 'text-sm mt-1.5'}`}>
                {title}
            </p>
            {description ? (
                <p className={`text-gray-400 max-w-sm leading-relaxed ${compact ? 'text-[11px]' : 'text-xs'}`}>
                    {description}
                </p>
            ) : null}
        </div>
    )
}
