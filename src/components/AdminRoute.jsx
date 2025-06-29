import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Impor logo untuk footer dan background baru
import brevetLogo from "../assets/brevet.png"; 
import bg1 from '../assets/bg1.jpg'; // Import background dari assets

// Komponen ini akan menjadi "penjaga" untuk rute khusus admin
const AdminRoute = ({ children }) => {
    const { user, role, loading } = useAuth();

    // Definisi kelas untuk tombol glassmorphism (dari AuthStatusDisplay)
    const glassButtonClasses = "flex items-center justify-center gap-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg shadow-lg transition-all duration-200 text-[#FF9F1C] hover:text-white";

    // --- Animasi untuk konten "Akses Ditolak" (dari AuthStatusDisplay) ---
    // (Akan diterapkan pada div container pesan akses ditolak)
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.2
            },
        },
    };

    // 1. Tampilkan pesan loading saat data pengguna sedang diperiksa
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center">
                        <p className="mb-4 text-lg">Memeriksa otorisasi...</p>
                        {/* Jika ada SkeletonLoader di sini, import dan gunakan */}
                        {/* <SkeletonLoader /> */} 
                    </div>
                </div>
                {/* Footer yang sama persis */}
                <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center md:text-left w-full md:w-1/3">
                            &copy; With Love STMKG Karate Club Periode 2025
                        </div>
                        <div className="w-full md:w-1/3 flex justify-center">
                            <img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" />
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
                            <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                            <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                            <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                            <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    // 2. Jika tidak loading dan tidak ada user, alihkan ke halaman login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Jika ada user tapi perannya bukan 'admin', tampilkan halaman "Akses Ditolak"
    if (role !== 'admin') {
        return (
            // Latar belakang dengan gambar bg1.jpg dan overlay hitam transparan
            <div className="min-h-screen flex flex-col justify-between text-white"
                 style={{
                     backgroundImage: `url(${bg1})`, // Menggunakan import gambar bg1
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                 }}>
                {/* Overlay hitam transparan untuk memastikan teks tetap terbaca */}
                <div className="absolute inset-0 bg-black opacity-80"></div>
                
                {/* Pembungkus konten agar footer tetap di bawah, dengan relative z-10 */}
                <div className="flex-grow flex items-center justify-center p-4 relative z-10">
                    {/* Konten modal penolakan akses dengan animasi Framer Motion */}
                    <motion.div
                        className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-8 max-w-md w-full"
                        variants={cardVariants} // Menerapkan variants untuk animasi
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Akses Ditolak</h2>
                        <p className="text-gray-300 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                        {/* Pembungkus untuk menengahkan tombol */}
                        <div className="flex justify-center">
                            <Link
                                to="/artikel" // PERUBAHAN: Mengarahkan ke halaman artikel
                                className={glassButtonClasses}
                            >
                                Kembali ke Artikel {/* PERUBAHAN: Teks tombol */}
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Footer yang sama persis */}
                <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center md:text-left w-full md:w-1/3">
                            &copy; With Love STMKG Karate Club Periode 2025
                        </div>
                        <div className="w-full md:w-1/3 flex justify-center">
                            <img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" />
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
                            <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                            <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                            <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                            <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    // 4. Jika semua kondisi terpenuhi (login dan admin), tampilkan halaman anak
    return children;
};

export default AdminRoute;