import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoaderCircle, ShieldCheck, Users, UserPlus, Trash2, Save, ServerCrash, Edit, X, Check, PlusCircle, Power, ChevronLeft, Settings, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

// Import gambar background
import heroBg from '../assets/bg9.jpg'; // Sesuaikan path jika berbeda

export default function ModerasiPengurus() {
    const { role, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk data
    const [periodeAktif, setPeriodeAktif] = useState(null);
    const [pengurus, setPengurus] = useState({});
    const [semuaPeriode, setSemuaPeriode] = useState([]);
    const [semuaPengguna, setSemuaPengguna] = useState([]);
    const [semuaBidang, setSemuaBidang] = useState([]);

    // Menyimpan ID periode yang DIPILIH di dropdown, bisa berbeda dari yang aktif.
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');

    // State untuk form tambah pengurus
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBidang, setSelectedBidang] = useState('');
    const [jabatan, setJabatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Digunakan juga untuk modal delete

    // State untuk edit nama periode (tidak ada di sini, tapi dipertahankan dari original)
    const [isEditingPeriode, setIsEditingPeriode] = useState(false);
    const [editedPeriodeName, setEditedPeriodeName] = useState('');

    // State untuk modal tambah periode baru
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPeriodeName, setNewPeriodeName] = useState('');
    const [isCreatingPeriode, setIsCreatingPeriode] = useState(false);

    // State untuk modal konfirmasi hapus pengurus
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [pengurusToDelete, setPengurusToDelete] = useState(null); // Menyimpan data pengurus yang akan dihapus

    // Gaya untuk efek glassmorphism pada card
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

    // Gaya glassmorphism untuk form input/select agar konsisten
    const glassFormStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '0.5rem', // Sedikit lebih kecil untuk form
    };

    // Fungsi untuk mengambil semua data yang dibutuhkan
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                periodeRes,
                penggunaRes,
                bidangRes
            ] = await Promise.all([
                supabase.from('periode_kepengurusan').select('*').order('id', { ascending: false }),
                supabase.from('profiles')
                    .select('id, nama_lengkap')
                    .in('role', ['admin', 'pengurus']) // Hanya ambil pengguna dengan role admin atau pengurus
                    .order('nama_lengkap'),
                supabase.from('bidang_pengurus').select('*').order('urutan')
            ]);

            if (periodeRes.error) throw periodeRes.error;
            if (penggunaRes.error) throw penggunaRes.error;
            if (bidangRes.error) throw bidangRes.error;

            setSemuaPeriode(periodeRes.data);
            const periodeSekarang = periodeRes.data.find(p => p.sedang_berjalan) || null;
            setPeriodeAktif(periodeSekarang);
            setEditedPeriodeName(periodeSekarang?.nama_periode || '');

            setSelectedPeriodeId(periodeSekarang?.id || '');

            setSemuaPengguna(penggunaRes.data);
            setSemuaBidang(bidangRes.data);

            if (periodeSekarang) {
                const { data: pengurusData, error: pengurusError } = await supabase
                    .from('jabatan_pengurus')
                    .select(`id, jabatan, id_pengguna, profiles (nama_lengkap), bidang_pengurus (nama_bidang)`)
                    .eq('id_periode', periodeSekarang.id);

                if (pengurusError) throw pengurusError;

                const grouped = pengurusData.reduce((acc, curr) => {
                    const bidang = curr.bidang_pengurus.nama_bidang;
                    if (!acc[bidang]) acc[bidang] = [];
                    acc[bidang].push(curr);
                    return acc;
                }, {});
                setPengurus(grouped);
            } else {
                setPengurus({});
            }
        } catch (err) {
            console.error("Error fetching moderation data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && role !== 'admin') {
            navigate('/dashboard', { replace: true });
            return;
        }
        if (role === 'admin') {
            fetchData();
        }
    }, [authLoading, role, navigate, fetchData]);

    const handleSetPeriodeAktif = async (periodeId) => {
        setLoading(true);
        try {
            if(periodeAktif) {
                await supabase.from('periode_kepengurusan').update({ sedang_berjalan: false }).eq('id', periodeAktif.id);
            }
            const { error } = await supabase.from('periode_kepengurusan').update({ sedang_berjalan: true }).eq('id', periodeId);
            if (error) throw error;
            fetchData();
        } catch (err) {
            alert(`Gagal mengubah periode aktif: ${err.message}`);
            setLoading(false);
        }
    };

    const handleTambahPengurus = async (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedBidang || !jabatan) {
            alert("Harap lengkapi semua kolom.");
            return;
        }
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('jabatan_pengurus').insert({ id_pengguna: selectedUser, id_periode: periodeAktif.id, id_bidang: selectedBidang, jabatan: jabatan });
            if (error) throw error;
            setSelectedUser('');
            setSelectedBidang('');
            setJabatan('');
            fetchData();
        } catch (err) {
            alert(`Gagal menambah pengurus: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHapusPengurus = (pengurusData) => {
        setPengurusToDelete(pengurusData);
        setIsDeleteConfirmModalOpen(true);
    };

    const confirmDeletePengurus = async () => {
        if (!pengurusToDelete) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('jabatan_pengurus').delete().eq('id', pengurusToDelete.id);
            if (error) throw error;
            fetchData();
            setIsDeleteConfirmModalOpen(false);
            setPengurusToDelete(null);
        } catch (err) {
            alert(`Gagal menghapus pengurus: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelDeletePengurus = () => {
        setIsDeleteConfirmModalOpen(false);
        setPengurusToDelete(null);
    };

    const handleUpdateNamaPeriode = async () => { if (!editedPeriodeName) { alert("Nama periode tidak boleh kosong."); return; } try { const { error } = await supabase.from('periode_kepengurusan').update({ nama_periode: editedPeriodeName }).eq('id', periodeAktif.id); if (error) throw error; setIsEditingPeriode(false); fetchData(); } catch (err) { alert(`Gagal mengubah nama periode: ${err.message}`); } };
    const handleBuatPeriodeBaru = async () => { if (!newPeriodeName.trim()) { alert("Nama periode baru tidak boleh kosong."); return; } setIsCreatingPeriode(true); try { if (periodeAktif) { const { error: updateError } = await supabase.from('periode_kepengurusan').update({ sedang_berjalan: false }).eq('id', periodeAktif.id); if (updateError) throw updateError; } const { error: insertError } = await supabase.from('periode_kepengurusan').insert({ nama_periode: newPeriodeName, sedang_berjalan: true }); if (insertError) throw insertError; setIsCreateModalOpen(false); setNewPeriodeName(''); fetchData(); } catch (err) { alert(`Gagal membuat periode baru: ${err.message}`); } finally { setIsCreatingPeriode(false); } };

    const baseButtonClass = "flex items-center justify-center gap-2 font-bold py-2 px-3 rounded-md transition-colors duration-200 border bg-white/5 border-white/10 hover:border-white/20 shadow-lg disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed";
    const iconButtonClass = "p-2 transition-colors duration-200 border bg-white/5 border-white/10 hover:border-white/20 rounded-md shadow-lg";

    const titleVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } } };
    const subtitleVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.7 } } };
    const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12, delayChildren: 0.2, staggerChildren: 0.05 } } };
    const headingVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    if (authLoading || loading) {
        return (
            <div className="relative min-h-screen text-white">
                <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
                    <div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div>
                </div>
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
            <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-center p-4">
                <ServerCrash className="h-16 w-16 text-red-500" />
                <h1 className="text-3xl font-bold text-red-400 mt-4">Terjadi Kesalahan</h1>
                <p className="text-gray-300 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen text-white">
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
                <div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow pt-24 pb-12">
                    {role === 'admin' && (
                        <>
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                            className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit"
                        >
                            <nav className="flex space-x-4 justify-center">
                                <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Struktur Pengurus">
                                    <ChevronLeft size={20} />
                                </Link>
                                <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Admin Pendaftaran">
                                    <UserPlus size={20} />
                                </Link>
                            </nav>
                        </motion.div>
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                            className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex"
                        >
                            <nav className="space-y-3">
                                <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Struktur Pengurus">
                                    <ChevronLeft size={20} />
                                </Link>
                                <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Admin Pendaftaran">
                                    <UserPlus size={20} />
                                </Link>
                            </nav>
                        </motion.div>
                        </>
                    )}

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 space-y-12">
                        <div className="text-center">
                            <motion.h1 variants={titleVariants} initial="hidden" animate="visible" className="text-4xl md:text-6xl font-league uppercase text-accent mb-2 drop-shadow-lg">
                                Moderasi Pengurus
                            </motion.h1>
                            <motion.p variants={subtitleVariants} initial="hidden" animate="visible" className="text-gray-300 drop-shadow-md">
                                Kelola periode kepengurusan dan anggota tim.
                            </motion.p>
                        </div>

                        <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                            <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold mb-4 flex items-center gap-3"><ShieldCheck className="text-amber-400"/>Panel Kontrol Periode</motion.h2>
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="font-medium">Periode Aktif Saat Ini:</span>
                                    {periodeAktif ? (
                                        <div className="flex items-center gap-2 bg-green-900/50 border border-green-700 px-3 py-1 rounded-full">
                                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                                            <span className="font-bold text-green-300">{periodeAktif.nama_periode}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Tidak ada periode aktif.</span>
                                    )}
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <label htmlFor="periode-select" className="block text-sm font-medium text-gray-400 mb-2">Ubah atau Buat Periode Baru</label>
                                    <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3">
                                        <select id="periode-select" value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} style={glassFormStyle} className="w-full md:w-auto px-3 py-2 focus:ring-amber-500 focus:border-amber-500">
                                            {semuaPeriode.map(p => (<option key={p.id} value={p.id} className="bg-gray-800 text-white">{p.nama_periode}</option>))}
                                        </select>
                                        {selectedPeriodeId && periodeAktif && selectedPeriodeId !== periodeAktif.id && (
                                            <button onClick={() => handleSetPeriodeAktif(selectedPeriodeId)} className={`${baseButtonClass} w-full md:w-auto text-blue-400`}>
                                                <Power size={18} />
                                                <span>Jadikan Aktif</span>
                                            </button>
                                        )}
                                        <button onClick={() => setIsCreateModalOpen(true)} className={`${baseButtonClass} w-full md:w-auto text-green-400`}>
                                            <PlusCircle size={18}/>
                                            <span>Buat Periode Baru</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                            <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold mb-4 flex items-center gap-3"><UserPlus className="text-amber-400"/>Angkat Pengurus Baru</motion.h2>
                            <form onSubmit={handleTambahPengurus} className="grid md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label htmlFor="user-select" className="block text-sm font-medium text-gray-400 mb-1">Pengguna</label>
                                    <select id="user-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required style={glassFormStyle} className="w-full p-2.5">
                                        <option value="" disabled className="bg-gray-800 text-white">Pilih Pengguna</option>
                                        {semuaPengguna.map(u => <option key={u.id} value={u.id} className="bg-gray-800 text-white">{u.nama_lengkap}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="bidang-select" className="block text-sm font-medium text-gray-400 mb-1">Bidang</label>
                                    <select id="bidang-select" value={selectedBidang} onChange={e => setSelectedBidang(e.target.value)} required style={glassFormStyle} className="w-full p-2.5">
                                        <option value="" disabled className="bg-gray-800 text-white">Pilih Bidang</option>
                                        {semuaBidang.map(b => <option key={b.id} value={b.id} className="bg-gray-800 text-white">{b.nama_bidang}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="jabatan-input" className="block text-sm font-medium text-gray-400 mb-1">Jabatan Spesifik</label>
                                    <input id="jabatan-input" type="text" value={jabatan} onChange={e => setJabatan(e.target.value)} required placeholder="Contoh: Ketua, Anggota" style={glassFormStyle} className="w-full p-2.5 placeholder-gray-400"/>
                                </div>
                                <div className="md:col-span-1">
                                    <button type="submit" disabled={isSubmitting || !periodeAktif} className={`${baseButtonClass} w-full text-amber-400`}>
                                        {isSubmitting ? <LoaderCircle className="animate-spin"/> : <Save size={20}/>} Simpan
                                    </button>
                                </div>
                            </form>
                        </motion.section>

                        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                            <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold mb-4 flex items-center gap-3"><Users className="text-amber-400"/>Struktur Kepengurusan Aktif</motion.h2>
                            <div className="space-y-6">
                                {Object.keys(pengurus).length > 0 ? Object.keys(pengurus).map(bidang => (
                                    <motion.div key={bidang} className="p-4" style={glassmorphismStyle} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 150, damping: 20 } } }}>
                                        <h3 className="text-xl font-semibold text-amber-400 mb-3">{bidang}</h3>
                                        <ul className="space-y-2">
                                            {pengurus[bidang].map(p => (
                                                <motion.li
                                                    key={p.id}
                                                    className="flex flex-row justify-between items-center bg-gray-700/50 p-2 rounded-md"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                >
                                                    <div className="flex-grow min-w-0 mr-2"> 
                                                        <p className="font-medium text-sm sm:text-base truncate">{p.profiles.nama_lengkap}</p>
                                                        <p className="text-xs sm:text-sm text-gray-400 truncate">{p.jabatan}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleHapusPengurus(p)} 
                                                        className={`${iconButtonClass} text-red-500 flex-shrink-0`}
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )) : <p className="text-center text-gray-400 py-8">Belum ada pengurus yang diangkat untuk periode ini.</p>}
                            </div>
                        </motion.section>

                    </div>
                </main>
                <Footer />
            </div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsCreateModalOpen(false)}>
                        <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="w-full max-w-md p-6" style={glassmorphismStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold mb-4">Buat Periode Kepengurusan Baru</h2>
                            <p className="text-gray-400 mb-6">Periode aktif saat ini akan diarsip dan periode baru ini akan langsung diaktifkan.</p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="new-periode-name" className="block text-sm font-medium text-gray-300 mb-1">Nama Periode Baru</label>
                                    <input id="new-periode-name" type="text" value={newPeriodeName} onChange={(e) => setNewPeriodeName(e.target.value)} placeholder="Contoh: Kepengurusan 2025/2026" style={glassFormStyle} className="w-full p-2.5 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"/>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button onClick={() => setIsCreateModalOpen(false)} className={`${baseButtonClass} text-gray-300`}>Batal</button>
                                    <button onClick={handleBuatPeriodeBaru} disabled={isCreatingPeriode} className={`${baseButtonClass} text-amber-400`}>{isCreatingPeriode ? <LoaderCircle className="animate-spin"/> : <Save/>} Simpan & Aktifkan</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteConfirmModalOpen && pengurusToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                        onClick={cancelDeletePengurus}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: -20 }}
                            className="w-full max-w-sm p-6 text-center"
                            style={glassmorphismStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <X size={24} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer" onClick={cancelDeletePengurus}/>
                            <Trash2 size={48} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Konfirmasi Hapus Pengurus</h2>
                            <p className="text-gray-300 mb-6">
                                Apakah Anda yakin ingin menghapus {pengurusToDelete.profiles.nama_lengkap} dari jabatan {pengurusToDelete.jabatan} di bidang {pengurusToDelete.bidang_pengurus.nama_bidang}?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button onClick={cancelDeletePengurus} className={`${baseButtonClass} flex-1 text-gray-300`} disabled={isSubmitting}>
                                    Batal
                                </button>
                                <button onClick={confirmDeletePengurus} className={`${baseButtonClass} flex-1 bg-red-600/50 hover:bg-red-700/50 text-white`} disabled={isSubmitting}>
                                    {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Check size={20} />} Ya, Hapus
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}