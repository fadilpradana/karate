import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProfilDojo from './pages/ProfilDojo';
import Pengurus from './pages/Pengurus';
import Jadwal from './pages/Jadwal';
import Berita from './pages/Berita';
import SignUp from './pages/SignUp.jsx';
import Kontak from './pages/Kontak';
import Pendaftaran from './pages/Pendaftaran';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Pastikan path benar
import { AuthProvider } from './contexts/AuthContext'; // Pastikan path benar

function App() {
  return (
    <BrowserRouter>
      {/* Bungkus seluruh aplikasi dengan AuthProvider */}
      {/* Ini akan membuat session, user, profile, loadingAuth, dll. tersedia di mana saja dalam pohon komponen */}
      <AuthProvider>
        <div className="min-h-screen bg-[#0E0004] text-white font-[Montserrat]">
          <Navbar /> {/* Navbar di luar Routes agar selalu terlihat */}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profil" element={<ProfilDojo />} />
            <Route path="/pengurus" element={<Pengurus />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/pendaftaran" element={<Pendaftaran />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            {/* 🔐 Proteksi untuk Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* 🔐 Contoh rute lain yang dilindungi (Tambahkan sesuai kebutuhan Anda) */}
            {/* Misalnya, halaman Profil pengguna pribadi juga perlu dilindungi */}
            <Route
                path="/profil-saya" // Contoh rute khusus profil pengguna yang dilindungi
                element={
                    <ProtectedRoute>
                        {/* Ganti dengan komponen profil yang hanya bisa diakses user login */}
                        <div>Halaman Profil Pengguna Saya (Dilindungi)</div>
                    </ProtectedRoute>
                }
            />

            {/* 404 - Halaman tidak ditemukan */}
            <Route path="*" element={<div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;