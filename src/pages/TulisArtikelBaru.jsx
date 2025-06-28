import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArticleForm } from '../hooks/useArticleForm';
import { AuthStatusDisplay } from '../components/AuthStatusDisplay';
import { Pencil, Image as ImageIcon, Send, Edit, FileText, Settings, ChevronLeft } from 'lucide-react';
import brevetLogo from '../assets/brevet.png';

export default function TulisArtikelBaru() {
    const { user, role: userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const {
        judul,
        setJudul,
        konten,
        setKonten,
        gambarUrl,
        setGambarUrl,
        isSubmitting,
        submitError,
        submitSuccess,
        handleSubmit,
    } = useArticleForm(user);

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            const authorized = user && (userRole === 'pengurus' || userRole === 'admin');
            setIsAuthorized(authorized);

            if (!authorized) {
                console.log("TulisArtikelBaru: Pengguna tidak diizinkan. User:", user, "Role:", userRole);
                setTimeout(() => {
                    alert('Anda tidak memiliki izin untuk mengakses halaman ini.');
                    navigate('/artikel');
                }, 100);
            } else {
                console.log("TulisArtikelBaru: Pengguna diizinkan sebagai", userRole);
            }
        }
    }, [user, userRole, authLoading, navigate]);

    const handleMyArticlesClick = () => {
        if (user && user.user_metadata?.username) {
            navigate(`/artikel?author=${user.user_metadata.username}`);
        } else if (user && user.email) {
            navigate(`/artikel?author=${user.email.split('@')[0]}`);
        } else {
            alert('Anda harus login untuk melihat artikel Anda.');
        }
    };

    const menuVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } },
    };
    const sidebarVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } },
    };

    if (authLoading || !isAuthorized) {
        return <AuthStatusDisplay authLoading={authLoading} isAuthorized={isAuthorized} />;
    }

    const glassButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold shadow-lg transition-all duration-200";

    return (
        <div className="relative min-h-screen flex flex-col justify-between">

            {/* Desktop Menu Manajemen Artikel */}
            {(userRole === 'pengurus' || userRole === 'admin') && (
                <motion.div
                    variants={sidebarVariants}
                    initial="hidden"
                    animate="visible"
                    className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                >
                    <nav className="space-y-3">
                        <button
                            onClick={() => navigate('/artikel')}
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text{current_date} transition-colors duration-200 block"
                            title="Kembali ke Artikel"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleMyArticlesClick}
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                            title="Artikel Saya"
                        >
                            <FileText size={20} />
                        </button>
                        {userRole === 'admin' && (
                            <Link
                                to="/moderasi-artikel"
                                className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                                title="Moderasi Artikel"
                            >
                                <Settings size={20} />
                            </Link>
                        )}
                    </nav>
                </motion.div>
            )}

            {/* Mobile Menu Manajemen Artikel - DIPINDAH DAN DIPERBAIKI */}
            {(userRole === 'pengurus' || userRole === 'admin') && (
                <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    // Mengembalikan ke mx-auto dan mt-20 untuk posisi tengah horizontal dan jarak atas
                    className="block md:hidden mx-auto mt-20 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg z-10 w-fit"
                >
                    <nav className="flex space-x-4 justify-center">
                        <button
                            onClick={() => navigate('/artikel')}
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                            title="Kembali ke Artikel"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleMyArticlesClick}
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                            title="Artikel Saya"
                        >
                            <FileText size={20} />
                        </button>
                        {userRole === 'admin' && (
                            <Link
                                to="/moderasi-artikel"
                                className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                                title="Moderasi Artikel"
                            >
                                <Settings size={20} />
                            </Link>
                        )}
                    </nav>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                // Mengembalikan pt-0 md:pt-20 dan mt-8 untuk jarak antara menu mobile dan form
                className="flex-grow flex items-center justify-center p-4 pt-0 md:pt-20 mt-8"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 max-w-xl w-full">
                    <h1 className="text-2xl sm:text-4xl font-league font-bold uppercase text-center mb-6 text-[#FF9F1C]">Tulis Artikel Baru</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Artikel</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="judul"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                    placeholder="Masukkan judul artikel..."
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    required
                                />
                                <Pencil size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="konten" className="block text-gray-300 text-sm font-medium mb-2">Konten Artikel</label>
                            <div className="relative">
                                <textarea
                                    id="konten"
                                    rows="8"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                    placeholder="Tulis konten artikel Anda di sini..."
                                    value={konten}
                                    onChange={(e) => setKonten(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="gambarUrl" className="block text-gray-300 text-sm font-medium mb-2">URL Gambar (Opsional)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    id="gambarUrl"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                    placeholder="https://example.com/gambar.jpg"
                                    value={gambarUrl}
                                    onChange={(e) => setGambarUrl(e.target.value)}
                                />
                                <ImageIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-red-400 text-sm text-center">{submitError}</p>
                        )}

                        {submitSuccess && (
                            <p className="text-green-400 text-sm text-center">Artikel berhasil dibuat! Mengarahkan ulang...</p>
                        )}

                        {/* Tombol Buat Artikel - Glass Effect, Teks Warna Accent, Lebar Penuh */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C] disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Buat Artikel
                                </>
                            )}
                        </motion.button>

                        {/* Tombol Kembali ke Daftar Artikel - Glass Effect, Teks Abu, Lebar Penuh */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate('/artikel')}
                            className={`${glassButtonClasses} text-gray-400 hover:text-gray-400 mt-2`}
                        >
                            <ChevronLeft size={20} />
                            Kembali ke Daftar Artikel
                        </motion.button>

                    </form>
                </div>
            </motion.div>

            {/* Footer yang Diperbarui (Dari Artikel.jsx) */}
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