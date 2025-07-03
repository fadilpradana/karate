import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TiptapToolbar } from './TiptapToolbar';
import { compressAndConvertToWebP } from '../utils/imageCompressor';
import { Pencil, Image as ImageIcon, Send, UploadCloud } from 'lucide-react';

import { Figure } from './Tiptap/Figure';
import { Figcaption } from './Tiptap/Figcaption';

export const ArticleEditorForm = ({ pageTitle, initialData = null, onSubmit, isSubmitting, submitError }) => {
    const [judul, setJudul] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    // --- DITAMBAHKAN --- State untuk efek visual drag & drop
    const [isDragging, setIsDragging] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph', 'figcaption'] }),
            Placeholder.configure({ placeholder: 'Tulis konten artikel Anda di sini...' }),
            Figure,
            Figcaption,
        ],
        content: '',
        editorProps: {
            attributes: {
                // --- DITAMBAHKAN --- kelas `tiptap-editor-content` untuk styling tinggi minimum
                class: 'prose prose-invert max-w-none focus:outline-none p-4 text-gray-300 tiptap-editor-content',
            },
        },
    });

    useEffect(() => {
        if (initialData && editor) {
            setJudul(initialData.judul || '');
            editor.commands.setContent(initialData.deskripsi || '');
            setGambarUrl(initialData.gambar_url || '');
            setCoverImagePreview(initialData.gambar_url || null);
        }
    }, [initialData, editor]);

    const handleImageFile = async (file) => {
        if (!file) return;

        setIsCompressing(true);
        setCoverImagePreview(URL.createObjectURL(file));

        try {
            const processedFile = await compressAndConvertToWebP(file, { quality: 0.8, maxWidth: 1200 });
            setCoverImageFile(processedFile);
        } catch (error) {
            console.error("Gagal memproses gambar sampul:", error);
            setCoverImageFile(null);
            setCoverImagePreview(initialData?.gambar_url || null);
        } finally {
            setIsCompressing(false);
        }
    };
    
    // Fungsi ini menangani input dari tombol 'Unggah'
    const handleCoverImageChange = (e) => {
        handleImageFile(e.target.files[0]);
    };

    // --- DITAMBAHKAN --- Handler untuk fungsionalitas Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageFile(file);
        }
    };
    
    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!editor || isCompressing) return;

        const kontenHtml = editor.getHTML();
        onSubmit({ judul, konten: kontenHtml, gambarUrl, coverImageFile });
    };

    const glassButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold shadow-lg transition-all duration-200";

    if (!editor) {
        return <div className="text-center text-white py-10">Memuat editor...</div>;
    }

    return (
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-white">{pageTitle}</h1>
            <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Input Judul */}
                <div>
                    <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Artikel</label>
                    <div className="relative">
                        <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF9F1C] focus:border-[#FF9F1C] transition-colors" placeholder="Judul yang menarik..." />
                    </div>
                </div>

                {/* Input Gambar Sampul */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Gambar Sampul</label>
                    {/* --- DITAMBAHKAN --- event handler onDragOver, onDragLeave, onDrop */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md transition-colors ${isDragging ? 'bg-white/10' : ''}`}
                    >
                        <div className="space-y-1 text-center">
                            {coverImagePreview ? (
                                <img src={coverImagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-md object-cover"/>
                            ) : (
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-400 justify-center">
                                <label htmlFor="cover-image-upload" className="relative cursor-pointer bg-black/20 rounded-md font-medium text-[#FF9F1C] hover:text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FF9F1C] px-2 py-1">
                                    <span>{isCompressing ? "Memproses..." : "Unggah gambar"}</span>
                                    <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleCoverImageChange} accept="image/*" disabled={isCompressing}/>
                                </label>
                                <p className="pl-1">atau seret dan lepas</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (akan dikonversi ke WebP)</p>
                        </div>
                    </div>
                </div>
                
                {/* Tiptap Editor */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Konten Artikel</label>
                    <div className="bg-black/20 rounded-lg border border-white/10">
                        <TiptapToolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Error & Tombol Submit */}
                {submitError && <p className="text-red-400 text-sm text-center bg-red-900/50 py-2 rounded-md">{submitError}</p>}
                
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className={`${glassButtonClasses} text-white hover:bg-[#FF9F1C] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed`} disabled={isSubmitting || isCompressing}>
                    {isSubmitting ? 'Menyimpan...' : (isCompressing ? 'Memproses Gambar...' : <><Send size={18} /> Simpan & Publikasikan</>)}
                </motion.button>
            </form>
        </div>
    );
};