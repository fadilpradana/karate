import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import brevetLogo from '../assets/brevet.png';
import { Edit, Trash2, Send, Settings, X, BookOpen, ChevronLeft, Save, Search, RefreshCcw } from 'lucide-react';

import Modal from '../components/Modal'; // Sesuaikan path jika berbeda

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

    // State untuk Modal Edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [editingArticleType, setEditingArticleType] = useState('');
    const [editForm, setEditForm] = useState({
        judul: '',
        deskripsi: '',
        gambar_url: ''
    });
    const [editStatus, setEditStatus] = useState({ success: null, error: null, message: '' });
    const [isSaving, setIsSaving] = useState(false);

    // State untuk Modal Konfirmasi (digunakan untuk publish, unpublish, delete)
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'publish', 'unpublish', 'delete'
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
            .select(`
                id, judul, deskripsi, gambar_url, created_at, penulis_id,
                profiles!penulis_id (username)
            `)
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
            .select(`
                id, judul, deskripsi, gambar_url, created_at, published, penulis_id,
                profiles!penulis_id (username)
            `)
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
        setEditingArticle(article);
        setEditingArticleType(type);
        setEditForm({
            judul: article.judul,
            deskripsi: article.deskripsi,
            gambar_url: article.gambar_url || ''
        });
        setEditStatus({ success: null, error: null, message: '' });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setEditStatus({ success: null, error: null, message: '' });

        let tableName = editingArticleType === 'draft' ? 'draft_artikel' : 'artikel';

        const { error } = await supabase
            .from(tableName)
            .update({
                judul: editForm.judul,
                deskripsi: editForm.deskripsi,
                gambar_url: editForm.gambar_url
            })
            .eq('id', editingArticle.id);

        if (error) {
            console.error("Error saving article:", error);
            setEditStatus({ success: false, error: true, message: `Gagal menyimpan perubahan: ${error.message}` });
        } else {
            setEditStatus({ success: true, error: false, message: "Perubahan berhasil disimpan!" });
            setTimeout(() => {
                setShowEditModal(false); // Ini memicu animasi keluar
                fetchDraftArticles();
                fetchPublishedArticles();
            }, 1000);
        }
        setIsSaving(false);
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
                    const { error: insertError } = await supabase
                        .from('artikel')
                        .insert({
                            judul: articleForAction.judul,
                            deskripsi: articleForAction.deskripsi,
                            gambar_url: articleForAction.gambar_url,
                            penulis_id: articleForAction.penulis_id,
                            published: true,
                            created_at: articleForAction.created_at
                        });

                    if (insertError) {
                        throw new Error(`Gagal mempublikasikan: ${insertError.message}`);
                    }

                    const { error: deleteDraftError } = await supabase
                        .from('draft_artikel')
                        .delete()
                        .eq('id', articleForAction.id);

                    if (deleteDraftError) {
                        console.error("Gagal menghapus artikel draft setelah publikasi:", deleteDraftError.message);
                    }
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dipublikasi!" });
                    break;

                case 'unpublish':
                    const { error: insertDraftError } = await supabase
                        .from('draft_artikel')
                        .insert({
                            judul: articleForAction.judul,
                            deskripsi: articleForAction.deskripsi,
                            gambar_url: articleForAction.gambar_url,
                            penulis_id: articleForAction.penulis_id,
                            created_at: articleForAction.created_at
                        });

                    if (insertDraftError) {
                        throw new Error(`Gagal memindahkan ke draft: ${insertDraftError.message}`);
                    }

                    const { error: deletePublishedError } = await supabase
                        .from('artikel')
                        .delete()
                        .eq('id', articleForAction.id);

                    if (deletePublishedError) {
                        console.error("Gagal menghapus artikel publikasi setelah dipindahkan ke draft:", deletePublishedError.message);
                    }
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dipindahkan ke draft!" });
                    break;

                case 'delete':
                    let tableName = articleForAction.type === 'draft' ? 'draft_artikel' : 'artikel';
                    const { error: deleteError } = await supabase
                        .from(tableName)
                        .delete()
                        .eq('id', articleForAction.id);

                    if (deleteError) {
                        throw new Error(`Gagal menghapus artikel: ${deleteError.message}`);
                    }
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dihapus!" });
                    break;

                default:
                    throw new Error("Aksi tidak dikenal.");
            }

            // Setelah sukses, tutup modal dan refresh data
            setTimeout(() => {
                setShowConfirmModal(false); // Ini memicu animasi keluar
                fetchDraftArticles();
                fetchPublishedArticles();
            }, 1000);

        } catch (err) {
            setActionStatus({ success: false, error: true, message: err.message });
            fetchDraftArticles();
            fetchPublishedArticles();
        } finally {
            setIsProcessingAction(false);
        }
    };

    const filteredDraftArticles = draftArticles.filter(artikel =>
        artikel.judul.toLowerCase().includes(draftSearchTerm.toLowerCase()) ||
        artikel.deskripsi.toLowerCase().includes(draftSearchTerm.toLowerCase()) ||
        (artikel.profiles?.username && artikel.profiles.username.toLowerCase().includes(draftSearchTerm.toLowerCase()))
    );

    const filteredPublishedArticles = publishedArticles.filter(artikel =>
        artikel.judul.toLowerCase().includes(publishedSearchTerm.toLowerCase()) ||
        artikel.deskripsi.toLowerCase().includes(publishedSearchTerm.toLowerCase()) ||
        (artikel.profiles?.username && artikel.profiles.username.toLowerCase().includes(publishedSearchTerm.toLowerCase()))
    );

    const menuVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } },
    };
    const sidebarVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } },
        exit: { opacity: 0, y: -20 }
    };

    const glassButtonClasses = "flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

    const getConfirmModalContent = () => {
        if (!articleForAction) return { title: '', message: '' };

        switch (confirmAction) {
            case 'publish':
                return {
                    title: 'Konfirmasi Publikasi',
                    message: (
                        <>
                            Apakah Anda yakin ingin mempublikasikan artikel "<span className="font-semibold">{articleForAction.judul}</span>"?
                            Artikel ini akan dipindahkan ke daftar artikel publikasi.
                        </>
                    ),
                    buttonText: 'Ya, Publikasikan',
                    buttonIcon: <Send size={16} />,
                    buttonClass: 'text-green-400 hover:text-green-400',
                    isProcessing: isProcessingAction,
                    processingText: 'Mempublikasikan...'
                };
            case 'unpublish':
                return {
                    title: 'Konfirmasi Unpublish',
                    message: (
                        <>
                            Apakah Anda yakin ingin memindahkan artikel "<span className="font-semibold">{articleForAction.judul}</span>" kembali ke daftar draft?
                        </>
                    ),
                    buttonText: 'Ya, Pindahkan ke Draft',
                    buttonIcon: <ChevronLeft size={16} />,
                    buttonClass: 'text-purple-400 hover:text-purple-400',
                    isProcessing: isProcessingAction,
                    processingText: 'Memindahkan...'
                };
            case 'delete':
                return {
                    title: 'Konfirmasi Hapus Artikel',
                    message: (
                        <>
                            Apakah Anda yakin ingin menghapus artikel "<span className="font-semibold">{articleForAction.judul}</span>"
                            dari {articleForAction.type === 'draft' ? 'draft' : 'publikasi'}?
                            Tindakan ini tidak dapat dibatalkan.
                        </>
                    ),
                    buttonText: 'Ya, Hapus',
                    buttonIcon: <Trash2 size={16} />,
                    buttonClass: 'text-red-400 hover:text-red-400',
                    isProcessing: isProcessingAction,
                    processingText: 'Menghapus...'
                };
            default:
                return { title: '', message: '' };
        }
    };

    const confirmModalProps = getConfirmModalContent();

    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-gray-900 text-white">

            {/* Desktop Menu Manajemen Artikel */}
            <motion.div
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
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
                    <Link
                        to="/artikel"
                        className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                        title="Lihat Artikel"
                    >
                        <BookOpen size={20} />
                    </Link>
                    <Link
                        to="/moderasi-artikel"
                        className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                        title="Moderasi Artikel"
                    >
                        <Settings size={20} />
                    </Link>
                </nav>
            </motion.div>

            <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                {/* Mobile Menu Manajemen Artikel */}
                <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    className="block md:hidden mx-auto mb-8 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg z-10 w-fit"
                >
                    <nav className="flex space-x-4 justify-center">
                        <Link
                            to="/tulis-artikel-baru"
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                            title="Tulis Artikel Baru"
                        >
                            <Edit size={20} />
                        </Link>
                        <Link
                            to="/artikel"
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                            title="Lihat Artikel"
                        >
                            <BookOpen size={20} />
                        </Link>
                        <Link
                            to="/moderasi-artikel"
                            className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                            title="Moderasi Artikel"
                        >
                            <Settings size={20} />
                        </Link>
                    </nav>
                </motion.div>

                <h1 className="text-3xl sm:text-6xl font-league font-bold uppercase text-center mb-10 text-[#FF9F1C]">Panel Moderasi Artikel</h1>

                <div className="max-w-6xl mx-auto space-y-10">
                    {/* Panel Artikel Draft */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#FF9F1C] flex-shrink-0">Artikel Draft</h2>
                            <div className="relative flex-grow max-w-sm sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari draft..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                    value={draftSearchTerm}
                                    onChange={(e) => setDraftSearchTerm(e.target.value)}
                                />
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                {draftSearchTerm && (
                                    <RefreshCcw
                                        size={20}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
                                        onClick={() => setDraftSearchTerm('')}
                                    />
                                )}
                            </div>
                        </div>

                        {loadingDrafts ? (
                            <p className="text-center text-gray-400">Memuat artikel draft...</p>
                        ) : errorDrafts ? (
                            <p className="text-center text-red-400">{errorDrafts}</p>
                        ) : filteredDraftArticles.length === 0 ? (
                            <p className="text-center text-gray-400">Tidak ada artikel draft yang ditemukan.</p>
                        ) : (
                            <AnimatePresence>
                                {filteredDraftArticles.map((artikel) => (
                                    <motion.div
                                        key={artikel.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 p-4 rounded-lg mb-4 last:mb-0 gap-4 border border-white/10"
                                    >
                                        <div className="flex-grow">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-1">{artikel.judul}</h3>
                                            <p className="text-sm text-gray-300">Oleh: {artikel.profiles?.username || 'Anonim'}</p>
                                            <p className="text-xs text-gray-400">Dibuat: {new Date(artikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            {artikel.deskripsi && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{artikel.deskripsi}</p>}
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:ml-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEditClick(artikel, 'draft')}
                                                className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}
                                            >
                                                <Edit size={16} /> Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleConfirmActionClick('publish', artikel)}
                                                className={`${glassButtonClasses} text-green-400 hover:text-green-400`}
                                            >
                                                <Send size={16} /> Publikasi
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleConfirmActionClick('delete', artikel, 'draft')}
                                                className={`${glassButtonClasses} text-red-400 hover:text-red-400`}
                                            >
                                                <Trash2 size={16} /> Hapus
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </motion.div>

                    {/* Panel Artikel Publikasi */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#FF9F1C] flex-shrink-0">Artikel Publikasi</h2>
                            <div className="relative flex-grow max-w-sm sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari publikasi..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                    value={publishedSearchTerm}
                                    onChange={(e) => setPublishedSearchTerm(e.target.value)}
                                />
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                {publishedSearchTerm && (
                                    <RefreshCcw
                                        size={20}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
                                        onClick={() => setPublishedSearchTerm('')}
                                    />
                                )}
                            </div>
                        </div>

                        {loadingPublished ? (
                            <p className="text-center text-gray-400">Memuat artikel publikasi...</p>
                        ) : errorPublished ? (
                            <p className="text-center text-red-400">{errorPublished}</p>
                        ) : filteredPublishedArticles.length === 0 ? (
                            <p className="text-center text-gray-400">Tidak ada artikel publikasi yang ditemukan.</p>
                        ) : (
                            <AnimatePresence>
                                {filteredPublishedArticles.map((artikel) => (
                                    <motion.div
                                        key={artikel.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 p-4 rounded-lg mb-4 last:mb-0 gap-4 border border-white/10"
                                    >
                                        <div className="flex-grow">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-1">{artikel.judul}</h3>
                                            <p className="text-sm text-gray-300">Oleh: {artikel.profiles?.username || 'Anonim'}</p>
                                            <p className="text-xs text-gray-400">Dibuat: {new Date(artikel.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            {artikel.deskripsi && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{artikel.deskripsi}</p>}
                                            <p className={`text-xs font-semibold mt-1 ${artikel.published ? 'text-green-400' : 'text-red-400'}`}>
                                                Status: {artikel.published ? 'Dipublikasi' : 'Tidak Dipublikasi'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:ml-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEditClick(artikel, 'published')}
                                                className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}
                                            >
                                                <Edit size={16} /> Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleConfirmActionClick('unpublish', artikel)}
                                                className={`${glassButtonClasses} text-purple-400 hover:text-purple-400`}
                                            >
                                                <ChevronLeft size={16} /> Unpublish
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleConfirmActionClick('delete', artikel, 'published')}
                                                className={`${glassButtonClasses} text-red-400 hover:text-red-400`}
                                            >
                                                <Trash2 size={16} /> Hapus
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Modal Edit Artikel */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)} // Ini akan memicu animasi keluar saat X ditekan
                title="Edit Artikel"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
                    <div>
                        <label htmlFor="editJudul" className="block text-gray-300 text-sm font-medium mb-2">Judul</label>
                        <input
                            type="text"
                            id="editJudul"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                            value={editForm.judul}
                            onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                            placeholder="Masukkan judul artikel"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="editDeskripsi" className="block text-gray-300 text-sm font-medium mb-2">Deskripsi</label>
                        <textarea
                            id="editDeskripsi"
                            rows="6"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                            value={editForm.deskripsi}
                            onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                            placeholder="Tulis deskripsi singkat artikel di sini"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="editGambarUrl" className="block text-gray-300 text-sm font-medium mb-2">URL Gambar</label>
                        <input
                            type="url"
                            id="editGambarUrl"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                            value={editForm.gambar_url}
                            onChange={(e) => setEditForm({ ...editForm, gambar_url: e.target.value })}
                            placeholder="Contoh: https://contoh.com/gambar.jpg"
                        />
                    </div>
                    {/* Notifikasi sukses/error untuk form edit */}
                    {editStatus.error && <p className="text-red-400 text-sm">{editStatus.message}</p>}
                    {editStatus.success && <p className="text-green-400 text-sm">{editStatus.message}</p>}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-white/5 border border-white/10 rounded-md text-blue-400 py-2 font-semibold hover:text-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </motion.button>
                </form>
            </Modal>

            {/* Modal Konfirmasi Umum (untuk Publikasi, Unpublish, Hapus) */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => {
                    // Logic untuk tombol X di modal konfirmasi: hanya menutup modal, tanpa refresh halaman
                    if (!isProcessingAction) { // Pastikan tidak sedang dalam proses
                        setShowConfirmModal(false); // Ini akan memicu animasi keluar saat X ditekan
                        setActionStatus({ success: null, error: null, message: '' }); // Reset status
                    }
                }}
                title={confirmModalProps.title}
                statusMessage={actionStatus.error ? { type: 'error', message: actionStatus.message } : actionStatus.success ? { type: 'success', message: actionStatus.message } : null}
                actions={
                    <>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmAction}
                            className={`${glassButtonClasses} ${confirmModalProps.buttonClass}`}
                            disabled={isProcessingAction}
                        >
                            {confirmModalProps.isProcessing ? confirmModalProps.processingText : <>{confirmModalProps.buttonIcon} {confirmModalProps.buttonText}</>}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                // Tombol Batal: hanya menutup modal, tanpa refresh halaman
                                if (!isProcessingAction) {
                                    setShowConfirmModal(false); // Ini akan memicu animasi keluar saat Batal ditekan
                                    setActionStatus({ success: null, error: null, message: '' }); // Reset status
                                }
                            }}
                            className={`${glassButtonClasses} text-gray-400 hover:text-gray-400`}
                            disabled={isProcessingAction}
                        >
                            <X size={16} /> Batal
                        </motion.button>
                    </>
                }
            >
                {confirmModalProps.message}
            </Modal>


            {/* Footer yang Diperbarui */}
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