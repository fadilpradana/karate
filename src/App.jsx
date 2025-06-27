// src/App.jsx
import { Routes, Route } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';

// Impor Komponen Halaman
import Home from './pages/Home';
import ProfilDojo from './pages/ProfilDojo';
import Pengurus from './pages/Pengurus';
import Jadwal from './pages/Jadwal';
import Berita from './pages/Berita';
import Kontak from './pages/Kontak';
import Pendaftaran from './pages/Pendaftaran';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp'; // Pastikan SignUp sudah diimpor

// Impor Komponen Umum
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


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
          <Route path="/berita" element={<Berita />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/pendaftaran" element={<Pendaftaran />} />
          
          {/* --- RUTE BARU UNTUK OTENTIKASI --- */}

          {/* Rute untuk Login */}
          <Route path="/login" element={<Login />} />
          
          {/* PERUBAHAN: Rute untuk SignUp ditambahkan di sini */}
          <Route path="/signup" element={<SignUp />} />

          {/* Rute untuk Dashboard, diproteksi oleh ProtectedRoute */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 - Halaman tidak ditemukan */}
          <Route path="*" element={<div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
