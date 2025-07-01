// src/pages/ModerasiArtikel.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import brevetLogo from '../assets/brevet.png';
import { Edit, Trash2, Send, Settings, X, BookOpen, ChevronLeft, Save, Search, RefreshCcw, Image as ImageIcon, Replace, Loader2, ArrowLeft } from 'lucide-react'; // Ditambahkan Loader2 dan ArrowLeft

import { compressAndConvertToWebP } from '../utils/imageCompressor';
import Modal from '../components/Modal';
import ImageBrowserModal from '../components/ImageBrowserModal';
import ActionSheetModal from '../components/ActionSheetModal';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TiptapToolbar } from '../components/TiptapToolbar';
import '../TiptapStyles.css';

const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const glassButtonClasses = "flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

// --- Komponen Form Inline untuk Artikel ---
const ArticleForm = ({ currentArticle, onSave, onCancel, isSaving, isCompressingImage }) => {
    const [formData, setFormData] = useState(currentArticle);
    const [coverImagePreview, setCoverImagePreview] = useState(currentArticle.gambar_url || null);
    const [newCoverImageFile, setNewCoverImageFile] = useState(null);
    const [isCoverRemoved, setIsCoverRemoved] = useState(false);
    const fileInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({ placeholder: 'Tulis konten artikel di sini...' }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        editorProps: { attributes: { class: 'tiptap max-h-[250px] overflow-y-auto' } }, // Increased max-height
    });

    useEffect(() => {
        if (editor && formData.deskripsi !== editor.getHTML()) {
            editor.commands.setContent(formData.deskripsi || '');
        }
    }, [formData.deskripsi, editor]);

    // Cleanup Tiptap editor on unmount
    useEffect(() => {
        return () => {
            if (editor && editor.destroy) {
                editor.destroy();
            }
        };
    }, [editor]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedFile = await compressAndConvertToWebP(file);
                setNewCoverImageFile(compressedFile);
                setCoverImagePreview(URL.createObjectURL(compressedFile));
                setIsCoverRemoved(false);
            } catch (error) {
                console.error("Gagal memproses gambar:", error);
                alert("Terjadi kesalahan saat memproses gambar.");
            }
        }
    };

    const handleRemoveCover = () => {
        setNewCoverImageFile(null);
        setCoverImagePreview(null);
        setIsCoverRemoved(true);
    };

    const handleSelectFromBrowser = (imageUrl) => {
        setCoverImagePreview(imageUrl);
        setNewCoverImageFile(null);
        setIsCoverRemoved(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            deskripsi: editor.getHTML(),
            newCoverImageFile,
            isCoverRemoved,
            coverImagePreview, // Pass preview for immediate UI update
        });
    };

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const [showImageBrowser, setShowImageBrowser] = useState(false);
    const [showCoverActionSheet, setShowCoverActionSheet] = useState(false);

    const coverActions = [
        {
            label: 'Ganti dari File',
            icon: <Replace size={20} />,
            onClick: () => {
                fileInputRef.current.click();
                setShowCoverActionSheet(false);
            },
            isPrimary: true
        },
        {
            label: 'Pilih dari Galeri',
            icon: <ImageIcon size={20} />,
            onClick: () => {
                setShowImageBrowser(true);
                setShowCoverActionSheet(false);
            },
            isSecondary: true
        },
        {
            label: 'Hapus Gambar',
            icon: <Trash2 size={20} />,
            onClick: () => {
                handleRemoveCover();
                setShowCoverActionSheet(false);
            },
            isDestructive: true
        }
    ];

    const glassFormStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)'};
    const glassInputStyle = { backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', borderRadius: '0.5rem', outline: 'none', width: '100%', transition: 'all 0.2s ease' };


    return (
        <motion.div
            key="article-form-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto p-6 rounded-2xl"
            style={glassFormStyle}
        >
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-4xl font-league uppercase text-[#FF9F1C]">{formData.id ? "Edit Artikel" : "Tambah Artikel Baru"}</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCancel} className={`${glassButtonClasses} px-3 py-1.5 text-xs text-gray-300 hover:text-white`}>
                    <ArrowLeft size={14} /> Batal
                </motion.button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="flex-grow w-full">
                        <label htmlFor="judul" className="block text-gray-300 text-xs font-medium mb-1">Judul</label>
                        <textarea id="judul" name="judul" rows="3" className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-sm text-white resize-none" value={formData.judul} onChange={handleInputChange} required />
                    </div>

                    <div className="w-full sm:w-auto sm:flex-shrink-0">
                        <label className="block text-gray-300 text-xs font-medium mb-1 text-center sm:text-left">Cover</label>
                        <div
                            className="group w-full sm:w-32 h-32 sm:h-20 bg-white/5 rounded-lg border-2 border-white/10 border-dashed flex justify-center items-center relative cursor-pointer"
                            onClick={() => {
                                if (isMobile) {
                                    setShowCoverActionSheet(true);
                                }
                            }}
                        >
                            {isCompressingImage ? (
                                <div className="text-center"><p className="text-xs text-gray-400">Memproses...</p></div>
                            ) : coverImagePreview ? (
                                <>
                                    <img src={coverImagePreview} alt="Pratinjau Cover" className="h-full w-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 justify-center items-center gap-2 opacity-0 transition-opacity duration-300 hidden sm:flex sm:group-hover:opacity-100">
                                        <div
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                            title="Ganti dari file"
                                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"
                                        >
                                            <Replace size={18} />
                                        </div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setShowImageBrowser(true); }}
                                            title="Pilih dari galeri"
                                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"
                                        >
                                            <ImageIcon size={18} />
                                        </div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }}
                                            title="Hapus gambar"
                                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-2">
                                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-1 text-xs font-medium text-[#FF9F1C]">Pilih Gambar</p>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleCoverFileChange} className="hidden" accept="image/*" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-300 text-xs font-medium mb-1">Deskripsi / Konten</label>
                    <div className="bg-white/5 rounded-lg border border-white/10">
                        <TiptapToolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full mt-2 bg-white/5 border border-white/10 rounded-md text-blue-400 py-2 text-sm font-semibold hover:text-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving || isCompressingImage}>
                    {isSaving ? 'Menyimpan...' : (isCompressingImage ? 'Gambar diproses...' : 'Simpan Perubahan')}
                </motion.button>
            </form>

            <ActionSheetModal
                isOpen={showCoverActionSheet}
                onClose={() => setShowCoverActionSheet(false)}
                title="Opsi Gambar Sampul"
                actions={coverActions}
            />

            <ImageBrowserModal isOpen={showImageBrowser} onClose={() => setShowImageBrowser(false)} onImageSelect={handleSelectFromBrowser} />
        </motion.div>
    );
};

