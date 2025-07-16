import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // Impor Helmet

// Impor Ikon dan Aset
import { Edit, Trash2, Send, Settings, BookOpen, Search, RefreshCcw, Loader2, Save, X, ChevronLeft, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import bg1 from '../assets/bg2.jpg';

// Impor Tiptap Editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TiptapToolbar } from '../components/TiptapToolbar';
import '../TiptapStyles.css';


// Helper function untuk membersihkan tag HTML
const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// =================================================================
// KOMPONEN FORM UNTUK EDIT PENGUMUMAN
// =================================================================
const PengumumanForm = ({ currentPengumuman, onSave, onCancel, isSaving }) => {
    const [judul, setJudul] = useState('');
    
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Tulis konten pengumuman di sini...' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        editorProps: { attributes: { class: 'tiptap min-h-[250px] overflow-y-auto px-4 py-2' } },
    });

    useEffect(() => {
        if (currentPengumuman && editor) {
            setJudul(currentPengumuman.judul || '');
            editor.commands.setContent(currentPengumuman.konten || '', false);
        }
    }, [currentPengumuman, editor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...currentPengumuman,
            judul,
            konten: editor.getHTML(),
        });
    };

    if (!editor) {
        return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" size={32} /></div>;
    }

    return (
        <motion.div
            key="pengumuman-form-view"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-3xl font-bold text-[#FF9F1C]">Edit Pengumuman</h2>
                <button type="button" onClick={onCancel} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md text-sm hover:bg-white/20">
                    <ArrowLeft size={16} /> Batal
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-1">Judul</label>
                    <input id="judul" name="judul" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" value={judul} onChange={(e) => setJudul(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Konten</label>
                    <div className="bg-white/5 rounded-lg border border-white/10">
                        <TiptapToolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>
                <button type="submit" className="w-full mt-2 flex justify-center items-center gap-2 bg-[#FF9F1C] text-black py-2.5 rounded-lg font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="animate-spin" size={20} /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
                </button>
            </form>
        </motion.div>
    );
};

