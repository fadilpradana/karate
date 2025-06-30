import { useState } from 'react';
import { supabase } from '../supabaseClient'; // Pastikan path ini benar

/**
 * Hook untuk menangani logika submit artikel ke Supabase.
 * @param {object} user - Objek user dari useAuth.
 */
export function useArticleForm(user) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState('');

    /**
     * Fungsi yang menangani seluruh proses submit.
     * @param {object} formData - Data dari form yang dikirim dari komponen.
     */
    const handleSubmit = async (formData) => {
        const { judul, konten, gambarUrl, coverImageFile } = formData;

        if (!user) {
            setSubmitError('Anda harus login untuk membuat artikel.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess('');
        let finalImageUrl = gambarUrl; 

        try {
            // Langkah 1: Unggah Gambar Sampul jika ada file yang dipilih
            if (coverImageFile) {
                const fileExt = coverImageFile.name.split('.').pop();
                const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // --- DIUBAH: Menggunakan nama bucket 'gambarartikel' ---
                const { error: uploadError } = await supabase.storage
                    .from('gambarartikel') 
                    .upload(filePath, coverImageFile);

                if (uploadError) {
                    throw new Error(`Gagal mengunggah gambar sampul: ${uploadError.message}`);
                }

                // --- DIUBAH: Mengambil URL dari bucket 'gambarartikel' ---
                const { data } = supabase.storage
                    .from('gambarartikel')
                    .getPublicUrl(filePath);
                
                finalImageUrl = data.publicUrl;
            }

            // Langkah 2: Siapkan data artikel untuk dimasukkan ke tabel
            const articleData = {
                judul: judul,
                deskripsi: konten, // Menyimpan konten HTML ke kolom 'deskripsi'
                gambar_url: finalImageUrl,
                penulis_id: user.id,
            };

            // Langkah 3: Masukkan data ke tabel 'draft_artikel'
            const { error: insertError } = await supabase.from('draft_artikel').insert([articleData]);

            if (insertError) {
                throw new Error(`Gagal menyimpan artikel: ${insertError.message}`);
            }

            setSubmitSuccess('Artikel berhasil disimpan sebagai draf dan menunggu moderasi!');

        } catch (error) {
            console.error('Submit Error:', error);
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        submitError,
        submitSuccess,
        handleSubmit,
    };
}
