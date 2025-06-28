import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import brevetLogo from '../assets/brevet.png';
import { Edit, Trash2, Send, FileText, Settings, X, BookOpen, ChevronLeft, Save, Search, RefreshCcw } from 'lucide-react';

export default function ModerasiArtikel() {
    const navigate = useNavigate();

    const [draftArticles, setDraftArticles] = useState([]);
    const [publishedArticles, setPublishedArticles] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const [loadingPublished, setLoadingPublished] = useState(true);
    const [errorDrafts, setErrorDrafts] = useState(null);
    const [errorPublished, setErrorPublished] = useState(null);

    // Search terms for each panel
    const [draftSearchTerm, setDraftSearchTerm] = useState('');
    const [publishedSearchTerm, setPublishedSearchTerm] = useState('');

    // State untuk modal edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [editingArticleType, setEditingArticleType] = useState(''); // 'draft' atau 'published'
    const [editForm, setEditForm] = useState({
        judul: '',
        deskripsi: '',
        gambar_url: ''
    });
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State untuk konfirmasi publish
    const [showConfirmPublishModal, setShowConfirmPublishModal] = useState(false);
    const [articleToPublish, setArticleToPublish] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState({ success: null, error: null });

    // State untuk konfirmasi unpublish
    const [showConfirmUnpublishModal, setShowConfirmUnpublishModal] = useState(false);
    const [articleToUnpublish, setArticleToUnpublish] = useState(null);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [unpublishStatus, setUnpublishStatus] = useState({ success: null, error: null });


    useEffect(() => {
        fetchDraftArticles();
        fetchPublishedArticles();
    }, []);

    // Fungsi untuk mengambil artikel draft
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

    // Fungsi untuk mengambil artikel yang sudah dipublikasi
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

    // Handler untuk membuka modal edit
    const handleEditClick = (article, type) => {
        setEditingArticle(article);
        setEditingArticleType(type);
        setEditForm({
            judul: article.judul,
            deskripsi: article.deskripsi,
            gambar_url: article.gambar_url || ''
        });
        setEditError(null);
        setEditSuccess(false);
        setShowEditModal(true);
    };

    // Handler untuk menyimpan perubahan artikel
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setEditError(null);
        setEditSuccess(false);

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
            setEditError(`Gagal menyimpan perubahan: ${error.message}`);
        } else {
            setEditSuccess(true);
            setTimeout(() => {
                setShowEditModal(false);
                if (editingArticleType === 'draft') {
                    fetchDraftArticles();
                } else {
                    fetchPublishedArticles();
                }
            }, 1000);
        }
        setIsSaving(false);
    };

    // Handler untuk membuka konfirmasi publish
    const handlePublishClick = (article) => {
        setArticleToPublish(article);
        setShowConfirmPublishModal(true);
        setPublishStatus({ success: null, error: null });
    };

    // Handler untuk memproses publikasi artikel
    const confirmPublish = async () => {
        setIsPublishing(true);
        setPublishStatus({ success: null, error: null });

        if (!articleToPublish) return;

        try {
            // 1. Insert ke tabel 'artikel'
            const { error: insertError } = await supabase
                .from('artikel')
                .insert({
                    judul: articleToPublish.judul,
                    deskripsi: articleToPublish.deskripsi,
                    gambar_url: articleToPublish.gambar_url,
                    penulis_id: articleToPublish.penulis_id,
                    published: true,
                    created_at: articleToPublish.created_at
                });

            if (insertError) {
                throw new Error(`Gagal mempublikasikan: ${insertError.message}`);
            }

            // 2. Hapus dari tabel 'draft_artikel'
            const { error: deleteError } = await supabase
                .from('draft_artikel')
                .delete()
                .eq('id', articleToPublish.id);

            if (deleteError) {
                console.error("Gagal menghapus artikel draft setelah publikasi:", deleteError.message);
            }

            setPublishStatus({ success: true, error: null });
            setTimeout(() => {
                setShowConfirmPublishModal(false);
                fetchDraftArticles();
                fetchPublishedArticles();
            }, 1000);

        } catch (err) {
            setPublishStatus({ success: false, error: err.message });
            console.error("Kesalahan saat publish artikel:", err);
        } finally {
            setIsPublishing(false);
        }
    };

    // Handler untuk membuka konfirmasi unpublish
    const handleUnpublishClick = (article) => {
        setArticleToUnpublish(article);
        setShowConfirmUnpublishModal(true);
        setUnpublishStatus({ success: null, error: null });
    };

    // Handler untuk memproses unpublish artikel (memindahkan ke draft)
    const confirmUnpublish = async () => {
        setIsUnpublishing(true);
        setUnpublishStatus({ success: null, error: null });

        if (!articleToUnpublish) return;

        try {
            // 1. Insert ke tabel 'draft_artikel'
            const { error: insertError } = await supabase
                .from('draft_artikel')
                .insert({
                    judul: articleToUnpublish.judul,
                    deskripsi: articleToUnpublish.deskripsi,
                    gambar_url: articleToUnpublish.gambar_url,
                    penulis_id: articleToUnpublish.penulis_id,
                    created_at: articleToUnpublish.created_at
                });

            if (insertError) {
                throw new Error(`Gagal memindahkan ke draft: ${insertError.message}`);
            }

            // 2. Hapus dari tabel 'artikel'
            const { error: deleteError } = await supabase
                .from('artikel')
                .delete()
                .eq('id', articleToUnpublish.id);

            if (deleteError) {
                console.error("Gagal menghapus artikel publikasi setelah dipindahkan ke draft:", deleteError.message);
            }

            setUnpublishStatus({ success: true, error: null });
            setTimeout(() => {
                setShowConfirmUnpublishModal(false);
                fetchDraftArticles();
                fetchPublishedArticles();
            }, 1000);

        } catch (err) {
            setUnpublishStatus({ success: false, error: err.message });
            console.error("Kesalahan saat unpublish artikel:", err);
        } finally {
            setIsUnpublishing(false);
        }
    };


    // Handler untuk menghapus artikel
    const handleDelete = async (articleId, type) => {
        const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus artikel ini dari ${type === 'draft' ? 'draft' : 'publikasi'}?`);
        if (!confirmDelete) return;

        let tableName = type === 'draft' ? 'draft_artikel' : 'artikel';

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', articleId);

        if (error) {
            alert(`Gagal menghapus artikel: ${error.message}`);
            console.error("Error deleting article:", error);
        } else {
            if (type === 'draft') {
                fetchDraftArticles();
            } else {
                fetchPublishedArticles();
            }
        }
    };

    // Filtered articles for display based on search terms
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

    // Base classes for glassmorphism buttons with fixed text color
    // Disesuaikan untuk teks yang aktif terus-menerus dan tidak berubah warna saat hover background
    const glassButtonClasses = "flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

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
                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-[#FF9F1C]">Panel Moderasi Artikel</h1>

                {/* Mobile Menu Manajemen Artikel */}
                <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
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

                <div className="max-w-6xl mx-auto space-y-10">
                    {/* Panel Artikel Draft */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8"
                    >
                        {/* Judul dan Search Bar Draft */}
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
                                            {/* Tombol Edit - Teks Kuning */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEditClick(artikel, 'draft')}
                                                className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}
                                            >
                                                <Edit size={16} /> Edit
                                            </motion.button>
                                            {/* Tombol Publikasi - Teks Hijau */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handlePublishClick(artikel)}
                                                className={`${glassButtonClasses} text-green-400 hover:text-green-400`}
                                            >
                                                <Send size={16} /> Publikasi
                                            </motion.button>
                                            {/* Tombol Hapus - Teks Merah */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(artikel.id, 'draft')}
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
                        {/* Judul dan Search Bar Publikasi */}
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
                                            {/* Tombol Edit - Teks Kuning */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEditClick(artikel, 'published')}
                                                className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C]`}
                                            >
                                                <Edit size={16} /> Edit
                                            </motion.button>
                                            {/* Tombol Unpublish - Teks Ungu */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUnpublishClick(artikel)}
                                                className={`${glassButtonClasses} text-purple-400 hover:text-purple-400`}
                                            >
                                                <ChevronLeft size={16} /> Unpublish
                                            </motion.button>
                                            {/* Tombol Hapus - Teks Merah */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(artikel.id, 'published')}
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
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 10 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 w-full max-w-md relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-[#FF9F1C]">Edit Artikel</h2>
                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div>
                                    <label htmlFor="editJudul" className="block text-gray-300 text-sm font-medium mb-2">Judul</label>
                                    <input
                                        type="text"
                                        id="editJudul"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                        value={editForm.judul}
                                        onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
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
                                    />
                                </div>
                                {editError && <p className="text-red-400 text-sm">{editError}</p>}
                                {editSuccess && <p className="text-green-400 text-sm">Perubahan berhasil disimpan!</p>}
                                {/* Tombol Simpan Perubahan - Teks Biru */}
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Publikasi */}
            <AnimatePresence>
                {showConfirmPublishModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 10 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 w-full max-w-sm relative text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowConfirmPublishModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-[#FF9F1C]">Konfirmasi Publikasi</h2>
                            <p className="mb-6 text-gray-300">
                                Apakah Anda yakin ingin mempublikasikan artikel "<span className="font-semibold">{articleToPublish?.judul}</span>"?
                                Artikel ini akan dipindahkan ke daftar artikel publikasi.
                            </p>
                            {publishStatus.error && <p className="text-red-400 text-sm mb-4">{publishStatus.error}</p>}
                            {publishStatus.success && <p className="text-green-400 text-sm mb-4">Artikel berhasil dipublikasi!</p>}
                            <div className="flex justify-center gap-4">
                                {/* Tombol Ya, Publikasikan - Teks Hijau */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={confirmPublish}
                                    className={`${glassButtonClasses} text-green-400 hover:text-green-400`}
                                    disabled={isPublishing}
                                >
                                    {isPublishing ? 'Mempublikasikan...' : <><Send size={16} /> Ya, Publikasikan</>}
                                </motion.button>
                                {/* Tombol Batal - Teks Abu */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowConfirmPublishModal(false)}
                                    className={`${glassButtonClasses} text-gray-400 hover:text-gray-400`}
                                >
                                    <X size={16} /> Batal
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Unpublish */}
            <AnimatePresence>
                {showConfirmUnpublishModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 10 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 w-full max-w-sm relative text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowConfirmUnpublishModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-[#FF9F1C]">Konfirmasi Unpublish</h2>
                            <p className="mb-6 text-gray-300">
                                Apakah Anda yakin ingin memindahkan artikel "<span className="font-semibold">{articleToUnpublish?.judul}</span>" kembali ke daftar draft?
                            </p>
                            {unpublishStatus.error && <p className="text-red-400 text-sm mb-4">{unpublishStatus.error}</p>}
                            {unpublishStatus.success && <p className="text-green-400 text-sm mb-4">Artikel berhasil dipindahkan ke draft!</p>}
                            <div className="flex justify-center gap-4">
                                {/* Tombol Ya, Pindahkan ke Draft - Teks Ungu */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={confirmUnpublish}
                                    className={`${glassButtonClasses} text-purple-400 hover:text-purple-400`}
                                    disabled={isUnpublishing}
                                >
                                    {isUnpublishing ? 'Memindahkan...' : <><ChevronLeft size={16} /> Ya, Pindahkan ke Draft</>}
                                </motion.button>
                                {/* Tombol Batal - Teks Abu */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowConfirmUnpublishModal(false)}
                                    className={`${glassButtonClasses} text-gray-400 hover:text-gray-400`}
                                >
                                    <X size={16} /> Batal
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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