import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, Plus, Edit, Trash2, Power, Check, X, CalendarCheck, CalendarOff, Settings, PowerOff, Users, ArrowLeft, AlertTriangle } from 'lucide-react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- KOMPONEN MODAL KUSTOM BARU ---
const KonfirmasiModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
    confirmIcon,
    cancelIcon,
    isSaving = false,
    confirmActionType = 'default' // 'default' atau 'danger' untuk tombol hapus
}) => {
    // Latar belakang dibuat lebih transparan
    const glassmorphismStyle = {
        backgroundColor: 'rgba(29, 29, 40, 0.70)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        borderRadius: '1.25rem',
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } },
    };

    if (!isOpen) return null;

    // Menentukan style tombol konfirmasi berdasarkan tipenya
    const confirmButtonColor = confirmActionType === 'danger'
        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
        : 'text-white hover:bg-[#52525B]';

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
        >
            <motion.div
                style={glassmorphismStyle}
                className="relative w-full max-w-md p-8 text-white"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    aria-label="Tutup modal"
                >
                    <X size={24} />
                </button>

                <div className="text-center">
                    <h3 className="text-2xl font-bold text-amber-400 mb-4">{title}</h3>
                    <div className="text-gray-300 text-base leading-relaxed">{message}</div>
                </div>

                <div className={`flex gap-4 mt-8 ${onConfirm ? 'justify-center' : 'justify-center'}`}>
                    {/* Tombol Konfirmasi (jika ada) */}
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isSaving}
                            className={`flex items-center justify-center px-6 py-2.5 bg-[#3F3F46] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto ${confirmButtonColor}`}
                        >
                            {isSaving ? (
                                <>
                                    <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    {confirmIcon}
                                    <span>{confirmText}</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Tombol Batal/Tutup */}
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className={`flex items-center justify-center px-6 py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-60 w-full md:w-auto ${!onConfirm ? 'w-full max-w-xs' : ''}`}
                    >
                        {cancelIcon}
                        <span>{cancelText}</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function AdminPendaftaran() {
    // State
    const [semuaPeriode, setSemuaPeriode] = useState([]);
    const [memuat, setMemuat] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // State untuk form periode baru
    const [periodeBaru, setPeriodeBaru] = useState({ nama_periode: '', tahun_angkatan: '', deskripsi: '' });
    
    // State untuk Modal Kustom
    const [modalInfo, setModalInfo] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: '',
        cancelText: '',
        confirmIcon: null,
        cancelIcon: null,
        confirmActionType: 'default',
    });

    const tampilkanModal = (config) => {
        setModalInfo({
            isOpen: true,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm || null,
            confirmText: config.confirmText || 'Ya',
            cancelText: config.cancelText || 'Tutup',
            confirmIcon: config.confirmIcon || null,
            cancelIcon: config.cancelIcon || <X size={16} className="mr-2" />,
            confirmActionType: config.confirmActionType || 'default',
        });
    };
    
    const tutupModal = () => setModalInfo({ ...modalInfo, isOpen: false });

    const glassyButtonStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        borderRadius: '0.5rem',
    };

    // --- LOGIKA PENGAMBILAN ROLE PENGGUNA ---
    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    if (profileError) throw profileError;
                    setUserRole(profileData ? profileData.role : null);
                } else {
                    setUserRole(null);
                }
            } catch (err) {
                console.error('Error fetching user role:', err.message);
                setUserRole(null);
            }
        }
        getUserAndRole();
    }, []);

    // Fungsi untuk mengambil semua data periode dari database
    const ambilSemuaPeriode = useCallback(async () => {
        setMemuat(true);
        try {
            const { data, error } = await supabase
                .from('periode_pendaftaran')
                .select('*')
                .order('tahun_angkatan', { ascending: false });
            if (error) throw error;
            if (data) setSemuaPeriode(data);
        } catch (error) {
            console.error('Gagal mengambil data periode:', error.message);
            tampilkanModal({
                title: 'Gagal Memuat Data',
                message: 'Terjadi kesalahan saat memuat daftar periode. Periksa koneksi internet Anda dan coba lagi.',
                cancelText: 'Tutup'
            });
        } finally {
            setMemuat(false);
        }
    }, []);

    useEffect(() => {
        ambilSemuaPeriode();
    }, [ambilSemuaPeriode]);

    // Handler untuk input form periode baru
    const handleInputPeriodeBaru = (e) => {
        const { name, value } = e.target;
        setPeriodeBaru(prev => ({ ...prev, [name]: value }));
    };

    // Handler untuk membuat periode baru
    const handleBuatPeriode = async (e) => {
        e.preventDefault();
        if (!periodeBaru.nama_periode || !periodeBaru.tahun_angkatan) {
            tampilkanModal({
                title: 'Input Tidak Lengkap',
                message: 'Nama Periode dan Tahun Angkatan wajib diisi untuk membuat periode baru.',
                cancelText: 'Mengerti'
            });
            return;
        }
        setMenyimpan(true);
        try {
            const { error } = await supabase.from('periode_pendaftaran').insert(periodeBaru);
            if (error) throw error;
            tampilkanModal({
                title: 'Berhasil!',
                message: `Periode "${periodeBaru.nama_periode}" telah berhasil dibuat.`,
                cancelText: 'Selesai'
            });
            setPeriodeBaru({ nama_periode: '', tahun_angkatan: '', deskripsi: '' });
            ambilSemuaPeriode();
        } catch(error) {
            tampilkanModal({
                title: 'Gagal Membuat Periode',
                message: `Terjadi kesalahan: ${error.message}`,
                cancelText: 'Tutup'
            });
        } finally {
            setMenyimpan(false);
        }
    };

    // Handler untuk mengubah status aktif/nonaktif dan buka/tutup
    const handleSetAktif = async (idPeriode) => {
        setMenyimpan(true);
        try {
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: false }).neq('id', idPeriode);
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: true }).eq('id', idPeriode);
            ambilSemuaPeriode();
        } catch (error) {
            tampilkanModal({ title: 'Gagal Mengubah Status', message: `Error: ${error.message}` });
        } finally {
            setMenyimpan(false);
        }
    };

    const handleSetNonAktif = async (idPeriode) => {
        setMenyimpan(true);
        try {
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: false, telah_dibuka: false }).eq('id', idPeriode);
            ambilSemuaPeriode();
        } catch (error) {
            tampilkanModal({ title: 'Gagal Mengubah Status', message: `Error: ${error.message}` });
        } finally {
            setMenyimpan(false);
        }
    };
    
    const handleToggleBuka = async (periode) => {
        setMenyimpan(true);
        try {
            await supabase.from('periode_pendaftaran').update({ telah_dibuka: !periode.telah_dibuka }).eq('id', periode.id);
            ambilSemuaPeriode();
        } catch (error) {
            tampilkanModal({ title: 'Gagal Mengubah Status', message: `Error: ${error.message}` });
        } finally {
            setMenyimpan(false);
        }
    };
    
    // Handler untuk membuka modal konfirmasi penghapusan
    const handleHapusPeriode = (periode) => {
        tampilkanModal({
            title: 'Konfirmasi Hapus',
            message: (
                <>
                    Apakah Anda yakin ingin menghapus periode <br />
                    <strong className="font-semibold text-gray-300">"{periode.nama_periode}"</strong>?
                    <br /><br />
                    <span className="text-sm text-gray-400">Tindakan ini tidak dapat diurungkan.</span>
                </>
            ),
            onConfirm: () => confirmHapusPeriode(periode.id),
            confirmText: 'Ya, Hapus',
            confirmIcon: <Trash2 size={16} className="mr-2" />,
            cancelText: 'Batal',
            confirmActionType: 'danger' // Memicu warna merah pada tombol
        });
    };

    // Handler yang menjalankan penghapusan setelah dikonfirmasi
    const confirmHapusPeriode = async (id) => {
        if (!id) return;
        
        setMenyimpan(true);
        try {
            const { error } = await supabase.from('periode_pendaftaran').delete().eq('id', id);
            if (error) throw error;
            tutupModal(); // Tutup modal konfirmasi
            ambilSemuaPeriode();
            // Tampilkan notifikasi sukses
            setTimeout(() => {
                tampilkanModal({
                    title: 'Berhasil Dihapus',
                    message: 'Periode pendaftaran telah berhasil dihapus.',
                    cancelText: 'OK'
                });
            }, 300); // Sedikit delay agar transisi mulus
        } catch(error) {
            tutupModal();
             // Tampilkan notifikasi error
             setTimeout(() => {
                tampilkanModal({
                    title: 'Gagal Menghapus',
                    message: `Gagal menghapus: ${error.message}. Pastikan tidak ada data pendaftar yang terhubung ke periode ini.`,
                    cancelText: 'Tutup'
                });
            }, 300);
        } finally {
            setMenyimpan(false);
        }
    };

    if (memuat) {
        return (
            <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
                <div className="flex-grow flex items-center justify-center">
                    <LoaderCircle className="animate-spin h-8 w-8 mr-2 text-amber-400" /> Memuat Data...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <main className="flex-grow w-full p-4 md:p-8 pt-12 md:pt-16 lg:pt-20">
                <div className="max-w-4xl lg:max-w-[88%] mx-auto space-y-12">

                    {/* Menu Manajemen Pengurus */}
                    {userRole === 'admin' && (
                        <>
                            {/* Mobile */}
                            <div className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                                <nav className="flex space-x-4 justify-center">
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Pengurus"><ArrowLeft size={20} /></Link>
                                    <Link to="/moderasi-pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Moderasi Pengurus"><Settings size={20} /></Link>
                                </nav>
                            </div>
                            {/* Desktop */}
                            <div className="fixed left-4 top-1/2 -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                                <nav className="space-y-3">
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Pengurus"><ArrowLeft size={20} /></Link>
                                    <Link to="/moderasi-pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Moderasi Pengurus"><Settings size={20} /></Link>
                                </nav>
                            </div>
                        </>
                    )}
                    
                    {/* Header Halaman */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-6xl uppercase font-league font-bold text-amber-400 mb-2 drop-shadow-lg">
                            Admin Pendaftaran
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl">Kelola periode dan status pendaftaran anggota baru.</p>
                    </div>

                    {/* Form Membuat Periode Baru */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-5 text-white flex items-center">
                            <Plus size={24} className="mr-2 text-amber-300" /> Buat Periode Baru
                        </h2>
                        <form onSubmit={handleBuatPeriode} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nama_periode" className="block text-sm font-medium text-gray-300 mb-1">Nama Periode <span className="text-red-500">*</span></label>
                                    <input type="text" id="nama_periode" name="nama_periode" value={periodeBaru.nama_periode} onChange={handleInputPeriodeBaru} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="Cth: Pendaftaran Angkatan XXII"/>
                                </div>
                                <div>
                                    <label htmlFor="tahun_angkatan" className="block text-sm font-medium text-gray-300 mb-1">Untuk Angkatan Tahun <span className="text-red-500">*</span></label>
                                    <input type="number" id="tahun_angkatan" name="tahun_angkatan" value={periodeBaru.tahun_angkatan} onChange={handleInputPeriodeBaru} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="Cth: 2025"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
                                <textarea id="deskripsi" name="deskripsi" value={periodeBaru.deskripsi} onChange={handleInputPeriodeBaru} rows="3" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors" placeholder="Deskripsi singkat untuk halaman pendaftaran..."></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={menyimpan} style={glassyButtonStyle} className="px-6 py-2 text-amber-400 hover:text-amber-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200">
                                    {menyimpan ? <LoaderCircle size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                                    {menyimpan ? 'Membuat...' : 'Buat Periode'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Daftar Periode yang Ada */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                            <CalendarCheck size={24} className="mr-2 text-amber-300" /> Daftar Periode
                        </h2>
                        <div className="space-y-4">
                            {semuaPeriode.map(periode => (
                                <div key={periode.id} className={`p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${periode.sedang_aktif ? 'bg-white/5 border-l-4 border-amber-500 shadow-md' : 'bg-gray-700 border-l-4 border-gray-600'}`}>
                                    <div className="flex-grow text-center md:text-left">
                                        <h3 className="font-bold text-xl text-white">{periode.nama_periode}</h3>
                                        <p className="text-gray-400 text-sm">Angkatan Tahun: {periode.tahun_angkatan}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400 justify-center md:justify-start">
                                            {periode.sedang_aktif ? (<span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full"><Check size={14}/> Periode Aktif</span>) : (<span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full"><X size={14}/> Tidak Aktif</span>)}
                                            {periode.sedang_aktif && (periode.telah_dibuka ? (<span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full"><CalendarCheck size={14}/> Dibuka</span>) : (<span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full"><CalendarOff size={14}/> Ditutup</span>))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                        {periode.sedang_aktif ? (
                                            <button onClick={() => handleSetNonAktif(periode.id)} disabled={menyimpan} title="Jadikan periode ini nonaktif" style={glassyButtonStyle} className="px-4 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg disabled:opacity-50 flex items-center transition-colors"><PowerOff size={16} className="mr-1"/> Nonaktifkan</button>
                                        ) : (
                                            <button onClick={() => handleSetAktif(periode.id)} disabled={menyimpan} title="Jadikan periode ini aktif" style={glassyButtonStyle} className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 rounded-lg disabled:opacity-50 flex items-center transition-colors"><Power size={16} className="mr-1"/> Aktifkan</button>
                                        )}
                                        {periode.sedang_aktif && (
                                            <button onClick={() => handleToggleBuka(periode)} disabled={menyimpan} title={periode.telah_dibuka ? "Tutup Pendaftaran" : "Buka Pendaftaran"} style={glassyButtonStyle} className={`px-4 py-2 text-sm rounded-lg flex items-center transition-colors ${periode.telah_dibuka ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                                                {periode.telah_dibuka ? <CalendarOff size={16} className="mr-1"/> : <CalendarCheck size={16} className="mr-1"/>}
                                                {periode.telah_dibuka ? 'Tutup' : 'Buka'}
                                            </button>
                                        )}
                                        <button onClick={() => handleHapusPeriode(periode)} disabled={menyimpan || periode.sedang_aktif} title={periode.sedang_aktif ? "Tidak dapat menghapus periode aktif" : "Hapus periode ini"} style={glassyButtonStyle} className="p-2 text-red-400 hover:text-red-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {semuaPeriode.length === 0 && <p className='text-center text-gray-500 py-4'>Belum ada periode pendaftaran yang dibuat.</p>}
                        </div>
                    </div>

                </div>
            </main>

            {/* Render Modal Konfirmasi Kustom */}
            <AnimatePresence>
                {modalInfo.isOpen && (
                    <KonfirmasiModal
                        isOpen={modalInfo.isOpen}
                        onClose={tutupModal}
                        onConfirm={modalInfo.onConfirm}
                        title={modalInfo.title}
                        message={modalInfo.message}
                        confirmText={modalInfo.confirmText}
                        cancelText={modalInfo.cancelText}
                        confirmIcon={modalInfo.confirmIcon}
                        cancelIcon={modalInfo.cancelIcon}
                        isSaving={menyimpan}
                        confirmActionType={modalInfo.confirmActionType}
                    />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}