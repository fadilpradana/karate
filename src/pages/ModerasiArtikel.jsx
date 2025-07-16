import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import { Edit, Trash2, Send, Settings, X, BookOpen, ChevronLeft, Save, Search, RefreshCcw, Image as ImageIcon, Replace, Loader2, ArrowLeft } from 'lucide-react';

// Impor background baru
import bg1 from '../assets/bg1.jpg';

import { compressAndConvertToWebP } from '../utils/imageCompressor';
import Modal from '../components/Modal';
import ImageBrowserModal from '../components/ImageBrowserModal';

// Tiptap Imports
import { useEditor, EditorContent, ReactNodeViewRenderer, BubbleMenu, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TiptapToolbar } from '../components/TiptapToolbar';
import '../TiptapStyles.css';

import { Node, mergeAttributes } from '@tiptap/core';

// --- Helper Functions ---
const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const glassButtonClasses = "flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

// --- ActionSheetModal Component (Tanpa Perubahan) ---
const ActionSheetModal = ({ isOpen, onClose, title, actions }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const getActionClass = (action) => {
        if (action.isDestructive) return 'text-red-400 hover:bg-red-500/10';
        if (action.isSecondary) return 'text-gray-300 hover:bg-white/10';
        return 'text-blue-400 hover:bg-blue-500/10';
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#1c1c1c] border-t border-white/10 rounded-t-2xl p-4"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                <div className="space-y-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors text-base ${getActionClass(action)} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};

// --- Komponen Node View Gambar dengan Caption ---
const ImageWithCaptionComponent = ({ node, updateAttributes, selected, editor }) => {
    return (
        <NodeViewWrapper className={`image-with-caption ${selected ? 'ProseMirror-selectednode' : ''}`} data-drag-handle>
            <figure>
                <img src={node.attrs.src} alt={node.attrs.alt} className="rounded-md" />
                <figcaption
                    contentEditable={editor.isEditable}
                    suppressContentEditableWarning={true}
                    className={!node.attrs.caption ? 'is-empty' : ''}
                    onBlur={(e) => {
                        updateAttributes({ caption: e.currentTarget.innerText });
                    }}
                >{node.attrs.caption}</figcaption>
            </figure>
        </NodeViewWrapper>
    );
};


// --- Definisi Node Kustom Tiptap untuk Gambar dengan Caption ---
const ImageWithCaptionNode = Node.create({
    name: 'imageWithCaption',
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            caption: { default: '' },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
                getAttrs: dom => {
                    if (typeof dom === 'string') return {};
                    const img = dom.querySelector('img');
                    const caption = dom.querySelector('figcaption');
                    if (!img) return false; 
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt'),
                        caption: caption?.innerText,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'figure',
            { 'data-type': this.name },
            ['img', { src: HTMLAttributes.src, alt: HTMLAttributes.alt }],
            ['figcaption', {}, HTMLAttributes.caption || ''],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageWithCaptionComponent);
    },

    addCommands() {
        return {
            setImageWithCaption: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});


// --- Komponen Form Inline untuk Artikel ---
const ArticleForm = ({ currentArticle, onSave, onCancel, isSaving, isCompressingImage, setIsFormDirty, setIsCompressingImageParent }) => {
    const [formData, setFormData] = useState(currentArticle);
    const [coverImagePreview, setCoverImagePreview] = useState(currentArticle.gambar_url || null);
    const [newCoverImageFile, setNewCoverImageFile] = useState(null);
    const [isCoverRemoved, setIsCoverRemoved] = useState(false);
    
    // [SOLUSI] State untuk melacak URL gambar yang dihapus/diganti selama sesi edit ini
    const [sessionOrphanedUrls, setSessionOrphanedUrls] = useState(new Set());
    
    const fileInputRef = useRef(null);
    const editorImageInputRef = useRef(null);
    const initialFormState = useRef(null);

    const handleImageUploadForEditor = async (file) => {
        if (!file || !editor) return;

        try {
            const compressedFile = await compressAndConvertToWebP(file);
            const fileName = `${Date.now()}_${compressedFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('gambarartikel').upload(fileName, compressedFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('gambarartikel').getPublicUrl(fileName);
            const imageUrl = urlData.publicUrl;

            editor.chain().focus().setImageWithCaption({ src: imageUrl, caption: '' }).run();
            updateIsDirty();
        } catch (error) {
            console.error("Gagal mengunggah gambar ke editor:", error);
            alert("Gagal mengunggah gambar.");
        }
    };

    const editor = useEditor({
        extensions: [ StarterKit, ImageWithCaptionNode, Placeholder.configure({ placeholder: 'Tulis konten artikel di sini...' }), TextAlign.configure({ types: ['heading', 'paragraph'] }), ],
        editorProps: { attributes: { class: 'tiptap min-h-[250px] overflow-y-auto px-4 py-2' } },
        onUpdate: () => {
            if (!initialFormState.current) return;
            updateIsDirty();
        },
    });

    // [SOLUSI] Fungsi untuk menangkap URL sebelum dihapus dari editor
    const captureUrlBeforeDelete = () => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'imageWithCaption') {
                const url = node.attrs.src;
                if (url) {
                    setSessionOrphanedUrls(prev => new Set(prev).add(url));
                }
            }
        });
    };

    const deleteImageInEditor = () => {
        captureUrlBeforeDelete(); // Tangkap URL sebelum dihapus
        editor.chain().focus().deleteSelection().run();
        updateIsDirty();
    };

    const replaceImageInEditor = () => {
        captureUrlBeforeDelete(); // Tangkap URL gambar lama sebelum diganti
        editorImageInputRef.current?.click();
    };

    const updateIsDirty = useCallback(() => {
        if (!initialFormState.current || !editor) return;
        const titleChanged = formData.judul !== initialFormState.current.judul;
        const contentChanged = editor.getHTML() !== initialFormState.current.deskripsi;
        const coverChanged = coverImagePreview !== initialFormState.current.gambar_url || newCoverImageFile !== null || isCoverRemoved;
        setIsFormDirty(titleChanged || contentChanged || coverChanged);
    }, [formData.judul, editor, coverImagePreview, newCoverImageFile, isCoverRemoved, setIsFormDirty]);
    
    useEffect(() => {
        if (currentArticle && editor) {
            const initialContent = currentArticle.deskripsi || '';
            initialFormState.current = { judul: currentArticle.judul, deskripsi: initialContent, gambar_url: currentArticle.gambar_url || null };
            setFormData(currentArticle);
            setCoverImagePreview(currentArticle.gambar_url || null);
            setNewCoverImageFile(null);
            setIsCoverRemoved(false);
            
            if (editor.getHTML() !== initialContent) {
                editor.commands.setContent(initialContent, false);
            }
            
            // [SOLUSI] Reset pelacak URL yatim setiap kali form dibuka
            setSessionOrphanedUrls(new Set());
            setIsFormDirty(false);
        }
    }, [currentArticle, editor, setIsFormDirty]);

    useEffect(() => {
        updateIsDirty();
    }, [formData.judul, coverImagePreview, newCoverImageFile, isCoverRemoved, updateIsDirty]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressingImageParent(true);
            try {
                const compressedFile = await compressAndConvertToWebP(file);
                setNewCoverImageFile(compressedFile);
                setCoverImagePreview(URL.createObjectURL(compressedFile));
                setIsCoverRemoved(false);
            } catch (error) {
                console.error("Gagal memproses gambar:", error);
                alert("Terjadi kesalahan saat memproses gambar.");
            } finally {
                setIsCompressingImageParent(false);
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
        setShowImageBrowser(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            deskripsi: editor.getHTML(),
            newCoverImageFile,
            isCoverRemoved,
            coverImagePreview,
            // [SOLUSI] Kirim daftar URL yatim ke fungsi save utama
            sessionOrphanedUrls: Array.from(sessionOrphanedUrls),
        });
        setIsFormDirty(false);
    };

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 640);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const [showImageBrowser, setShowImageBrowser] = useState(false);
    const [showCoverActionSheet, setShowCoverActionSheet] = useState(false);
    const coverActions = [
        { label: 'Ganti dari File', icon: <Replace size={20} />, onClick: () => { fileInputRef.current.click(); setShowCoverActionSheet(false); }, isPrimary: true },
        { label: 'Pilih dari Galeri', icon: <ImageIcon size={20} />, onClick: () => { setShowImageBrowser(true); setShowCoverActionSheet(false); }, isSecondary: true },
        { label: 'Hapus Gambar', icon: <Trash2 size={20} />, onClick: () => { handleRemoveCover(); setShowCoverActionSheet(false); }, isDestructive: true }
    ];

    const glassFormStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' };

    if (!editor) {
        return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" size={32} /></div>;
    }

    return (
        <motion.div
            key="article-form-view"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto p-6 rounded-2xl"
            style={glassFormStyle}
        >
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100, placement: 'top', }}
                shouldShow={({ editor }) => editor.isActive('imageWithCaption')}
                className="bubble-menu"
            >
                <button type="button" onClick={replaceImageInEditor} className="bubble-menu-button">
                    <Replace size={18} /> Ganti
                </button>
                <button type="button" onClick={deleteImageInEditor} className="bubble-menu-button text-red-400">
                    <Trash2 size={18} /> Hapus
                </button>
            </BubbleMenu>

            <input
                type="file"
                ref={editorImageInputRef}
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleImageUploadForEditor(e.target.files[0]);
                    }
                }}
                className="hidden"
                accept="image/*"
            />
            
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-4xl font-league uppercase text-[#FF9F1C]">{formData.id ? "Edit Artikel" : "Tambah Artikel Baru"}</h2>
                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCancel} className={`${glassButtonClasses} px-3 py-1.5 text-xs text-gray-300 hover:text-white`}>
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
                            onClick={() => { if (isMobile) { setShowCoverActionSheet(true); } else { fileInputRef.current.click() } }}
                        >
                            {isCompressingImage ? (
                                <div className="text-center"><p className="text-xs text-gray-400">Memproses...</p></div>
                            ) : coverImagePreview ? (
                                <>
                                    <img src={coverImagePreview} alt="Pratinjau Cover" className="h-full w-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 justify-center items-center gap-2 opacity-0 transition-opacity duration-300 hidden sm:flex sm:group-hover:opacity-100">
                                        <div onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} title="Ganti dari file" className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"><Replace size={18} /></div>
                                        <div onClick={(e) => { e.stopPropagation(); setShowImageBrowser(true); }} title="Pilih dari galeri" className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"><ImageIcon size={18} /></div>
                                        <div onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }} title="Hapus gambar" className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 cursor-pointer"><Trash2 size={18} /></div>
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
                        <TiptapToolbar editor={editor} onImageUploadClick={() => editorImageInputRef.current?.click()} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full mt-2 bg-white/5 border border-white/10 rounded-md text-blue-400 py-2 text-sm font-semibold hover:text-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving || isCompressingImage}>
                    {isSaving ? 'Menyimpan...' : (isCompressingImage ? 'Gambar diproses...' : 'Simpan Perubahan')}
                </motion.button>
            </form>
            
            <AnimatePresence>
                {showCoverActionSheet && (
                    <ActionSheetModal isOpen={showCoverActionSheet} onClose={() => setShowCoverActionSheet(false)} title="Opsi Gambar Sampul" actions={coverActions} />
                )}
            </AnimatePresence>

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
    const [currentArticle, setCurrentArticle] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [articleForAction, setArticleForAction] = useState(null);
    const [actionStatus, setActionStatus] = useState({ success: null, error: null, message: '' });
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    const extractImageUrls = useCallback((html) => {
        if (!html) return [];
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const images = doc.querySelectorAll('figure[data-type="imageWithCaption"] img');
        return Array.from(images).map(img => img.getAttribute('src')).filter(Boolean);
    }, []);

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

    const handleEditClick = useCallback((article, type) => {
        setCurrentArticle({
            ...article,
            deskripsi: article.deskripsi || '',
            type,
        });
    }, []);

    // [SOLUSI] Logika save diperbarui untuk menggunakan daftar URL yatim dari sesi edit
    const handleSaveArticle = async ({ id, judul, deskripsi, newCoverImageFile, isCoverRemoved, coverImagePreview, type, sessionOrphanedUrls }) => {
        setIsSaving(true);

        const articles = type === 'draft' ? draftArticles : publishedArticles;
        const originalArticle = articles.find(a => a.id === id);
        
        if (!originalArticle) {
            alert("Artikel asli tidak ditemukan.");
            setIsSaving(false);
            return;
        }

        const initialHtml = originalArticle.deskripsi || '';
        const oldCoverImageUrl = originalArticle.gambar_url;

        // 1. Dapatkan URL gambar yang ada saat artikel dimuat, tapi sudah tidak ada di konten akhir
        const initialContentImageUrls = extractImageUrls(initialHtml);
        const finalContentImageUrls = extractImageUrls(deskripsi);
        const finalUrlSet = new Set(finalContentImageUrls);
        const persistentUrlsToDelete = initialContentImageUrls.filter(url => !finalUrlSet.has(url));

        // 2. Gabungkan semua sumber URL yang akan dihapus
        const allUrlsToDelete = new Set([
            ...persistentUrlsToDelete,  // Gambar lama yang dihapus
            ...sessionOrphanedUrls,    // Gambar yang dihapus/diganti selama sesi edit
        ]);
        
        let finalCoverImageUrl = oldCoverImageUrl;

        try {
            // Proses upload gambar sampul baru jika ada
            if (newCoverImageFile) {
                const fileName = `${Date.now()}_${newCoverImageFile.name}`;
                const { error: uploadError } = await supabase.storage.from('gambarartikel').upload(fileName, newCoverImageFile);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('gambarartikel').getPublicUrl(fileName);
                finalCoverImageUrl = urlData.publicUrl;
            } else if (isCoverRemoved) {
                finalCoverImageUrl = null;
            } else {
                finalCoverImageUrl = coverImagePreview;
            }

            // 3. Tambahkan gambar sampul lama ke daftar hapus jika diganti/dihapus
            if (oldCoverImageUrl && finalCoverImageUrl !== oldCoverImageUrl) {
                allUrlsToDelete.add(oldCoverImageUrl);
            }
            
            // 4. Update data artikel di database
            const tableName = type === 'draft' ? 'draft_artikel' : 'artikel';
            const { error: updateError } = await supabase.from(tableName).update({
                judul,
                deskripsi,
                gambar_url: finalCoverImageUrl
            }).eq('id', id);

            if (updateError) throw updateError;
            
            // 5. Lakukan penghapusan file dari bucket
            if (allUrlsToDelete.size > 0) {
                const imagePaths = Array.from(allUrlsToDelete).map(url => {
                    try {
                        return new URL(url).pathname.split(`/gambarartikel/`)[1];
                    } catch (e) { return null; }
                }).filter(Boolean);
                
                if (imagePaths.length > 0) {
                    console.log("Menghapus file yatim dari storage:", imagePaths);
                    const { error: deleteStorageError } = await supabase.storage.from('gambarartikel').remove(imagePaths);
                    if (deleteStorageError) {
                        console.error("Gagal menghapus beberapa file dari storage:", deleteStorageError);
                    }
                }
            }

            setCurrentArticle(null);
            setIsFormDirty(false);
            await Promise.all([fetchDraftArticles(), fetchPublishedArticles()]);

        } catch (error) {
            console.error("Error saving article:", error);
            alert(`Gagal menyimpan artikel: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCancelEdit = useCallback(() => {
        if (isFormDirty && !isSaving && !isCompressingImage) {
            setShowUnsavedChangesModal(true);
        } else {
            setCurrentArticle(null);
            setIsFormDirty(false);
        }
    }, [isFormDirty, isSaving, isCompressingImage]);

    const discardChangesAndClose = useCallback(() => {
        setShowUnsavedChangesModal(false);
        setCurrentArticle(null);
        setIsFormDirty(false);
    }, []);


    const handleConfirmActionClick = useCallback((action, article, type = null) => {
        setConfirmAction(action);
        setArticleForAction({ ...article, type });
        setActionStatus({ success: null, error: null, message: '' });
        setShowConfirmModal(true);
    }, []);

    const handleConfirmAction = async () => {
        setIsProcessingAction(true);
        setActionStatus({ success: null, error: null, message: '' });
        if (!articleForAction) {
            setIsProcessingAction(false);
            return;
        };

        let success = false;
        let actionType = confirmAction;
        let shouldCloseForm = false;

        try {
            switch (actionType) {
                case 'publish':
                    const { error: insertError } = await supabase.from('artikel').insert({
                        judul: articleForAction.judul, deskripsi: articleForAction.deskripsi,
                        gambar_url: articleForAction.gambar_url, penulis_id: articleForAction.penulis_id,
                        published: true, created_at: articleForAction.created_at
                    });
                    if (insertError) throw new Error(`Gagal mempublikasikan: ${insertError.message}`);
                    await supabase.from('draft_artikel').delete().eq('id', articleForAction.id);
                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dipublikasi!" });
                    success = true;
                    shouldCloseForm = true;
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
                    success = true;
                    shouldCloseForm = true;
                    break;
                case 'delete':
                    let tableName = articleForAction.type === 'draft' ? 'draft_artikel' : 'artikel';
                    
                    const { data: articleToDelete, error: fetchError } = await supabase
                        .from(tableName)
                        .select('deskripsi, gambar_url')
                        .eq('id', articleForAction.id)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore error if row not found
                        throw new Error(`Gagal mengambil data artikel untuk dihapus: ${fetchError.message}`);
                    }

                    const { error: deleteError } = await supabase.from(tableName).delete().eq('id', articleForAction.id);
                    if (deleteError) throw new Error(`Gagal menghapus artikel: ${deleteError.message}`);

                    const allUrlsToDelete = [];
                    if (articleToDelete?.gambar_url) {
                        allUrlsToDelete.push(articleToDelete.gambar_url);
                    }
                    if(articleToDelete?.deskripsi){
                        const contentImageUrls = extractImageUrls(articleToDelete.deskripsi);
                        allUrlsToDelete.push(...contentImageUrls);
                    }

                    if (allUrlsToDelete.length > 0) {
                        const imagePaths = allUrlsToDelete.map(url => url.split('/gambarartikel/')[1]).filter(Boolean);
                        if (imagePaths.length > 0) {
                            await supabase.storage.from('gambarartikel').remove(imagePaths);
                        }
                    }

                    setActionStatus({ success: true, error: false, message: "Artikel berhasil dihapus!" });
                    success = true;
                    shouldCloseForm = true;
                    break;
                default:
                    throw new Error("Aksi tidak dikenal.");
            }
            
            await Promise.all([fetchDraftArticles(), fetchPublishedArticles()]);

            if (success) {
                setTimeout(() => {
                    setShowConfirmModal(false);
                    if (shouldCloseForm) {
                        setCurrentArticle(null);
                    }
                }, 1500);
            }

        } catch (err) {
            setActionStatus({ success: false, error: true, message: err.message });
        } finally {
            setIsProcessingAction(false);
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
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Moderasi Artikel - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg1})` }} />
            <div className="absolute inset-0 bg-black/70 z-0" />
            
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                    <nav className="space-y-3">
                        <Link to="/tulis-artikel-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Tulis Artikel Baru"><Edit size={20} /></Link>
                        <Link to="/artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Lihat Artikel"><BookOpen size={20} /></Link>
                    </nav>
                </motion.div>
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    <motion.div variants={menuVariants} initial="hidden" animate="visible" className="block md:hidden mx-auto mb-8 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg z-10 w-fit">
                        <nav className="flex space-x-4 justify-center">
                            <Link to="/tulis-artikel-baru" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Tulis Artikel Baru"><Edit size={20} /></Link>
                            <Link to="/artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Lihat Artikel"><BookOpen size={20} /></Link>
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
                                    setIsFormDirty={setIsFormDirty}
                                    setIsCompressingImageParent={setIsCompressingImage}
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

                <Modal isOpen={showUnsavedChangesModal} onClose={() => setShowUnsavedChangesModal(false)} title="Perubahan Belum Disimpan" contentClassName="pt-6 pb-8" className="w-full max-w-sm mx-auto">
                    <div className="flex flex-col justify-center">
                        <p className="text-gray-300 text-sm text-center mt-2">Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup editor?</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowUnsavedChangesModal(false)} className={`${glassButtonClasses} text-gray-300 hover:text-white`}>Lanjutkan Mengedit</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={discardChangesAndClose} className={`${glassButtonClasses} text-red-400 hover:text-red-300`}>Tutup & Buang</motion.button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={showConfirmModal} onClose={() => { if (!isProcessingAction) { setShowConfirmModal(false); setActionStatus({ success: null, error: null, message: '' }); } }} title={confirmModalProps.title} statusMessage={actionStatus.error ? { type: 'error', message: actionStatus.message } : actionStatus.success ? { type: 'success', message: actionStatus.message } : null} actions={
                    <>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmAction} className={`${glassButtonClasses} ${confirmModalProps.buttonClass}`} disabled={isProcessingAction}>
                            {confirmModalProps.isProcessing ? <><Loader2 size={16} className="animate-spin" /> {confirmModalProps.processingText}</> : <>{confirmModalProps.buttonIcon} {confirmModalProps.buttonText}</>}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (!isProcessingAction) { setShowConfirmModal(false); setActionStatus({ success: null, error: null, message: '' }); } }} className={`${glassButtonClasses} text-gray-400 hover:text-gray-400`} disabled={isProcessingAction}>
                            <X size={16} /> Batal
                        </motion.button>
                    </>
                }>
                    {confirmModalProps.message}
                </Modal>
                
                <Footer />
            </div>
        </div>
    );
}
