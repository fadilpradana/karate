// src/pages/LupaPassword.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, LoaderCircle, Phone, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import favicon from '../assets/logo_bintangcompress.png';

function LupaPassword() {
    const [step, setStep] = useState(1);
    const [npt, setNpt] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userId, setUserId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: null });
    const navigate = useNavigate();

    const glassFrameStyle = { 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.3)', 
        boxShadow: `0px 1px 3px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.11), inset -1px -1px 2px rgba(0, 0, 0, 0.1)` 
    };

    const showFeedback = (message, type) => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: null }), 5000);
    };

    const handleNptSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('reset-password-with-npt', {
                body: { action: 'verify-npt', npt },
            });
            if (error) throw error;
            if (!data.success) throw new Error(data.message);
            
            setUserId(data.userId);
            setStep(2);
            showFeedback('NPT ditemukan. Silakan masukkan nomor telepon Anda.', 'success');
        } catch (error) {
            // [PERBAIKAN ULANG] Logika penanganan error yang lebih tangguh
            let errorMessage = 'Terjadi kesalahan.';
            if (error.context?.message) {
                errorMessage = error.context.message;
            } else if (error.message.includes('non-2xx')) {
                errorMessage = 'NPT tidak ditemukan atau tidak valid.';
            } else {
                errorMessage = error.message;
            }
            showFeedback(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('reset-password-with-npt', {
                body: { action: 'verify-secondary', userId, nomorTelepon },
            });
            if (error) throw error;
            if (!data.success) throw new Error(data.message);
            
            setStep(3);
            showFeedback('Verifikasi berhasil. Silakan buat password baru Anda.', 'success');
        } catch (error) {
            // [PERBAIKAN ULANG] Logika penanganan error yang lebih tangguh
            let errorMessage = 'Terjadi kesalahan.';
            if (error.context?.message) {
                errorMessage = error.context.message;
            } else if (error.message.includes('non-2xx')) {
                errorMessage = 'Nomor telepon tidak sesuai.';
            } else {
                errorMessage = error.message;
            }
            showFeedback(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showFeedback('Password minimal harus 6 karakter.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('reset-password-with-npt', {
                body: { action: 'update-password', userId, newPassword },
            });
            if (error) throw error;
            if (!data.success) throw new Error(data.message);
            
            showFeedback('Password berhasil diubah! Anda akan dialihkan ke halaman login.', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const message = error.context?.message || error.message || 'Gagal mengubah password.';
            showFeedback(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const glassButtonStyle = "group w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";
    const formVariants = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }};

    const renderFormStep = () => {
        if (step === 1) {
            return (
                <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <h1 className="text-3xl font-bold text-center text-white">Lupa Password</h1>
                    <p className="text-center text-gray-300 text-sm mt-2">Masukkan NPT Anda untuk memulai.</p>
                    <form onSubmit={handleNptSubmit} className="space-y-6 pt-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">NPT</label>
                            <input type="text" value={npt} onChange={(e) => setNpt(e.target.value)} required className={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} className={glassButtonStyle}>
                            <span className="flex items-center justify-center gap-2">
                                {loading ? <LoaderCircle className="animate-spin" size={20} /> : <KeyRound size={16} />}
                                {loading ? 'Memverifikasi...' : 'Verifikasi NPT'}
                            </span>
                        </button>
                    </form>
                </motion.div>
            );
        }
        if (step === 2) {
            return (
                <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <h1 className="text-3xl font-bold text-center text-white">Verifikasi Identitas</h1>
                    <p className="text-center text-gray-300 text-sm mt-2">Untuk keamanan, masukkan nomor telepon Anda.</p>
                    <form onSubmit={handleVerificationSubmit} className="space-y-6 pt-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Nomor Telepon</label>
                            <input type="tel" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)} required className={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} className={glassButtonStyle}>
                             <span className="flex items-center justify-center gap-2">
                                {loading ? <LoaderCircle className="animate-spin" size={20} /> : <Phone size={16} />}
                                {loading ? 'Memverifikasi...' : 'Verifikasi Telepon'}
                            </span>
                        </button>
                    </form>
                </motion.div>
            );
        }
        if (step === 3) {
            return (
                <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <h1 className="text-3xl font-bold text-center text-white">Buat Password Baru</h1>
                    <p className="text-center text-gray-300 text-sm mt-2">Masukkan password baru Anda.</p>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6 pt-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Password Baru</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} className={glassButtonStyle}>
                             <span className="flex items-center justify-center gap-2">
                                {loading ? <LoaderCircle className="animate-spin" size={20} /> : <Lock size={16} />}
                                {loading ? 'Menyimpan...' : 'Simpan Password'}
                            </span>
                        </button>
                    </form>
                </motion.div>
            );
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
            <Helmet>
                <title>Lupa Password - STMKG Karate Club</title>
                <link rel="icon" href={favicon} />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <AnimatePresence>
                {feedback.type && (
                    <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                        className="fixed top-5 z-50 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 rounded-lg"
                        style={{ ...glassFrameStyle, borderColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}>
                        {feedback.type === 'success' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}
                        <p>{feedback.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <main className="flex-grow flex justify-center items-center pt-20 pb-12 px-4">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <AnimatePresence mode="wait">
                        {renderFormStep()}
                    </AnimatePresence>
                    <p className="text-center text-sm text-gray-400 pt-6">
                        <Link to="/login" className="flex items-center justify-center gap-1 mx-auto font-medium text-[#FF9F1C] hover:underline">
                            <ArrowLeft size={14} /> Kembali ke Login
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default LupaPassword;