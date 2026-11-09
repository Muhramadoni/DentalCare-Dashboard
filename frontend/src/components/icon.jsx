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
            fill="currentColor"
            viewBox="0 0 640 640"
            {...props}
        >
            <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM208.9 175.1C241 156.2 278.1 144 320 144C385.2 144 438.8 173.6 479.9 211.7C518.4 247.4 545 290 558.5 320C544.9 350 518.3 392.5 479.9 428.3C476.8 431.1 473.7 433.9 470.5 436.7L425.8 392C439.8 371.5 448 346.7 448 320C448 249.3 390.7 192 320 192C293.3 192 268.5 200.2 248 214.2L208.9 175.1zM390.9 357.1L282.9 249.1C294 243.3 306.6 240 320 240C364.2 240 400 275.8 400 320C400 333.4 396.7 346 390.9 357.1zM135.4 237.2L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L384.2 486C364.2 492.4 342.8 496 320 496C254.8 496 201.2 466.4 160.1 428.3C121.6 392.6 95 350 81.5 320C91.9 296.9 110.1 266.4 135.5 237.2z" />
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
            {/* Body outline */}
            <rect x="3" y="4" width="18" height="18" rx="3" />

            {/* Rings */}
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />

            {/* Header fill (tanpa garis divider) */}
            <path
                d="M3 7 Q3 4 6 4 L18 4 Q21 4 21 7 L21 8 L3 8 Z"
                fill="currentColor"
                stroke="none"
            />

            {/* Checkmark */}
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


