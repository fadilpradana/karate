// src/hooks/useArticleForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * Custom hook untuk mengelola state form artikel dan logika pengirimannya.
 */
export function useArticleForm(user) {
    const navigate = useNavigate();

    const [judul, setJudul] = useState('');
    const [konten, setKonten] = useState(''); // Menggunakan 'konten' untuk konten artikel
    const [gambarUrl, setGambarUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!user || !user.id) {
            setSubmitError('ID pengguna tidak ditemukan. Harap login ulang.');
            setIsSubmitting(false);
            return;
        }

        // Validasi sisi klien sederhana
        if (!judul.trim()) {
            setSubmitError('Judul artikel tidak boleh kosong.');
            setIsSubmitting(false);
            return;
        }
        if (!konten.trim()) {
            setSubmitError('Konten artikel tidak boleh kosong.');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log("Mencoba kirim draft artikel dengan data:", {
                judul,
                deskripsi: konten,
                gambar_url: gambarUrl,
                penulis_id: user.id,
                // Kolom 'published' TIDAK DIBUTUHKAN di draft_artikel
            });

            // --- PERUBAHAN KRUSIAL: INSERT KE TABEL `draft_artikel` ---
            const { data, error } = await supabase
                .from('draft_artikel') // <-- Target tabel diubah ke draft_artikel
                .insert([
                    {
                        judul: judul,
                        deskripsi: konten,
                        gambar_url: gambarUrl,
                        penulis_id: user.id,
                        // 'published' tidak dikirim karena tidak ada di tabel draft_artikel
                    },
                ])
                .select(); // Tambahkan .select() untuk mendapatkan data yang baru dimasukkan jika diperlukan

            if (error) {
                console.error("Error saat membuat draft artikel:", error);
                setSubmitError(`Gagal membuat draft artikel: ${error.message || 'Terjadi kesalahan tidak diketahui.'} (Code: ${error.code || 'N/A'})`);
            } else {
                setSubmitSuccess(true);
                setJudul('');
                setKonten('');
                setGambarUrl('');
                console.log("Draft artikel berhasil dibuat:", data);
                // Ubah pesan sukses
                alert('Artikel berhasil disimpan sebagai draft dan menunggu moderasi!');
                setTimeout(() => {
                    navigate('/artikel'); // Kembali ke halaman daftar artikel atau dashboard
                }, 2000);
            }
        } catch (err) {
            console.error("Kesalahan tak terduga saat pembuatan draft artikel:", err);
            setSubmitError(`Terjadi kesalahan tak terduga: ${err.message || 'Silakan coba lagi.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        judul,
        setJudul,
        konten,
        setKonten,
        gambarUrl,
        setGambarUrl,
        isSubmitting,
        submitError,
        submitSuccess,
        handleSubmit,
    };
}