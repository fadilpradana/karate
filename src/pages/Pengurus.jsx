import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, Users, Shield, ServerCrash, FileText, Wallet, Megaphone, Wrench, Paintbrush, BarChart3, HeartPulse, X, Settings, UserPlus, UserRoundCheck, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import Footer from '../components/Footer';

// Import gambar background
import heroBg from '../assets/bg9.jpg';

// Gaya untuk efek glassmorphism
const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
        0px 4px 10px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '0.8rem',
};

// Komponen Modal untuk menampilkan foto profil yang diperbesar
const ProfileModal = ({ member, onClose }) => {
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.7, y: 50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 25 } },
        exit: { opacity: 0, scale: 0.7, y: 50, transition: { type: "spring", stiffness: 250, damping: 25 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' },
        visible: { opacity: 1, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.4)', transition: { duration: 0.2 } },
        exit: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)', transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
            ></motion.div>

            <motion.div
                variants={modalVariants}
                className="relative bg-white/10 border border-white/20 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center max-w-sm mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white hover:text-amber-400 transition-colors duration-200"
                    aria-label="Tutup"
                >
                    <X size={24} />
                </button>
                <img
                    src={member.profiles.avatar_url || `https://ui-avatars.com/api/?name=${member.profiles.nama_lengkap.replace(/\s+/g, '+')}&background=0284c7&color=fff&bold=true`}
                    alt={`Foto ${member.profiles.nama_lengkap}`}
                    className="w-60 h-60 object-cover rounded-xl aspect-square mx-auto mb-4 border-4 border-amber-400 shadow-lg"
                />
                <h3 className="text-xl font-bold text-white mb-1">{member.profiles.nama_lengkap}</h3>
                <p className="battery-style-gradient font-semibold text-base">{member.jabatan}</p>
                <div className="text-sm text-gray-300 mt-2">
                    <span>{member.profiles.kelas}</span> | <span>{member.profiles.angkatan}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Komponen Card Anggota
const MemberCard = ({ member, onClick, index, totalMembersInBidang }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{
                scale: isHovered ? 1.05 : 1,
                boxShadow: isHovered
                    ? '0px 8px 20px rgba(0, 0, 0, 0.5)'
                    : `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`
            }}
            transition={{
                opacity: { duration: 0.5, ease: "easeOut", delay: (totalMembersInBidang - 1 - index) * 0.6 },
                x: { duration: 0.5, ease: "easeOut", delay: (totalMembersInBidang - 1 - index) * 0.6 },
                default: { type: "spring", stiffness: 300, damping: 20 },
            }}
            className="w-64 flex flex-col items-center text-center p-6 rounded-xl shadow-lg cursor-pointer mx-auto"
            style={glassmorphismStyle}
            onClick={() => onClick(member)}
        >
            <img
                src={member.profiles.avatar_url || `https://ui-avatars.com/api/?name=${member.profiles.nama_lengkap.replace(/\s+/g, '+')}&background=0284c7&color=fff&bold=true`}
                alt={`Foto ${member.profiles.nama_lengkap}`}
                className="w-24 h-24 rounded-full object-cover aspect-square mb-4 border-2 border-gray-600 shadow-md"
            />
            <h3 className="text-xl font-bold text-white max-w-full text-wrap">
                {member.profiles.nama_lengkap}
            </h3>
            <p className="battery-style-gradient font-semibold text-base max-w-full text-wrap">
                {member.jabatan}
            </p>
            <div className="text-sm text-gray-400 mt-1 max-w-full text-wrap">
                <span>{member.profiles.kelas}</span> | <span>{member.profiles.angkatan}</span>
            </div>
        </motion.div>
    );
};

// Komponen Card Purna Pengurus (lebih kecil dan horizontal)
const PurnaMemberCard = ({ member, onClick, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.05
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{
                scale: isHovered ? 1.03 : 1,
                boxShadow: isHovered
                    ? '0px 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0px 1px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.15)'
            }}
            className="flex items-center p-3 rounded-lg shadow-md cursor-pointer w-full h-full"
            style={glassmorphismStyle}
            onClick={() => onClick(member)}
        >
            <img
                src={member.profiles.avatar_url || `https://ui-avatars.com/api/?name=${member.profiles.nama_lengkap.replace(/\s+/g, '+')}&background=0284c7&color=fff&bold=true`}
                alt={`Foto ${member.profiles.nama_lengkap}`}
                className="w-10 h-10 rounded-full object-cover aspect-square border border-gray-500 shadow-sm flex-shrink-0"
            />
            <div className="ml-2.5 text-left overflow-hidden">
                <h3 className="text-xs font-bold text-white text-wrap">
                    {member.profiles.nama_lengkap}
                </h3>
                <div className="text-[10px] text-gray-400 text-wrap">
                    <span>{member.profiles.kelas}</span> | <span>{member.profiles.angkatan}</span>
                </div>
            </div>
        </motion.div>
    );
};


