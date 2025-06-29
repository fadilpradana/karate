import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export function useArticleForm(user) {
    const [judul, setJudul] = useState('');
    const [konten, setKonten] = useState('');
    const [gambarUrl, setGambarUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null); // Ini akan berisi pesan sukses
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!user) {
            setSubmitError('Anda harus login untuk membuat artikel.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            const { data, error } = await supabase
                .from('draft_artikel')
                .insert([
                    {
                        judul: judul,
                        deskripsi: konten,
                        gambar_url: gambarUrl,
                        penulis_id: user.id,
                    },
                ])
                .select();

            if (error) {
                throw error;
            }

            if (data) {
                // DIUBAH DI SINI:
                // Hook ini sekarang hanya bertanggung jawab untuk memberikan pesan,
                // bukan menampilkan alert. Tampilan ditangani oleh komponen.
                setSubmitSuccess('Artikel berhasil disimpan sebagai draft dan menunggu moderasi!');
                
                // Hapus navigasi otomatis dari sini. Biarkan komponen yang mengaturnya
                // setelah modal ditutup.
            }

        } catch (error) {
            console.error('Error submitting article:', error.message);
            setSubmitError(`Gagal menyimpan artikel: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        judul, setJudul,
        konten, setKonten,
        gambarUrl, setGambarUrl,
        isSubmitting,
        submitError,
        submitSuccess,
        handleSubmit,
    };
}
