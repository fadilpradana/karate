import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- [PERUBAHAN] Kembali menggunakan Link
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Impor Konteks, Komponen, dan Aset
import { useAuth } from '../context/AuthContext';
import { TiptapToolbar } from '../components/TiptapToolbar';
import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';

// Impor Ikon
import { Pencil, Send, Loader2, X, CheckCircle, AlertTriangle, Settings, BookOpen, Edit } from 'lucide-react';

// Impor Editor Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import '../TiptapStyles.css';


// Komponen Modal Sederhana untuk Notifikasi
const NotificationModal = ({ isOpen, onClose, status, message }) => {
    if (!isOpen) return null;
    const isSuccess = status === 'success';
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center shadow-lg relative"
            >
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-white/10"><X size={20} /></button>
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isSuccess ? <CheckCircle size={40} className="text-green-400" /> : <AlertTriangle size={40} className="text-red-400" />}
                </div>
                <h3 className={`text-xl font-bold ${isSuccess ? 'text-white' : 'text-red-400'} mb-2`}>{isSuccess ? 'Berhasil!' : 'Gagal!'}</h3>
                <p className="text-gray-300">{message}</p>
                <button onClick={onClose} className={`w-full mt-6 py-2 rounded-lg font-semibold transition-colors ${isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>Tutup</button>
            </motion.div>
        </div>
    );
};

export default function TulisPengumumanBaru() {
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [judul, setJudul] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ show: false, type: '', message: '' });

    const editor = useEditor({
        extensions: [ StarterKit, Placeholder.configure({ placeholder: 'Tulis konten...' }), TextAlign.configure({ types: ['heading', 'paragraph'] }) ],
        editorProps: { attributes: { class: 'tiptap px-4 py-2' } },
    });

    const isAuthorized = !authLoading && (role === 'pengurus' || role === 'admin');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!editor || isSubmitting || !isAuthorized) return;
        setIsSubmitting(true);
        const kontenHtml = editor.getHTML();

        if (!judul.trim() || editor.isEmpty) {
            setSubmitStatus({ show: true, type: 'error', message: 'Judul dan konten tidak boleh kosong.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase.from('draft_pengumuman').insert([{ judul: judul, konten: kontenHtml, penulis_id: user.id }]);
            if (error) throw error;
            setSubmitStatus({ show: true, type: 'success', message: 'Pengumuman berhasil dibuat dan dikirim untuk moderasi.' });
        } catch (error) {
            console.error("Error submitting announcement:", error);
            setSubmitStatus({ show: true, type: 'error', message: error.message || "Terjadi kesalahan." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCloseModal = () => {
        setSubmitStatus({ show: false, type: '', message: '' });
        if (submitStatus.type === 'success') {
            navigate(role === 'admin' ? '/moderasi-pengumuman' : '/pengumuman');
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">Memuat...</div>;
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-white bg-gray-900">
                <h1 className="text-3xl font-bold text-red-500">Akses Ditolak</h1>
                <p className="mt-2 text-gray-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                <Link to="/" className="mt-6 px-4 py-2 bg-[#FF9F1C] text-black font-semibold rounded-lg hover:bg-orange-400">Kembali ke Beranda</Link>
            </div>
        );
    }

    // [PERUBAHAN] Definisikan class yang seragam untuk semua tombol menu
    const menuLinkClass = "p-2 rounded-full transition-colors duration-200 text-gray-300 hover:bg-[#FF9F1C] hover:text-white";
    
    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            
            <AnimatePresence>
                <NotificationModal isOpen={submitStatus.show} onClose={handleCloseModal} status={submitStatus.type} message={submitStatus.message} />
            </AnimatePresence>

            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                {/* [PERUBAHAN] Navigasi Samping untuk Desktop */}
                 <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20">
                    <nav className="space-y-3">
                        <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={`${menuLinkClass} block`}>
                            <Edit size={20} />
                        </Link>
                        <Link to="/pengumuman" title="Lihat Pengumuman" className={`${menuLinkClass} block`}>
                            <BookOpen size={20} />
                        </Link>
                        {role === 'admin' && (
                            <Link to="/moderasi-pengumuman" title="Moderasi" className={`${menuLinkClass} block`}>
                                <Settings size={20} />
                            </Link>
                        )}
                    </nav>
                </motion.div>

                <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16 px-4">
                     {/* [PERUBAHAN] Navigasi Atas untuk Mobile */}
                     <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-10 w-fit">
                        <nav className="flex space-x-4 justify-center">
                           <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={menuLinkClass}>
                                <Edit size={20} />
                            </Link>
                            <Link to="/pengumuman" title="Lihat Pengumuman" className={menuLinkClass}>
                                <BookOpen size={20} />
                            </Link>
                            {role === 'admin' && (
                                <Link to="/moderasi-pengumuman" title="Moderasi" className={menuLinkClass}>
                                    <Settings size={20} />
                                </Link>
                            )}
                        </nav>
                    </motion.div>

                    <motion.div 
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-3xl"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl sm:text-6xl font-league text-center mb-6 text-accent uppercase">Tulis Pengumuman Baru</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Pengumuman</label>
                                <div className="relative">
                                    <input type="text" id="judul" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3" placeholder="Masukkan judul..." value={judul} onChange={(e) => setJudul(e.target.value)} required />
                                    <Pencil size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Konten</label>
                                <div className="bg-white/5 rounded-lg border border-white/10">
                                    <TiptapToolbar editor={editor} />
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                           
                            <div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9F1C] text-black rounded-lg font-semibold shadow-lg transition-all duration-200 hover:bg-orange-400 disabled:opacity-60" disabled={isSubmitting}>
                                    {isSubmitting ? ( <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />Mengirim...</> ) : ( <><Send size={20} /> Kirim untuk Moderasi</> )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </main>
 
                <Footer /> 
            </div>
        </div>
    );
}