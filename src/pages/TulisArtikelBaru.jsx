import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

// Impor Tiptap dan ekstensi yang diperlukan
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align'; // ⬇️ DITAMBAHKAN: Impor ekstensi perataan teks
import { TiptapToolbar } from '../components/TiptapToolbar'; // Pastikan path ini benar
import '../TiptapStyles.css'; // Pastikan path ini benar

// Impor hook, komponen, dan utilitas
import { useAuth } from '../context/AuthContext';
import { useArticleForm } from '../hooks/useArticleForm';
import { AuthStatusDisplay } from '../components/AuthStatusDisplay';
import SuccessModal from '../components/SuccessModal';
import { Pencil, Image as ImageIcon, Send, FileText, Settings, ChevronLeft, UploadCloud } from 'lucide-react';
import { compressAndConvertToWebP } from '../utils/imageCompressor'; // Impor fungsi kompresor

// Impor aset statis
import brevetLogo from '../assets/brevet.png';
import bg1 from '../assets/bg1.jpg';

export default function TulisArtikelBaru() {
    const { user, role: userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Mengambil fungsi submit dan statusnya dari hook
    const { handleSubmit: handleArticleSubmit, isSubmitting, submitError, submitSuccess } = useArticleForm(user);
    
    // State untuk form dikelola di dalam komponen ini
    const [judul, setJudul] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null); 
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false); // State untuk loading kompresi

    // Konfigurasi editor Tiptap
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false }),
            Placeholder.configure({
                placeholder: 'Tulis konten artikel Anda di sini...',
            }),
            // ⬇️ DITAMBAHKAN: Konfigurasi untuk perataan teks
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        editorProps: {
            attributes: {
                class: 'tiptap', // Class untuk styling
            },
        },
    });

    // Fungsi untuk menangani submit form utama
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!editor || isCompressing) return; // Jangan submit jika sedang kompresi

        const kontenHtml = editor.getHTML();
        
        // Panggil fungsi submit dari hook dengan semua data form
        handleArticleSubmit({
            judul,
            konten: kontenHtml,
            gambarUrl,
            coverImageFile
        });
    };

    // Fungsi untuk menangani perubahan input file gambar sampul
    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsCompressing(true); // Tampilkan loading
        try {
            // Panggil fungsi untuk kompresi dan konversi ke WebP
            const compressedFile = await compressAndConvertToWebP(file);

            setCoverImageFile(compressedFile);
            setGambarUrl(''); // Kosongkan input URL jika file dipilih
            setCoverImagePreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error("Gagal memproses gambar sampul:", error);
            alert("Terjadi kesalahan saat memproses gambar. Silakan coba lagi.");
        } finally {
            setIsCompressing(false); // Sembunyikan loading
        }
    };

    // Fungsi handler untuk tombol "Artikel Saya" dari menu manajemen
    const handleMyArticlesClick = () => {
        if (user && user.user_metadata?.username) {
            navigate(`/artikel?author=${user.user_metadata.username}`);
        } else if (user && user.email) {
            navigate(`/artikel?author=${user.email.split('@')[0]}`);
        } else {
            alert('Anda harus login untuk melihat artikel Anda.');
        }
    };
    
    // Efek untuk memeriksa otorisasi pengguna
    useEffect(() => {
        if (!authLoading) {
            const authorized = user && (userRole === 'pengurus' || userRole === 'admin');
            setIsAuthorized(authorized);
        }
    }, [user, userRole, authLoading]);

    // Efek untuk cleanup URL objek untuk mencegah memory leak
    useEffect(() => {
        return () => {
            if (coverImagePreview) {
                URL.revokeObjectURL(coverImagePreview);
            }
        };
    }, [coverImagePreview]);

    // Varian animasi untuk Framer Motion
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    const sidebarVariants = { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } } };

    // Tampilan loading atau jika tidak terotorisasi
    if (authLoading || !isAuthorized) {
        return <AuthStatusDisplay authLoading={authLoading} isAuthorized={isAuthorized} />;
    }
    
    const glassButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold shadow-lg transition-all duration-200";

    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <AnimatePresence>
                {submitSuccess && ( <SuccessModal message={submitSuccess} onClose={() => navigate('/artikel')} /> )}
            </AnimatePresence>
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                
                {/* Menu Manajemen Desktop */}
                {(userRole === 'pengurus' || userRole === 'admin') && (
                    <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                        <nav className="space-y-3">
                            <button onClick={() => navigate('/artikel')} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Artikel"><ChevronLeft size={20} /></button>
                            <button onClick={handleMyArticlesClick} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Artikel Saya"><FileText size={20} /></button>
                            {userRole === 'admin' && ( <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Moderasi Artikel"><Settings size={20} /></Link> )}
                        </nav>
                    </motion.div>
                )}

                <motion.main className="flex-grow flex flex-col items-center justify-start pt-24 pb-16 px-4 gap-8" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* Menu Manajemen Mobile */}
                    {(userRole === 'pengurus' || userRole === 'admin') && (
                        <motion.div variants={itemVariants} className="block md:hidden">
                            <div className="p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg w-fit">
                                <nav className="flex space-x-4 justify-center">
                                    <button onClick={() => navigate('/artikel')} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Artikel"><ChevronLeft size={20} /></button>
                                    <button onClick={handleMyArticlesClick} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Artikel Saya"><FileText size={20} /></button>
                                    {userRole === 'admin' && ( <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Moderasi Artikel"><Settings size={20} /></Link> )}
                                </nav>
                            </div>
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="w-full max-w-xl">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full">
                            <h1 className="text-2xl sm:text-4xl font-league font-bold uppercase text-center mb-6 text-[#FF9F1C]">Tulis Artikel Baru</h1>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Artikel</label>
                                    <div className="relative">
                                        <input type="text" id="judul" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]" placeholder="Masukkan judul artikel..." value={judul} onChange={(e) => setJudul(e.target.value)} required />
                                        <Pencil size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Gambar Sampul (Cover)</label>
                                    <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md min-h-[200px]">
                                        <div className="space-y-1 text-center">
                                            {isCompressing ? (
                                                <div>
                                                    <svg className="animate-spin mx-auto h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    <p className="mt-2 text-sm text-gray-300">Mengompres gambar...</p>
                                                </div>
                                            ) : coverImagePreview ? ( 
                                                <img src={coverImagePreview} alt="Pratinjau Gambar Sampul" className="mx-auto h-40 w-auto rounded-md object-cover"/> 
                                            ) : ( 
                                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" /> 
                                            )}
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <label htmlFor="cover-image-upload" className={`relative cursor-pointer bg-transparent rounded-md font-medium text-[#FF9F1C] hover:text-[#ffc41c] focus-within:outline-none ${isCompressing ? 'pointer-events-none opacity-50' : ''}`}>
                                                    <span>Unggah file</span>
                                                    <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleCoverImageChange} accept="image/*" disabled={isCompressing || isSubmitting} />
                                                </label>
                                                <p className="pl-1">atau seret dan lepas</p>
                                            </div>
                                            <p className="text-xs text-gray-500">Gambar akan diubah ke WebP & dikompres</p>
                                        </div>
                                    </div>
                                    <label htmlFor="gambarUrl" className="block text-gray-300 text-sm font-medium mb-2 mt-4">Atau tempel URL Gambar Sampul</label>
                                    <div className="relative">
                                       <input type="url" id="gambarUrl" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]" placeholder="https://example.com/gambar.jpg" value={gambarUrl} onChange={(e) => setGambarUrl(e.target.value)} disabled={!!coverImageFile || isSubmitting} />
                                       <ImageIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Konten Artikel</label>
                                    <div className="bg-white/5 rounded-lg border border-white/10">
                                        <TiptapToolbar editor={editor} />
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                                {submitError && ( <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">{submitError}</p> )}
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C] disabled:opacity-50 disabled:cursor-not-allowed`} disabled={isSubmitting || isCompressing}>
                                    {isSubmitting ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Memproses...</> ) : ( <> <Send size={20} /> Buat Artikel </> )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </motion.main>
                
                {/* Footer */}
                <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center md:text-left w-full md:w-1/3"> &copy; With Love STMKG Karate Club Periode 2025 </div>
                        <div className="w-full md:w-1/3 flex justify-center"> <img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" /> </div>
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