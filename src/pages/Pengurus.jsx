import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, Users, Shield, ServerCrash, FileText, Wallet, Megaphone, Wrench, Paintbrush, BarChart3, HeartPulse, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

// Import gambar background (gantilah dengan path gambar background Anda yang sebenarnya)
import heroBg from '../assets/bg9.jpg';

// Gaya untuk efek glassmorphism pada card, DISALIN DARI KONTAK.JSX
// Didefinisikan di sini agar bisa diakses oleh MemberCard
const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
        0px 4px 10px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '0.8rem', // Sesuaikan jika ada perbedaan radius
};


// Komponen Modal untuk menampilkan foto profil yang diperbesar
const ProfileModal = ({ member, onClose }) => {
    // Animasi pop up modal dikembalikan seperti awal
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.7, y: 50 }, // Skala awal lebih kecil
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 25 } }, // Animasi masuk lebih cepat
        exit: { opacity: 0, scale: 0.7, y: 50, transition: { type: "spring", stiffness: 250, damping: 25 } } // Animasi keluar: fade, skala kecil, geser ke bawah, dengan spring animation
    };

    const overlayVariants = {
        hidden: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' },
        visible: { opacity: 1, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.4)', transition: { duration: 0.2 } }, // Durasi lebih cepat
        exit: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)', transition: { duration: 0.2 } } // Durasi lebih cepat
    };

    return (
        // AnimatePresence sudah di luar komponen ini di Pengurus.jsx
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-md" // backdrop-blur-md dikembalikan
            ></motion.div>

            <motion.div
                variants={modalVariants}
                // Kelas dikembalikan ke versi awal tanpa properti style glassmorphism
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
                <p className="text-amber-400 font-semibold text-base">{member.jabatan}</p>
                <div className="text-sm text-gray-300 mt-2">
                    <span>{member.profiles.kelas}</span> | <span>Angkatan {member.profiles.angkatan}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};


const MemberCard = ({ member, onClick, index, totalMembersInBidang }) => {
  const [isHovered, setIsHovered] = useState(false); // State untuk mengontrol hover

  return (
    <motion.div
      // Animasi masuk dari kiri, dengan delay berdasarkan index TERBALIK
      initial={{ opacity: 0, x: -100 }} // Muncul dari kiri
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.7 }} // Memicu saat 20% elemen terlihat
      
      // Menggunakan onHoverStart dan onHoverEnd untuk mengelola state isHovered
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}

      // Properti animate akan mengontrol scale dan boxShadow berdasarkan isHovered
      animate={{
        scale: isHovered ? 1.05 : 1,
        // Penting: Kembalikan boxShadow ke nilai default glassmorphismStyle saat tidak di-hover
        boxShadow: isHovered 
            ? '0px 8px 20px rgba(0, 0, 0, 0.5)' 
            : `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`
      }}
      // --- PERBAIKAN: SATUKAN SEMUA DEFINISI TRANSISI DI SINI ---
      transition={{
        // Transisi untuk animasi masuk (initial -> whileInView)
        opacity: { duration: 0.5, ease: "easeOut", delay: (totalMembersInBidang - 1 - index) * 0.6 },
        x: { duration: 0.5, ease: "easeOut", delay: (totalMembersInBidang - 1 - index) * 0.6 },
        
        // Transisi untuk properti yang dikendalikan oleh 'animate' (hover)
        // Jika tidak ada properti spesifik, ini akan menjadi default untuk 'scale' dan 'boxShadow'
        default: { type: "spring", stiffness: 300, damping: 20 },
        // Atau bisa juga didefinisikan secara eksplisit per properti:
        // scale: { type: "spring", stiffness: 300, damping: 20 },
        // boxShadow: { type: "spring", stiffness: 300, damping: 20 }
      }}
      // --- AKHIR PERBAIKAN ---

      className="w-64 flex flex-col items-center text-center p-6 rounded-xl shadow-lg cursor-pointer mx-auto" // Lebar diubah ke w-64
      style={glassmorphismStyle} // Menerapkan style glassmorphism
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
        <p className="text-amber-400 font-semibold text-base max-w-full text-wrap">
            {member.jabatan}
        </p>
        <div className="text-sm text-gray-400 mt-1 max-w-full text-wrap">
            <span>{member.profiles.kelas}</span> | <span>Angkatan {member.profiles.angkatan}</span>
        </div>
    </motion.div>
  );
};

