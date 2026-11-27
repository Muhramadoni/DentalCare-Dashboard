import { useState, useCallback } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Reservasi from './pages/reservasi'
import Dokter from './pages/dokter'
import EMR from './pages/EMR'
import { API } from './utils/api'
import { getAuthToken, clearAuthSession } from './utils/auth'

function App() {
    // Cek token autentikasi & halaman terakhir yang dikunjungi saat refresh
    const [currentPage, setCurrentPage] = useState(() => {
        const token = getAuthToken()
        if (!token) return 'login'
        const savedPage = sessionStorage.getItem('active_page')
        const validPages = ['dashboard', 'reservasi', 'dokter', 'emr']
        return validPages.includes(savedPage) ? savedPage : 'dashboard'
    })

    const handleNavigate = (pageId) => {
        const pageMap = {
            ringkasan: 'dashboard',
            dashboard: 'dashboard',
            reservasi: 'reservasi',
            dokter: 'dokter',
            emr: 'emr',
        }
        const targetPage = pageMap[pageId]
        if (!targetPage) {
            console.log('Navigasi halaman:', pageId)
            return
        }
        sessionStorage.setItem('active_page', targetPage)
        setCurrentPage(targetPage)
    }

    // Logout manual: Hanya dieksekusi saat admin menekan tombol "Logout"
    const handleLogout = useCallback(async () => {
        const token = getAuthToken()
        if (token) {
            try {
                await fetch(API.auth.logout, {
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
        clearAuthSession()
        setCurrentPage('login')
    }, [])

    return (
        <main className="w-full min-h-screen">
            {currentPage === 'login' && (
                <Login
                    onLoginSuccess={() => {
                        sessionStorage.setItem('active_page', 'dashboard')
                        setCurrentPage('dashboard')
                    }}
                />
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
