import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';
import { User, Calendar, ArrowLeft } from 'lucide-react';

// Impor file CSS Tiptap yang sudah final
import '../TiptapStyles.css';

export default function ArtikelDetail() {
    const { id } = useParams();
    const [artikel, setArtikel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArtikelDetail = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('artikel')
                .select(`*, profiles!penulis_id (username, nama_lengkap)`)
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching detail artikel:", error);
                setError('Gagal memuat detail artikel.');
            } else {
                setArtikel(data);
            }
            setLoading(false);
        };

        if (id) {
            fetchArtikelDetail();
        }
    }, [id]);

    const handleAuthorClick = (authorUsername) => {
        if (authorUsername) {
            navigate(`/artikel?author=${encodeURIComponent(authorUsername)}`);
        }
    };

    if (loading) return ( <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}> <div className="absolute inset-0 bg-black opacity-70"></div> <div className="relative z-10 text-lg">Memuat artikel...</div> </div> );
    if (error) return ( <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}> <div className="absolute inset-0 bg-black opacity-70"></div> <div className="relative z-10 text-lg text-red-400">{error}</div> </div> );
    if (!artikel) return ( <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}> <div className="absolute inset-0 bg-black opacity-70"></div> <div className="relative z-10 text-lg">Artikel tidak ditemukan.</div> </div> );

    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <div className="absolute inset-0 bg-black opacity-70"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut", duration: 0.6 }} className="max-w-4xl mx-auto">
                        <Link to="/artikel" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm sm:text-base">
                            <ArrowLeft size={16} />
                            Kembali ke semua artikel
                        </Link>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">{artikel.judul}</h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-400 mt-4 mb-8 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <User size={14} sm:size={16} />
                                <span>Ditulis oleh {' '}
                                    <button onClick={() => handleAuthorClick(artikel.profiles?.username)} className="text-white hover:text-[#FF9F1C] font-semibold cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] focus:ring-opacity-50">
                                        {artikel.profiles?.nama_lengkap || 'Anonim'}
                                    </button>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} sm:size={16} />
                                <span>{new Date(artikel.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        {artikel.gambar_url && (
                            <div className="w-full mb-8 flex justify-center">
                                <img src={artikel.gambar_url} alt={artikel.judul} className="max-w-full h-auto rounded-2xl shadow-lg" />
                            </div>
                        )}
                        
                        {/* [PERBAIKAN] Kelas 'text-justify' dihapus dari div ini */}
                        <div
                            className="tiptap text-gray-300"
                            dangerouslySetInnerHTML={{ __html: artikel.deskripsi }}
                        />

                    </motion.div>
                </main>
                <Footer />
            </div>
        </div>
    );
}