export default function Pengurus() {
    const [pengurus, setPengurus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [namaPeriode, setNamaPeriode] = useState("Periode Saat Ini");
    const [selectedMember, setSelectedMember] = useState(null);
    const [userRole, setUserRole] = useState(null); // State untuk user role

    // --- LOGIKA PENGAMBILAN ROLE PENGGUNA ---
    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError.message);
                    setUserRole(null);
                    return;
                }

                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching user profile:', profileError.message);
                        setUserRole(null);
                        return;
                    }

                    if (profileData) {
                        setUserRole(profileData.role);
                    } else {
                        setUserRole(null); // Atau 'anggota' jika itu default untuk non-admin/pengurus
                    }
                } else {
                    setUserRole(null); // Jika tidak ada sesi (tidak login)
                }
            } catch (err) {
                console.error('Unexpected error fetching user role:', err.message);
                setUserRole(null);
            }
        }

        getUserAndRole();
    }, []); // Efek ini hanya dijalankan sekali saat komponen di-mount

    useEffect(() => {
        const fetchPengurus = async () => {
            try {
                const { data: periodeData, error: periodeError } = await supabase
                    .from('periode_kepengurusan')
                    .select('id, nama_periode')
                    .eq('sedang_berjalan', true)
                    .single();

                if (periodeError) throw new Error("Tidak dapat menemukan periode kepengurusan yang aktif.");
                if (!periodeData) {
                    setLoading(false);
                    setError("Data kepengurusan untuk periode ini belum diatur.");
                    return;
                }

                setNamaPeriode(periodeData.nama_periode);

                const { data, error: jabatanError } = await supabase
                    .from('jabatan_pengurus')
                    .select(`
                        jabatan,
                        profiles (nama_lengkap, avatar_url, kelas, angkatan),
                        bidang_pengurus (nama_bidang, urutan)
                    `)
                    .eq('id_periode', periodeData.id)
                    .order('urutan', { foreignTable: 'bidang_pengurus', ascending: true });

                if (jabatanError) throw jabatanError;

                const grouped = data.reduce((acc, curr) => {
                    const bidang = curr.bidang_pengurus.nama_bidang;
                    if (!acc[bidang]) acc[bidang] = [];
                    acc[bidang].push(curr);
                    return acc;
                }, {});

                setPengurus(grouped);
            } catch (err) {
                console.error("Error fetching pengurus:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPengurus();
    }, []);

    const sortedBidang = useMemo(() => {
        return Object.keys(pengurus).sort((a, b) => {
            const urutanA = pengurus[a][0]?.bidang_pengurus?.urutan || 99;
            const urutanB = pengurus[b][0]?.bidang_pengurus?.urutan || 99;
            return urutanA - urutanB;
        });
    }, [pengurus]);

    const handleCardClick = (member) => {
        setSelectedMember(member);
    };

    const handleCloseModal = () => {
        setSelectedMember(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <div className="flex-grow flex justify-center items-center">
                    <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
                </div>
                <Footer />
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

    const bidangLain = sortedBidang.filter(namaBidang =>
        !['Komandan Karate', 'Sekretaris', 'Bendahara'].includes(namaBidang)
    );

    const getIconForBidang = (namaBidang) => {
        if (namaBidang === 'Sekretaris') return <FileText size={28}/>;
        if (namaBidang === 'Bendahara') return <Wallet size={28}/>;
        if (namaBidang === 'Hubungan Masyarakat') return <Megaphone size={28}/>;
        if (namaBidang === 'Komite Teknik') return <Wrench size={28}/>;
        if (namaBidang === 'Desain Komunikasi Visual') return <Paintbrush size={28}/>;
        if (namaBidang === 'Strategi Dana dan Operasional') return <BarChart3 size={28}/>;
        if (namaBidang === 'Kesehatan') return <HeartPulse size={28}/>;
        return <Users size={28}/>;
    };

    // Varian animasi untuk hero section (lebih kalem)
    const titleVariants = {
        hidden: { opacity: 0, y: 10 }, // Sedikit dari atas
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.5
            }
        }
    };
    const subtitleVariants = {
        hidden: { opacity: 0, y: 10 }, // Sedikit dari atas
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.7
            }
        }
    };

    // Varian untuk setiap section bidang (animasi saat masuk viewport)
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 }, // Mulai dari sedikit di bawah
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring", // Tetap spring untuk section agar ada sedikit efek 'pop' saat bagian baru muncul
                stiffness: 100, // Kekakuan transisi
                damping: 12,  // Redaman pantulan
                delayChildren: 0.2, // Memberi delay ke children (kartu)
                staggerChildren: 0.05 // Memberi efek berurutan ke children
            }
        }
    };

    // Varian untuk judul setiap bidang (kalem)
    const headingVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="relative min-h-screen text-white">
            {/* Fixed Background */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div> {/* Overlay gelap */}
            </div>

            {/* Konten Utama dengan z-index agar di atas background */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center text-center p-4">
                    <div className="relative z-10"> {/* Konten hero section di atas overlay */}
                        <motion.h1
                            variants={titleVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-4xl md:text-7xl font-league font-semibold uppercase text-accent mb-2 drop-shadow-lg"
                        >
                            Struktur Kepengurusan
                        </motion.h1>
                        <motion.p
                            variants={subtitleVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-gray-200 text-lg md:text-a2xl drop-shadow-md"
                        >
                            {namaPeriode}
                        </motion.p>
                    </div>
                </section>

                {/* Main Content Sections (scrollable) */}
                <main className="flex-grow pt-12 pb-12 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 space-y-16">
                        {/* Mobile Menu Manajemen Pengurus - HANYA TOMBOL MODERASI PENGURUS */}
                        {userRole === 'admin' && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                                className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit"
                            >
                                <nav className="flex space-x-4 justify-center">
                                    <Link
                                        to="/moderasi-pengurus"
                                        className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                                        title="Moderasi Pengurus"
                                    >
                                        <Settings size={20} />
                                    </Link>
                                </nav>
                            </motion.div>
                        )}

                        {/* Desktop Menu Manajemen Pengurus - fixed di kiri - HANYA TOMBOL MODERASI PENGURUS */}
                        {userRole === 'admin' && (
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                                className="fixed left-4 top-[43%] -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                            >
                                <nav className="space-y-3">
                                    <Link
                                        to="/moderasi-pengurus"
                                        className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                                        title="Moderasi Pengurus"
                                    >
                                        <Settings size={20} />
                                    </Link>
                                </nav>
                            </motion.div>
                        )}
                        {/* End Sidebar Menu Pengurus */}

                        {komandan.length > 0 && (
                            <motion.section
                                variants={sectionVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <motion.div
                                    className="flex justify-center mb-8"
                                    variants={headingVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-white border-b-2 border-amber-400 pb-2 px-6 flex items-center gap-3 text-center max-w-full sm:max-w-none mx-auto whitespace-normal sm:whitespace-nowrap break-words sm:break-normal">
                                        <Shield size={28}/> Komandan Karate
                                    </h2>
                                </motion.div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {komandan.map((member, index) => (
                                        <MemberCard
                                            key={member.profiles.nama_lengkap}
                                            member={member}
                                            onClick={handleCardClick}
                                            index={index}
                                            totalMembersInBidang={komandan.length} // Tambahkan prop ini
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {(sekretaris.length || bendahara.length) > 0 && (
                            <motion.section
                                variants={sectionVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <motion.div
                                    className="flex justify-center mb-8"
                                    variants={headingVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-white border-b-2 border-amber-400 pb-2 px-6 flex items-center gap-3 text-center max-w-full sm:max-w-none mx-auto whitespace-normal sm:whitespace-nowrap break-words sm:break-normal">
                                        <FileText size={28}/> Sekretaris <Wallet size={28}/> Bendahara
                                    </h2>
                                </motion.div>
                                <div className="flex flex-col md:flex-row justify-center gap-6">
                                    {/* Gabungkan sekretaris dan bendahara untuk mendapatkan total index yang benar */}
                                    {[...sekretaris, ...bendahara].map((member, index, array) => (
                                        <MemberCard
                                            key={member.profiles.nama_lengkap}
                                            member={member}
                                            onClick={handleCardClick}
                                            index={index}
                                            totalMembersInBidang={array.length} // total gabungan
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {bidangLain.map(namaBidang => {
                            const members = pengurus[namaBidang];
                            return (
                                <motion.section
                                    key={namaBidang}
                                    variants={sectionVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                >
                                    <motion.div
                                        className="flex justify-center mb-8"
                                        variants={headingVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.5 }}
                                    >
                                        <h2 className="text-2xl sm:text-3xl font-semibold text-white border-b-2 border-amber-400 pb-2 px-6 flex items-center gap-3 text-center max-w-full sm:max-w-none mx-auto whitespace-normal sm:whitespace-nowrap break-words sm:break-normal">
                                            {getIconForBidang(namaBidang)} {namaBidang}
                                        </h2>
                                    </motion.div>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        {members.map((member, index) => (
                                            <MemberCard
                                                key={member.profiles.nama_lengkap}
                                                member={member}
                                                onClick={handleCardClick}
                                                index={index}
                                                totalMembersInBidang={members.length} // Tambahkan prop ini
                                            />
                                        ))}
                                    </div>
                                </motion.section>
                            );
                        })}
                    </div>
                </main>
                <Footer />
            </div>
            {/* AnimatePresence untuk ProfileModal berada di sini */}
            <AnimatePresence>
                {selectedMember && (
                    <ProfileModal member={selectedMember} onClose={handleCloseModal} />
                )}
            </AnimatePresence>
        </div>
    );
}