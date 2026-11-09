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
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" />
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" />
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
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06003M9.9 4.24002C10.5883 4.0789 11.2931 3.99836 12 4.00003C19 4.00003 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88003" />
            <path d="M1 1L23 23" />
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
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M2.4 21.6C1.74 21.6 1.1752 21.3652 0.7056 20.8956C0.236 20.426 0.0008 19.8608 0 19.2V2.4C0 1.74 0.2352 1.1752 0.7056 0.7056C1.176 0.236 1.7408 0.0008 2.4 0H19.2C19.86 0 20.4252 0.2352 20.8956 0.7056C21.366 1.176 21.6008 1.7408 21.6 2.4V10.44C21.22 10.26 20.83 10.1052 20.43 9.9756C20.03 9.846 19.62 9.7508 19.2 9.69V2.4H2.4V19.2H9.66C9.72 19.64 9.8152 20.06 9.9456 20.46C10.076 20.86 10.2308 21.24 10.41 21.6H2.4ZM2.4 18V19.2V2.4V9.69V9.6V18ZM4.8 16.8H9.69C9.75 16.38 9.8452 15.97 9.9756 15.57C10.106 15.17 10.2508 14.78 10.41 14.4H4.8V16.8ZM4.8 12H12.12C12.76 11.4 13.4752 10.9 14.2656 10.5C15.056 10.1 15.9008 9.83 16.8 9.69V9.6H4.8V12ZM4.8 7.2H16.8V4.8H4.8V7.2ZM18 24C16.34 24 14.9252 23.4148 13.7556 22.2444C12.586 21.074 12.0008 19.6592 12 18C11.9992 16.3408 12.5844 14.926 13.7556 13.7556C14.9268 12.5852 16.3416 12 18 12C19.6584 12 21.0736 12.5852 22.2456 13.7556C23.4176 14.926 24.0024 16.3408 24 18C23.9976 19.6592 23.4124 21.0744 22.2444 22.2456C21.0764 23.4168 19.6616 24.0016 18 24ZM17.4 21.6H18.6V18.6H21.6V17.4H18.6V14.4H17.4V17.4H14.4V18.6H17.4V21.6Z" />
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
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M12.5649 6.39844H11.4375C11.3344 6.39844 11.25 6.48281 11.25 6.58594V13.0383C11.25 13.0992 11.2782 13.1555 11.3274 13.1906L15.2016 16.0195C15.286 16.0805 15.4032 16.0641 15.4641 15.9797L16.1344 15.0656C16.1977 14.9789 16.1789 14.8617 16.0946 14.8031L12.7524 12.3867V6.58594C12.7524 6.48281 12.668 6.39844 12.5649 6.39844ZM17.7164 8.16094L21.3914 9.0586C21.5086 9.08672 21.6235 8.99766 21.6235 8.87813L21.6422 5.09297C21.6422 4.93594 21.4618 4.84688 21.3399 4.94532L17.6461 7.83047C17.6182 7.85207 17.597 7.8811 17.5848 7.91424C17.5727 7.94738 17.5701 7.98327 17.5775 8.0178C17.5848 8.05232 17.6017 8.08407 17.6263 8.10939C17.6509 8.13471 17.6821 8.15258 17.7164 8.16094ZM21.6469 15.218L20.318 14.7609C20.2717 14.7451 20.221 14.7479 20.1767 14.769C20.1325 14.79 20.0982 14.8275 20.0813 14.8734C20.0368 14.993 19.9899 15.1102 19.9407 15.2273C19.5235 16.2141 18.9258 17.1023 18.1618 17.8641C17.4062 18.622 16.5107 19.2261 15.525 19.643C14.5039 20.0747 13.4063 20.2963 12.2977 20.2945C11.1774 20.2945 10.0922 20.0766 9.07035 19.643C8.08466 19.2261 7.18921 18.622 6.43363 17.8641C5.67191 17.1023 5.07425 16.2141 4.65472 15.2273C4.22536 14.2057 4.00539 13.1082 4.00784 12C4.00784 10.8797 4.22581 9.79219 4.65941 8.77032C5.0766 7.7836 5.67425 6.89532 6.43831 6.1336C7.19389 5.37567 8.08934 4.77154 9.07503 4.35469C10.0922 3.9211 11.1797 3.70313 12.3 3.70313C13.4203 3.70313 14.5055 3.9211 15.5274 4.35469C16.5131 4.77154 17.4085 5.37567 18.1641 6.1336C18.4032 6.375 18.6282 6.62578 18.8344 6.89063L20.236 5.79375C18.3914 3.43594 15.5203 1.91953 12.2953 1.92188C6.67972 1.92422 2.17034 6.48516 2.22659 12.1031C2.28284 17.6227 6.77113 22.0781 12.3 22.0781C16.6477 22.0781 20.3508 19.3219 21.7618 15.4617C21.7969 15.3633 21.7453 15.2531 21.6469 15.218Z" />
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
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M8.707 19.707L18 10.414L13.586 6L4.293 15.293C4.16494 15.421 4.07404 15.5814 4.03 15.757L3 21L8.242 19.97C8.418 19.926 8.579 19.835 8.707 19.707ZM21 7.414C21.3749 7.03895 21.5856 6.53033 21.5856 6C21.5856 5.46967 21.3749 4.96106 21 4.586L19.414 3C19.0389 2.62506 18.5303 2.41443 18 2.41443C17.4697 2.41443 16.9611 2.62506 16.586 3L15 4.586L19.414 9L21 7.414Z" />
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
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M20.25 6H17.25V4.125C17.25 3.29766 16.5773 2.625 15.75 2.625H8.25C7.42266 2.625 6.75 3.29766 6.75 4.125V6H3.75C3.33516 6 3 6.33516 3 6.75V7.5C3 7.60313 3.08437 7.6875 3.1875 7.6875H4.60312L5.18203 19.9453C5.21953 20.7445 5.88047 21.375 6.67969 21.375H17.3203C18.1219 21.375 18.7805 20.7469 18.818 19.9453L19.3969 7.6875H20.8125C20.9156 7.6875 21 7.60313 21 7.5V6.75C21 6.33516 20.6648 6 20.25 6ZM15.5625 6H8.4375V4.3125H15.5625V6Z" />
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


