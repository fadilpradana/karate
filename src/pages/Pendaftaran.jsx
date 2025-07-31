import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Pastikan path ini benar
import { useAuth } from '../context/AuthContext'; // Pastikan path ini benar
import { Helmet } from 'react-helmet-async';
import favicon from '../assets/logo_bintangcompress.png';
import { 
    LoaderCircle, 
    Lock, 
    CheckCircle, 
    UploadCloud, 
    File as FileIcon,
    X,
    UserCircle,
    FilePenLine,
    Users,
    Heart,
    Star,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer'; // Pastikan path ini benar
import heroVideo from '../assets/daftar.mp4'; // Pastikan path ini benar

// Variabel cache
let pendaftaranDataCache = null;

// Komponen Modal Info
const InfoModal = ({ isOpen, onClose, title, message }) => {
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.8, transition: { type: "spring", stiffness: 300, damping: 20 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="info-modal-overlay"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={overlayVariants}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        key="info-modal-content"
                        variants={modalVariants}
                        className="relative p-6 text-center text-white max-w-sm w-full"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '0.8rem'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-accent/20 mb-4 border border-accent/50">
                                <AlertCircle size={40} className="text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{title}</h3>
                            <p className="text-gray-300 mb-6 text-sm">{message}</p>
                            <button
                                onClick={onClose}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '0.5rem'
                                }}
                                className="w-full py-2.5 px-4 font-semibold text-white hover:bg-white/10 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Komponen Modal Terima Kasih
const ThankYouModal = ({ isOpen, onClose, periodeName }) => {
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.8, transition: { type: "spring", stiffness: 300, damping: 20 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="thank-you-modal-overlay"
                    initial="hidden" animate="visible" exit="exit" variants={overlayVariants}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        key="thank-you-modal-content" variants={modalVariants}
                        className="relative p-6 text-center text-white max-w-sm w-full"
                        style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '0.8rem'
                        }}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 mb-4 border border-green-500/50">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Terima Kasih!</h3>
                            <p className="text-gray-300 mb-6 text-base">
                                Anda sudah terdaftar pada <span className="font-semibold">{periodeName || "periode ini"}</span>.
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    backgroundColor: 'transparent', border: '1px solid rgba(34, 197, 94, 0.5)',
                                    borderRadius: '0.5rem'
                                }}
                                className="w-full py-2.5 px-4 font-semibold text-green-300 hover:bg-green-500/10 transition-colors"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Komponen baru untuk konten utama dan animasi
