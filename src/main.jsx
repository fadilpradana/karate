import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Impor Komponen Layout, Konteks, dan Penjaga Rute
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AdminRoute from './components/AdminRoute.jsx'; // Penjaga untuk Admin
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Penjaga untuk Pengguna Login

// Impor Semua Komponen Halaman Anda
import Home from './pages/Home';
import ProfilDojo from './pages/ProfilDojo';
import Pengurus from './pages/Pengurus';
import Jadwal from './pages/Jadwal';
import Artikel from './pages/Artikel';
import ArtikelDetail from './pages/ArtikelDetail';
import Kontak from './pages/Kontak';
import Pendaftaran from './pages/Pendaftaran';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import TulisArtikelBaru from './pages/TulisArtikelBaru';
import ModerasiArtikel from './pages/ModerasiArtikel';

// Definisikan semua rute/halaman aplikasi
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div className="text-center text-2xl mt-20">Oops! Terjadi kesalahan.</div>,
    children: [
      // --- Rute Publik ---
      { index: true, element: <Home /> },
      { path: 'profil', element: <ProfilDojo /> },
      { path: 'pengurus', element: <Pengurus /> },
      { path: 'jadwal', element: <Jadwal /> },
      { path: 'artikel', element: <Artikel /> },
      { path: 'artikel/:id', element: <ArtikelDetail /> },
      { path: 'kontak', element: <Kontak /> },
      { path: 'pendaftaran', element: <Pendaftaran /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <SignUp /> },
      
      // --- Rute untuk Pengguna Terautentikasi (cukup login) ---
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tulis-artikel-baru',
        element: (
          <ProtectedRoute>
            <TulisArtikelBaru />
          </ProtectedRoute>
        ),
      },

      // --- Rute Khusus Admin ---
      {
        path: 'moderasi-artikel',
        element: (
          <AdminRoute>
            <ModerasiArtikel />
          </AdminRoute>
        ),
      },

      // --- Halaman 404 Not Found ---
      {
        path: '*', 
        element: <div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
