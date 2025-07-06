import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

// Impor Aset dan Ikon
import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';
import { User, Calendar, ArrowLeft } from 'lucide-react';

// Impor gaya untuk konten yang dibuat dengan Tiptap Editor
// Pastikan path ini benar sesuai struktur proyek Anda
import '../TiptapStyles.css';

export default function PengumumanDetail() {
    const { id } = useParams(); // Mengambil ID dari URL
    const [pengumuman, setPengumuman] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPengumumanDetail = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('pengumuman')
                .select(`
                    *, 
                    profiles!penulis_id (
                        nama_lengkap
                    )
                `)
                .eq('id', id)
                .single(); // Gunakan .single() karena kita hanya mengharapkan satu hasil

            if (error) {
                console.error("Error fetching detail pengumuman:", error);
                setError('Gagal memuat detail pengumuman. Mungkin tidak ditemukan.');
            } else {
                setPengumuman(data);
            }
            setLoading(false);
        };

        if (id) {
            fetchPengumumanDetail();
        }
    }, [id]);

    // Tampilan saat data sedang dimuat
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative z-10 text-lg">Memuat pengumuman...</div>
        </div>
    );
    
    // Tampilan jika terjadi error
    if (error) return (
        <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative z-10 text-lg text-red-400">{error}</div>
        </div>
    );

    // Tampilan jika pengumuman tidak ada
    if (!pengumuman) return (
        <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative z-10 text-lg">Pengumuman tidak ditemukan.</div>
        </div>
    );

    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ ease: "easeOut", duration: 0.6 }} 
                        className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg"
                    >
                        <Link 
                            to="/pengumuman" 
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm sm:text-base"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke semua pengumuman
                        </Link>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-[#FF9F1C]">
                            {pengumuman.judul}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 mt-4 mb-8 border-y border-white/10 py-4">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>Ditulis oleh {' '}
                                    <span className="font-semibold text-white">
                                        {pengumuman.profiles?.nama_lengkap || 'Admin'}
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>
                                    {new Date(pengumuman.published_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        
                        {/* Area untuk merender konten HTML dari Tiptap */}
                        <div
                            className="tiptap text-gray-200"
                            dangerouslySetInnerHTML={{ __html: pengumuman.konten }}
                        />

                    </motion.div>
                </main>

                <Footer />
            </div>
        </div>
    );
}