const PendaftaranContent = ({
    periodeAktif,
    profile,
    handleSubmit,
    mengirim,
    sudahKirim,
    persentaseMinat,
    setPersentaseMinat,
    alasanMinat,
    setAlasanMinat,
    pengalamanOrganisasi,
    setPengalamanOrganisasi,
    pengalamanKepanitiaan,
    setPengalamanKepanitiaan,
    sepuluhCalon,
    setSepuluhCalon,
    cvFile,
    setCvFile,
    handleCvFileChange,
    isModalOpen,
    setIsModalOpen,
    modalContent,
    showModal,
}) => {
    const navigate = useNavigate();

    const glassFormStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
    };

    // Refs and scroll animations are now inside this component
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "center start"]
    });
    const heroContentX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-150%"]);
    const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const formDataDiriRef = useRef(null);
    const { scrollYProgress: scrollDataDiri } = useScroll({
        target: formDataDiriRef,
        offset: ["start end", "end end"]
    });
    const opacityDataDiri = useTransform(scrollDataDiri, [0, 0.3], [0, 1]);
    const yDataDiri = useTransform(scrollDataDiri, [0, 0.3], [50, 0]);

    const formPeminatanRef = useRef(null);
    const { scrollYProgress: scrollPeminatan } = useScroll({
        target: formPeminatanRef,
        offset: ["start end", "end end"]
    });
    const opacityPeminatan = useTransform(scrollPeminatan, [0, 0.3], [0, 1]);
    const yPeminatan = useTransform(scrollPeminatan, [0, 0.3], [50, 0]);
    
    const heroVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="relative text-white h-full">
            <Helmet>
                <title>Pendaftaran - UKM Karate STMKG</title>
                <link rel="icon" href={favicon} />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet> 
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 z-0 w-full h-full object-cover"
            >
                <source src={heroVideo} type="video/mp4" />
                Browser Anda tidak mendukung tag video.
            </video>
            <div className="fixed inset-0 bg-black/60 z-10"></div>
            
            <ThankYouModal
                isOpen={sudahKirim}
                onClose={() => navigate('/dashboard')}
                periodeName={periodeAktif?.nama_periode}
            />
            
            <div className="relative z-20">
                <InfoModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalContent.title}
                    message={modalContent.message}
                />
                
                <div ref={heroRef} className="h-[270vh]">
                    <header className="h-screen flex items-center justify-center text-center px-4 sticky top-0">
                        <motion.div style={{ x: heroContentX, opacity: heroContentOpacity }}>
                            <motion.h1 
                                variants={heroVariants} initial="hidden" animate="visible"
                                className="text-4xl sm:text-5xl md:text-6xl font-league uppercase font-bold text-accent mb-4 drop-shadow-lg"
                            >
                                {periodeAktif.nama_periode}
                            </motion.h1>
                            <motion.p 
                                variants={heroVariants} initial="hidden" animate="visible"
                                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                                className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md"
                            >
                                {periodeAktif.deskripsi || ''}
                            </motion.p>
                        </motion.div>
                    </header>
                </div>
                
                <main className="pb-20 pt-10 relative -mt-[150vh]">
                    <div className="max-w-4xl mx-auto px-4">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <motion.div
                                ref={formDataDiriRef}
                                style={{ opacity: opacityDataDiri, y: yDataDiri, ...glassFormStyle }}
                                className="p-6 shadow-lg"
                            >
                                <h2 className="text-2xl font-semibold text-white mb-5 flex items-center gap-3">
                                    <UserCircle className="text-accent"/>
                                    <span className="battery-style-gradient">Data Diri Peserta</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div><p className="text-gray-400">Nama Lengkap</p><p className="font-medium text-base">{profile?.nama_lengkap}</p></div>
                                    <div><p className="text-gray-400">NPT</p><p className="font-medium text-base">{profile?.npt}</p></div>
                                    <div><p className="text-gray-400">Kelas</p><p className="font-medium text-base">{profile?.kelas}</p></div>
                                    <div><p className="text-gray-400">Nomor Telepon</p><p className="font-medium text-base">{profile?.nomor_telepon}</p></div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                ref={formPeminatanRef}
                                style={{ opacity: opacityPeminatan, y: yPeminatan, ...glassFormStyle }}
                                className="p-6 shadow-lg space-y-8"
                            >
                                <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                                    <FilePenLine className="text-accent"/>
                                    <span className="battery-style-gradient">Formulir Peminatan</span>
                                </h2>
                                <div className="flex flex-col"><label htmlFor="persentaseMinat" className="mb-3 font-medium flex items-center gap-2"><Heart size={16}/> Seberapa besar minat Anda?</label><div className="flex items-center gap-4"><input id="persentaseMinat" type="range" min="0" max="100" step="5" value={persentaseMinat} onChange={(e) => setPersentaseMinat(e.target.value)} disabled={sudahKirim} className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-accent" /><span className="bg-accent text-gray-900 text-xs font-bold px-3 py-1 rounded-full w-16 text-center">{persentaseMinat}%</span></div></div>
                                <div className="flex flex-col"><label htmlFor="alasanMinat" className="mb-2 font-medium flex items-center gap-2"><Sparkles size={16}/> Alasan Minat</label><textarea id="alasanMinat" value={alasanMinat} onChange={(e) => setAlasanMinat(e.target.value)} required rows="4" style={glassFormStyle} disabled={sudahKirim} className="p-3 focus:ring-2 focus:ring-accent focus:border-accent transition w-full placeholder-gray-400" placeholder="Jelaskan motivasi utama Anda..."></textarea></div>
                                <div className="flex flex-col"><label htmlFor="pengalamanOrganisasi" className="mb-2 font-medium flex items-center gap-2"><Star size={16}/> Pengalaman Organisasi</label><textarea id="pengalamanOrganisasi" value={pengalamanOrganisasi} onChange={(e) => setPengalamanOrganisasi(e.target.value)} required rows="4" style={glassFormStyle} disabled={sudahKirim} className="p-3 focus:ring-2 focus:ring-accent focus:border-accent transition w-full placeholder-gray-400" placeholder="Sebutkan organisasi yang pernah diikuti..."></textarea></div>
                                <div className="flex flex-col"><label htmlFor="pengalamanKepanitiaan" className="mb-2 font-medium flex items-center gap-2"><Star size={16}/> Pengalaman Kepanitiaan</label><textarea id="pengalamanKepanitiaan" value={pengalamanKepanitiaan} onChange={(e) => setPengalamanKepanitiaan(e.target.value)} required rows="4" style={glassFormStyle} disabled={sudahKirim} className="p-3 focus:ring-2 focus:ring-accent focus:border-accent transition w-full placeholder-gray-400" placeholder="Sebutkan kepanitiaan yang pernah diikuti..."></textarea></div>
                                <div className="flex flex-col"><label htmlFor="sepuluhCalon" className="mb-2 font-medium flex items-center gap-2"><Users size={16}/> Rekomendasi 10 Nama Calon Pengurus</label><textarea id="sepuluhCalon" value={sepuluhCalon} onChange={(e) => setSepuluhCalon(e.target.value)} required rows="5" style={glassFormStyle} disabled={sudahKirim} className="p-3 focus:ring-2 focus:ring-accent focus:border-accent transition w-full placeholder-gray-400" placeholder="Tuliskan rekomendasi 10 nama calon pengurus dari angkatan kalian, pisahkan dengan koma..."></textarea></div>
                                <div className="flex flex-col">
                                    <label className="mb-2 font-medium flex items-center gap-2"><UploadCloud size={16}/> Unggah Curriculum Vitae (CV)</label>
                                    <p className="text-xs text-gray-400 mb-3">Format: PDF. Maksimal 1MB. (Sertakan: TTL, Alamat Kos, dll).</p>
                                    <div className="mt-2">
                                        <label htmlFor="cv-upload" style={{ ...glassFormStyle, borderStyle: 'dashed', borderWidth: '2px' }} className={`relative cursor-pointer hover:border-accent transition-colors flex justify-center items-center p-6 text-center ${sudahKirim ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className="flex flex-col items-center">
                                                <UploadCloud className="h-10 w-10 text-gray-400 mb-2"/>
                                                <span className="text-sm text-gray-300">Klik untuk memilih file</span>
                                            </div>
                                            <input id="cv-upload" name="cv-upload" type="file" className="sr-only" onChange={handleCvFileChange} accept="application/pdf" disabled={sudahKirim} />
                                        </label>
                                    </div>
                                    {cvFile && (
                                        <div className="mt-4 flex items-center justify-between bg-green-900/50 border border-green-700 text-sm text-white rounded-md p-3">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                                                <span className="truncate">{cvFile.name}</span>
                                            </div>
                                            <button type="button" onClick={() => setCvFile(null)} className="p-1 rounded-full hover:bg-red-500/50 transition-colors" disabled={sudahKirim}>
                                                <X className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="pt-4"
                            >
                                <button 
                                    type="submit" 
                                    disabled={mengirim || !cvFile || sudahKirim} 
                                    style={glassFormStyle}
                                    className="w-full text-accent font-bold py-4 px-4 transition-all duration-300 flex items-center justify-center text-lg hover:bg-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {mengirim ? <LoaderCircle className="animate-spin h-6 w-6" /> : 'Kirim Pendaftaran Saya'}
                                </button>
                            </motion.div>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}


export default function Pendaftaran() {
    const navigate = useNavigate();
    const { session, role, loading: authLoading } = useAuth();

    const [periodeAktif, setPeriodeAktif] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isFetchingData, setIsFetchingData] = useState(!pendaftaranDataCache);
    const [mengirim, setMengirim] = useState(false);
    const [sudahKirim, setSudahKirim] = useState(false);
    const [persentaseMinat, setPersentaseMinat] = useState(50);
    const [alasanMinat, setAlasanMinat] = useState('');
    const [pengalamanOrganisasi, setPengalamanOrganisasi] = useState('');
    const [pengalamanKepanitiaan, setPengalamanKepanitiaan] = useState('');
    const [sepuluhCalon, setSepuluhCalon] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const showModal = (title, message) => {
        setModalContent({ title, message });
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (authLoading) return;
        if (pendaftaranDataCache && pendaftaranDataCache.userId !== session?.user?.id) {
            pendaftaranDataCache = null;
            setIsFetchingData(true);
        }
        if (pendaftaranDataCache) {
            setPeriodeAktif(pendaftaranDataCache.periodeAktif);
            setProfile(pendaftaranDataCache.profile);
            setSudahKirim(pendaftaranDataCache.sudahKirim);
            setIsFetchingData(false);
            return;
        }
        if (role && role.toLowerCase() !== 'anggota') {
            navigate('/dashboard', { replace: true });
            return;
        }
        if (session && role?.toLowerCase() === 'anggota') {
            const ambilDataAwal = async () => {
                setIsFetchingData(true); // Set loading true at the start
                try {
                    const [periodeRes, profileRes] = await Promise.all([
                        supabase.from('periode_pendaftaran').select('*').eq('sedang_aktif', true).maybeSingle(),
                        supabase.from('profiles').select('*').eq('id', session.user.id).single()
                    ]);
                    const periodeData = periodeRes.data;
                    const profileData = profileRes.data;
                    let isAlreadySubmitted = false;
                    if (periodeData) {
                        const { count } = await supabase
                            .from('data_pendaftar')
                            .select('*', { count: 'exact', head: true })
                            .eq('id_pengguna', session.user.id)
                            .eq('id_periode', periodeData.id);
                        isAlreadySubmitted = count > 0;
                    }
                    setPeriodeAktif(periodeData);
                    setProfile(profileData);
                    setSudahKirim(isAlreadySubmitted);
                    pendaftaranDataCache = {
                        periodeAktif: periodeData, profile: profileData,
                        sudahKirim: isAlreadySubmitted, userId: session.user.id
                    };
                } catch (error) {
                    console.error('Gagal mengambil data awal pendaftaran:', error);
                    pendaftaranDataCache = null;
                } finally {
                    setIsFetchingData(false);
                }
            };
            ambilDataAwal();
        } else if (!session && !authLoading) {
            navigate('/login', { replace: true });
        } else {
            setIsFetchingData(false);
        }
    }, [authLoading, session, role, navigate]);

    const handleCvFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                showModal("Ukuran File Terlalu Besar", "Ukuran file CV tidak boleh lebih dari 1MB.");
                return;
            }
            if (file.type !== 'application/pdf') {
                showModal("Format File Tidak Didukung", "Harap unggah file dengan format PDF.");
                return;
            }
            setCvFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cvFile) {
            showModal('CV Belum Diunggah', 'Harap unggah file CV Anda sebelum mengirim pendaftaran.');
            return;
        }
        setMengirim(true);
        try {
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${periodeAktif.tahun_angkatan}/${profile?.nama_lengkap?.replace(/\s+/g, '_')}_${session.user.id}.${fileExt}`;
            const BUCKET_NAME = 'cvpendaftar';
            const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, cvFile, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);
            const dataIsian = { persentase_minat: persentaseMinat, alasan_minat: alasanMinat, pengalaman_organisasi: pengalamanOrganisasi, pengalaman_kepanitiaan: pengalamanKepanitiaan, sepuluh_calon: sepuluhCalon, cv_url: publicUrlData.publicUrl };
            const { error: submissionError } = await supabase.from('data_pendaftar').insert({ id_pengguna: session.user.id, id_periode: periodeAktif.id, data_isian: dataIsian });
            if (submissionError) throw submissionError;
            setSudahKirim(true);
            if (pendaftaranDataCache) {
                pendaftaranDataCache.sudahKirim = true;
            }
        } catch (error) {
            showModal('Pendaftaran Gagal', error.message);
        } finally {
            setMengirim(false);
        }
    };
    
    // Render logic in the main component
    if (authLoading || isFetchingData) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <div className="flex-grow flex justify-center items-center">
                    <LoaderCircle className="animate-spin h-8 w-8 text-white" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!session) {
        // useEffect already handles navigation, but this is a safeguard.
        return null;
    }

    if (!periodeAktif || !periodeAktif.telah_dibuka) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <main className="flex-grow flex justify-center items-center text-center p-4">
                    <div>
                        <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-accent">{periodeAktif?.nama_periode || 'Pendaftaran'}</h1>
                        <p className="mt-2 text-gray-300">Saat ini pendaftaran sedang ditutup atau belum ada periode yang dibuka.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Pass all state and handlers to the content component
    return (
        <PendaftaranContent
            periodeAktif={periodeAktif}
            profile={profile}
            handleSubmit={handleSubmit}
            mengirim={mengirim}
            sudahKirim={sudahKirim}
            persentaseMinat={persentaseMinat}
            setPersentaseMinat={setPersentaseMinat}
            alasanMinat={alasanMinat}
            setAlasanMinat={setAlasanMinat}
            pengalamanOrganisasi={pengalamanOrganisasi}
            setPengalamanOrganisasi={setPengalamanOrganisasi}
            pengalamanKepanitiaan={pengalamanKepanitiaan}
            setPengalamanKepanitiaan={setPengalamanKepanitiaan}
            sepuluhCalon={sepuluhCalon}
            setSepuluhCalon={setSepuluhCalon}
            cvFile={cvFile}
            setCvFile={setCvFile}
            handleCvFileChange={handleCvFileChange}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            modalContent={modalContent}
            showModal={showModal}
        />
    );
}
