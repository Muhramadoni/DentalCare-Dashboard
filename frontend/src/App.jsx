import { useState, useCallback, lazy, Suspense } from 'react'
import { API } from './utils/api'
import { getAuthToken, clearAuthSession } from './utils/auth'

// Lazy loading halaman-halaman utama agar ukuran bundle awal kecil dan performa navigasi cepat
const Login = lazy(() => import('./pages/login'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Reservasi = lazy(() => import('./pages/reservasi'))
const Dokter = lazy(() => import('./pages/dokter'))
const EMR = lazy(() => import('./pages/EMR'))

// Indikator loading ringan saat komponen halaman diunduh secara dinamis (lazy load)
function PageLoader() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f9f8ff] font-['Poppins'] select-none">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#49baff]/20 border-t-[#49baff] rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-medium tracking-wide">Memuat halaman...</span>
            </div>
        </div>
    )
}

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
        </main>
    )
}

export default App
