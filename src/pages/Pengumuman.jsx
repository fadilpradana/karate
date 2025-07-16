import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Impor Helmet

// Import aset dan ikon
import Footer from '../components/Footer';
import bg1 from '../assets/bg2.jpg'; 
import { User, Calendar, Search, RefreshCcw, ChevronLeft, ChevronRight, Edit, Settings, Megaphone, Filter } from 'lucide-react'; // Tambahkan icon Filter

// Helper function untuk membersihkan HTML dan memotong teks
const stripHtmlAndTruncate = (html, length) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};


export default function Pengumuman() {
    const [pengumumanList, setPengumumanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPengumuman, setFilteredPengumuman] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Jumlah pengumuman per halaman
    
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    // State baru untuk filter tahun
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [isYearFilterOpen, setIsYearFilterOpen] = useState(false); 
    const filterContainerRef = useRef(null);

    // Logika untuk mendapatkan role pengguna, sama seperti di halaman Artikel
    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, username, nama_lengkap')
                        .eq('id', user.id)
                        .single();

                    if (profileError) throw profileError;
                    
                    if (profileData) {
                        setUserRole(profileData.role);
                    }
                }
            } catch (err) {
                console.error('Error fetching user role:', err.message);
                setUserRole(null);
            }
        }
        getUserAndRole();
    }, []);

    // Efek untuk mengambil data pengumuman dari Supabase
    useEffect(() => {
        const fetchPengumuman = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('pengumuman')
                .select(`
                    id, judul, konten, published_at,
                    profiles!penulis_id (
                        username,
                        nama_lengkap
                    )
                `)
                .order('published_at', { ascending: false });

            if (error) {
                console.error("Error fetching pengumuman:", error);
                setError(`Gagal memuat pengumuman: ${error.message}`);
            } else {
                setPengumumanList(data);
                setFilteredPengumuman(data);

                // Ekstrak tahun unik dari pengumuman untuk dropdown filter
                const years = [...new Set(data.map(item => new Date(item.published_at).getFullYear()))].sort((a, b) => b - a);
                setAvailableYears(['', ...years]); // Tambahkan opsi 'Semua Tahun'
            }
            setLoading(false);
        };

        fetchPengumuman();
    }, []);

    // Efek untuk melakukan filter pencarian dan tahun
    useEffect(() => {
        let results = pengumumanList;

        // Filter berdasarkan tahun terlebih dahulu
        if (selectedYear) {
            results = results.filter(item =>
                new Date(item.published_at).getFullYear().toString() === selectedYear
            );
        }

        // Kemudian filter berdasarkan searchTerm
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        results = results.filter(item =>
            item.judul.toLowerCase().includes(lowerCaseSearchTerm) ||
            (item.profiles?.nama_lengkap && item.profiles.nama_lengkap.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredPengumuman(results);
        setCurrentPage(1); // Reset halaman ke 1 setiap kali filter berubah
    }, [searchTerm, selectedYear, pengumumanList]); // Tambahkan selectedYear sebagai dependency

    // Fungsi untuk mereset pencarian dan filter tahun
    const handleResetSearch = () => {
        setSearchTerm('');
        setSelectedYear(''); // Reset tahun juga
        setFilteredPengumuman(pengumumanList);
        setCurrentPage(1);
    };

    // Logika Paginasi
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPengumuman.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPengumuman.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // Varian animasi untuk item daftar
    const listItemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15, ease: "easeIn" } }
    };

    const toggleYearFilter = () => { 
        setIsYearFilterOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isYearFilterOpen && filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setIsYearFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isYearFilterOpen]);

    return (
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Pengumuman - STMKG Karate Club</title>
                <meta name="description" content="Informasi dan berita terbaru seputar kegiatan STMKG Karate Club. Jangan lewatkan pengumuman penting dari kami." />
                <meta name="keywords" content="pengumuman karate, berita karate, stmkg karate club, info karate, jadwal latihan" />
                <meta property="og:title" content="Papan Pengumuman | STMKG Karate Club" />
                <meta property="og:description" content="Informasi dan berita terbaru dari STMKG Karate Club." />
                <meta property="og:url" content="https://karate.stmkg.ac.id/pengumuman" />
                <meta property="og:type" content="website" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="author" content="STMKG Karate Club" />
                <link rel="canonical" href="https://karate.stmkg.ac.id/pengumuman" />
            </Helmet>
            {/* Latar Belakang dengan Animasi */}
            <motion.div
                className="fixed inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg1})` }}
                />
                <div className="absolute inset-0 bg-black/70" />
            </motion.div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    
                    {/* Menu Manajemen untuk Admin/Pengurus */}
                    {(userRole === 'pengurus' || userRole === 'admin') && (
                        <>
                            {/* Menu Mobile */}
                             <motion.div
                                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit"
                            >
                                <nav className="flex space-x-4 justify-center">
                                    <Link to="/tulis-pengumuman-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors" title="Tulis Pengumuman Baru"><Edit size={20} /></Link>
                                    {userRole === 'admin' && (
                                        <Link to="/moderasi-pengumuman" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors" title="Moderasi Pengumuman"><Settings size={20} /></Link>
                                    )}
                                </nav>
                            </motion.div>
                            {/* Menu Desktop */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                            >
                                <nav className="space-y-3">
                                    <Link to="/tulis-pengumuman-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors block" title="Tulis Pengumuman Baru"><Edit size={20} /></Link>
                                    {userRole === 'admin' && (
                                        <Link to="/moderasi-pengumuman" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors block" title="Moderasi Pengumuman"><Settings size={20} /></Link>
                                    )}
                                </nav>
                            </motion.div>
                        </>
                    )}

                    <div className="max-w-4xl mx-auto">
                        <motion.h1 
                            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="text-5xl sm:text-7xl uppercase font-league text-center mb-4 text-accent"
                        >
                            PAPAN PENGUMUMAN
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-center text-gray-300 mb-10"
                        >
                            Informasi dan berita terbaru seputar kegiatan karate.
                        </motion.p>

                        {/* Search Bar and Year Filter */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                            className="relative z-30 mb-8 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg flex items-center justify-between mx-auto max-w-[18rem] sm:max-w-md md:max-w-lg lg:max-w-xl"
                        >
                            <div className="flex items-center flex-grow pl-2">
                                <Search size={20} className="text-gray-400 mr-2 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm sm:text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-1 pr-1">
                                <div className="relative" ref={filterContainerRef}>
                                    <button
                                        onClick={toggleYearFilter}
                                        className={`p-2 rounded-full transition-colors duration-200 ${selectedYear ? 'bg-white/20 text-[#FF9F1C]' : 'text-gray-300 hover:bg-white/20'}`}
                                        title="Filter berdasarkan tahun"
                                    >
                                        <Filter size={18} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isYearFilterOpen && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedYear('');
                                                            setIsYearFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${!selectedYear ? 'text-[#FF9F1C] font-semibold' : 'text-gray-200 hover:bg-white/10'}`}
                                                    >
                                                        Semua Tahun
                                                    </button>
                                                    <div className="border-t border-white/10 my-1"></div>
                                                    {availableYears.filter(y => y !== '').map(year => (
                                                        <button
                                                            key={year}
                                                            onClick={() => {
                                                                setSelectedYear(year.toString());
                                                                setIsYearFilterOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedYear === year.toString() ? 'text-[#FF9F1C] font-semibold' : 'text-gray-200 hover:bg-white/10'}`}
                                                        >
                                                            {year}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {(searchTerm || selectedYear) && (
                                    <button
                                        onClick={handleResetSearch}
                                        className="p-2 rounded-full text-gray-300 hover:bg-white/20 transition-colors duration-200"
                                        title="Reset Filter"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Konten Utama (List Pengumuman) */}
                        <div className="space-y-6">
                            {loading ? (
                                <p className="text-center text-lg">Memuat pengumuman...</p>
                            ) : error ? (
                                <p className="text-center text-red-400 text-lg">{error}</p>
                            ) : currentItems.length === 0 ? (
                                <p className="text-center text-gray-400 text-lg">Tidak ada pengumuman yang ditemukan.</p>
                            ) : (
                                <AnimatePresence>
                                    {currentItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            variants={listItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link to={`/pengumuman/${item.id}`} className="block group">
                                                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-5 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 border-l-4 border-[#FF9F1C]">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="flex-shrink-0 text-[#FF9F1C] mt-1">
                                                            <Megaphone size={24} />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#FF9F1C] transition-colors">
                                                                {item.judul}
                                                            </h2>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-300 mb-3">
                                                                <div className="flex items-center gap-1.5"><User size={14} /><span>Oleh {item.profiles?.nama_lengkap || 'Admin'}</span></div>
                                                                <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                                                            </div>
                                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                                {stripHtmlAndTruncate(item.konten, 150)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Paginasi */}
                        {totalPages > 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-2 mt-12">
                                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"><ChevronLeft size={20} /></button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium ${currentPage === i + 1 ? 'bg-[#FF9F1C] text-white' : 'bg-white/10 hover:bg-white/20'}`}
                                    >{i + 1}</button>
                                ))}
                                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"><ChevronRight size={20} /></button>
                            </motion.div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
