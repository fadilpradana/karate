// src/components/AuthStatusDisplay.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion dan AnimatePresence
import { LoaderCircle } from 'lucide-react'; // Import LoaderCircle untuk animasi loading
import brevetLogo from '../assets/brevet.png';
import bg1 from '../assets/bg1.jpg';

export function AuthStatusDisplay({ authLoading, isAuthorized }) {
    const glassButtonClasses = "flex items-center justify-center gap-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg shadow-lg transition-all duration-200 text-[#FF9F1C] hover:text-white";
    
    // Gaya glassmorphism untuk box loading atau akses ditolak
    const glassBoxStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
        borderRadius: '0.8rem',
    };

    // Varian animasi untuk kotak (baik loading maupun akses ditolak)
    const boxVariants = {
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
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } } // Animasi keluar
    };

    // Ini adalah div container utama untuk seluruh tampilan AuthStatusDisplay
    // Baik loading maupun akses ditolak akan menggunakan struktur ini agar footer tetap di bawah
    const AuthContainer = ({ children }) => (
        <div className="min-h-screen flex flex-col justify-between text-white"
             style={{
                 backgroundImage: `url(${bg1})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            {/* Overlay hitam transparan */}
            <div className="absolute inset-0 bg-black opacity-80"></div>
            
            {/* Konten utama (loading atau akses ditolak) */}
            <div className="flex-grow flex items-center justify-center p-4 relative z-10">
                <AnimatePresence mode="wait"> {/* mode="wait" agar animasi exit selesai sebelum yang baru masuk */}
                    {children}
                </AnimatePresence>
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

    // 1. Tampilkan animasi loading saat authLoading true
    if (authLoading) {
        return (
            <AuthContainer>
                <motion.div 
                    key="loading-state" // Key untuk AnimatePresence
                    variants={boxVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-8 max-w-md w-full"
                    style={glassBoxStyle}
                >
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ loop: Infinity, duration: 1, ease: "linear" }}
                        className="mx-auto mb-4"
                    >
                        <LoaderCircle className="w-12 h-12 text-[#FF9F1C]" /> {/* Warna kuning sesuai tema */}
                    </motion.div>
                    <p className="text-lg text-gray-300">Memverifikasi akses Anda...</p>
                </motion.div>
            </AuthContainer>
        );
    }

    // 2. Jika authLoading false dan tidak authorized, tampilkan "Akses Ditolak"
    if (!isAuthorized) {
        return (
            <AuthContainer>
                <motion.div 
                    key="access-denied-state" // Key untuk AnimatePresence
                    variants={boxVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-8 max-w-md w-full"
                    style={glassBoxStyle}
                >
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Akses Ditolak</h2>
                    <p className="text-gray-300 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => window.location.href = '/artikel'}
                            className={glassButtonClasses}
                        >
                            Kembali ke Artikel
                        </button>
                    </div>
                </motion.div>
            </AuthContainer>
        );
    }

    return null; // Jika authorized dan tidak loading, tidak render apapun (biarkan children yang render)
}