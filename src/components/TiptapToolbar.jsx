import React, { useState } from 'react';
import { Bold, Italic, Strikethrough, Heading2, List, ListOrdered, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { compressAndConvertToWebP } from '../utils/imageCompressor';

export const TiptapToolbar = ({ editor }) => {
    // State untuk menangani loading saat gambar inline diunggah
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    /**
     * Menangani proses upload gambar inline:
     * 1. Membuka dialog file.
     * 2. Mengompres dan mengubah gambar ke WebP.
     * 3. Mengunggah file yang sudah diproses ke Supabase Storage.
     * 4. Menyisipkan URL gambar ke dalam editor Tiptap.
     */
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                setIsUploading(true); // Mulai loading
                try {
                    // Panggil fungsi helper untuk memproses gambar
                    const processedFile = await compressAndConvertToWebP(file);

                    // Buat nama file yang unik dengan ekstensi .webp
                    const originalName = processedFile.name.substring(0, processedFile.name.lastIndexOf('.'));
                    const fileName = `inline-${originalName}-${Date.now()}.webp`;

                    // Unggah file yang sudah diproses ke Supabase
                    const { error: uploadError } = await supabase.storage
                        .from('gambarartikel') // Pastikan nama bucket sudah benar
                        .upload(fileName, processedFile, {
                            contentType: 'image/webp', // Set content type secara eksplisit
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) {
                        throw uploadError;
                    }

                    // Dapatkan URL publik dari file yang baru diunggah
                    const { data } = supabase.storage
                        .from('gambarartikel')
                        .getPublicUrl(fileName);

                    // Sisipkan gambar ke dalam editor
                    if (data.publicUrl) {
                        editor.chain().focus().setImage({ src: data.publicUrl, alt: originalName }).run();
                    }
                } catch (error) {
                    console.error('Gagal mengunggah gambar inline:', error);
                    alert('Gagal memproses atau mengunggah gambar. Silakan periksa konsol untuk detail.');
                } finally {
                    setIsUploading(false); // Selesai loading
                }
            }
        };
        input.click();
    };
    
    // Fungsi helper untuk styling tombol toolbar
    const buttonClass = (isActive, isDisabled = false) => 
        `p-1.5 rounded-md text-gray-300 transition-colors duration-200 ${isActive ? 'bg-[#FF9F1C] text-white' : 'hover:bg-white/10'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-t-lg">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Bold">
                <Bold size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Italic">
                <Italic size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Strike">
                <Strikethrough size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
                <Heading2 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Bullet List">
                <List size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Ordered List">
                <ListOrdered size={18} />
            </button>
            <button type="button" onClick={handleImageUpload} className={buttonClass(false, isUploading)} title="Insert Image" disabled={isUploading}>
                {isUploading ? <Loader size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>
        </div>
    );
};
