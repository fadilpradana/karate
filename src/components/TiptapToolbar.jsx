import React, { useState, useRef } from 'react';
import {
    Bold, Italic, Strikethrough, Heading2, List, ListOrdered,
    Image as ImageIcon, Loader, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { compressAndConvertToWebP } from '../utils/imageCompressor';

export const TiptapToolbar = ({ editor }) => {
    // State untuk menangani loading saat gambar inline diunggah
    const [isUploading, setIsUploading] = useState(false);
    // [PENYEMPURNAAN] Menggunakan useRef untuk mengelola elemen input file
    const imageInputRef = useRef(null);

    if (!editor) {
        return null;
    }

    const handleImageButtonClick = () => {
        // Memicu klik pada input file yang tersembunyi
        imageInputRef.current?.click();
    };

    /**
     * Menangani proses upload gambar inline setelah file dipilih.
     */
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true); // Mulai loading
            try {
                const processedFile = await compressAndConvertToWebP(file);
                const originalName = processedFile.name.substring(0, processedFile.name.lastIndexOf('.'));
                const fileName = `inline-${originalName}-${Date.now()}.webp`;

                const { error: uploadError } = await supabase.storage
                    .from('gambarartikel')
                    .upload(fileName, processedFile, {
                        contentType: 'image/webp',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage
                    .from('gambarartikel')
                    .getPublicUrl(fileName);

                // [PERBAIKAN UTAMA] Menggunakan perintah yang benar untuk menyisipkan node kustom
                if (data.publicUrl) {
                    editor.chain().focus().insertContent({
                        type: 'imageWithCaption', // Nama node kustom kita
                        attrs: {
                            src: data.publicUrl,
                            alt: originalName
                        },
                    }).run();
                }
                // ===================================================================

            } catch (error) {
                console.error('Gagal mengunggah gambar inline:', error);
                alert('Gagal memproses atau mengunggah gambar. Silakan periksa konsol untuk detail.');
            } finally {
                setIsUploading(false); // Selesai loading
                // Reset nilai input agar bisa memilih file yang sama lagi jika diperlukan
                if(imageInputRef.current) {
                    imageInputRef.current.value = "";
                }
            }
        }
    };

    // Fungsi helper untuk styling tombol toolbar
    const buttonClass = (isActive, isDisabled = false) =>
        `p-1.5 rounded-md text-gray-300 transition-colors duration-200 ${isActive ? 'bg-[#FF9F1C] text-white' : 'hover:bg-white/10'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-black/20 border-b border-white/10 rounded-t-lg">
            {/* Tombol Format Teks Dasar */}
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Bold">
                <Bold size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Italic">
                <Italic size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Strike">
                <Strikethrough size={18} />
            </button>

            <div className="w-px h-5 bg-white/20 mx-1"></div>

            {/* Tombol Heading dan List */}
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
                <Heading2 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Bullet List">
                <List size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Ordered List">
                <ListOrdered size={18} />
            </button>

            <div className="w-px h-5 bg-white/20 mx-1"></div>

            {/* Tombol Perataan Teks */}
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClass(editor.isActive({ textAlign: 'left' }))} title="Rata Kiri">
                <AlignLeft size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClass(editor.isActive({ textAlign: 'center' }))} title="Rata Tengah">
                <AlignCenter size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClass(editor.isActive({ textAlign: 'right' }))} title="Rata Kanan">
                <AlignRight size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={buttonClass(editor.isActive({ textAlign: 'justify' }))} title="Rata Kanan-Kiri">
                <AlignJustify size={18} />
            </button>

            <div className="w-px h-5 bg-white/20 mx-1"></div>
            
            {/* [PENYEMPURNAAN] Tombol Sisipkan Gambar sekarang menggunakan ref */}
            <button type="button" onClick={handleImageButtonClick} className={buttonClass(false, isUploading)} title="Sisipkan Gambar" disabled={isUploading}>
                {isUploading ? <Loader size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>
            <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};