export default function ModerasiArtikel() {
    const navigate = useNavigate();

    const [draftArticles, setDraftArticles] = useState([]);
    const [publishedArticles, setPublishedArticles] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const [loadingPublished, setLoadingPublished] = useState(true);
    const [errorDrafts, setErrorDrafts] = useState(null);
    const [errorPublished, setErrorPublished] = useState(null);
    const [draftSearchTerm, setDraftSearchTerm] = useState('');
    const [publishedSearchTerm, setPublishedSearchTerm] = useState('');

    const [currentArticle, setCurrentArticle] = useState(null); // State baru untuk mode inline edit
    const [isSaving, setIsSaving] = useState(false);
    const [isCompressingImage, setIsCompressingImage] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [articleForAction, setArticleForAction] = useState(null);
    const [actionStatus, setActionStatus] = useState({ success: null, error: null, message: '' });
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    useEffect(() => {
        fetchDraftArticles();
        fetchPublishedArticles();
    }, []);

    const fetchDraftArticles = async () => {
        setLoadingDrafts(true);
        setErrorDrafts(null);
        const { data, error } = await supabase
            .from('draft_artikel')
            .select(`id, judul, deskripsi, gambar_url, created_at, penulis_id, profiles!penulis_id (username)`)
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching draft articles:", error);
            setErrorDrafts(`Gagal memuat artikel draft: ${error.message}`);
        } else {
            setDraftArticles(data);
        }
        setLoadingDrafts(false);
    };

    const fetchPublishedArticles = async () => {
        setLoadingPublished(true);
        setErrorPublished(null);
        const { data, error } = await supabase
            .from('artikel')
            .select(`id, judul, deskripsi, gambar_url, created_at, published, penulis_id, profiles!penulis_id (username)`)
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching published articles:", error);
            setErrorPublished(`Gagal memuat artikel publikasi: ${error.message}`);
        } else {
            setPublishedArticles(data);
        }
        setLoadingPublished(false);
    };

    const handleEditClick = (article, type) => {
        setCurrentArticle({
            ...article,
            deskripsi: article.deskripsi || '',
            type, // Keep track of the article type (draft/published)
        });
    };

    const handleSaveArticle = async ({ id, judul, deskripsi, newCoverImageFile, isCoverRemoved, coverImagePreview, type }) => {
        setIsSaving(true);
        setIsCompressingImage(false); // Reset this flag for the main component
        let finalImageUrl = coverImagePreview; // Start with current preview URL

        const oldImageUrl = type === 'draft'
            ? draftArticles.find(a => a.id === id)?.gambar_url
            : publishedArticles.find(a => a.id === id)?.gambar_url;

        try {
            if (newCoverImageFile) {
                setIsCompressingImage(true);
                const file = newCoverImageFile;
                const fileName = `${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage.from('gambarartikel').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('gambarartikel').getPublicUrl(fileName);
                finalImageUrl = urlData.publicUrl;
                setIsCompressingImage(false);
            }

            if (oldImageUrl && (finalImageUrl !== oldImageUrl || isCoverRemoved)) {
                const oldImagePath = oldImageUrl.split('/gambarartikel/')[1];
                if (oldImagePath) {
                    const { error: deleteError } = await supabase.storage.from('gambarartikel').remove([oldImagePath]);
                    if (deleteError) console.error("Gagal menghapus gambar lama di storage:", deleteError.message);
                }
            }

            let tableName = type === 'draft' ? 'draft_artikel' : 'artikel';
            const { error: updateError } = await supabase.from(tableName).update({
                judul: judul,
                deskripsi: deskripsi,
                gambar_url: isCoverRemoved ? null : finalImageUrl
            }).eq('id', id);

            if (updateError) throw updateError;

            // Update successful
            setCurrentArticle(null); // Exit edit mode
            fetchDraftArticles();
            fetchPublishedArticles();

        } catch (error) {
            console.error("Error saving article:", error);
            // You might want to display an error message in the form
        } finally {
            setIsSaving(false);
            setIsCompressingImage(false);
        }
    };

    const handleCancelEdit = () => {
        setCurrentArticle(null); // Exit edit mode
    };

    const handleConfirmActionClick = (action, article, type = null) => {
        setConfirmAction(action);
        setArticleForAction({ ...article, type });
        setActionStatus({ success: null, error: null, message: '' });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        setIsProcessingAction(true);
        setActionStatus({ success: null, error: null, message: '' });
        if (!articleForAction) return;
        try {
            switch (confirmAction) {
                case 'publish':
                    const { error: insertError } = await supabase.from('artikel').insert({
                        judul: articleForAction.judul, deskripsi: articleForAction.deskripsi,
                        gambar_url: articleForAction.gambar_url, penulis_id: articleForAction.penulis_id,
                        published: true, created_at: articleForAction.created_at
                    });
                    if (insertError) throw new Error(`Gagal mempublikasikan: ${insertError.message}`);
                    await supabase.from('draft_artikel').delete().eq('id', articleForAction.id);
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dipublikasi!" });
                    break;
                case 'unpublish':
                    const { error: insertDraftError } = await supabase.from('draft_artikel').insert({
                        judul: articleForAction.judul, deskripsi: articleForAction.deskripsi,
                        gambar_url: articleForAction.gambar_url, penulis_id: articleForAction.penulis_id,
                        created_at: articleForAction.created_at
                    });
                    if (insertDraftError) throw new Error(`Gagal memindahkan ke draft: ${insertDraftError.message}`);
                    await supabase.from('artikel').delete().eq('id', articleForAction.id);
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dipindahkan ke draft!" });
                    break;
                case 'delete':
                    let tableName = articleForAction.type === 'draft' ? 'draft_artikel' : 'artikel';
                    const { error: deleteError } = await supabase.from(tableName).delete().eq('id', articleForAction.id);
                    if (deleteError) throw new Error(`Gagal menghapus artikel: ${deleteError.message}`);
                    // If there was an image, delete it from storage as well
                    if (articleForAction.gambar_url) {
                        const imagePath = articleForAction.gambar_url.split('/gambarartikel/')[1];
                        if (imagePath) {
                            const { error: storageError } = await supabase.storage.from('gambarartikel').remove([imagePath]);
                            if (storageError) console.error("Gagal menghapus file dari storage:", storageError);
                        }
                    }
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dihapus!" });
                    break;
                default:
                    throw new Error("Aksi tidak dikenal.");
            }
            setTimeout(() => {
                setShowConfirmModal(false);
                fetchDraftArticles();
                fetchPublishedArticles();
            }, 1000);
        } catch (err) {
            setActionStatus({ success: false, error: true, message: err.message });
        } finally {
            setIsProcessingAction(false);
            // Always refetch after an action to ensure UI is up-to-date, even on error
            fetchDraftArticles();
            fetchPublishedArticles();
        }
    };

    const filteredDraftArticles = draftArticles.filter(artikel =>
        artikel.judul.toLowerCase().includes(draftSearchTerm.toLowerCase()) ||
        (artikel.deskripsi && stripHtml(artikel.deskripsi).toLowerCase().includes(draftSearchTerm.toLowerCase())) ||
        (artikel.profiles?.username && artikel.profiles.username.toLowerCase().includes(draftSearchTerm.toLowerCase()))
    );
    const filteredPublishedArticles = publishedArticles.filter(artikel =>
        artikel.judul.toLowerCase().includes(publishedSearchTerm.toLowerCase()) ||
        (artikel.deskripsi && stripHtml(artikel.deskripsi).toLowerCase().includes(publishedSearchTerm.toLowerCase())) ||
        (artikel.profiles?.username && artikel.profiles.username.toLowerCase().includes(publishedSearchTerm.toLowerCase()))
    );

    const menuVariants = { hidden: { y: -50, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } } };
    const sidebarVariants = { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } }, exit: { opacity: 0, y: -20 } };

    const getConfirmModalContent = () => {
        if (!articleForAction) return { title: '', message: '' };
        switch (confirmAction) {
            case 'publish': return { title: 'Konfirmasi Publikasi', message: <>Apakah Anda yakin ingin mempublikasikan artikel "<span className="font-semibold">{articleForAction.judul}</span>"? Artikel ini akan dipindahkan ke daftar artikel publikasi.</>, buttonText: 'Ya, Publikasikan', buttonIcon: <Send size={16} />, buttonClass: 'text-green-400 hover:text-green-400', isProcessing: isProcessingAction, processingText: 'Mempublikasikan...' };
            case 'unpublish': return { title: 'Konfirmasi Unpublish', message: <>Apakah Anda yakin ingin memindahkan artikel "<span className="font-semibold">{articleForAction.judul}</span>" kembali ke daftar draft?</>, buttonText: 'Ya, Pindahkan ke Draft', buttonIcon: <ChevronLeft size={16} />, buttonClass: 'text-purple-400 hover:text-purple-400', isProcessing: isProcessingAction, processingText: 'Memindahkan...' };
            case 'delete': return { title: 'Konfirmasi Hapus Artikel', message: <>Apakah Anda yakin ingin menghapus artikel "<span className="font-semibold">{articleForAction.judul}</span>" dari {articleForAction.type === 'draft' ? 'draft' : 'publikasi'}? Tindakan ini tidak dapat dibatalkan.</>, buttonText: 'Ya, Hapus', buttonIcon: <Trash2 size={16} />, buttonClass: 'text-red-400 hover:text-red-400', isProcessing: isProcessingAction, processingText: 'Menghapus...' };
            default: return { title: '', message: '' };
        }
    };

    const confirmModalProps = getConfirmModalContent();

    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-gray-900 text-white">
            <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                <nav className="space-y-3">
                    <Link to="/tulis-artikel-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Tulis Artikel Baru"><Edit size={20} /></Link>
                    <Link to="/artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Lihat Artikel"><BookOpen size={20} /></Link>
                    <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Moderasi Artikel"><Settings size={20} /></Link>
                </nav>
            </motion.div>
            <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                <motion.div variants={menuVariants} initial="hidden" animate="visible" className="block md:hidden mx-auto mb-8 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg z-10 w-fit">
                    <nav className="flex space-x-4 justify-center">
                        <Link to="/tulis-artikel-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Tulis Artikel Baru"><Edit size={20} /></Link>
                        <Link to="/artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Lihat Artikel"><BookOpen size={20} /></Link>
                        <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Moderasi Artikel"><Settings size={20} /></Link>
                    </nav>
                </motion.div>
                <h1 className="text-3xl sm:text-6xl font-league font-bold uppercase text-center mb-10 text-[#FF9F1C]">Panel Moderasi Artikel</h1>
                <div className="max-w-6xl mx-auto space-y-10">
                    <AnimatePresence mode="wait">
                        {currentArticle ? (
                            <ArticleForm
                                key="article-edit-form"
                                currentArticle={currentArticle}
                                onSave={handleSaveArticle}
                                onCancel={handleCancelEdit}
                                isSaving={isSaving}
                                isCompressingImage={isCompressingImage}
                            />
                        ) : (
                            <>
                                <motion.div initial="hidden" animate="visible" variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-[#FF9F1C] flex-shrink-0">Artikel Draft</h2>
                                        <div className="relative flex-grow max-w-sm sm:max-w-xs">
                                            <input type="text" placeholder="Cari draft..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]" value={draftSearchTerm} onChange={(e) => setDraftSearchTerm(e.target.value)} />
                                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            {draftSearchTerm && (<RefreshCcw size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white" onClick={() => setDraftSearchTerm('')} />)}
                                        </div>
                                    </div>
                                    {loadingDrafts ? (<p className="text-center text-gray-400">Memuat artikel draft...</p>) : errorDrafts ? (<p className="text-center text-red-400">{errorDrafts}</p>) : filteredDraftArticles.length === 0 ? (<p className="text-center text-gray-400">Tidak ada artikel draft yang ditemukan.</p>) : (
                                        <AnimatePresence>
                                            {filteredDraftArticles.map((artikel) => (
                                                <motion.div key={artikel.id} variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 p-4 rounded-lg mb-4 last:mb-0 gap-4 border border-white/10">
                                                    <div className="flex-grow">
                                                        <h3 className="text-lg sm:text-xl font-semibold mb-1">{artikel.judul}</h3>
                                                        <p className="text-sm text-gray-300">Oleh: {artikel.profiles?.username || 'Anonim'}</p>
                                                        <p className="text-xs text-gray-400">Dibuat: {new Date(artikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        {artikel.deskripsi && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{stripHtml(artikel.deskripsi)}</p>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 md:ml-4">
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditClick(artikel, 'draft')} className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}><Edit size={16} /> Edit</motion.button>
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConfirmActionClick('publish', artikel)} className={`${glassButtonClasses} text-green-400 hover:text-green-400`}><Send size={16} /> Publikasi</motion.button>
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConfirmActionClick('delete', artikel, 'draft')} className={`${glassButtonClasses} text-red-400 hover:text-red-400`}><Trash2 size={16} /> Hapus</motion.button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </motion.div>
                                <motion.div initial="hidden" animate="visible" variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-[#FF9F1C] flex-shrink-0">Artikel Publikasi</h2>
                                        <div className="relative flex-grow max-w-sm sm:max-w-xs">
                                            <input type="text" placeholder="Cari publikasi..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]" value={publishedSearchTerm} onChange={(e) => setPublishedSearchTerm(e.target.value)} />
                                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            {publishedSearchTerm && (<RefreshCcw size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white" onClick={() => setPublishedSearchTerm('')} />)}
                                        </div>
                                    </div>
                                    {loadingPublished ? (<p className="text-center text-gray-400">Memuat artikel publikasi...</p>) : errorPublished ? (<p className="text-center text-red-400">{errorPublished}</p>) : filteredPublishedArticles.length === 0 ? (<p className="text-center text-gray-400">Tidak ada artikel publikasi yang ditemukan.</p>) : (
                                        <AnimatePresence>
                                            {filteredPublishedArticles.map((artikel) => (
                                                <motion.div key={artikel.id} variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 p-4 rounded-lg mb-4 last:mb-0 gap-4 border border-white/10">
                                                    <div className="flex-grow">
                                                        <h3 className="text-lg sm:text-xl font-semibold mb-1">{artikel.judul}</h3>
                                                        <p className="text-sm text-gray-300">Oleh: {artikel.profiles?.username || 'Anonim'}</p>
                                                        <p className="text-xs text-gray-400">Dibuat: {new Date(artikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        {artikel.deskripsi && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{stripHtml(artikel.deskripsi)}</p>}
                                                        <p className={`text-xs font-semibold mt-1 ${artikel.published ? 'text-green-400' : 'text-red-400'}`}>Status: {artikel.published ? 'Dipublikasi' : 'Tidak Dipublikasi'}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 md:ml-4">
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditClick(artikel, 'published')} className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}><Edit size={16} /> Edit</motion.button>
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConfirmActionClick('unpublish', artikel)} className={`${glassButtonClasses} text-purple-400 hover:text-purple-400`}><ChevronLeft size={16} /> Unpublish</motion.button>
                                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConfirmActionClick('delete', artikel, 'published')} className={`${glassButtonClasses} text-red-400 hover:text-red-400`}><Trash2 size={16} /> Hapus</motion.button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Modal isOpen={showConfirmModal} onClose={() => { if (!isProcessingAction) { setShowConfirmModal(false); setActionStatus({ success: null, error: null, message: '' }); } }} title={confirmModalProps.title} statusMessage={actionStatus.error ? { type: 'error', message: actionStatus.message } : actionStatus.success ? { type: 'success', message: actionStatus.message } : null} actions={
                <>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmAction} className={`${glassButtonClasses} ${confirmModalProps.buttonClass}`} disabled={isProcessingAction}>
                        {confirmModalProps.isProcessing ? confirmModalProps.processingText : <>{confirmModalProps.buttonIcon} {confirmModalProps.buttonText}</>}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (!isProcessingAction) { setShowConfirmModal(false); setActionStatus({ success: null, error: null, message: '' }); } }} className={`${glassButtonClasses} text-gray-400 hover:text-gray-400`} disabled={isProcessingAction}>
                        <X size={16} /> Batal
                    </motion.button>
                </>
            }>
                {confirmModalProps.message}
            </Modal>

            <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="text-center md:text-left w-full md:w-1/3">&copy; With Love STMKG Karate Club Periode 2025</div>
                    <div className="w-full md:w-1/3 flex justify-center"><img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" /></div>
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