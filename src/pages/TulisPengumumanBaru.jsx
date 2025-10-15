import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Impor Konteks, Komponen, dan Aset
import { useAuth } from '../context/AuthContext';
import { TiptapToolbar } from '../components/TiptapToolbar';
import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';

// Impor Ikon
import { 
    Pencil, Send, Loader2, X, CheckCircle, AlertTriangle, 
    Settings, BookOpen, Edit, Paperclip, FileText, Trash2 
} from 'lucide-react';

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

    // State untuk form utama
    const [judul, setJudul] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ show: false, type: '', message: '' });

    // State untuk handle file PDF
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [uploadError, setUploadError] = useState('');

    const editor = useEditor({
        extensions: [ StarterKit, Placeholder.configure({ placeholder: 'Tulis konten...' }), TextAlign.configure({ types: ['heading', 'paragraph'] }) ],
        editorProps: { attributes: { class: 'tiptap px-4 py-2' } },
    });

    const isAuthorized = !authLoading && (role === 'pengurus' || role === 'admin');

    // [PERUBAHAN TERBARU] Fungsi handle file dengan validasi ukuran 1MB
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadError('');

        if (file.type !== 'application/pdf') {
            setUploadError('Hanya file PDF yang diizinkan.');
            event.target.value = null;
            return;
        }

        const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
        if (file.size > maxSizeInBytes) {
            setUploadError('Ukuran file tidak boleh melebihi 1MB.');
            event.target.value = null;
            return;
        }
        
        setSelectedFile(file);
        setIsUploading(true);
        
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('pengumuman-pdf')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('pengumuman-pdf')
                .getPublicUrl(fileName);

            if (data.publicUrl) {
                setPdfUrl(data.publicUrl);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadError(error.message || "Gagal mengunggah file.");
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPdfUrl('');
        setUploadError('');
    };

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
            const { error } = await supabase.from('draft_pengumuman').insert([
                { 
                    judul: judul, 
                    konten: kontenHtml, 
                    penulis_id: user.id,
                    pdf_url: pdfUrl || null
                }
            ]);
            
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
        const isSuccess = submitStatus.type === 'success';
        setSubmitStatus({ show: false, type: '', message: '' });
        if (isSuccess) {
            setJudul('');
            editor?.commands.clearContent();
            handleRemoveFile();
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

    const menuLinkClass = "p-2 rounded-full transition-colors duration-200 text-gray-300 hover:bg-[#FF9F1C] hover:text-white";
    
    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <Helmet>
                <title>Tulis Pengumuman - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Helmet>           
            <div className="absolute inset-0 bg-black opacity-70"></div>
            
            <AnimatePresence>
                <NotificationModal isOpen={submitStatus.show} onClose={handleCloseModal} status={submitStatus.type} message={submitStatus.message} />
            </AnimatePresence>

            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                 <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20">
                     <nav className="space-y-3">
                         <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={`${menuLinkClass} block`}><Edit size={20} /></Link>
                         <Link to="/pengumuman" title="Lihat Pengumuman" className={`${menuLinkClass} block`}><BookOpen size={20} /></Link>
                         {role === 'admin' && (<Link to="/moderasi-pengumuman" title="Moderasi" className={`${menuLinkClass} block`}><Settings size={20} /></Link>)}
                     </nav>
                 </motion.div>

                <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16 px-4">
                     <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-10 w-fit">
                         <nav className="flex space-x-4 justify-center">
                            <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={menuLinkClass}><Edit size={20} /></Link>
                            <Link to="/pengumuman" title="Lihat Pengumuman" className={menuLinkClass}><BookOpen size={20} /></Link>
                            {role === 'admin' && (<Link to="/moderasi-pengumuman" title="Moderasi" className={menuLinkClass}><Settings size={20} /></Link>)}
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
                                <label className="block text-gray-300 text-sm font-medium mb-2">Lampirkan PDF (Opsional)</label>
                                <div className="mt-2 flex items-center justify-center w-full">
                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors text-center">
                                        <div className="flex flex-col items-center justify-center py-4 sm:pt-5 sm:pb-6 px-2">
                                            <Paperclip size={24} className="text-gray-400 mb-1 sm:mb-2"/>
                                            <p className="mb-1 text-xs sm:text-sm text-gray-400"><span className="font-semibold text-[#FF9F1C]">Klik untuk unggah</span> atau seret file ke sini</p>
                                            <p className="text-xs text-gray-500">Hanya PDF (Maks. 1MB)</p>
                                        </div>
                                        <input id="file-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} disabled={isUploading} />
                                    </label>
                                </div>
                                
                                <AnimatePresence>
                                {uploadError && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="mt-2 text-sm text-red-400">{uploadError}</motion.p>}
                                {isUploading && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        <span>Mengunggah file...</span>
                                    </motion.div>
                                )}
                                {selectedFile && !isUploading && pdfUrl && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3 flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-green-300">
                                            <FileText size={16} />
                                            <span className="truncate max-w-xs">{selectedFile.name}</span>
                                            <CheckCircle size={16} className="text-green-400" />
                                        </div>
                                        <button type="button" onClick={handleRemoveFile} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                            
                            <div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9F1C] text-black rounded-lg font-semibold shadow-lg transition-all duration-200 hover:bg-orange-400 disabled:opacity-60" disabled={isSubmitting || isUploading}>
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