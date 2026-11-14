import React, { useState } from 'react'
import doctorImg from '../assets/image/doctor.png'
import logoImg from '../assets/image/logo-indentalcare.png'
import { ClearIcon, EyeIcon, EyeOffIcon, SpinnerIcon, ErrorIcon } from '../components/icon'

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [loginSuccess, setLoginSuccess] = useState(false)

    const handleClearEmail = () => {
        setEmail('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')

        if (!email.trim()) {
            setErrorMessage('Silakan masukkan email Anda.')
            return
        }

        if (!password) {
            setErrorMessage('Silakan masukkan password Anda.')
            return
        }

        setIsLoading(true)

        try {
            // Panggil API Login Backend (sesuai apiguide.md: POST /api/v1/auth/login)
            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                // Tangani error dari API (401, 400, 429, dll)
                if (response.status === 429) {
                    setErrorMessage('Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.')
                } else {
                    setErrorMessage(result?.error?.message || 'Email atau password yang Anda masukkan salah.')
                }
                setIsLoading(false)
                return
            }

            // Login berhasil: simpan token di sessionStorage (auto-reset saat tab/browser ditutup)
            const { token, user } = result.data
            sessionStorage.setItem('auth_token', token)
            sessionStorage.setItem('user_email', user.email)

            setIsLoading(false)
            setLoginSuccess(true)

            // Arahkan ke dashboard setelah animasi sukses
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess({ email: user.email, token })
                }
            }, 500)

        } catch (err) {
            // Error jaringan / server tidak bisa dijangkau
            setIsLoading(false)
            setErrorMessage('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.')
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#e8ecef] font-['Poppins'] select-none">
            {/* =========================================
                BAGIAN KIRI: Foto Full Height Memenuhi Layar
                (Proporsi proporsional sesuai Figma Login.png)
            ========================================= */}
            <div className="relative w-full lg:w-1/2 h-[45vh] sm:h-[50vh] lg:h-screen bg-[#e8ecef] flex items-end justify-center overflow-hidden shrink-0">
                <img
                    src={doctorImg}
                    alt="Dokter IN Dental Care"
                    className="h-[80%] sm:h-[82%] lg:h-[80vh] max-h-[820px] w-auto object-contain object-bottom pointer-events-none select-none transition-transform duration-300"
                />
            </div>

            {/* =========================================
                BAGIAN KANAN: Card Login Full Height Memenuhi Layar
                (Tanpa border radius, split lurus sesuai Figma Login.png)
            ========================================= */}
            <div className="w-full lg:w-1/2 min-h-[55vh] lg:h-screen bg-white rounded-none flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-14 xl:px-24 py-8 lg:py-12 z-20 overflow-y-auto shrink-0">
                <div className="w-full max-w-[440px] flex flex-col">
                    {/* Logo Klinik Gigi */}
                    <div className="flex justify-center mb-8">
                        <img
                            src={logoImg}
                            alt="Logo IN Dental Care"
                            className="h-24 sm:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105"
                        />
                    </div>

                    {/* Heading & Sub-header (Rata Kiri sesuai foto desain) */}
                    <div className="text-left mb-7">
                        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                            Selamat Datang
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-normal">
                            Silakan Masuk Ke Dashboard Admin
                        </p>
                    </div>

                    {/* Alert Notifikasi Error */}
                    {errorMessage && (
                        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <ErrorIcon className="w-4 h-4 shrink-0 text-red-500" />
                                <span>{errorMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setErrorMessage('')}
                                className="text-red-400 hover:text-red-700 font-bold ml-2 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Alert Notifikasi Berhasil */}
                    {loginSuccess && (
                        <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium flex items-center justify-center">
                            Login berhasil! Mengalihkan ke sistem...
                        </div>
                    )}

                    {/* Formulir Login */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Form Group: Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs sm:text-sm font-medium text-gray-800 mb-2"
                            >
                                Email
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan Email"
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                                />
                                {email && (
                                    <button
                                        type="button"
                                        onClick={handleClearEmail}
                                        className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                        title="Hapus email"
                                        aria-label="Hapus email"
                                    >
                                        <ClearIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form Group: Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs sm:text-sm font-medium text-gray-800 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan Password"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400 focus:border-[#49baff] focus:ring-2 focus:ring-[#49baff]/20 focus:outline-none transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                >
                                    {showPassword ? (
                                        <EyeIcon className="w-4 h-4" />
                                    ) : (
                                        <EyeOffIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tombol Aksi: Login (Primary Button sesuai DESIGN.md) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 bg-[#49baff] hover:bg-[#38a9ee] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#49baff]/30 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Login</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
