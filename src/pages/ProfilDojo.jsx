import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { LoaderCircle, AlertTriangle, CheckCircle, X, Edit, Trash2, Plus, ChevronDown, Save, ShieldCheck, ArrowLeft, Settings, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// --- Import Supabase Client (sesuaikan dengan proyek Anda) ---
// Pastikan path ini benar sesuai dengan struktur proyek Anda
import { supabase } from '../supabaseClient.js';

// --- Import Aset ---
import Footer from '../components/Footer'; // Pastikan komponen Footer ada
import favicon from '../assets/logo_bintangcompress.png';
import heroBg from '../assets/bg12.jpg';
import logoBintang from '../assets/logo_bintangcompress.png';
import brevet from '../assets/brevet.png';
// *** NEW *** Impor logo tambahan
import logoResimen from '../assets/logo_resimen.png';
import logoStmkg from '../assets/logo_stmkg.png';
import logoBmkg from '../assets/logobmkglight.png';


// --- Data Statis ---
const profilData = {
    about: {
        title: "Tentang Kami",
        history: "STMKG Karate Club, sebuah wadah pembinaan penguasaan bela diri dan karakter yang berdedikasi tinggi bagi para Taruna dan Taruni. Awal berdirinya organisasi ini didirikan atas inisiatif Bapak Dr. Ir. Suko Adi Prayitno, M.Si., M.I.Kom. STMKG Karate Club beroperasi di bawah naungan Komandan Batalyon 2 Resimen Taruna STMKG, dengan Komandan Karate sebagai pimpinan tertinggi di dalam organisasi. Saat ini, pembinaan diberikan oleh Pembina Ayu Adi Justicea S.T., S.ST., M.App.Sc. Dengan semangat yang membara serta visi kuat untuk mencetak Taruna dan Taruni yang tak hanya tangguh secara fisik namun juga disiplin tinggi serta menguasai seni bela diri karate yang autentik, STMKG Karate Club menjadi pilar fundamental dalam pengembangan potensi holistik setiap Taruna. Kami berkomitmen menanamkan nilai-nilai karate seperti kehormatan, integritas, dan ketekunan, yang membentuk individu bermental kuat dan siap menghadapi berbagai tantangan baik di lingkungan kampus maupun dalam kehidupan bermasyarakat.",
    },
    sumpahKarate: [
        "1. Sanggup memelihara kepribadian;",
        "2. Sanggup patuh pada kejujuran;",
        "3. Sanggup mempertinggi prestasi;",
        "4. Sanggup menjaga sopan santun;",
        "5. Sanggup menguasai diri.",
    ]
};

const logoPhilosophies = [
    { term: "Bintang Prestasi", description: "Melambangkan pencapaian luar biasa dalam perlombaan karate. Setiap satu bintang mewakili lima medali emas yang diraih oleh karateka STMKG pada tingkat nasional." },
    { term: "Lingkaran", description: "Melambangkan kebulatan tekad dan semangat karateka dalam melaksanakan aktivitasnya di bidang karate." },
    { term: "Arah Mata Angin", description: "Melambangkan arah dan tujuan yang ingin dicapai." },
    { term: "Merah", description: "Melambangkan keberanian akan sebuah tindakan." },
    { term: "Kuning", description: "Melambangkan kreativitas." },
    { term: "Biru", description: "Melambangkan tanggungjawab dan bisa diandalkan." },
    { term: "Tulisan Warna Hitam", description: "Melambangkan kekuasaan karateka yang harus sanggup menguasai diri sesuai dengan sumpah karate yang kelima." },
    { term: "Putih", description: "Melambangkan ketulusan dan saling menghargai." }
];

const brevetPhilosophies = [
    { term: "Lingkaran", description: "Sebagai bentuk kewaspadaan seorang karateka, mengembangkan rasa empati, dan simpati." },
    { term: "Arah Mata Angin", description: "Melambangkan arah dan tujuan yang ingin dicapai, serta menandakan naungan Sekolah Tinggi Meteorologi Klimatologi dan Geofisika." },
    { term: "Dua Tate Zuki", description: "Pukulan mengepal setengah terbalik dan pukulan ke arah kepala, melambangkan tekad, semangat, dan kemauan kuat seorang Taruna/i untuk berlatih." },
    { term: "Dua Tangan Nukite", description: "Serangan dengan tangan seperti tombak, melambangkan perjuangan sensei dan senpai terdahulu karena tombak merupakan senjata tradisional." },
    { term: "Dua Sayap (6 Bulu)", description: "Perwujudan STMKG Karate sebagai organisasi dinamis. Enam bulu menunjukkan jumlah warna sabuk di karate dan semangat membangun prestasi." },
    { term: "STMKG KARATE CLUB", description: "Wadah latihan fisik, mental baja, dan penempaan diri dengan penuh kesadaran, itikad baik, serta tanggung jawab terhadap cita-cita Bangsa." }
];


// --- Komponen & Style Helper ---
const glassEffect = "bg-black/20 backdrop-blur-lg border border-white/10 shadow-lg";

const Toast = ({ message, type, onClose }) => {
    const isError = type === 'error';
    const Icon = isError ? AlertTriangle : CheckCircle;
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 100 }} className={`fixed bottom-5 right-5 flex items-center gap-4 p-4 rounded-lg shadow-xl z-50 ${glassEffect} ${isError ? 'border-red-500/50' : 'border-green-500/50'}`}>
            <Icon className={`h-6 w-6 ${isError ? 'text-red-400' : 'text-green-400'}`} />
            <p className="text-white font-[Montserrat]">{message}</p>
            <button onClick={onClose} className="ml-4 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
        </motion.div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`p-8 shadow-xl max-w-sm mx-auto text-center ${glassEffect} rounded-2xl`}>
                    <p className="text-white text-lg mb-6 font-[Montserrat]">{message}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onClose} className={`px-4 py-2 ${glassEffect} rounded-lg text-white/90 hover:bg-white/10 transition-all`}>Batal</button>
                        <button onClick={onConfirm} className={`px-4 py-2 ${glassEffect} rounded-lg text-green-400 hover:bg-green-500/20 transition-all`}>Konfirmasi</button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// --- Framer Motion Variants ---
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12,
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 15,
        },
    },
};

const formContainerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5, ease: 'easeInOut' } }
};

// --- Komponen Utama ---
export default function ProfilDojo() {
    // --- State Management ---
    const [allVisi, setAllVisi] = useState([]);
    const [activeVisi, setActiveVisi] = useState(null);
    const [misiList, setMisiList] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isVisiMisiEditMode, setIsVisiMisiEditMode] = useState(false);
    const [isAdminPeriodeMode, setIsAdminPeriodeMode] = useState(false);
    const [isTestimonialAdminOpen, setIsTestimonialAdminOpen] = useState(false);
    
    // State untuk form
    const [visiInput, setVisiInput] = useState("");
    const [editingMisi, setEditingMisi] = useState({});
    const [newMissionInput, setNewMissionInput] = useState("");
    const [newTahun, setNewTahun] = useState((new Date().getFullYear() + 1).toString());
    const [newVisiText, setNewVisiText] = useState("");
    const [newMisiText, setNewMisiText] = useState("");

    // State untuk UI
    const [modalState, setModalState] = useState({ isOpen: false, message: '', onConfirm: () => {} });
    const [toastState, setToastState] = useState({ isOpen: false, message: '', type: 'success' });

    // State untuk Testimonial Carousel
    const [activeIndex, setActiveIndex] = useState(0);
    const [carouselHeight, setCarouselHeight] = useState(450); // State untuk tinggi carousel dinamis
    const cardRefs = useRef([]); // Refs untuk kartu testimoni

    // --- Hooks untuk Animasi Scroll ---
    const scrollContainerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start start", "end end"]
    });

    // --- Transformasi Animasi Berbasis Scroll ---
    const hero1Scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.01]);
    const hero1Opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const hero2Scale = useTransform(scrollYProgress, [0.1, 0.15, 0.2, 0.25], [0.5, 1, 1, 0.01]);
    const hero2Opacity = useTransform(scrollYProgress, [0.1, 0.15, 0.2, 0.25], [0, 1, 1, 0]);
    const mainContentOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
    const mainContentY = useTransform(scrollYProgress, [0.2, 0.3], [100, 0]);

    // --- Helper Functions ---
    const showToast = useCallback((message, type = 'success') => {
        setToastState({ isOpen: true, message, type });
    }, []);

    const openModal = (message, onConfirm) => {
        setModalState({ isOpen: true, message, onConfirm });
    };

    // --- Data Fetching & Auth ---
    const fetchAndSetData = useCallback(async () => {
        // Fetch Visi & Misi
        const { data: visiData, error: visiError } = await supabase.from('visi').select('*').order('tahun_periode', { ascending: false });
        if (visiError) {
            console.error("Error fetching Visi:", visiError);
            setError(`Gagal mengambil data Visi: ${visiError.message}.`);
            return;
        }
        setAllVisi(visiData);
        const currentActiveVisi = visiData.find(v => v.is_active) || (visiData.length > 0 ? visiData[0] : null);
        setActiveVisi(currentActiveVisi);
        if (currentActiveVisi) {
            const { data: misiData, error: misiError } = await supabase.from('misi').select('*').eq('visi_id', currentActiveVisi.id).order('id', { ascending: true });
            if (misiError) {
                 console.error("Error fetching Misi:", misiError);
                 setError(`Gagal mengambil data Misi: ${misiError.message}.`);
            } else {
                 setMisiList(misiData || []);
                 setVisiInput(currentActiveVisi.teks_visi);
            }
        } else {
            setMisiList([]);
            setVisiInput("");
        }

        // Fetch Testimonials
        const { data: testimonialsData, error: testimonialsError } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (testimonialsError) {
            console.error("Error fetching testimonials:", testimonialsError);
            setError(prev => `${prev}\n Gagal mengambil data testimoni: ${testimonialsError.message}.`);
        } else {
            const testimonialsWithUrls = testimonialsData.map(t => {
                if (t.image_path) {
                    const { data } = supabase.storage.from('testimonial_images').getPublicUrl(t.image_path);
                    return { ...t, image_url: data.publicUrl };
                }
                return { ...t, image_url: null };
            });
            setTestimonials(testimonialsWithUrls);
        }
    }, []);

    const checkUserRole = useCallback(async (user) => {
        if (user) {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profileError) {
                console.error('Error fetching user profile for role check:', profileError.message);
                setUserRole(null);
            } else if (profileData) {
                setUserRole(profileData.role);
            } else {
                setUserRole(null);
            }
        } else {
            setUserRole(null);
        }
    }, []);

    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            await checkUserRole(session?.user);
            await fetchAndSetData();
            setIsLoading(false);
        };
        
        initializePage();
        
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            checkUserRole(session?.user);
        });
        
        const channel = supabase.channel('profil-dojo-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'visi' }, fetchAndSetData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'misi' }, fetchAndSetData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchAndSetData)
            .subscribe();
            
        return () => {
            authListener.subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [fetchAndSetData, checkUserRole]);

    // Timer untuk auto-slide carousel
    useEffect(() => {
        if (testimonials.length > 1) {
            const timer = setInterval(() => {
                setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
            }, 10000); // Ganti setiap 10 detik

            return () => clearInterval(timer);
        }
    }, [testimonials.length, activeIndex]);

    // Mengatur ulang array refs ketika data testimoni berubah
    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, testimonials.length);
    }, [testimonials]);

    // Mengukur tinggi kartu aktif dan mengatur tinggi container
    useEffect(() => {
        const activeCard = cardRefs.current[activeIndex];
        if (activeCard) {
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const newHeight = entry.contentRect.height;
                    // Menambah sedikit margin dan memastikan ada tinggi minimal
                    setCarouselHeight(newHeight > 0 ? newHeight + 20 : 450);
                }
            });
            observer.observe(activeCard);
            return () => observer.disconnect();
        }
    }, [activeIndex, testimonials]);


    // --- Carousel Navigation Handlers ---
    const nextTestimonial = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };
    
    const handleDragEnd = (event, info) => {
        const swipeThreshold = 50;
        if (info.offset.x < -swipeThreshold) {
            nextTestimonial();
        } else if (info.offset.x > swipeThreshold) {
            prevTestimonial();
        }
    };


    // --- Admin Action Handlers ---
    const handleUpdateVisi = async () => {
        if (!activeVisi || visiInput === activeVisi.teks_visi) return;
        const { error } = await supabase.from('visi').update({ teks_visi: visiInput }).eq('id', activeVisi.id);
        if (error) { showToast(`Gagal: ${error.message}`, "error"); }
        else {
            showToast("Visi berhasil diperbarui.");
            await fetchAndSetData();
        }
    };

    const handleUpdateMisi = async (misiId) => {
        const newText = editingMisi[misiId];
        if (!newText) return;
        const { error } = await supabase.from('misi').update({ teks_misi: newText }).eq('id', misiId);
        if (error) { showToast(`Gagal: ${error.message}`, "error"); }
        else {
            showToast("Misi berhasil diperbarui.");
            setEditingMisi(prev => ({ ...prev, [misiId]: undefined }));
            await fetchAndSetData();
        }
    };

    const handleAddMisi = async (e) => {
        e.preventDefault();
        if (newMissionInput.trim() === "" || !activeVisi) return;
        const { error } = await supabase.from('misi').insert({ visi_id: activeVisi.id, teks_misi: newMissionInput.trim() });
        if (error) { showToast(`Gagal: ${error.message}`, "error"); }
        else {
            showToast("Misi baru berhasil ditambahkan.");
            setNewMissionInput("");
            await fetchAndSetData();
        }
    };

    const handleDeleteMisi = (misi) => {
        openModal(`Yakin ingin menghapus misi: "${misi.teks_misi}"?`, async () => {
            const { error } = await supabase.from('misi').delete().eq('id', misi.id);
            if (error) { showToast(`Gagal: ${error.message}`, "error"); }
            else {
                showToast("Misi berhasil dihapus.");
                await fetchAndSetData();
            }
            setModalState({ isOpen: false });
        });
    };

    const handleCreatePackage = () => {
        openModal(`Anda akan membuat paket baru untuk tahun ${newTahun}. Lanjutkan?`, async () => {
            const misiLines = newMisiText.split('\n').filter(line => line.trim() !== '');
            if (!newTahun || !newVisiText || misiLines.length === 0) {
                showToast("Harap isi semua kolom untuk paket baru.", "error");
                setModalState({ isOpen: false });
                return;
            }
            const { error: rpcError } = await supabase.rpc('create_new_visi_package', { p_tahun: parseInt(newTahun), p_visi_text: newVisiText, p_misi_texts: misiLines });
            if (rpcError) { showToast(`Gagal membuat paket: ${rpcError.message}`, "error"); }
            else {
                showToast("Paket Visi & Misi baru berhasil dibuat!");
                setNewTahun((new Date().getFullYear() + 1).toString());
                setNewVisiText("");
                setNewMisiText("");
                await fetchAndSetData();
            }
            setModalState({ isOpen: false });
        });
    };

    const handleActivateVisi = (visiId) => {
        openModal(`Anda akan mengaktifkan Visi ini. Visi lain akan dinonaktifkan. Lanjutkan?`, async () => {
            const { error } = await supabase.rpc('set_active_visi', { p_visi_id: visiId });
            if (error) { showToast(`Gagal mengaktifkan Visi: ${error.message}`, "error"); }
            else {
                showToast("Visi berhasil diaktifkan.");
                await fetchAndSetData();
            }
            setModalState({ isOpen: false });
        });
    };

    const handleDeleteVisiPackage = (visiId, tahunPeriode) => {
        openModal(`Yakin ingin menghapus seluruh paket untuk periode ${tahunPeriode}? Tindakan ini tidak dapat dibatalkan.`, async () => {
            const { error } = await supabase.rpc('delete_visi_package', { p_visi_id: visiId });
            if (error) { showToast(`Gagal menghapus paket: ${error.message}`, "error"); }
            else {
                showToast(`Paket periode ${tahunPeriode} berhasil dihapus.`);
                await fetchAndSetData();
            }
            setModalState({ isOpen: false });
        });
    };

    return (
        <div className="relative text-white bg-[#0E0004]">
            <Helmet>
                <title>Profil - STMKG Karate Club</title>
                <meta name="description" content="Pelajari tentang sejarah, Sumpah Karate, visi, misi, dan filosofi logo STMKG Karate Club serta brevet STMKG Karate Club. Kenali lebih dalam tentang semangat dan dedikasi kami." />
                <meta name="keywords" content="profil dojo, sejarah karate, sumpah karate, visi misi, stmkg karate club, filosofi logo" />
                <meta property="og:title" content="Profil & Visi Misi | STMKG Karate Club" />
                <meta property="og:description" content="Kenali lebih dalam tentang sejarah, Sumpah Karate, dan visi misi STMKG Karate Club." />
                <meta property="og:image" content={logoBintang} />
                <meta property="og:url" content="https://karate.stmkg.ac.id/profil" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://karate.stmkg.ac.id/profil" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
            </Helmet>
            <motion.div
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <div className="fixed inset-0 z-0 bg-black/20"></div>
            <ConfirmModal {...modalState} onClose={() => setModalState({ isOpen: false })} />
            <AnimatePresence>{toastState.isOpen && <Toast {...toastState} onClose={() => setToastState({ isOpen: false })} />}</AnimatePresence>
            {isTestimonialAdminOpen && <TestimonialAdminModal testimonials={testimonials} onDataChange={fetchAndSetData} onClose={() => setIsTestimonialAdminOpen(false)} showToast={showToast} />}

            <div ref={scrollContainerRef} className="relative z-10 w-full">
                <div className="h-[500vh]">
                    <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} style={{ scale: hero1Scale, opacity: hero1Opacity }} className="text-center p-4 absolute">
                            <h1 className="text-4xl md:text-8xl font-league uppercase text-accent battery-style-gradient">TENTANG KAMI</h1>
                            <p className="text-lg md:text-xl text-white/70 mt-2 font-[Montserrat]">STMKG Karate Club</p>
                        </motion.div>
                        <motion.div style={{ scale: hero2Scale, opacity: hero2Opacity }} className="text-center p-4 absolute">
                            <div className={`${glassEffect} rounded-2xl p-6 md:p-8`}>
                                <h2 className="text-3xl md:text-5xl font-league uppercase mb-8 text-center text-accent">Sumpah Karate</h2>
                                <div className="max-w-md mx-auto space-y-4">
                                    {profilData.sumpahKarate.map((sumpah, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <p className="text-lg font-[Montserrat] text-white/90">{sumpah}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div style={{ opacity: mainContentOpacity, y: mainContentY }} className="relative w-full -mt-[200vh] z-20">
                    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
                        {isLoading ? (
                            <div className="flex-grow flex justify-center items-center py-20"><LoaderCircle className="animate-spin h-12 w-12 text-accent" /></div>
                        ) : (
                            <div className="space-y-16">
                                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants} className={`${glassEffect} rounded-2xl p-6 md:p-8`}>
                                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                        <motion.div variants={itemVariants} className="text-left">
                                            <h3 className="text-xl md:text-3xl font-league uppercase mb-4 text-accent">Sejarah Singkat</h3>
                                            <p className="text-base text-white/80 font-[Montserrat] font-light leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: profilData.about.history }}></p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="text-left relative">
                                            {error ? (
                                                <div className="text-center text-red-400 p-4"><AlertTriangle className="mx-auto h-8 w-8 mb-2" /><p className="font-bold text-lg">Terjadi Kesalahan</p><p className="font-[Montserrat] text-sm mt-1">{error}</p></div>
                                            ) : (
                                                <AnimatePresence mode="wait">
                                                    {isVisiMisiEditMode ? (
                                                        <motion.div key="edit" variants={formContainerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                                            <button onClick={() => setIsVisiMisiEditMode(false)} className="flex items-center gap-2 text-sm text-accent mb-4"><ArrowLeft size={16} /> Kembali</button>
                                                            <div>
                                                                <label className="block text-2xl uppercase font-league text-accent mb-1">Visi Aktif ({activeVisi?.tahun_periode})</label>
                                                                <textarea value={visiInput} onChange={(e) => setVisiInput(e.target.value)} rows="4" className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`}></textarea>
                                                                <button onClick={handleUpdateVisi} className={`mt-2 w-full py-2 px-4 ${glassEffect} text-accent rounded-lg hover:bg-accent/20 transition-all flex items-center justify-center gap-2`}>
                                                                    <Save size={16} /> Simpan Visi
                                                                </button>
                                                            </div>
                                                            <hr className="border-white/10" />
                                                            <div>
                                                                <h4 className="text-2xl font-league text-accent uppercase mb-2">Misi Aktif</h4>
                                                                <div className="space-y-2">
                                                                    {misiList.map(m => (
                                                                        <div key={m.id} className="flex items-center gap-2">
                                                                            <input type="text" value={editingMisi[m.id] !== undefined ? editingMisi[m.id] : m.teks_misi} onChange={(e) => setEditingMisi(prev => ({...prev, [m.id]: e.target.value}))} className={`flex-1 p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} />
                                                                            <button onClick={() => handleUpdateMisi(m.id)} className="p-2 text-white/70 hover:text-accent"><Save size={16} /></button>
                                                                            <button onClick={() => handleDeleteMisi(m)} className="p-2 text-white/70 hover:text-red-400"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <form onSubmit={handleAddMisi}>
                                                                <input type="text" value={newMissionInput} onChange={(e) => setNewMissionInput(e.target.value)} placeholder="Tambah misi baru..." className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} />
                                                                <button type="submit" className={`mt-2 w-full py-2 px-4 ${glassEffect} text-accent rounded-lg hover:bg-accent/20 transition-all`}>
                                                                    <Plus size={16} className="inline mr-2" /> Tambah Misi
                                                                </button>
                                                            </form>
                                                        </motion.div>
                                                    ) : isAdminPeriodeMode ? (
                                                         <motion.div key="admin-periode" variants={formContainerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                                            <button onClick={() => setIsAdminPeriodeMode(false)} className="flex items-center gap-2 text-sm text-accent mb-4"><ArrowLeft size={16} /> Kembali</button>
                                                            <div className="space-y-4">
                                                                <h4 className="text-2xl uppercase font-league text-accent">Kelola Periode Visi & Misi</h4>
                                                                {allVisi.map(v => (
                                                                    <div key={v.id} className={`p-3 rounded-lg flex items-center justify-between ${glassEffect} ${v.is_active ? 'border-accent' : 'border-transparent'} border`}>
                                                                        <span className="font-semibold">{v.tahun_periode} {v.is_active && "(Aktif)"}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            {!v.is_active && <button onClick={() => handleActivateVisi(v.id)} className="p-2 text-white/70 hover:text-accent"><ShieldCheck size={16} /></button>}
                                                                            {!v.is_active && <button onClick={() => handleDeleteVisiPackage(v.id, v.tahun_periode)} className="p-2 text-white/70 hover:text-red-400"><Trash2 size={16} /></button>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <hr className="border-white/10" />
                                                            <div>
                                                                <h4 className="text-2xl uppercase font-league text-accent mb-2">Buat Paket Baru</h4>
                                                                <div className="space-y-2">
                                                                    <input type="number" value={newTahun} onChange={e => setNewTahun(e.target.value)} placeholder="Tahun Periode" className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} />
                                                                    <textarea value={newVisiText} onChange={e => setNewVisiText(e.target.value)} placeholder="Teks Visi" rows="3" className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`}></textarea>
                                                                    <textarea value={newMisiText} onChange={e => setNewMisiText(e.target.value)} placeholder="Teks Misi (satu per baris)" rows="5" className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`}></textarea>
                                                                    <button onClick={handleCreatePackage} className={`w-full py-2 px-4 ${glassEffect} text-accent rounded-lg hover:bg-accent/20 transition-all`}>
                                                                        <Plus size={16} className="inline mr-2" /> Buat Paket Baru
                                                                    </button>
                                                                </div>
                                                            </div>
                                                         </motion.div>
                                                    ) : (
                                                        <motion.div key="display" variants={formContainerVariants} initial="hidden" animate="visible" exit="exit">
                                                            <h3 className="text-xl md:text-3xl font-league uppercase text-accent mb-4">VISI</h3>
                                                            <p className="text-base text-white/80 font-[Montserrat] font-light leading-relaxed text-justify">{activeVisi?.teks_visi || "Visi belum ditetapkan."}</p>
                                                            <h3 className="text-xl md:text-3xl font-league uppercase text-accent mt-8 mb-4">MISI</h3>
                                                            <ul className="space-y-3">
                                                                {misiList.length > 0 ? misiList.map(m => (<li key={m.id} className="flex items-start"><span className="text-accent mr-3 mt-1">&#9679;</span><span className="text-white/80 flex-1 font-[Montserrat] font-light">{m.teks_misi}</span></li>)) : <li className="text-white/60 font-[Montserrat]">Misi untuk periode ini belum ditetapkan.</li>}
                                                            </ul>
                                                            {userRole === 'admin' && activeVisi && (
                                                                <div className="mt-8 flex flex-col sm:flex-row gap-2">
                                                                    <button onClick={() => setIsVisiMisiEditMode(true)} className={`flex-1 py-2 px-4 ${glassEffect} border-accent/50 border text-accent rounded-lg hover:bg-accent/20 transition-all flex items-center justify-center gap-2`}>
                                                                        <Edit size={16} /> Edit Visi & Misi Aktif
                                                                    </button>
                                                                     <button onClick={() => setIsAdminPeriodeMode(true)} className={`flex-1 py-2 px-4 ${glassEffect} border-gray-500/50 border text-gray-300 rounded-lg hover:bg-gray-500/20 transition-all flex items-center justify-center gap-2`}>
                                                                        <Settings size={16} /> Admin Periode
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.section>

                                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants} className="py-8">
                                    <h2 className="text-3xl md:text-5xl font-league uppercase mb-12 text-center text-accent">Filosofi Logo</h2>
                                    <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${glassEffect} p-4 md:p-6 rounded-2xl`}>
                                        <motion.div variants={itemVariants} className="flex justify-center">
                                            <img src={logoBintang} alt="Logo STMKG Karate Club" className="max-w-[14rem] w-full h-auto rounded-lg"/>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="space-y-3">
                                            {logoPhilosophies.map((item) => (
                                                <div key={item.term}>
                                                    <h4 className="font-bold battery-style-gradient font-[Montserrat] text-sm">{item.term}</h4>
                                                    <p className="text-white/80 font-[Montserrat] font-light text-sm">{item.description}</p>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.section>

                                <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants} className="py-8">
                                    <h2 className="text-3xl md:text-5xl font-league uppercase mb-12 text-center text-accent">Filosofi Brevet</h2>
                                    <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${glassEffect} p-4 md:p-6 rounded-2xl`}>
                                        <motion.div variants={itemVariants} className="space-y-4 md:order-2 flex justify-center">
                                            <img src={brevet} alt="Brevet STMKG Karate Club" className="max-w-[16rem] w-full h-auto rounded-lg"/>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="space-y-3 md:order-1">
                                            {brevetPhilosophies.map((item) => (
                                                <div key={item.term}>
                                                    <h4 className="font-bold battery-style-gradient font-[Montserrat] text-sm">{item.term}</h4>
                                                    <p className="text-white/80 font-[Montserrat] font-light text-sm leading-relaxed">{item.description}</p>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.section>
                                
                                {/* --- START: REVISED TESTIMONIAL SECTION --- */}
                                <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="py-12">
                                    <div className="flex justify-center items-center mb-12 gap-4">
                                        <h2 className="text-3xl md:text-5xl font-league uppercase text-center text-accent">Gema Tapak Ksatria</h2>
                                        {userRole === 'admin' && (
                                            <button onClick={() => setIsTestimonialAdminOpen(true)} className={`p-2 rounded-full ${glassEffect} hover:bg-accent/20 text-accent transition-colors`}>
                                                <Edit size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {testimonials.length > 0 && (
                                        <div className="relative overflow-hidden">
                                            <motion.div 
                                                className="relative w-full flex items-center justify-center"
                                                animate={{ height: carouselHeight }}
                                                transition={{ type: 'spring', stiffness: 170, damping: 26 }}
                                                drag="x"
                                                dragConstraints={{ left: 0, right: 0 }}
                                                onDragEnd={handleDragEnd}
                                                dragElastic={0.1}
                                            >
                                                {testimonials.map((testimonial, index) => {
                                                    const total = testimonials.length;
                                                    let offset = index - activeIndex;
                                                    if (offset > total / 2) offset -= total;
                                                    if (offset < -total / 2) offset += total;

                                                    const isVisible = Math.abs(offset) <= 1;
                                                    const isCenter = offset === 0;
                                                    
                                                    const animateProps = {
                                                        x: `${offset * 100}%`,
                                                        scale: isCenter ? 1 : 0.8,
                                                        opacity: isVisible ? 1 : 0,
                                                        zIndex: total - Math.abs(offset),
                                                    };

                                                    const backgroundAnimateProps = {
                                                        filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                                                    };

                                                    const contentAnimateProps = {
                                                        opacity: isCenter ? 1 : 0.5,
                                                    };

                                                    return (
                                                        <motion.div
                                                            key={testimonial.id}
                                                            className="absolute w-full md:w-1/3 h-auto p-2"
                                                            initial={false}
                                                            animate={animateProps}
                                                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                                        >
                                                            <div ref={el => cardRefs.current[index] = el} className="relative w-full h-auto">
                                                                <motion.div 
                                                                    className={`absolute inset-0 ${glassEffect} rounded-2xl`}
                                                                    animate={backgroundAnimateProps}
                                                                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                                                />
                                                                <motion.div 
                                                                    className={`relative flex flex-col items-center p-6 text-center w-full min-h-[380px]`}
                                                                    animate={contentAnimateProps}
                                                                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                                                >
                                                                    <img 
                                                                        src={testimonial.image_url || 'https://placehold.co/100x100/333/FFF?text=User'} 
                                                                        alt={testimonial.name} 
                                                                        className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-white/30 flex-shrink-0" 
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/333/FFF?text=User'; }} 
                                                                    />
                                                                    {/* --- BARIS YANG DIPERBAIKI --- */}
                                                                    <p className={`text-sm font-[Montserrat] font-light italic text-white/80 mb-4 break-words ${!isCenter ? 'line-clamp-5' : 'flex-grow'}`}>&ldquo;{testimonial.quote}&rdquo;</p>
                                                                    <div className="mt-auto pt-2">
                                                                        <p className="font-[Montserrat] battery-style-gradient font-semibold text-sm break-words">- {testimonial.name}</p>
                                                                        {testimonial.kelas && testimonial.angkatan && (
                                                                            <p className="text-xs text-white/60 font-[Montserrat] mt-1">{testimonial.kelas} &bull; Angkatan {testimonial.angkatan}</p>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>

                                            {/* Tombol Navigasi */}
                                            <button onClick={prevTestimonial} className={`absolute left-[0px] md:-left-12 top-1/2 -translate-y-1/2 p-1 rounded-full z-30 ${glassEffect}`}>
                                                <ChevronLeft className="h-4 w-4 text-white/70 hover:text-white transition-colors" />
                                            </button>
                                            <button onClick={nextTestimonial} className={`absolute right-[0px] md:-right-12 top-1/2 -translate-y-1/2 p-1 rounded-full z-30 ${glassEffect}`}>
                                                <ChevronRight className="h-4 w-4 text-white/70 hover:text-white transition-colors" />
                                            </button>
                                        </div>
                                    )}

                                    {testimonials.length === 0 && (
                                        <div className="text-center text-white/60 font-[Montserrat]">
                                            Belum ada testimoni.
                                        </div>
                                    )}
                                </motion.section>
                                {/* --- END: REVISED TESTIMONIAL SECTION --- */}
                                
                                {/* --- START: UPDATED ORGANIZATION SECTION --- */}
                                <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="py-12">
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <h2 className="text-4xl md:text-5xl font-league uppercase battery-style-gradient">Naungan Organisasi</h2>
                                        <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
                                            <a href="https://karate.stmkg.ac.id" target="_blank" rel="noopener noreferrer">
                                                <img src={logoBintang} alt="Logo STMKG Karate Club" className="h-14 md:h-28 w-auto transition-transform hover:scale-105" />
                                            </a>
                                            <a href="https://resimen.stmkg.ac.id" target="_blank" rel="noopener noreferrer">
                                                <img src={logoResimen} alt="Logo Resimen" className="h-14 md:h-24 w-auto transition-transform hover:scale-105" />
                                            </a>
                                            <a href="https://stmkg.ac.id" target="_blank" rel="noopener noreferrer">
                                                <img src={logoStmkg} alt="Logo STMKG" className="h-14 md:h-24 w-auto transition-transform hover:scale-105" />
                                            </a>
                                            <a href="https://bmkg.go.id" target="_blank" rel="noopener noreferrer">
                                                <img src={logoBmkg} alt="Logo BMKG" className="h-14 md:h-24 w-auto transition-transform hover:scale-105" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.section>
                                {/* --- END: UPDATED ORGANIZATION SECTION --- */}
                            </div>
                        )}
                    </div>
                    <Footer />
                </motion.div>
            </div>
        </div>
    );
}

// --- Komponen Modal Admin Testimoni ---
// (Tidak ada perubahan pada komponen ini, disertakan untuk kelengkapan)
function TestimonialAdminModal({ onClose, showToast, testimonials, onDataChange }) {
    const [editingTestimonial, setEditingTestimonial] = useState(null); // null, 'new', or an object
    const [formData, setFormData] = useState({ name: '', quote: '', kelas: '', angkatan: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // State untuk modal konfirmasi internal
    const [modalState, setModalState] = useState({ isOpen: false, message: '', onConfirm: () => {} });

    const openModal = (message, onConfirm) => {
        setModalState({ isOpen: true, message, onConfirm });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const compressedFile = await compressImage(file);
            setImageFile(compressedFile);
            setImagePreview(URL.createObjectURL(compressedFile));
        } catch (err) {
            showToast(`Gagal kompres gambar: ${err.message}`, 'error');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        let image_path = editingTestimonial?.image_path || null;

        // 1. Upload gambar jika ada file baru
        if (imageFile) {
            if (editingTestimonial && editingTestimonial.image_path) {
                await supabase.storage.from('testimonial_images').remove([editingTestimonial.image_path]);
            }
            
            const filePath = `public/${Date.now()}-${imageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('testimonial_images').upload(filePath, imageFile);
            if (uploadError) {
                showToast(`Gagal unggah gambar: ${uploadError.message}`, 'error');
                return;
            }
            image_path = filePath;
        }

        // 2. Simpan data ke database
        const testimonialData = { ...formData, image_path };
        let error;
        if (editingTestimonial === 'new') {
            ({ error } = await supabase.from('testimonials').insert(testimonialData));
        } else {
            ({ error } = await supabase.from('testimonials').update(testimonialData).eq('id', editingTestimonial.id));
        }

        if (error) {
            showToast(`Gagal menyimpan testimoni: ${error.message}`, 'error');
        } else {
            showToast(`Testimoni berhasil ${editingTestimonial === 'new' ? 'dibuat' : 'diperbarui'}.`);
            setEditingTestimonial(null);
            onDataChange();
        }
    };

    const handleDelete = (testimonial) => {
        openModal(`Yakin ingin menghapus testimoni dari ${testimonial.name}?`, async () => {
            if (testimonial.image_path) {
                await supabase.storage.from('testimonial_images').remove([testimonial.image_path]);
            }
            const { error } = await supabase.from('testimonials').delete().eq('id', testimonial.id);
            if (error) {
                showToast(`Gagal hapus testimoni: ${error.message}`, 'error');
            } else {
                showToast('Testimoni berhasil dihapus.');
                onDataChange();
            }
            setModalState({ isOpen: false }); // Tutup modal konfirmasi
        });
    };

    const startEditing = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({ name: testimonial.name, quote: testimonial.quote, kelas: testimonial.kelas || '', angkatan: testimonial.angkatan || '' });
        setImagePreview(testimonial.image_url);
        setImageFile(null);
    };

    const startNew = () => {
        setEditingTestimonial('new');
        setFormData({ name: '', quote: '', kelas: '', angkatan: '' });
        setImagePreview(null);
        setImageFile(null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <ConfirmModal {...modalState} onClose={() => setModalState({ isOpen: false })} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl ${glassEffect} rounded-2xl`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
                <h3 className="text-2xl font-league uppercase text-accent mb-6">Kelola Testimoni</h3>

                {editingTestimonial ? (
                    // Form View
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button onClick={() => setEditingTestimonial(null)} className="flex items-center gap-2 text-sm text-accent mb-4"><ArrowLeft size={16} /> Kembali ke daftar</button>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Nama</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Kutipan</label>
                                <textarea value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} rows="4" className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} required></textarea>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Kelas</label>
                                    <input type="text" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Angkatan</label>
                                    <input type="text" value={formData.angkatan} onChange={e => setFormData({...formData, angkatan: e.target.value})} className={`w-full p-2 text-sm ${glassEffect} bg-black/40 rounded-md font-[Montserrat]`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Foto</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />}
                                    <label className={`flex-1 p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-accent/50 text-center ${glassEffect}`}>
                                        <UploadCloud className="mx-auto mb-2 text-white/50" />
                                        <span className="text-sm text-white/70">Klik untuk unggah (WebP)</span>
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className={`w-full py-2 ${glassEffect} bg-accent/30 text-accent rounded-lg hover:bg-accent/50 transition-colors`}>Simpan</button>
                        </form>
                    </motion.div>
                ) : (
                    // List View
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button onClick={startNew} className={`w-full mb-4 py-2 ${glassEffect} text-accent rounded-lg hover:bg-accent/20 transition-colors`}>
                            <Plus className="inline mr-2" size={16} /> Tambah Testimoni Baru
                        </button>
                        <div className="space-y-2">
                            {testimonials.map(t => (
                                <div key={t.id} className={`p-3 rounded-lg flex items-center justify-between ${glassEffect}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={t.image_url || 'https://placehold.co/100x100/333/FFF?text=U'} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                        <span className="font-semibold">{t.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEditing(t)} className="p-2 text-white/70 hover:text-accent"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(t)} className="p-2 text-white/70 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

// --- Utility Kompresi Gambar ---
// (Tidak ada perubahan pada fungsi ini, disertakan untuk kelengkapan)
function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], `${Date.now()}-compressed.webp`, {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        }
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}