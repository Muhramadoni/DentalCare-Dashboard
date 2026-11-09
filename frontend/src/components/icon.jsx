import React from 'react'

/**
 * Clear / Close Icon (X)
 */
export function ClearIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    )
}

/**
 * Eye Open Icon (Tampilkan Password)
 */
export function EyeIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
        </svg>
    )
}

/**
 * Eye Off / Slashed Icon (Sembunyikan Password)
 */
export function EyeOffIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
            />
        </svg>
    )
}

/**
 * Spinner / Loading Icon
 */
export function SpinnerIcon({ className = 'animate-spin h-4 w-4', ...props }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" {...props}>
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}

/**
 * Alert / Error Circle Icon
 */
export function ErrorIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20" {...props}>
            <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
            />
        </svg>
    )
}

/**
 * Dashboard / Ringkasan Utama Icon (Font Awesome — chart-line)
 */
export function DashboardIcon({ className = 'w-5 h-5', ...props }) {
    return (
        <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M128 128C128 110.3 113.7 96 96 96C78.3 96 64 110.3 64 128L64 464C64 508.2 99.8 544 144 544L544 544C561.7 544 576 529.7 576 512C576 494.3 561.7 480 544 480L144 480C135.2 480 128 472.8 128 464L128 128zM534.6 214.6C547.1 202.1 547.1 181.8 534.6 169.3C522.1 156.8 501.8 156.8 489.3 169.3L384 274.7L326.6 217.4C314.1 204.9 293.8 204.9 281.3 217.4L185.3 313.4C172.8 325.9 172.8 346.2 185.3 358.7C197.8 371.2 218.1 371.2 230.6 358.7L304 285.3L361.4 342.7C373.9 355.2 394.2 355.2 406.7 342.7L534.7 214.7z" />
        </svg>
    )
}

/**
 * Kelola Reservasi Icon (Calendar with Checkmark)
 */
export function ReservationIcon({ className = 'w-5 h-5', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M9 16l2 2 4-4" />
        </svg>
    )
}

/**
 * Kelola Dokter Icon (Doctor / User with Stethoscope)
 */
export function DoctorIcon({ className = 'w-5 h-5', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            {/* Kepala */}
            <circle cx="10" cy="7" r="4" />
            
            {/* Badan */}
            <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
            
            {/* Tanda Plus Outline (User-plus style) */}
            <path d="M19 10v4m-2-2h4" />
        </svg>
    );
}
/**
 * EMR Icon (Medical Record Document with Plus badge)
 */
export function EMRIcon({ className = 'w-5 h-5', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
    )
}

/**
 * Logout Icon (Exit arrow)
 */
export function LogoutIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}

/**
 * Riwayat / Activity History Icon
 */
export function ActivityIcon({ className = 'w-5 h-5', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" />
        </svg>
    )
}

/**
 * Search Icon (Kaca Pembesar)
 */
export function SearchIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

/**
 * Edit / Pencil Icon
 */
export function EditIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    )
}

/**
 * Trash / Delete Icon
 */
export function TrashIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
    )
}

/**
 * Plus Icon
 */
export function PlusIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

/**
 * Calendar Outline Icon
 */
export function CalendarOutlineIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

/**
 * Clock Outline Icon
 */
export function ClockOutlineIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

/**
 * Chevron Down Icon
 */
export function ChevronDownIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

/**
 * Check Icon (Centang)
 */
export function CheckIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

/**
 * Chevron Left Icon
 */
export function ChevronLeftIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    )
}

/**
 * Chevron Right Icon
 */
export function ChevronRightIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            {...props}
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}

/**
 * Filter Reset Icon (Font Awesome Free — fa-filter)
 */
export function FilterResetIcon({ className = 'w-4 h-4', ...props }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            fill="currentColor"
            {...props}
        >
            <path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z" />
        </svg>
    )
}


