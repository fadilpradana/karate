import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import favicon from '../assets/logo_bintangcompress.png';
import { Pencil, Image as ImageIcon, Send, FileText, Settings, ChevronLeft, UploadCloud, Replace, Trash2, X, Loader2, Save } from 'lucide-react';

import Modal from '../components/Modal'; 
import ImageBrowserModal from '../components/ImageBrowserModal';

import { useEditor, EditorContent, ReactNodeViewRenderer, BubbleMenu, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TiptapToolbar } from '../components/TiptapToolbar';
import '../TiptapStyles.css';

import { useAuth } from '../context/AuthContext';
import { AuthStatusDisplay } from '../components/AuthStatusDisplay';
import { compressAndConvertToWebP } from '../utils/imageCompressor';

import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';

const ImageWithCaptionComponent = ({ node, updateAttributes, selected, editor }) => {
    return (
        <NodeViewWrapper className={`image-with-caption ${selected ? 'ProseMirror-selectednode' : ''}`} data-drag-handle>
            <figure>
                <img src={node.attrs.src} alt={node.attrs.alt} className="rounded-md" />
                <figcaption
                    contentEditable={editor.isEditable}
                    suppressContentEditableWarning={true}
                    className={!node.attrs.caption ? 'is-empty' : ''}
                    onBlur={(e) => updateAttributes({ caption: e.currentTarget.innerText })}
                >{node.attrs.caption}</figcaption>
            </figure>
        </NodeViewWrapper>
    );
};

const ImageWithCaptionNode = Node.create({
    name: 'imageWithCaption',
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() { return { src: { default: null }, alt: { default: null }, caption: { default: '' } }; },
    parseHTML() {
        return [{
            tag: 'figure[data-type="imageWithCaption"]',
            getAttrs: dom => {
                const img = dom.querySelector('img');
                const caption = dom.querySelector('figcaption');
                return { src: img?.getAttribute('src'), alt: img?.getAttribute('alt'), caption: caption?.innerText };
            },
        }];
    },
    renderHTML({ HTMLAttributes }) { return ['figure', { 'data-type': this.name }, ['img', HTMLAttributes], ['figcaption', {}]]; },
    addNodeView() { return ReactNodeViewRenderer(ImageWithCaptionComponent); },
    addCommands() {
        return {
            setImageWithCaption: (options) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: options });
            },
        };
    },
});

