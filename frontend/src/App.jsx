import React, { useState } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Reservasi from './pages/reservasi'
import Dokter from './pages/dokter'
import EMR from './pages/EMR'

function App() {
    // Alur awal aplikasi: mulai dari halaman Login, setelah login masuk ke Ringkasan Utama (Dashboard)
    const [currentPage, setCurrentPage] = useState('login')

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

    return (
        <main className="w-full min-h-screen">
            {currentPage === 'login' && (
                <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
            )}

            {currentPage === 'dashboard' && (
                <Dashboard
                    onNavigate={handleNavigate}
                    onLogout={() => setCurrentPage('login')}
                />
            )}

            {currentPage === 'reservasi' && (
                <Reservasi
                    onNavigate={handleNavigate}
                    onLogout={() => setCurrentPage('login')}
                />
            )}

            {currentPage === 'dokter' && (
                <Dokter
                    onNavigate={handleNavigate}
                    onLogout={() => setCurrentPage('login')}
                />
            )}

            {currentPage === 'emr' && (
                <EMR
                    onNavigate={handleNavigate}
                    onLogout={() => setCurrentPage('login')}
                />
            )}
        </main>
    )
}

export default App
