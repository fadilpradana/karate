// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Pastikan path ini benar

// Impor Komponen Halaman
import Home from './pages/Home';
import ProfilDojo from './pages/ProfilDojo';
import Pengurus from './pages/Pengurus';
import Jadwal from './pages/Jadwal';
import Artikel from './pages/Artikel';
import ArtikelDetail from './pages/ArtikelDetail';
import Kontak from './pages/Kontak';
import Pendaftaran from './pages/Pendaftaran';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import TulisArtikelBaru from './pages/TulisArtikelBaru';
import ModerasiArtikel from './pages/ModerasiArtikel';

// Impor Komponen Umum
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Tetap diimpor karena masih digunakan oleh rute lain

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0E0004] text-white font-[Montserrat]">
        <Navbar />

        <Routes>
          {/* Rute Publik Anda yang sudah ada */}
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<ProfilDojo />} />
          <Route path="/pengurus" element={<Pengurus />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:id" element={<ArtikelDetail />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/pendaftaran" element={<Pendaftaran />} />

          {/* Rute untuk Login & Sign Up */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Rute yang Dilindungi */}
          {/* Rute untuk Dashboard, diproteksi oleh ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* PERUBAHAN: Rute untuk Tulis Artikel Baru, TIDAK DILINDUNGI ProtectedRoute */}
          {/* Sekarang dapat diakses langsung oleh siapa saja (termasuk dummy mode) */}
          <Route path="/tulis-artikel-baru" element={<TulisArtikelBaru />} />


          <Route path="/moderasi-artikel" element={<ModerasiArtikel />} />


          {/* 404 - Halaman tidak ditemukan */}
          <Route path="*" element={<div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;