// =================================================================
// KOMPONEN MODAL UNTUK KONFIRMASI AKSI
// =================================================================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, actionText, isProcessing, status, confirmAction }) => {
    if (!isOpen) return null;

    const getStatusColor = () => {
        if (status.type === 'success') return 'text-green-400';
        if (status.type === 'error') return 'text-red-400';
        return 'text-gray-300';
    };

    // [PERUBAHAN] Fungsi untuk menentukan style tombol konfirmasi secara dinamis
    const getConfirmButtonClass = () => {
        const baseClass = "px-6 py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 w-36 transition-colors border";
        switch (confirmAction) {
            case 'publish':
                // Tombol kaca transparan dengan teks hijau
                return `${baseClass} bg-transparent border-green-400/50 text-green-400 hover:bg-green-500/10 hover:border-green-400`;
            case 'unpublish':
                // Tombol kaca transparan dengan teks ungu
                return `${baseClass} bg-transparent border-purple-400/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400`;
            case 'delete':
                // Pertahankan tombol merah solid untuk aksi hapus
                return `${baseClass} bg-red-600 text-white border-red-600 hover:bg-red-700`;
            default:
                // Fallback untuk kasus yang tidak terduga
                return `${baseClass} bg-gray-600 text-white border-gray-600 hover:bg-gray-700`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={!isProcessing ? onClose : undefined}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 w-full max-w-md text-center shadow-lg"
            >
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <div className={`text-sm mb-6 ${getStatusColor()}`}>{status.message || children}</div>
                
                {!status.message && (
                    <div className="flex justify-center gap-4">
                        <button onClick={onClose} disabled={isProcessing} className="px-6 py-2 bg-white/10 rounded-md hover:bg-white/20 disabled:opacity-50">Batal</button>
                        {/* [PERUBAHAN] Menggunakan fungsi untuk menerapkan class dinamis */}
                        <button onClick={onConfirm} disabled={isProcessing} className={getConfirmButtonClass()}>
                            {isProcessing ? <><Loader2 className="animate-spin" size={20} /></> : actionText}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};


// =================================================================
// KOMPONEN UTAMA HALAMAN MODERASI PENGUMUMAN
// =================================================================
export default function ModerasiPengumuman() {
    const [draftPengumuman, setDraftPengumuman] = useState([]);
    const [publishedPengumuman, setPublishedPengumuman] = useState([]);
    const [loading, setLoading] = useState({ drafts: true, published: true });
    const [error, setError] = useState({ drafts: null, published: null });
    const [searchTerm, setSearchTerm] = useState({ drafts: '', published: '' });
    
    const [currentPengumuman, setCurrentPengumuman] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [pengumumanForAction, setPengumumanForAction] = useState(null);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [actionStatus, setActionStatus] = useState({ type: null, message: '' });

    const fetchAllData = useCallback(async () => {
        setLoading({ drafts: true, published: true });
        
        const { data: drafts, error: draftsError } = await supabase.from('draft_pengumuman').select(`*, profiles!penulis_id(username)`).order('created_at', { ascending: false });
        if (draftsError) setError(prev => ({ ...prev, drafts: draftsError.message }));
        else setDraftPengumuman(drafts);
        setLoading(prev => ({...prev, drafts: false}));

        const { data: published, error: publishedError } = await supabase.from('pengumuman').select(`*, profiles!penulis_id(username)`).order('published_at', { ascending: false });
        if (publishedError) setError(prev => ({ ...prev, published: publishedError.message }));
        else setPublishedPengumuman(published);
        setLoading(prev => ({...prev, published: false}));
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleEditClick = (pengumuman) => setCurrentPengumuman(pengumuman);
    const handleCancelEdit = () => setCurrentPengumuman(null);

    const handleSavePengumuman = async (editedPengumuman) => {
        setIsSaving(true);
        const { type, ...updateData } = editedPengumuman;
        const tableName = type === 'draft' ? 'draft_pengumuman' : 'pengumuman';

        const { error } = await supabase.from(tableName).update({ judul: updateData.judul, konten: updateData.konten }).eq('id', updateData.id);

        if (error) {
            alert(`Gagal menyimpan perubahan: ${error.message}`);
        } else {
            setCurrentPengumuman(null);
            await fetchAllData();
        }
        setIsSaving(false);
    };

    const handleActionClick = (action, pengumuman) => {
        setConfirmAction(action);
        setPengumumanForAction(pengumuman);
        setActionStatus({ type: null, message: '' });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmAction || !pengumumanForAction) return;
        
        setIsProcessingAction(true);
        let statusUpdate = { type: 'success', message: ''};
        
        try {
            switch (confirmAction) {
                case 'publish':
                    const { error: insertErr } = await supabase.from('pengumuman').insert({ judul: pengumumanForAction.judul, konten: pengumumanForAction.konten, penulis_id: pengumumanForAction.penulis_id, created_at: pengumumanForAction.created_at, published_at: new Date().toISOString() });
                    if (insertErr) throw insertErr;
                    await supabase.from('draft_pengumuman').delete().eq('id', pengumumanForAction.id);
                    statusUpdate.message = 'Pengumuman berhasil dipublikasi!';
                    break;
                
                case 'unpublish':
                    const { error: insertDraftErr } = await supabase.from('draft_pengumuman').insert({ judul: pengumumanForAction.judul, konten: pengumumanForAction.konten, penulis_id: pengumumanForAction.penulis_id, created_at: pengumumanForAction.created_at });
                    if (insertDraftErr) throw insertDraftErr;
                    await supabase.from('pengumuman').delete().eq('id', pengumumanForAction.id);
                    statusUpdate.message = 'Pengumuman berhasil dipindahkan ke draft.';
                    break;

                case 'delete':
                    const tableName = pengumumanForAction.type === 'draft' ? 'draft_pengumuman' : 'pengumuman';
                    const { error: deleteErr } = await supabase.from(tableName).delete().eq('id', pengumumanForAction.id);
                    if (deleteErr) throw deleteErr;
                    statusUpdate.message = 'Pengumuman berhasil dihapus permanen.';
                    break;
                
                default: throw new Error('Aksi tidak dikenal');
            }
            
            setActionStatus(statusUpdate);
            await fetchAllData();

        } catch (error) {
            setActionStatus({ type: 'error', message: `Terjadi kesalahan: ${error.message}` });
        } finally {
            setIsProcessingAction(false);
            setTimeout(() => { setShowConfirmModal(false); }, 2000);
        }
    };

    const filteredDrafts = draftPengumuman.filter(p => p.judul.toLowerCase().includes(searchTerm.drafts.toLowerCase()));
    const filteredPublished = publishedPengumuman.filter(p => p.judul.toLowerCase().includes(searchTerm.published.toLowerCase()));

    const renderList = (title, items, type, isLoading, errorMsg, searchTermValue, setSearchTermFunc) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-[#FF9F1C]">{title}</h2>
                <div className="relative w-full sm:w-auto">
                    <input type="text" placeholder={`Cari di ${title}...`} className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4" value={searchTermValue} onChange={(e) => setSearchTermFunc(e.target.value)} />
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            {isLoading ? <p>Memuat...</p> : errorMsg ? <p className="text-red-400">{errorMsg}</p> : (
                <div className="space-y-4">
                    {items.length > 0 ? items.map(item => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-grow min-w-0">
                                <h3 className="font-semibold truncate">{item.judul}</h3>
                                <p className="text-xs text-gray-400">Oleh: {item.profiles?.username || 'N/A'} | Dibuat: {new Date(item.created_at).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-300 line-clamp-2 mt-1">{stripHtml(item.konten)}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => handleEditClick({...item, type})} className="p-2 bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/40" title="Edit"><Edit size={16} /></button>
                                {type === 'draft' ? (
                                    <button onClick={() => handleActionClick('publish', item)} className="p-2 bg-green-500/20 text-green-300 rounded-md hover:bg-green-500/40" title="Publikasi"><Send size={16} /></button>
                                ) : (
                                    <button onClick={() => handleActionClick('unpublish', item)} className="p-2 bg-purple-500/20 text-purple-300 rounded-md hover:bg-purple-500/40" title="Pindahkan ke Draft"><ChevronLeft size={16} /></button>
                                )}
                                <button onClick={() => handleActionClick('delete', {...item, type})} className="p-2 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/40" title="Hapus"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-400 py-4">Tidak ada pengumuman.</p>}
                </div>
            )}
        </motion.div>
    );

    const getModalContent = () => {
        if (!pengumumanForAction) return {};
        switch (confirmAction) {
            case 'publish': return { title: 'Konfirmasi Publikasi', message: `Anda yakin ingin mempublikasikan "${pengumumanForAction.judul}"?`, actionText: 'Ya, Publikasi' };
            case 'unpublish': return { title: 'Konfirmasi Batal Publikasi', message: `Anda yakin ingin memindahkan "${pengumumanForAction.judul}" kembali ke draft?`, actionText: 'Ya, Pindahkan' };
            case 'delete': return { title: 'Konfirmasi Hapus', message: `Anda yakin ingin menghapus "${pengumumanForAction.judul}" secara permanen?`, actionText: 'Ya, Hapus' };
            default: return {};
        }
    };
    
    const menuLinkClass = "p-2 rounded-full transition-colors duration-200 text-gray-300 hover:bg-[#FF9F1C] hover:text-white";

    return (
        <div className="relative min-h-screen flex flex-col justify-between text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <Helmet>
                <title>Moderasi Pengumuman - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative z-10">
                <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20">
                    <nav className="space-y-3">
                        <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={`${menuLinkClass} block`}><Edit size={20} /></Link>
                        <Link to="/pengumuman" title="Lihat Pengumuman" className={`${menuLinkClass} block`}><BookOpen size={20} /></Link>
                    </nav>
                </motion.div>

                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                     <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="md:hidden mx-auto mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-10 w-fit">
                        <nav className="flex space-x-4 justify-center">
                            <Link to="/tulis-pengumuman-baru" title="Tulis Baru" className={menuLinkClass}><Edit size={20} /></Link>
                            <Link to="/pengumuman" title="Lihat Pengumuman" className={menuLinkClass}><BookOpen size={20} /></Link>
                        </nav>
                    </motion.div>
                    
                    <h1 className="text-4xl sm:text-6xl uppercase font-league text-center mb-10 text-accent">
                        Moderasi Pengumuman
                    </h1>
                    
                    <AnimatePresence mode="wait">
                        {currentPengumuman ? (
                            <PengumumanForm 
                                key="form"
                                currentPengumuman={currentPengumuman}
                                onSave={handleSavePengumuman}
                                onCancel={handleCancelEdit}
                                isSaving={isSaving}
                            />
                        ) : (
                            <motion.div key="lists" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="max-w-6xl mx-auto space-y-10">
                                {renderList('Pengumuman Draft', filteredDrafts, 'draft', loading.drafts, error.drafts, searchTerm.drafts, (val) => setSearchTerm(p => ({...p, drafts: val})))}
                                {renderList('Pengumuman Publikasi', filteredPublished, 'published', loading.published, error.published, searchTerm.published, (val) => setSearchTerm(p => ({...p, published: val})))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <AnimatePresence>
                {showConfirmModal && <ConfirmationModal 
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmAction}
                    title={getModalContent().title}
                    actionText={getModalContent().actionText}
                    isProcessing={isProcessingAction}
                    status={actionStatus}
                    confirmAction={confirmAction}
                >
                    {getModalContent().message}
                </ConfirmationModal>}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
