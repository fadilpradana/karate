import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import brevetLogo from '../assets/brevet.png';
import bg1 from '../assets/bg1.jpg'; // Import gambar background
import { User, Calendar, Search, RefreshCcw, ChevronLeft, ChevronRight, Edit, FileText, Settings } from 'lucide-react';

// Nama komponen diubah menjadi Artikel
export default function Artikel() {
    const [artikelList, setArtikelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArtikel, setFilteredArtikel] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;
    const location = useLocation();
    const navigate = useNavigate();

    // State untuk menyimpan role pengguna dan username
    const [userRole, setUserRole] = useState(null);
    const [loggedInUsername, setLoggedInUsername] = useState(null);

    // --- LOGIKA PENGAMBILAN ROLE PENGGUNA DAN USERNAME (Tetap di sini) ---
    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError.message);
                    setUserRole(null);
                    setLoggedInUsername(null);
                    return;
                }

                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, username')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching user profile:', profileError.message);
                        setUserRole(null);
                        setLoggedInUsername(null);
                        return;
                    }

                    if (profileData) {
                        setUserRole(profileData.role);
                        setLoggedInUsername(profileData.username);
                    } else {
                        // Default role jika profil tidak ditemukan (bisa disesuaikan)
                        setUserRole('anggota');
                        setLoggedInUsername(null);
                    }
                } else {
                    // Jika tidak ada sesi (tidak login)
                    setUserRole(null);
                    setLoggedInUsername(null);
                }
            } catch (err) {
                console.error('Unexpected error fetching user role/username:', err.message);
                setUserRole(null);
                setLoggedInUsername(null);
            }
        }

        getUserAndRole();
        // Tidak ada dependensi array di sini, akan jalan sekali saat mount
        // Jika perlu update saat login/logout, bisa tambahkan supabase.auth.onAuthStateChange
    }, []);

    // --- LOGIKA PENGAMBILAN ARTIKEL (EXISTING) ---
    useEffect(() => {
        const fetchArtikelWithAuthor = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('artikel')
                .select(`
                    *,
                    profiles!penulis_id (
                        username
                    )
                `)
                .order('created_at', { ascending: false }); // Mengambil semua artikel, nanti difilter oleh RLS

            if (error) {
                console.error("Error fetching artikel:", error);
                setError(`Gagal memuat artikel: ${error.message || 'Terjadi kesalahan tidak diketahui.'}`);
            } else {
                setArtikelList(data);

                const queryParams = new URLSearchParams(location.search);
                const authorFromUrl = queryParams.get('author');

                if (authorFromUrl) {
                    setSearchTerm(authorFromUrl);
                    const results = data.filter(artikel =>
                        artikel.profiles?.username && artikel.profiles.username.toLowerCase() === authorFromUrl.toLowerCase()
                    );
                    setFilteredArtikel(results);
                } else {
                    setFilteredArtikel(data);
                }

                setCurrentPage(1);
            }
            setLoading(false);
        };

        fetchArtikelWithAuthor();
    }, [location.search]);

    // --- LOGIKA FILTER ARTIKEL (EXISTING) ---
    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const results = artikelList.filter(artikel =>
            artikel.judul.toLowerCase().includes(lowerCaseSearchTerm) ||
            (artikel.profiles?.username && artikel.profiles.username.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredArtikel(results);
        setCurrentPage(1);
    }, [searchTerm, artikelList]);

    const handleResetSearch = () => {
        setSearchTerm('');
        setFilteredArtikel(artikelList);
        setCurrentPage(1);
        const url = new URL(window.location.href);
        url.searchParams.delete('author');
        window.history.replaceState({}, '', url.toString());
    };

    const handleMyArticlesClick = () => {
        if (loggedInUsername) {
            navigate(`/artikel?author=${loggedInUsername}`);
        } else {
            alert('Anda harus login untuk melihat artikel Anda.');
        }
    };

    const highlightArtikel = filteredArtikel.length > 0 ? filteredArtikel[0] : null;
    const articlesForPagination = highlightArtikel ? filteredArtikel.slice(1) : filteredArtikel;

    const indexOfLastOtherArticle = currentPage * (articlesPerPage - 1);
    const indexOfFirstOtherArticle = indexOfLastOtherArticle - (articlesPerPage - 1);
    const otherArtikel = articlesForPagination.slice(indexOfFirstOtherArticle, indexOfLastOtherArticle);

    const totalPages = Math.ceil(articlesForPagination.length / (articlesPerPage - 1));

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } }
    };

    const otherItemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
    };

    return (
        <div
            className="relative min-h-screen text-white bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${bg1})` }}
        >
            <div className="absolute inset-0 bg-black opacity-70"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    {/* Mobile Menu Manajemen Artikel - di atas search bar */}
                    {(userRole === 'pengurus' || userRole === 'admin') && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                            className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit"
                        >
                            <nav className="flex space-x-4 justify-center">
                                <Link
                                    to="/tulis-artikel-baru"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                                    title="Tulis Artikel Baru"
                                >
                                    <Edit size={20} />
                                </Link>
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

                    {/* Desktop Menu Manajemen Artikel - fixed di kiri */}
                    {(userRole === 'pengurus' || userRole === 'admin') && (
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                            className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                        >
                            <nav className="space-y-3">
                                <Link
                                    to="/tulis-artikel-baru"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                                    title="Tulis Artikel Baru"
                                >
                                    <Edit size={20} />
                                </Link>
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
                    {/* End Sidebar Menu */}

                    {/* Konten Utama (Search Bar + Articles) */}
                    <div className="max-w-5xl mx-auto">
                        {/* Search Bar */}
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="mb-8 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg flex items-center justify-between mx-auto max-w-lg"
                        >
                            <Search size={20} className="text-gray-300 ml-2 mr-3" />

                            <input
                                type="text"
                                placeholder="Cari artikel..."
                                className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm sm:text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="flex items-center mr-2">
                                {searchTerm && (
                                    <RefreshCcw
                                        size={20}
                                        className="text-gray-300 cursor-pointer hover:text-white transition-colors"
                                        onClick={handleResetSearch}
                                        title="Reset pencarian"
                                    />
                                )}
                            </div>
                        </motion.div>
                        {/* End Search Bar */}

                        {loading ? (
                            <p className="text-center text-base sm:text-lg">Memuat artikel...</p>
                        ) : error ? (
                            <p className="text-center text-red-400 text-base sm:text-lg">{error}</p>
                        ) : filteredArtikel.length === 0 ? (
                            <p className="text-center text-gray-400 text-base sm:text-lg">Tidak ada artikel yang ditemukan untuk "{searchTerm}".</p>
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                                }}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-lg overflow-hidden"
                            >
                                {/* Highlight Article */}
                                {highlightArtikel && (
                                    <Link to={`/artikel/${highlightArtikel.id}`}>
                                        <motion.div variants={itemVariants} className="relative w-full h-auto text-white group">
                                            <div className="relative w-[calc(100%-1.5rem*2)] sm:w-[calc(100%-3rem)] mx-auto h-52 sm:h-64 md:h-80 overflow-hidden rounded-b-2xl">
                                                <img src={highlightArtikel.gambar_url} alt={highlightArtikel.judul} className="w-full h-full object-cover" />

                                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"></div>

                                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                                                        {highlightArtikel.judul}
                                                    </h1>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-200">
                                                        <div className="flex items-center gap-1"><User size={14} sm:size={16} /><span>Oleh {highlightArtikel.profiles?.username || 'Anonim'}</span></div>
                                                        <div className="flex items-center gap-1"><Calendar size={14} sm:size={16} /><span>{new Date(highlightArtikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                )}

                                {/* Other Articles Section */}
                                {otherArtikel.length > 0 && (
                                    <motion.div variants={itemVariants} className="mt-4 p-4 md:p-8">
                                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Artikel Lainnya</h2>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentPage}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={{
                                                    hidden: { opacity: 0 },
                                                    visible: {
                                                        opacity: 1,
                                                        transition: {
                                                            staggerChildren: 0.1,
                                                            delayChildren: 0.2
                                                        }
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        transition: {
                                                            when: "afterChildren",
                                                            duration: 0.3
                                                        }
                                                    }
                                                }}
                                                className="space-y-2"
                                            >
                                                {otherArtikel.map(artikel => (
                                                    <motion.div
                                                        key={artikel.id}
                                                        variants={otherItemVariants}
                                                    >
                                                        <Link to={`/artikel/${artikel.id}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200">
                                                            <img src={artikel.gambar_url} alt={artikel.judul} className="w-full sm:w-16 h-32 sm:h-16 rounded-md object-cover flex-shrink-0" />
                                                            <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-between min-w-0 w-full">
                                                                <p className="font-[Montserrat] font-medium text-sm sm:text-base leading-tight text-justify line-clamp-2 sm:max-w-[50%] mb-2 sm:mb-0">
                                                                    {artikel.judul}
                                                                </p>
                                                                <div className="flex flex-wrap sm:flex-nowrap items-center sm:justify-end gap-x-3 gap-y-1 text-xs text-gray-300 whitespace-nowrap overflow-hidden w-full sm:w-auto">
                                                                    <div className="flex items-center gap-1">
                                                                        <User size={12} sm:size={14} />
                                                                        <span className="truncate">{artikel.profiles?.username || 'Anonim'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar size={12} sm:size={14} />
                                                                        <span>{new Date(artikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* Paginasi */}
                                {(articlesForPagination.length > (articlesPerPage - 1)) && searchTerm === '' && (
                                    <motion.div
                                        variants={itemVariants}
                                        className="flex justify-center items-center gap-2 py-4 sm:py-6 border-t border-white/10 px-4"
                                    >
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                                                    currentPage === i + 1
                                                        ? 'bg-[#FF9F1C] text-white'
                                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                                } transition-colors duration-200`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </main>

                {/* Footer yang Diperbarui */}
                <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        {/* Kiri: Teks */}
                        <div className="text-center md:text-left w-full md:w-1/3">
                            &copy; With Love STMKG Karate Club Periode 2025
                        </div>

                        {/* Tengah: Logo selalu di tengah */}
                        <div className="w-full md:w-1/3 flex justify-center">
                            <img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" />
                        </div>

                        {/* Kanan: Link navigasi */}
                        <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
                            <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                            <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                            <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                            <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}