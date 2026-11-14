import React, { useState, useCallback } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Reservasi from './pages/reservasi'
import Dokter from './pages/dokter'
import EMR from './pages/EMR'

function App() {
    // Cek apakah token autentikasi tersimpan di sessionStorage (hilang otomatis saat tab ditutup)
    const [currentPage, setCurrentPage] = useState(() => {
        const token = sessionStorage.getItem('auth_token')
        return token ? 'dashboard' : 'login'
    })

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

    // Logout manual: Hanya dieksekusi saat admin menekan tombol "Logout"
    const handleLogout = useCallback(async () => {
        const token = sessionStorage.getItem('auth_token')
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
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('user_email')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_email')
        setCurrentPage('login')
    }, [])

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