export default function TulisArtikelBaru() {
    const { user, role: userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [judul, setJudul] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [sessionUploadedUrls, setSessionUploadedUrls] = useState(new Set());
    const editorImageInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageWithCaptionNode,
            Placeholder.configure({ placeholder: 'Tulis konten artikel Anda di sini...' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        editorProps: { attributes: { class: 'tiptap px-4 py-2' } },
        onUpdate: ({ editor }) => {
            setIsFormDirty(true);
        },
    });

    const handleImageUploadForEditor = async (file) => {
        if (!file) return;
        try {
            const compressedFile = await compressAndConvertToWebP(file);
            const fileName = `${Date.now()}_${compressedFile.name}`;
            const { error } = await supabase.storage.from('gambarartikel').upload(fileName, compressedFile);
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('gambarartikel').getPublicUrl(fileName);
            const imageUrl = urlData.publicUrl;
            
            setSessionUploadedUrls(prev => new Set(prev).add(imageUrl));
            editor.chain().focus().setImageWithCaption({ src: imageUrl }).run();
        } catch (error) {
            console.error("Gagal mengunggah gambar ke editor:", error);
            alert("Gagal mengunggah gambar.");
        }
    };

    const deleteImageInEditor = () => {
        const { from, to } = editor.state.selection;
        editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'imageWithCaption') {
                setSessionUploadedUrls(prev => new Set(prev).add(node.attrs.src));
            }
        });
        editor.chain().focus().deleteSelection().run();
    };

    const replaceImageInEditor = () => {
        const { from, to } = editor.state.selection;
        editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'imageWithCaption') {
                setSessionUploadedUrls(prev => new Set(prev).add(node.attrs.src));
            }
        });
        editorImageInputRef.current?.click();
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!editor || isCompressing || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError(null);

        const kontenHtml = editor.getHTML();
        let finalCoverImageUrl = '';

        const finalContentUrls = new Set(extractImageUrls(kontenHtml));
        let allUploadedUrls = new Set(sessionUploadedUrls);

        try {
            if (coverImageFile) {
                const fileName = `cover_${Date.now()}_${coverImageFile.name}`;
                const { error: uploadError } = await supabase.storage.from('gambarartikel').upload(fileName, coverImageFile);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('gambarartikel').getPublicUrl(fileName);
                finalCoverImageUrl = urlData.publicUrl;
                allUploadedUrls.add(finalCoverImageUrl);
            }

            const { data: articleData, error: insertError } = await supabase
                .from('draft_artikel')
                .insert([{
                    judul: judul,
                    deskripsi: kontenHtml,
                    gambar_url: finalCoverImageUrl,
                    penulis_id: user.id,
                }])
                .select();

            if (insertError) throw insertError;

            const urlsToKeep = new Set(finalContentUrls);
            if (finalCoverImageUrl) {
                urlsToKeep.add(finalCoverImageUrl);
            }

            const urlsToDelete = [...allUploadedUrls].filter(url => !urlsToKeep.has(url));

            if (urlsToDelete.length > 0) {
                const imagePaths = urlsToDelete.map(url => url.split('/gambarartikel/')[1]).filter(Boolean);
                if(imagePaths.length > 0) {
                    await supabase.storage.from('gambarartikel').remove(imagePaths);
                }
            }

            setSubmitSuccess("Artikel berhasil dibuat dan disimpan sebagai draft!");
            setIsFormDirty(false);

        } catch (error) {
            console.error("Error submitting article:", error);
            setSubmitError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const extractImageUrls = useCallback((html) => {
        if (!html) return [];
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const images = doc.querySelectorAll('figure[data-type="imageWithCaption"] img');
        return Array.from(images).map(img => img.getAttribute('src')).filter(Boolean);
    }, []);

    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsCompressing(true);
        setIsFormDirty(true);
        if (coverImagePreview) {
            setSessionUploadedUrls(prev => new Set(prev).add(coverImagePreview));
        }

        try {
            const compressedFile = await compressAndConvertToWebP(file);
            setCoverImageFile(compressedFile);
            const previewUrl = URL.createObjectURL(compressedFile);
            setCoverImagePreview(previewUrl);
        } catch (error) {
            console.error("Gagal memproses gambar sampul:", error);
            alert("Terjadi kesalahan saat memproses gambar.");
        } finally {
            setIsCompressing(false);
        }
    };

    const handleMyArticlesClick = () => {
        if (user && user.user_metadata?.username) {
            navigate(`/artikel?author=${user.user_metadata.username}`);
        } else if (user && user.email) {
            navigate(`/artikel?author=${user.email.split('@')[0]}`);
        }
    };
    
    useEffect(() => {
        if (!authLoading) {
            const authorized = user && (userRole === 'pengurus' || userRole === 'admin');
            setIsAuthorized(authorized);
        }
    }, [user, userRole, authLoading]);

    useEffect(() => {
        const preview = coverImagePreview;
        return () => { if (preview) { URL.revokeObjectURL(preview); } };
    }, [coverImagePreview]);
    
    const handleCancel = () => {
        if (isFormDirty) {
            setShowUnsavedChangesModal(true);
        } else {
            navigate('/artikel');
        }
    };

    // [ANIMASI] Definisikan varian animasi untuk container dan item
    const formContainerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if (authLoading || !isAuthorized) {
        return <AuthStatusDisplay authLoading={authLoading} isAuthorized={isAuthorized} />;
    }
    
    const glassButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold shadow-lg transition-all duration-200";
    const sidebarVariants = { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 } } };

    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <Helmet>
                <title>Tulis Artikel - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="icon" href={favicon} />
            </Helmet>
            <div className="absolute inset-0 bg-black opacity-70"></div>

            <AnimatePresence>
                {submitSuccess && (
                    <Modal isOpen={true} onClose={() => navigate('/artikel')} title="Sukses!">
                        <p>{submitSuccess}</p>
                    </Modal>
                )}
                {showUnsavedChangesModal && (
                    <Modal isOpen={true} onClose={() => setShowUnsavedChangesModal(false)} title="Perubahan Belum Disimpan">
                         <p className="text-gray-300 text-sm text-center mt-2">Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?</p>
                         <div className="flex justify-center gap-4 mt-6">
                             <button onClick={() => setShowUnsavedChangesModal(false)} className="flex items-center justify-center gap-1 px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white">Lanjutkan Menulis</button>
                             <button onClick={() => { setIsFormDirty(false); navigate('/artikel'); }} className="flex items-center justify-center gap-1 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">Keluar & Buang</button>
                         </div>
                    </Modal>
                )}
            </AnimatePresence>
            
            <input type="file" ref={editorImageInputRef} onChange={(e) => handleImageUploadForEditor(e.target.files[0])} className="hidden" accept="image/*" />
            
            {/* [PERUBAHAN] BubbleMenu hanya muncul saat gambar aktif */}
            <BubbleMenu 
                editor={editor} 
                tippyOptions={{ duration: 100 }} 
                className="bubble-menu"
                shouldShow={({ editor }) => {
                    // Hanya tampilkan menu jika node 'imageWithCaption' sedang aktif/terseleksi
                    return editor.isActive('imageWithCaption');
                }}
            >
                <button type="button" onClick={replaceImageInEditor} className="bubble-menu-button"><Replace size={18} /> Ganti</button>
                <button type="button" onClick={deleteImageInEditor} className="bubble-menu-button text-red-400"><Trash2 size={18} /> Hapus</button>
            </BubbleMenu>

            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                {(userRole === 'pengurus' || userRole === 'admin') && (
                    <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                        <nav className="space-y-3">
                            <button onClick={handleCancel} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali"><ChevronLeft size={20} /></button>
                            <button onClick={handleMyArticlesClick} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Artikel Saya"><FileText size={20} /></button>
                            {userRole === 'admin' && ( <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Moderasi Artikel"><Settings size={20} /></Link> )}
                        </nav>
                    </motion.div>
                )}

                <main className="flex-grow flex flex-col items-center justify-start pt-24 pb-16 px-4 gap-8">
                     {(userRole === 'pengurus' || userRole === 'admin') && (
                         <div className="block md:hidden">
                             <div className="p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg w-fit">
                                 <nav className="flex space-x-4 justify-center">
                                     <button onClick={handleCancel} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali"><ChevronLeft size={20} /></button>
                                     <button onClick={handleMyArticlesClick} className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Artikel Saya"><FileText size={20} /></button>
                                     {userRole === 'admin' && ( <Link to="/moderasi-artikel" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Moderasi Artikel"><Settings size={20} /></Link> )}
                                 </nav>
                             </div>
                         </div>
                     )}

                    <div className="w-full max-w-xl">
                        {/* [ANIMASI] Bungkus container form dengan motion.div */}
                        <motion.div 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full"
                            variants={formContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.h1 variants={formItemVariants} className="text-2xl sm:text-5xl font-league font-bold uppercase text-center mb-6 text-[#FF9F1C]">Tulis Artikel Baru</motion.h1>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={formItemVariants}>
                                    <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Artikel</label>
                                    <div className="relative">
                                        <input type="text" id="judul" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]" placeholder="Masukkan judul artikel..." value={judul} onChange={(e) => { setJudul(e.target.value); setIsFormDirty(true); }} required />
                                        <Pencil size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </motion.div>
                                <motion.div variants={formItemVariants}>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Gambar Sampul (Cover)</label>
                                    <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md min-h-[200px]">
                                        <div className="space-y-1 text-center">
                                            {isCompressing ? (
                                                <Loader2 className="animate-spin mx-auto h-12 w-12 text-white" />
                                            ) : coverImagePreview ? ( 
                                                <div className="relative group">
                                                    <img src={coverImagePreview} alt="Pratinjau" className="mx-auto h-40 w-auto rounded-md object-cover"/>
                                                    <div className="absolute inset-0 bg-black/60 flex-col justify-center items-center gap-2 opacity-0 group-hover:opacity-100 flex transition-opacity">
                                                        <button type="button" onClick={() => document.getElementById('cover-image-upload').click()} className="text-sm text-white bg-black/50 px-3 py-1 rounded-md">Ganti</button>
                                                        <button type="button" onClick={() => { setCoverImagePreview(null); setCoverImageFile(null); }} className="text-sm text-red-400 bg-black/50 px-3 py-1 rounded-md mt-1">Hapus</button>
                                                    </div>
                                                </div>
                                            ) : ( 
                                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" /> 
                                            )}
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <label htmlFor="cover-image-upload" className={`relative cursor-pointer bg-transparent rounded-md font-medium text-[#FF9F1C] hover:text-[#ffc41c] focus-within:outline-none ${isCompressing ? 'pointer-events-none opacity-50' : ''}`}>
                                                    <span>Unggah file</span>
                                                    <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleCoverImageChange} accept="image/*" disabled={isCompressing || isSubmitting} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">Gambar akan diubah ke WebP & dikompres</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div variants={formItemVariants}>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Konten Artikel</label>
                                    <div className="bg-white/5 rounded-lg border border-white/10">
                                        <TiptapToolbar editor={editor} onImageUploadClick={() => editorImageInputRef.current?.click()} />
                                        <EditorContent editor={editor} />
                                    </div>
                                </motion.div>
                                {submitError && ( <motion.p variants={formItemVariants} className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">{submitError}</motion.p> )}
                                <motion.div variants={formItemVariants}>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className={`${glassButtonClasses} text-[#FF9F1C] hover:text-[#FF9F1C] disabled:opacity-50 disabled:cursor-not-allowed`} disabled={isSubmitting || isCompressing}>
                                        {isSubmitting ? ( <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />Memproses...</> ) : ( <> <Send size={20} /> Buat & Simpan Draft</> )}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </div>
                </main>
 
                <Footer />
            </div>
        </div>
    );
}