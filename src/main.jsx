import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Impor Komponen Layout & Konteks
import App from './App.jsx'; // Ini akan menjadi layout utama (dengan Navbar)
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
    element: <App />, // App.jsx sekarang menjadi komponen Layout
    // Halaman Error jika terjadi kesalahan pada rute
    errorElement: <div className="text-center text-2xl mt-20">Oops! Terjadi kesalahan.</div>,
    // Semua halaman lain menjadi "children" dari App
    children: [
      {
        index: true, // Ini untuk path '/', halaman Home
        element: <Home />,
      },
      {
        path: 'profil',
        element: <ProfilDojo />,
      },
      {
        path: 'pengurus',
        element: <Pengurus />,
      },
      {
        path: 'jadwal',
        element: <Jadwal />,
      },
      {
        path: 'artikel',
        element: <Artikel />,
      },
      {
        path: 'artikel/:id', // Rute dinamis untuk detail artikel
        element: <ArtikelDetail />,
      },
      {
        path: 'kontak',
        element: <Kontak />,
      },
      {
        path: 'pendaftaran',
        element: <Pendaftaran />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
      {
        path: 'tulis-artikel-baru',
        element: <TulisArtikelBaru />,
      },
      {
        path: 'moderasi-artikel',
        element: <ModerasiArtikel />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        // Halaman "catch-all" untuk 404 Not Found
        path: '*', 
        element: <div className="text-center text-2xl mt-20">404 - Halaman tidak ditemukan</div>
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider membungkus semua rute agar konteks tersedia di mana saja */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
