import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TiptapToolbar } from './TiptapToolbar';
import { compressAndConvertToWebP } from '../utils/imageCompressor';
import { Pencil, Image as ImageIcon, Send, UploadCloud } from 'lucide-react';

/**
 * Komponen form universal untuk membuat dan mengedit artikel.
 * @param {object} props
 * @param {string} props.pageTitle - Judul halaman ("Tulis Artikel Baru" atau "Edit Artikel").
 * @param {object} props.initialData - Data awal untuk mode edit.
 * @param {function} props.onSubmit - Fungsi yang dipanggil saat form disubmit.
 * @param {boolean} props.isSubmitting - Status loading dari proses submit.
 * @param {string|null} props.submitError - Pesan error jika ada.
 */
export const ArticleEditorForm = ({ pageTitle, initialData = null, onSubmit, isSubmitting, submitError }) => {
    const [judul, setJudul] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, Image.configure({ inline: false }), Placeholder.configure({ placeholder: 'Tulis konten artikel Anda...' })],
        content: '',
        editorProps: { attributes: { class: 'tiptap' } },
    });

    // Efek untuk mengisi form dengan data awal (untuk mode edit)
    useEffect(() => {
        if (initialData && editor) {
            setJudul(initialData.judul || '');
            // Atur konten editor. Pastikan konten tidak null/undefined.
            editor.commands.setContent(initialData.deskripsi || '');
            setGambarUrl(initialData.gambar_url || '');
            setCoverImagePreview(initialData.gambar_url || null);
        }
    }, [initialData, editor]);

    const handleCoverImageChange = async (e) => {
        // ... Logika handleCoverImageChange tidak berubah ...
    };
    
    // Fungsi submit internal yang memanggil prop onSubmit
    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!editor || isCompressing) return;

        const kontenHtml = editor.getHTML();
        onSubmit({ judul, konten: kontenHtml, gambarUrl, coverImageFile });
    };

    const glassButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold shadow-lg transition-all duration-200";

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full">
            <h1 className="text-2xl sm:text-4xl font-league font-bold uppercase text-center mb-6 text-[#FF9F1C]">{pageTitle}</h1>
            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* ... Seluruh elemen form (input judul, upload gambar, Tiptap editor) dipindahkan ke sini ... */}
                {/* Input Judul */}
                <div>
                    <label htmlFor="judul" className="block text-gray-300 text-sm font-medium mb-2">Judul Artikel</label>
                    <div className="relative">
                        <input type="text" id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} required />
                        {/* ... styling dan ikon ... */}
                    </div>
                </div>
                {/* Input Gambar Sampul */}
                <div>
                    {/* ... logika upload gambar sampul dengan preview dan kompresi ... */}
                </div>
                {/* Tiptap Editor */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Konten Artikel</label>
                    <div className="bg-white/5 rounded-lg border border-white/10">
                        <TiptapToolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>
                {/* Error & Tombol Submit */}
                {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}
                <motion.button type="submit" className={`${glassButtonClasses} ...`} disabled={isSubmitting || isCompressing}>
                    {isSubmitting ? 'Memproses...' : <><Send size={20} /> Simpan Artikel</>}
                </motion.button>
            </form>
        </div>
    );
};
