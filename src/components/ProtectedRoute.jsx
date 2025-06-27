// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // Pastikan path benar
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { session, loadingAuth } = useAuth(); // Ambil session dan loadingAuth dari AuthContext

  // Tampilkan loading spinner atau pesan saat autentikasi sedang dimuat
  // Ini penting agar tidak langsung redirect sebelum status autentikasi diketahui
  if (loadingAuth) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-t-4 border-t-[#FF9F1C] border-white/20 rounded-full animate-spin"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        ></motion.div>
        <p className="mt-4 text-white text-lg font-medium">Memuat sesi...</p>
      </motion.div>
    );
  }

  // Jika tidak ada sesi aktif, redirect ke halaman login
  // Supabase akan secara otomatis mengelola sesi. Jika kedaluwarsa, session akan null.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada sesi aktif, render children (komponen yang dilindungi)
  return children;
};

export default ProtectedRoute;