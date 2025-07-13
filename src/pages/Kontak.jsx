import { Mail, MapPin, Phone, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Footer from '../components/Footer';
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient.js"; 

export default function Kontak() {
    const [sukses, setSukses] = useState(false);
    const formRef = useRef(null);

    const [humasContacts, setHumasContacts] = useState([]);
    const [currentHumasIndex, setCurrentHumasIndex] = useState(0);
    const [loadingHumas, setLoadingHumas] = useState(true);

    useEffect(() => {
        const fetchHumasContacts = async () => {
            setLoadingHumas(true);
            try {
                const { data: activePeriod, error: periodError } = await supabase
                    .from('periode_kepengurusan')
                    .select('id')
                    .eq('sedang_berjalan', true)
                    .single();

                if (periodError || !activePeriod) {
                    throw new Error('Tidak ada periode kepengurusan aktif yang ditemukan.');
                }

                const { data: humasData, error: humasError } = await supabase
                    .from('jabatan_pengurus')
                    .select('profiles(nama_lengkap, nomor_telepon)')
                    .eq('id_periode', activePeriod.id)
                    .eq('jabatan', 'Hubungan Masyarakat');

                if (humasError) throw humasError;

                const validContacts = humasData
                    .map(item => ({
                        nama: item.profiles.nama_lengkap,
                        telepon: item.profiles.nomor_telepon
                    }))
                    .filter(contact => contact.telepon);

                setHumasContacts(validContacts);

            } catch (error) {
                console.error("Gagal mengambil data Humas:", error.message);
                setHumasContacts([]);
            } finally {
                setLoadingHumas(false);
            }
        };

        fetchHumasContacts();
    }, []);

    useEffect(() => {
        if (humasContacts.length > 1) {
            const timer = setInterval(() => {
                setCurrentHumasIndex(prevIndex => (prevIndex + 1) % humasContacts.length);
            }, 8000);

            return () => clearInterval(timer);
        }
    }, [humasContacts.length]);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    const sectionTitleVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
    const cardVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };
    
    const phoneVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    const glassmorphismStyle = { backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`, borderRadius: '0.8rem', transition: 'all 0.3s ease-in-out' };
    const glassmorphismHoverStyle = (e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'; e.currentTarget.style.boxShadow = `0px 2px 5px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.4)`; };
    const glassmorphismLeaveStyle = (e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; e.currentTarget.style.boxShadow = `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`; };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(formRef.current);
        const nama = formData.get("nama");
        const hp = formData.get("hp");
        const pesan = formData.get("pesan");

        try {
            const { error } = await supabase.functions.invoke('send-telegram-kontak', {
                body: { nama, hp, pesan },
            });

            if (error) { throw error; }
            
            setSukses(true);
            formRef.current.reset();
            setTimeout(() => setSukses(false), 5000);

        } catch (error) {
            console.error("Error memanggil Edge Function:", error.message);
            alert("Gagal mengirim pesan. Silakan coba lagi nanti.");
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen text-white overflow-x-hidden flex flex-col background-mobile md:background-desktop"
        >
            <section className="pt-24 pb-16 px-4 md:px-16 text-center flex-grow flex flex-col justify-center items-center relative z-40">
                <motion.h1
                    className="text-4xl md:text-6xl font-league font-semibold uppercase tracking-wide mb-10 text-accent"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    Hubungi Kami
                </motion.h1>

                <motion.div
                    className="grid md:grid-cols-2 gap-6 max-w-4xl w-full mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Card Info Kontak */}
                    <motion.div
                        className="p-5 rounded-xl flex flex-col justify-start"
                        style={glassmorphismStyle}
                        onMouseEnter={glassmorphismHoverStyle}
                        onMouseLeave={glassmorphismLeaveStyle}
                        variants={cardVariants}
                    >
                        <h2 className="text-2xl md:text-3xl font-league uppercase text-white mb-4 md:mt-2">Informasi Dojo</h2>
                        <motion.div variants={itemVariants} className="space-y-3 text-left font-[Montserrat] text-[#e7e7e7] flex flex-col justify-evenly h-full md:block">
                            <div className="flex items-start gap-3 text-base md:text-lg">
                                <MapPin className="text-[#FF9F1C] w-6 h-6 flex-shrink-0 mt-1" />
                                <p>Jl. Meteorologi No. 5, Tanah Tinggi, Kec. Tangerang, Kota Tangerang, Banten</p>
                            </div>
                            <p className="flex items-center gap-3 text-base md:text-lg">
                                <Mail className="text-[#FF9F1C] w-5 h-5" />
                                karate@stmkg.ac.id
                            </p>
                            
                            {/* --- PERUBAHAN DI SINI --- */}
                            <div className="flex items-start gap-3 text-base md:text-lg min-h-[28px]">
                                <Phone className="text-[#FF9F1C] w-5 h-5 flex-shrink-0 mt-1" />
                                {loadingHumas ? (
                                    <span className="text-gray-400">Memuat kontak...</span>
                                ) : humasContacts.length > 0 ? (
                                    <AnimatePresence mode="wait">
                                        <motion.a
                                            key={currentHumasIndex}
                                            href={`https://wa.me/${humasContacts[currentHumasIndex].telepon.replace(/^0/, '62')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[#FF9F1C] transition-colors duration-200"
                                            variants={phoneVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                        >
                                            <p className="flex flex-col md:flex-row md:items-baseline">
                                                {humasContacts[currentHumasIndex].telepon}
                                                <span className="text-gray-400 text-xs md:ml-2">
                                                    {humasContacts[currentHumasIndex].nama}
                                                </span>
                                            </p>
                                        </motion.a>
                                    </AnimatePresence>
                                ) : (
                                    <span>Kontak Humas tidak tersedia</span>
                                )}
                            </div>
                            
                            <a
                                href="https://www.instagram.com/karate.stmkg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-base md:text-lg hover:text-[#FF9F1C] transition-colors duration-200"
                            >
                                <Instagram className="text-[#FF9F1C] w-5 h-5" />
                                @karate.stmkg
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Formulir Kirim Pesan */}
                    <motion.div
                        className="p-6 rounded-2xl w-full space-y-5"
                        style={glassmorphismStyle}
                        onMouseEnter={glassmorphismHoverStyle}
                        onMouseLeave={glassmorphismLeaveStyle}
                        variants={cardVariants}
                        transition={{ ...cardVariants.visible.transition, delay: 0.3 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-league uppercase text-white mb-3">Kirim Pesan</h2>
                        <form
                            ref={formRef}
                            onSubmit={handleSubmit}
                            className="space-y-3"
                        >
                            <input type="text" name="nama" placeholder="Nama kamu..." required className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm" style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }}/>
                            <input type="tel" name="hp" placeholder="Nomor HP kamu..." required className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm" style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }}/>
                            <textarea name="pesan" placeholder="Pesan kamu..." required rows="3" className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm" style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }} ></textarea>
                            <button
                                type="submit"
                                className="inline-block mt-2 px-4 py-2 font-semibold rounded-lg text-xs text-white"
                                style={{ ...glassmorphismStyle, borderRadius: '0.6rem', boxShadow: `0px 2px 5px rgba(0, 0, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.13), inset -1px -1px 2px rgba(0, 0, 0, 0.25)`, color: '#e7e7e7' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                    e.currentTarget.style.boxShadow = `0 0 20px rgba(42, 20, 54, 0.8), 0px 2px 5px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.4)`;
                                    e.currentTarget.style.color = '#FF9F1C';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    e.currentTarget.style.boxShadow = `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`;
                                    e.currentTarget.style.color = '#e7e7e7';
                                }}
                            >
                                Kirim Pesan
                            </button>
                        </form>

                        {sukses && (
                            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-green-300 mt-3 font-[Montserrat] text-sm" >
                                🎉 Pesan kamu berhasil dikirim! Terima kasih sudah menghubungi kami.
                            </motion.p>
                        )}
                    </motion.div>
                </motion.div>

                <motion.div
                    className="rounded-xl overflow-hidden shadow-md max-w-4xl w-full p-4"
                    style={glassmorphismStyle}
                    onMouseEnter={glassmorphismHoverStyle}
                    onMouseLeave={glassmorphismLeaveStyle}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...cardVariants.visible.transition, delay: 0.6 }}
                >
                    <iframe
                        title="Lokasi Dojo"
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3966.6915280279854!2d106.6442658!3d-6.1720406!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f05e4e6d1c27%3A0x8f19299fa86d971f!2sSekolah%20Tinggi%20Meteorologi%20Klimatologi%20dan%20Geofisika%20(STMKG)!5e0!3m2!1sid!2sid!4v1751900924599!5m2!1sid!2sid"
                        width="100%"
                        height="300"
                        className="w-full border-none rounded-md"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </motion.div>
            </section>

            <Footer />

        </motion.main>
    );
}
