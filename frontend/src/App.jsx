import React, { useState, useEffect, useRef, useCallback } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Reservasi from './pages/reservasi'
import Dokter from './pages/dokter'
import EMR from './pages/EMR'

function App() {
    // Cek apakah token autentikasi tersimpan di localStorage
    const [currentPage, setCurrentPage] = useState(() => {
        const token = localStorage.getItem('auth_token')
        return token ? 'dashboard' : 'login'
    })

    // --- Sliding Session: Idle Timeout ---
    // Referensi waktu aktivitas terakhir admin (tidak perlu re-render)
    const lastActivityRef = useRef(Date.now())

    // Konstanta durasi (ms)
    const IDLE_TIMEOUT_MS    = 60 * 60 * 1000  // 60 menit tidak aktif → auto logout
    const REFRESH_INTERVAL_MS = 55 * 60 * 1000  // Refresh token tiap 55 menit jika aktif
    const IDLE_CHECK_MS       =      60 * 1000  // Cek idle tiap 1 menit

    // Daftar event yang dianggap sebagai "aktivitas admin"
    const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

    const handleNavigate = (pageId) => {
        if (pageId === 'ringkasan') {
            setCurrentPage('dashboard')
        } else if (pageId === 'reservasi') {
            setCurrentPage('reservasi')
        } else if (pageId === 'dokter') {
            setCurrentPage('dokter')
        } else if (pageId === 'emr') {
            setCurrentPage('emr')
        } else {
            console.log('Navigasi halaman:', pageId)
        }
    }

    const handleLogout = useCallback(async () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            try {
                await fetch('http://localhost:5000/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })
            } catch (error) {
                console.error('Logout error:', error)
            }
        }
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_email')
        setCurrentPage('login')
    }, [])

    // --- Effect 1: Catat setiap aktivitas admin ---
    useEffect(() => {
        if (currentPage === 'login') return

        const handleActivity = () => {
            lastActivityRef.current = Date.now()
        }

        ACTIVITY_EVENTS.forEach(event =>
            window.addEventListener(event, handleActivity, { passive: true })
        )

        return () => {
            ACTIVITY_EVENTS.forEach(event =>
                window.removeEventListener(event, handleActivity)
            )
        }
    }, [currentPage])

    // --- Effect 2: Cek idle setiap 1 menit → logout jika idle ≥ 60 menit ---
    useEffect(() => {
        if (currentPage === 'login') return

        const idleChecker = setInterval(() => {
            const idleDuration = Date.now() - lastActivityRef.current
            if (idleDuration >= IDLE_TIMEOUT_MS) {
                console.warn('Sesi berakhir: Admin tidak aktif selama 60 menit.')
                handleLogout()
            }
        }, IDLE_CHECK_MS)

        return () => clearInterval(idleChecker)
    }, [currentPage, handleLogout])

    // --- Effect 3: Refresh token tiap 55 menit HANYA jika admin aktif ---
    useEffect(() => {
        if (currentPage === 'login') return

        const tokenRefresher = setInterval(async () => {
            const idleDuration = Date.now() - lastActivityRef.current

            // Jika admin idle lebih dari 55 menit, skip refresh (biarkan logout handle)
            if (idleDuration >= REFRESH_INTERVAL_MS) return

            const token = localStorage.getItem('auth_token')
            if (!token) return

            try {
                const res = await fetch('http://localhost:5000/api/v1/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (res.ok) {
                    const json = await res.json()
                    // Simpan token baru → sesi diperpanjang 1 jam ke depan
                    localStorage.setItem('auth_token', json.data.token)
                    console.info('Token sesi berhasil diperpanjang.')
                } else {
                    // Token sudah tidak valid → paksa logout
                    console.warn('Refresh token gagal, paksa logout.')
                    handleLogout()
                }
            } catch (error) {
                console.error('Gagal menghubungi server untuk refresh token:', error)
            }
        }, REFRESH_INTERVAL_MS)

        return () => clearInterval(tokenRefresher)
    }, [currentPage, handleLogout])

    return (
        <main className="w-full min-h-screen">
            {currentPage === 'login' && (
                <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
            )}

            {currentPage === 'dashboard' && (
                <Dashboard
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'reservasi' && (
                <Reservasi
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'dokter' && (
                <Dokter
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'emr' && (
                <EMR
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
            )}
        </main>
    )
}

export default App