export default function Pengurus() {
    const [pengurus, setPengurus] = useState({});
    const [purnaList, setPurnaList] = useState([]); // State baru untuk purna pengurus
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [namaPeriode, setNamaPeriode] = useState("Periode Saat Ini");
    const [selectedMember, setSelectedMember] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error('Error fetching session:', sessionError.message);
                    setUserRole(null); return;
                }
                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles').select('role').eq('id', user.id).single();
                    if (profileError) {
                        console.error('Error fetching user profile:', profileError.message);
                        setUserRole(null); return;
                    }
                    setUserRole(profileData ? profileData.role : null);
                } else {
                    setUserRole(null);
                }
            } catch (err) {
                console.error('Unexpected error fetching user role:', err.message);
                setUserRole(null);
            }
        }
        getUserAndRole();
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // Fetch pengurus aktif berdasarkan periode
                const { data: periodeData, error: periodeError } = await supabase
                    .from('periode_kepengurusan').select('id, nama_periode').eq('sedang_berjalan', true).single();
                
                if (periodeError) throw new Error("Tidak dapat menemukan periode kepengurusan yang aktif.");
                if (!periodeData) {
                    setError("Data kepengurusan untuk periode ini belum diatur.");
                    return;
                }
                
                setNamaPeriode(periodeData.nama_periode);
                const { data: jabatanData, error: jabatanError } = await supabase
                    .from('jabatan_pengurus')
                    .select(`jabatan, profiles (nama_lengkap, avatar_url, kelas, angkatan), bidang_pengurus (nama_bidang, urutan)`)
                    .eq('id_periode', periodeData.id)
                    .order('urutan', { foreignTable: 'bidang_pengurus', ascending: true });

                if (jabatanError) throw jabatanError;

                const grouped = jabatanData.reduce((acc, curr) => {
                    const bidang = curr.bidang_pengurus.nama_bidang;
                    if (!acc[bidang]) acc[bidang] = [];
                    acc[bidang].push(curr);
                    return acc;
                }, {});
                setPengurus(grouped);

                // Fetch purna pengurus dari tabel profiles
                const { data: purnaData, error: purnaError } = await supabase
                    .from('profiles')
                    .select('nama_lengkap, avatar_url, kelas, angkatan')
                    .eq('role', 'purna_pengurus');

                if (purnaError) {
                    console.error("Gagal mengambil data purna pengurus:", purnaError);
                } else {
                    const formattedPurnaData = purnaData.map(profile => ({
                        jabatan: 'Purna Pengurus',
                        profiles: profile
                    }));
                    setPurnaList(formattedPurnaData);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const sortedBidang = useMemo(() => {
        return Object.keys(pengurus).sort((a, b) => {
            const urutanA = pengurus[a][0]?.bidang_pengurus?.urutan || 99;
            const urutanB = pengurus[b][0]?.bidang_pengurus?.urutan || 99;
            return urutanA - urutanB;
        });
    }, [pengurus]);

    const handleCardClick = (member) => { setSelectedMember(member); };
    const handleCloseModal = () => { setSelectedMember(null); };

    if (loading) {
        return (
            <div className="relative min-h-screen text-white">
                <motion.div
                    className="fixed inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${heroBg})` }}
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-brightness-30" />
                </motion.div>
                
                <div className="relative z-10 flex flex-col min-h-screen">
                    <div className="flex-grow flex justify-center items-center">
                        <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <main className="flex-grow flex flex-col justify-center items-center text-center p-4">
                    <ServerCrash className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-red-400">Gagal Memuat Data</h1>
                    <p className="mt-2 text-gray-300">{error}</p>
                </main>
                <Footer />
            </div>
        );
    }

    const komandan = pengurus['Komandan Karate'] || [];
    const sekretaris = pengurus['Sekretaris'] || [];
    const bendahara = pengurus['Bendahara'] || [];
    const pengurusPendamping = pengurus['Pengurus Pendamping'] || [];
    const bidangLain = sortedBidang.filter(namaBidang =>
        !['Komandan Karate', 'Sekretaris', 'Bendahara', 'Pengurus Pendamping'].includes(namaBidang)
    );

    const getIconForBidang = (namaBidang) => {
        if (namaBidang === 'Sekretaris') return <FileText className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Bendahara') return <Wallet className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Hubungan Masyarakat') return <Megaphone className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Komite Teknik') return <Wrench className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Desain Komunikasi Visual') return <Paintbrush className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Strategi Dana dan Operasional') return <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Kesehatan') return <HeartPulse className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Pengurus Pendamping') return <UserPlus className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        if (namaBidang === 'Purna Pengurus') return <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
        return <Users className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" />;
    };

    const titleVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } }
    };
    const subtitleVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.7 } }
    };
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12, delayChildren: 0.2, staggerChildren: 0.05 } }
    };
    const headingVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Struktur Kepengurusan - STMKG Karate Club</title>
                <meta name="description" content={`Lihat struktur kepengurusan STMKG Karate Club untuk ${namaPeriode}. Kenali komandan, sekretaris, bendahara, dan seluruh anggota bidang.`} />
                <meta name="keywords" content={`pengurus karate, struktur organisasi, ${namaPeriode}, STMKG, karate, stmkg karate club`} />
                <meta property="og:title" content={`Struktur Kepengurusan - ${namaPeriode}`} />
                <meta property="og:description" content={`Struktur organisasi dan daftar pengurus STMKG Karate Club periode ${namaPeriode}.`} />
                <meta property="og:url" content="https://karate.stmkg.ac.id/pengurus" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://karate.stmkg.ac.id/pengurus" />
            </Helmet>

            <motion.div
                className="fixed inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBg})` }}
                />
                <div className="absolute inset-0 bg-black/50 backdrop-brightness-30" />
            </motion.div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <section className="min-h-screen flex items-center justify-center text-center p-4">
                    <div className="relative z-10">
                        <motion.h1 variants={titleVariants} initial="hidden" animate="visible"
                            className="text-4xl md:text-7xl font-league font-semibold uppercase text-accent mb-2 drop-shadow-lg"
                        >
                            Struktur Kepengurusan
                        </motion.h1>
                        <motion.p variants={subtitleVariants} initial="hidden" animate="visible"
                            className="text-gray-200 text-lg md:text-a2xl drop-shadow-md"
                        >
                            {namaPeriode}
                        </motion.p>
                    </div>
                </section>

                <main className="flex-grow pt-12 pb-12 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 space-y-16">

                        {/* --- AWAL PERUBAHAN HAK AKSES --- */}
                        {/* Menu Mobile: Tampil untuk admin dan pengurus */}
                        {['admin', 'pengurus'].includes(userRole) && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                                className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit"
                            >
                                <nav className="flex space-x-2 justify-center">
                                    {/* Tombol ini hanya untuk admin */}
                                    {userRole === 'admin' && (
                                        <>
                                            <Link to="/moderasi-pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Moderasi Pengurus" >
                                                <Settings size={20} />
                                            </Link>
                                            <Link to="/pemilihan-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Pemilihan Komandan" >
                                                <Shield size={20} />
                                            </Link>
                                        </>
                                    )}
                                    {/* Tombol ini untuk admin DAN pengurus */}
                                    <Link to="/data-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Data Pendaftar" >
                                        <UserRoundCheck size={20} />
                                    </Link>
                                </nav>
                            </motion.div>
                        )}

                        {/* Menu Desktop: Tampil untuk admin dan pengurus */}
                        {['admin', 'pengurus'].includes(userRole) && (
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                                className="fixed left-4 top-[38%] -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                            >
                                <nav className="space-y-3">
                                    {/* Tombol ini hanya untuk admin */}
                                    {userRole === 'admin' && (
                                        <>
                                            <Link to="/moderasi-pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Moderasi Pengurus" >
                                                <Settings size={20} />
                                            </Link>
                                        </>
                                    )}
                                    {/* Tombol ini untuk admin DAN pengurus */}
                                    <Link to="/pemilihan-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Pemilihan Komandan" >
                                        <Shield size={20} />
                                    </Link>                                                
                                    <Link to="/data-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Data Pendaftar" >
                                        <UserRoundCheck size={20} />
                                    </Link>
                                </nav>
                            </motion.div>
                        )}
                        {/* --- AKHIR PERUBAHAN HAK AKSES --- */}

                        {komandan.length > 0 && (
                            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} >
                                <motion.div className="flex justify-center mb-8" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} >
                                    <h2 className="text-xl sm:text-3xl font-semibold text-white pb-2 px-6 flex items-center gap-2 sm:gap-3 justify-center relative group">
                                        <Shield className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" /> Komandan Karate
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:via-[#FF9F1C] transition-colors duration-300"></span>
                                    </h2>
                                </motion.div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {komandan.map((member, index) => (
                                        <MemberCard key={member.profiles.nama_lengkap} member={member} onClick={handleCardClick} index={index} totalMembersInBidang={komandan.length} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                        {(sekretaris.length || bendahara.length) > 0 && (
                            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                                <motion.div className="flex justify-center mb-8" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                                    <h2 className="text-xl sm:text-3xl font-semibold text-white pb-2 px-6 flex items-center gap-2 sm:gap-3 justify-center relative group">
                                        <FileText className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" /> Sekretaris <Wallet className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0" /> Bendahara
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:via-[#FF9F1C] transition-colors duration-300"></span>
                                    </h2>
                                </motion.div>
                                <div className="flex flex-col md:flex-row justify-center gap-6">
                                    {[...sekretaris, ...bendahara].map((member, index, array) => (
                                        <MemberCard key={member.profiles.nama_lengkap} member={member} onClick={handleCardClick} index={index} totalMembersInBidang={array.length} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                        {bidangLain.map(namaBidang => {
                            const members = pengurus[namaBidang];
                            return (
                                <motion.section key={namaBidang} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                                    <motion.div className="flex justify-center mb-8" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                                        <h2 className="text-xl sm:text-3xl font-semibold text-white pb-2 px-6 flex items-center gap-2 sm:gap-3 justify-center relative group">
                                            {getIconForBidang(namaBidang)} {namaBidang}
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:via-[#FF9F1C] transition-colors duration-300"></span>
                                        </h2>
                                    </motion.div>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        {members.map((member, index) => (
                                            <MemberCard key={member.profiles.nama_lengkap} member={member} onClick={handleCardClick} index={index} totalMembersInBidang={members.length} />
                                        ))}
                                    </div>
                                </motion.section>
                            );
                        })}

                        {/* --- BAGIAN PENGURUS PENDAMPING --- */}
                        {pengurusPendamping.length > 0 && (
                            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                                <motion.div className="flex justify-center mb-8" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                                    <h2 className="text-xl sm:text-3xl font-semibold text-white pb-2 px-6 flex items-center gap-2 sm:gap-3 justify-center relative group">
                                        {getIconForBidang('Pengurus Pendamping')} Pengurus Pendamping
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:via-[#FF9F1C] transition-colors duration-300"></span>
                                    </h2>
                                </motion.div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {pengurusPendamping.map((member, index) => (
                                        <MemberCard key={member.profiles.nama_lengkap} member={member} onClick={handleCardClick} index={index} totalMembersInBidang={pengurusPendamping.length} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                        {/* --- AKHIR BAGIAN PENGURUS PENDAMPING --- */}

                        {/* --- BAGIAN BARU: PURNA PENGURUS --- */}
                        {purnaList.length > 0 && (
                            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                                <motion.div className="flex justify-center mb-8" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                                    <h2 className="text-xl sm:text-3xl font-semibold text-white pb-2 px-6 flex items-center gap-2 sm:gap-3 justify-center relative group">
                                        {getIconForBidang('Purna Pengurus')} Purna Pengurus
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:via-[#FF9F1C] transition-colors duration-300"></span>
                                    </h2>
                                </motion.div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                                    {purnaList.map((member, index) => (
                                        <PurnaMemberCard key={member.profiles.nama_lengkap} member={member} onClick={handleCardClick} index={index} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                        {/* --- AKHIR BAGIAN BARU --- */}

                    </div>
                </main>
                <Footer />
            </div>

            <AnimatePresence>
                {selectedMember && (
                    <ProfileModal member={selectedMember} onClose={handleCloseModal} />
                )}
            </AnimatePresence>
        </div>
    );
}