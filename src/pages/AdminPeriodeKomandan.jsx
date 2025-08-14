import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoaderCircle, Plus, Edit, Trash2, Power, AlertTriangle, CheckCircle, XCircle, Users, ChevronLeft, Play, Square, Eye, PowerOff, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import heroBg from '../assets/bg10.jpg';
import favicon from '../assets/logo_bintangcompress.png';

// --- Komponen-komponen Modal ---
const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.8rem',
};

const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;
    const icons = {
        success: <CheckCircle size={40} className="text-green-400" />,
        error: <XCircle size={40} className="text-red-400" />,
        warning: <AlertTriangle size={40} className="text-amber-400" />,
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative p-6 text-center text-white max-w-md w-full" style={glassmorphismStyle} onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 border bg-white/5`}>{icons[type]}</div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <p className="text-gray-300 mb-6">{message}</p>
                            <button onClick={onClose} style={{...glassmorphismStyle, backgroundColor: 'rgba(255, 255, 255, 0.1)'}} className="w-full py-2.5 px-4 rounded-lg font-semibold text-white hover:bg-white/20 transition-colors">Tutup</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi Hapus', confirmButtonClass = 'text-red-400 hover:text-red-300' }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative p-6 text-center text-white max-w-md w-full" style={glassmorphismStyle} onClick={(e) => e.stopPropagation()}>
                         <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4 border border-amber-500/50 bg-amber-500/20"><AlertTriangle size={40} className="text-amber-400" /></div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <div className="text-gray-300 mb-6">{message}</div>
                            <div className="flex justify-center items-center gap-4 w-full">
                                <button onClick={onClose} style={{ ...glassmorphismStyle, backgroundColor: 'transparent' }} className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-300 hover:text-white transition-colors">Batal</button>
                                <button onClick={onConfirm} style={{ ...glassmorphismStyle, backgroundColor: 'transparent' }} className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-colors ${confirmButtonClass}`}>
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


export default function AdminPeriodeKomandan() {
    const { role } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [periods, setPeriods] = useState([]);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [newPeriodData, setNewPeriodData] = useState({ nama_periode: '', tahun_angkatan: '' });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Konfirmasi Hapus', confirmButtonClass: 'text-red-400 hover:text-red-300' });
    
    const [durationModal, setDurationModal] = useState({ isOpen: false, periodId: null });
    const [voteDuration, setVoteDuration] = useState('15');

    useEffect(() => {
        if (role && role !== 'admin') {
            navigate('/dashboard');
        }
    }, [role, navigate]);

    const fetchPeriods = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('periode_komandan')
            .select('*')
            .order('dibuat_pada', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setPeriods(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (role === 'admin') {
            fetchPeriods();
        }
    }, [role, fetchPeriods]);

    const handleOpenFormModal = (period = null) => {
        if (period) {
            setCurrentPeriod(period);
            setNewPeriodData({ nama_periode: period.nama_periode, tahun_angkatan: period.tahun_angkatan });
        } else {
            setCurrentPeriod(null);
            setNewPeriodData({ nama_periode: '', tahun_angkatan: new Date().getFullYear() });
        }
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let error;
        const dataToSubmit = { ...newPeriodData, is_active: currentPeriod ? currentPeriod.is_active : false };

        if (currentPeriod) {
            ({ error } = await supabase.from('periode_komandan').update(dataToSubmit).eq('id', currentPeriod.id));
        } else {
            ({ error } = await supabase.from('periode_komandan').insert(dataToSubmit));
        }

        if (error) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
        } else {
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: `Periode berhasil ${currentPeriod ? 'diperbarui' : 'dibuat'}.` });
            setIsFormModalOpen(false);
            fetchPeriods();
        }
        setIsSubmitting(false);
    };

    const handleActivate = (periodId) => {
        const activePeriod = periods.find(p => p.is_active);

        const proceedWithActivation = async () => {
            setIsSubmitting(true);
            const { error } = await supabase.rpc('activate_periode_komandan', { p_id: periodId });

            if (error) {
                setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: `Gagal mengaktifkan: ${error.message}` });
            } else {
                setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Periode telah diaktifkan.' });
                fetchPeriods();
            }
            setIsSubmitting(false);
        };

        if (activePeriod && activePeriod.id !== periodId) {
            setConfirmAction({
                isOpen: true,
                title: 'Konfirmasi Aktivasi Periode',
                message: `Periode "${activePeriod.nama_periode}" sedang aktif. Mengaktifkan periode baru akan menonaktifkan periode tersebut. Lanjutkan?`,
                confirmText: 'Ya, Aktifkan',
                confirmButtonClass: 'text-green-400 hover:text-green-300',
                onConfirm: () => {
                    setConfirmAction({ ...confirmAction, isOpen: false });
                    proceedWithActivation();
                }
            });
        } else {
            proceedWithActivation();
        }
    };

    const handleDeactivate = async (periodId) => {
        setIsSubmitting(true);
        const { error } = await supabase
            .from('periode_komandan')
            .update({ is_active: false })
            .eq('id', periodId);

        if (error) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: `Gagal menonaktifkan: ${error.message}` });
        } else {
            setNotification({ isOpen: true, type: 'warning', title: 'Berhasil', message: 'Periode telah dinonaktifkan.' });
            fetchPeriods();
        }
        setIsSubmitting(false);
    };
    
    const handleDelete = (periodId) => {
        setConfirmAction({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Anda yakin ingin menghapus periode ini? Semua data calon dan vote yang terkait akan ikut terhapus secara permanen.',
            confirmText: 'Konfirmasi Hapus',
            confirmButtonClass: 'text-red-400 hover:text-red-300',
            onConfirm: async () => {
                setConfirmAction({ ...confirmAction, isOpen: false });
                const { error } = await supabase.from('periode_komandan').delete().eq('id', periodId);
                if (error) {
                    setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
                } else {
                    setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Periode telah dihapus.' });
                    fetchPeriods();
                }
            }
        });
    };

    // FUNGSI UNTUK MELIHAT/MENYEMBUNYIKAN HASIL DITAMBAHKAN KEMBALI
    const handleToggleHasil = async (periodId, shouldShow) => {
        setIsSubmitting(true);
        const { error } = await supabase
            .from('periode_komandan')
            .update({ hasil_ditampilkan: shouldShow })
            .eq('id', periodId);

        if (error) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: `Gagal mengubah status hasil: ${error.message}` });
        } else {
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: `Hasil voting telah ${shouldShow ? 'ditampilkan' : 'disembunyikan'}.` });
            fetchPeriods();
        }
        setIsSubmitting(false);
    };

    const handleOpenDurationModal = (periodId) => {
        setDurationModal({ isOpen: true, periodId: periodId });
    };

    const handleConfirmMulaiVote = async (e) => {
        e.preventDefault();
        const { periodId } = durationModal;
        if (!voteDuration || isNaN(voteDuration) || parseInt(voteDuration) <= 0) {
            setNotification({ isOpen: true, type: 'warning', title: 'Input Tidak Valid', message: 'Harap masukkan durasi yang valid dalam angka.' });
            return;
        }

        setIsSubmitting(true);
        setDurationModal({ isOpen: false, periodId: null });
        const { error } = await supabase.rpc('mulai_vote_periode', { p_id: periodId, p_durasi: parseInt(voteDuration) });
        if (error) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
        } else {
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Voting telah dimulai!' });
            fetchPeriods();
        }
        setIsSubmitting(false);
    };

    const handleTutupVote = async (periodId) => {
        setIsSubmitting(true);
        const { error } = await supabase.rpc('tutup_vote_periode', { p_id: periodId });
        if (error) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
        } else {
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Voting telah ditutup secara manual.' });
            fetchPeriods();
        }
        setIsSubmitting(false);
    };
    
    if (role && role !== 'admin') {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                Anda tidak memiliki izin untuk mengakses halaman ini.
            </div>
        );
    }
    
    return (
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Admin Periode Komandan - STMKG Karate Club</title>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}><div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div></div>
            
            <div className="relative z-10 flex flex-col min-h-screen">
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="fixed left-4 top-[48%] -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                    <nav className="space-y-3">
                        <Link to="/pemilihan-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Halaman Pemilihan"><ChevronLeft size={20} /></Link>
                        <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Manajemen Pengurus"><Users size={20} /></Link>
                    </nav>
                </motion.div>

                <main className="flex-grow pt-24 pb-12 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20">
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                            <nav className="flex space-x-4 justify-center">
                                <Link to="/pemilihan-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Halaman Pemilihan"><ChevronLeft size={20} /></Link>
                                <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Manajemen Pengurus"><Users size={20} /></Link>
                            </nav>
                        </motion.div>
                        
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl md:text-5xl font-league uppercase text-accent drop-shadow-lg">Manajemen Periode Pemilihan Komandan</h1>
                            <button onClick={() => handleOpenFormModal()} style={glassmorphismStyle} className="flex items-center gap-2 px-4 py-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors shadow-lg">
                                <Plus size={20} /> Tambah Periode
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center"><LoaderCircle className="animate-spin h-8 w-8" /></div>
                        ) : error ? (
                            <p className="text-red-400 text-center">{error}</p>
                        ) : (
                            <div className="overflow-x-auto" style={glassmorphismStyle}>
                                <table className="min-w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Periode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tahun</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status Periode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status Vote</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {periods.map(period => (
                                            <tr key={period.id} className="hover:bg-white/5">
                                                <td className="px-6 py-4 whitespace-nowrap">{period.nama_periode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{period.tahun_angkatan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${period.is_active ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>{period.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${period.status_vote === 'berlangsung' ? 'bg-blue-500/30 text-blue-300' : period.status_vote === 'selesai' ? 'bg-red-500/30 text-red-300' : 'bg-gray-500/30 text-gray-300'}`}>{period.status_vote.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* TOMBOL LIHAT HASIL DITAMBAHKAN KEMBALI */}
                                                        {period.status_vote === 'selesai' && (
                                                            period.hasil_ditampilkan ? (
                                                                <button onClick={() => handleToggleHasil(period.id, false)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400" title="Sembunyikan Hasil"><EyeOff size={18} /></button>
                                                            ) : (
                                                                <button onClick={() => handleToggleHasil(period.id, true)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-cyan-400" title="Tampilkan Hasil"><Eye size={18} /></button>
                                                            )
                                                        )}
                                                        {period.is_active && period.status_vote === 'belum_dimulai' && (
                                                            <button onClick={() => handleOpenDurationModal(period.id)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-400" title="Mulai Vote"><Play size={18} /></button>
                                                        )}
                                                        {period.is_active && period.status_vote === 'berlangsung' && (
                                                            <button onClick={() => handleTutupVote(period.id)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400" title="Tutup Vote Sekarang"><Square size={18} /></button>
                                                        )}
                                                        
                                                        {period.is_active ? (
                                                            <button onClick={() => handleDeactivate(period.id)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-yellow-400" title="Nonaktifkan Periode">
                                                                <PowerOff size={18} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleActivate(period.id)} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-full transition-colors text-green-400" title="Aktifkan Periode">
                                                                <Power size={18} />
                                                            </button>
                                                        )}

                                                        <button onClick={() => handleOpenFormModal(period)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-amber-400" title="Edit"><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete(period.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400" title="Hapus"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                <AnimatePresence>
                    {isFormModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="w-full max-w-md" style={{...glassmorphismStyle, padding: '2rem'}}>
                                <h2 className="text-xl font-bold mb-4">{currentPeriod ? 'Edit Periode' : 'Tambah Periode Baru'}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Nama Periode</label><input type="text" required value={newPeriodData.nama_periode} onChange={e => setNewPeriodData({...newPeriodData, nama_periode: e.target.value})} className="w-full p-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"/></div>
                                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Tahun Kepengurusan</label><input type="number" required value={newPeriodData.tahun_angkatan} onChange={e => setNewPeriodData({...newPeriodData, tahun_angkatan: e.target.value})} className="w-full p-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"/></div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button type="button" onClick={() => setIsFormModalOpen(false)} style={glassmorphismStyle} className="px-4 py-2 rounded-md hover:bg-white/20 text-gray-300 hover:text-white">Batal</button>
                                        <button type="submit" disabled={isSubmitting} style={glassmorphismStyle} className="px-4 py-2 rounded-md hover:bg-amber-500/20 font-semibold text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {durationModal.isOpen && (
                         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="w-full max-w-md" style={{...glassmorphismStyle, padding: '2rem'}}>
                                <h2 className="text-xl font-bold mb-4">Mulai Voting</h2>
                                <form onSubmit={handleConfirmMulaiVote}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Durasi Voting (Menit)</label>
                                        <input type="number" required value={voteDuration} onChange={e => setVoteDuration(e.target.value)} className="w-full p-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"/>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button type="button" onClick={() => setDurationModal({isOpen: false, periodId: null})} style={glassmorphismStyle} className="px-4 py-2 rounded-md hover:bg-white/20 text-gray-300 hover:text-white">Batal</button>
                                        <button type="submit" disabled={isSubmitting} style={glassmorphismStyle} className="px-4 py-2 rounded-md hover:bg-blue-500/20 font-semibold text-blue-400 disabled:opacity-50">
                                            {isSubmitting ? 'Memulai...' : 'Mulai Voting'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                
                <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} type={notification.type} title={notification.title} message={notification.message} />
                <ConfirmationModal 
                    isOpen={confirmAction.isOpen} 
                    onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })} 
                    onConfirm={confirmAction.onConfirm} 
                    title={confirmAction.title} 
                    message={confirmAction.message}
                    confirmText={confirmAction.confirmText}
                    confirmButtonClass={confirmAction.confirmButtonClass}
                />
                
                <Footer />
            </div>
        </div>
    );
}
