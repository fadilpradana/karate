import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProfilDojo from './pages/ProfilDojo'
import Pengurus from './pages/Pengurus'
import Jadwal from './pages/Jadwal'
import Berita from './pages/Berita' // Pastikan ini sudah ada atau tambahkan jika belum
// import Galeri from './pages/Galeri' // BARIS INI DIHAPUS ATAU DIKOMENTARI
import Kontak from './pages/Kontak'
import Pendaftaran from './pages/Pendaftaran'
import Navbar from './components/Navbar' // pastikan file ini ada

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0E0004] text-white font-[Montserrat]">
        {/* Navbar Utama */}
        <Navbar />

        {/* Konten Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<ProfilDojo />} />
          <Route path="/pengurus" element={<Pengurus />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/pendaftaran" element={<Pendaftaran />} />
          <Route path="*" element={<div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App