import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoaderCircle, User, X, CheckCircle, AlertTriangle, Users, ChevronLeft, XCircle, Timer, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import heroBg from '../assets/bg10.jpg';

// --- Komponen Modal Notifikasi (Reusable) ---
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
    const iconBgColors = { success: 'bg-green-500/20', error: 'bg-red-500/20', warning: 'bg-amber-500/20' };
    const iconBorderColors = { success: 'border-green-500/50', error: 'border-red-500/50', warning: 'border-amber-500/50' };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative p-6 text-center text-white max-w-md w-full" style={glassmorphismStyle} onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 border ${iconBgColors[type]} ${iconBorderColors[type]}`}>{icons[type]}</div>
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


export default function PemilihanKomandan() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePeriod, setActivePeriod] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [userVote, setUserVote] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [visiMisi, setVisiMisi] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [countdown, setCountdown] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const { data: periodData, error: periodError } = await supabase.from('periode_komandan').select('*').eq('is_active', true).limit(1).single();
            if (periodError && periodError.code !== 'PGRST116') throw periodError;
            if (!periodData) { setLoading(false); return; }
            setActivePeriod(periodData);

            const { data: candidatesData, error: candidatesError } = await supabase.from('calon_komandan').select('id, nama_calon, npt_calon, visi_misi, id_pengguna, profiles(avatar_url)').eq('id_periode', periodData.id);
            if (candidatesError) throw candidatesError;

            const candidateIds = candidatesData.map(c => c.id);
            const { data: votesData, error: votesError } = await supabase.from('vote_komandan').select('id_calon, id_pemilih').in('id_calon', candidateIds);
            if (votesError) throw votesError;

            let candidatesWithVotes = candidatesData.map(candidate => ({
                ...candidate,
                vote_count: votesData.filter(vote => vote.id_calon === candidate.id).length,
            }));
            
            if (periodData.hasil_ditampilkan) {
                candidatesWithVotes.sort((a, b) => {
                    if (b.vote_count !== a.vote_count) {
                        return b.vote_count - a.vote_count;
                    }
                    return a.npt_calon.localeCompare(b.npt_calon);
                });
            }

            setUserVote(votesData.find(vote => vote.id_pemilih === user.id) || null);
            setIsRegistered(candidatesData.some(c => c.id_pengguna === user.id));
            setCandidates(candidatesWithVotes);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (role === 'admin' || role === 'pengurus') {
            fetchData();
        } else if (user) {
            setError("Anda tidak memiliki izin untuk mengakses halaman ini.");
            setLoading(false);
        }
    }, [user, role, fetchData]);

    useEffect(() => {
        if (!activePeriod || activePeriod.status_vote !== 'berlangsung') {
            setIsVotingOpen(false);
            setCountdown('');
            return;
        }

        const interval = setInterval(() => {
            const startTime = new Date(activePeriod.waktu_mulai_vote);
            const durationMillis = activePeriod.durasi_vote_menit * 60 * 1000;
            const endTime = new Date(startTime.getTime() + durationMillis);
            const now = new Date();
            const distance = endTime.getTime() - now.getTime();

            if (distance < 0) {
                clearInterval(interval);
                setIsVotingOpen(false);
                setCountdown("Waktu voting telah habis.");
                if (activePeriod.status_vote !== 'selesai') {
                    supabase.rpc('tutup_vote_periode', { p_id: activePeriod.id }).then(() => fetchData());
                }
                return;
            }

            setIsVotingOpen(true);
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [activePeriod, fetchData]);

    const handleVote = async (candidateId) => {
        if (!user || !activePeriod || userVote || !isVotingOpen) return;
        setIsSubmitting(true);
        try {
            await supabase.from('vote_komandan').insert({ id_calon: candidateId, id_pemilih: user.id });
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Terima kasih, suara Anda telah dicatat!' });
            fetchData();
        } catch (err) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: `Gagal memberikan suara: ${err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelVote = async () => {
        if (!user || !userVote || !isVotingOpen) return;
        setIsSubmitting(true);
        try {
            await supabase.from('vote_komandan').delete().eq('id_pemilih', user.id);
            setNotification({ isOpen: true, type: 'success', title: 'Dibatalkan', message: 'Pilihan Anda berhasil dibatalkan.' });
            fetchData();
        } catch (err) {
            setNotification({ isOpen: true, type: 'error', title: 'Gagal', message: `Gagal membatalkan pilihan: ${err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterCandidate = async (e) => {
        e.preventDefault();
        if (!user || !activePeriod || !visiMisi) {
            setNotification({ isOpen: true, type: 'warning', title: 'Visi & Misi Kosong', message: 'Mohon isi Visi & Misi Anda untuk mendaftar.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('nama_lengkap, npt').eq('id', user.id).single();
            if (profileError || !profileData) throw new Error("Gagal mengambil data profil Anda. Pastikan profil Anda sudah lengkap.");
            await supabase.from('calon_komandan').insert({
                id_pengguna: user.id,
                nama_calon: profileData.nama_lengkap,
                npt_calon: profileData.npt,
                visi_misi: visiMisi,
                id_periode: activePeriod.id,
            });
            setNotification({ isOpen: true, type: 'success', title: 'Pendaftaran Berhasil', message: 'Anda berhasil terdaftar sebagai calon komandan!' });
            setIsRegisterModalOpen(false);
            setVisiMisi('');
            fetchData();
        } catch (err) {
            const errorMessage = err.code === '23505' ? 'Anda sudah terdaftar sebagai calon di periode ini.' : err.message;
            setNotification({ isOpen: true, type: 'error', title: 'Gagal Mendaftar', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const highestVoteCount = candidates.length > 0 && activePeriod?.hasil_ditampilkan ? candidates[0].vote_count : 0;
    const isTie = highestVoteCount > 0 && candidates.filter(c => c.vote_count === highestVoteCount).length > 1;

    return (
        <div className="relative min-h-screen text-white">
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}><div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div></div>
            <div className="relative z-10 flex flex-col min-h-screen">

                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="fixed left-4 top-[48%] -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                    <nav className="space-y-3">
                        <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Manajemen Pengurus">
                            <ChevronLeft size={20} />
                        </Link>
                        {role === 'admin' && (
                             <Link to="/admin-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Admin Pemilihan">
                                <Crown size={20} />
                             </Link>
                        )}
                    </nav>
                </motion.div>

                <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24">
                    <div className="max-w-7xl mx-auto">
                        
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                            <nav className="flex space-x-4 justify-center">
                                <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Manajemen Pengurus">
                                    <ChevronLeft size={20} />
                                </Link>
                                {role === 'admin' && (
                                     <Link to="/admin-komandan" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Admin Pemilihan">
                                        <Crown size={20} />
                                     </Link>
                                )}
                            </nav>
                        </motion.div>

                        <h1 className="text-6xl font-league uppercase text-accent drop-shadow-lg text-center mb-4">
                            {activePeriod ? activePeriod.nama_periode : 'Pemilihan Komandan'}
                        </h1>
                        
                        {activePeriod && (
                            <div className="flex justify-center mb-8">
                                <div className="p-3 rounded-lg text-center" style={glassmorphismStyle}>
                                    {activePeriod.status_vote === 'belum_dimulai' && <p className="text-base text-gray-400">Voting belum dimulai.</p>}
                                    {activePeriod.status_vote === 'berlangsung' && countdown && (
                                        <p className="text-base text-amber-400 flex items-center gap-2"><Timer size={18} /> Sisa Waktu: <span className="font-bold tracking-widest">{countdown}</span></p>
                                    )}
                                    {activePeriod.status_vote === 'selesai' && <p className="text-base text-red-400">Voting untuk periode ini telah ditutup.</p>}
                                </div>
                            </div>
                        )}
                        
                        {loading && <div className="flex justify-center mt-10"><LoaderCircle className="animate-spin h-12 w-12 text-amber-400" /></div>}
                        {error && <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}

                        {!loading && !error && (
                            <>
                                {!activePeriod ? (
                                    <div className="text-center p-8 rounded-lg" style={glassmorphismStyle}>
                                        <h2 className="text-2xl font-semibold text-gray-400">Saat Ini Tidak Ada Periode Pemilihan Aktif</h2>
                                    </div>
                                ) : (
                                    <div>
                                        {activePeriod.status_vote === 'belum_dimulai' && !isRegistered && (
                                            <div className="mb-8 flex justify-center">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsRegisterModalOpen(true)} style={glassmorphismStyle} className="px-6 py-3 font-bold rounded-md transition-all duration-300 shadow-lg flex items-center gap-2 text-green-400 hover:bg-green-500/10">
                                                    <User className="inline" size={20}/> Daftarkan Diri Sebagai Calon
                                                </motion.button>
                                            </div>
                                        )}
                                        
                                        {candidates.length === 0 ? (
                                            <p className="text-center text-gray-400 mt-8">Belum ada calon yang mendaftar untuk periode ini.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {candidates.map((candidate) => {
                                                    const isTopCandidate = activePeriod.hasil_ditampilkan && highestVoteCount > 0 && candidate.vote_count === highestVoteCount;
                                                    const isSoleWinner = isTopCandidate && !isTie;
                                                    const isTiedWinner = isTopCandidate && isTie;
                                                    
                                                    return (
                                                        <motion.div 
                                                            key={candidate.id} 
                                                            layout
                                                            initial={{ opacity: 0, y: 20 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }} 
                                                            className={`relative flex flex-col text-center transition-all duration-300 ${
                                                                isSoleWinner ? 'border-amber-400 scale-105 shadow-xl shadow-amber-500/20' :
                                                                isTiedWinner ? 'border-cyan-400 scale-105 shadow-xl shadow-cyan-500/20' :
                                                                'border-white/20'
                                                            }`}
                                                            style={{...glassmorphismStyle, padding: '1.5rem'}}
                                                        >
                                                            {(isSoleWinner || isTiedWinner) && (
                                                                <div className="absolute top-0 right-0 p-2 bg-black/20 rounded-bl-lg rounded-tr-lg backdrop-blur-sm">
                                                                    <Crown className={isTiedWinner ? "text-cyan-400" : "text-amber-400"} size={24}/>
                                                                </div>
                                                            )}
                                                            {isTiedWinner && (
                                                                <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-cyan-200 bg-cyan-500/30 rounded-full shadow-lg">SERI</div>
                                                            )}
                                                            <img src={candidate.profiles.avatar_url || `https://placehold.co/128x128/1a202c/FFFFFF?text=${candidate.nama_calon.charAt(0)}`} alt={candidate.nama_calon} className="w-32 h-32 rounded-full object-cover border-4 border-white/30 mb-4 mx-auto" />
                                                            <h3 className="text-xl font-bold text-amber-400">{candidate.nama_calon}</h3>
                                                            <p className="text-sm text-gray-400 mb-4">NPT: {candidate.npt_calon}</p>
                                                            <p className="text-xs text-gray-300 italic flex-grow mb-4 whitespace-pre-line">"{candidate.visi_misi || 'Belum ada visi & misi.'}"</p>
                                                            <div className="font-bold text-2xl mb-4">
                                                                {activePeriod.hasil_ditampilkan ? `Total Suara: ${candidate.vote_count}` : 'Suara Disembunyikan'}
                                                            </div>

                                                            {userVote && userVote.id_calon === candidate.id ? (
                                                                <button onClick={handleCancelVote} disabled={!isVotingOpen || isSubmitting} style={glassmorphismStyle} className="w-full px-4 py-2 font-semibold rounded-md transition-colors disabled:opacity-50 text-red-400 hover:bg-red-500/10 disabled:hover:bg-transparent disabled:text-gray-500">
                                                                    <X className="inline mr-2" size={16}/> Batalkan Pilihan
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleVote(candidate.id)} disabled={!isVotingOpen || !!userVote || isSubmitting} style={glassmorphismStyle} className="w-full px-4 py-2 font-semibold rounded-md transition-colors disabled:bg-gray-800/50 disabled:cursor-not-allowed disabled:text-gray-500 text-amber-400 hover:bg-amber-500/10">
                                                                    Beri Suara
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
                <Footer />
            </div>

            <AnimatePresence>
                {isRegisterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="w-full max-w-lg" style={{...glassmorphismStyle, padding: '2rem'}}>
                            <h2 className="text-2xl font-bold mb-4">Daftar Sebagai Calon</h2>
                            <form onSubmit={handleRegisterCandidate}>
                                <label className="block text-sm text-gray-300 mb-2">Visi & Misi</label>
                                <textarea value={visiMisi} onChange={(e) => setVisiMisi(e.target.value)} rows="5" className="w-full p-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none" placeholder="Jelaskan visi dan misi Anda..." required></textarea>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 rounded-md text-gray-300 hover:bg-white/10">Batal</button>
                                    <button type="submit" disabled={isSubmitting} style={glassmorphismStyle} className="px-4 py-2 rounded-md font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-50">
                                        {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} type={notification.type} title={notification.title} message={notification.message} />
        </div>
    );
}