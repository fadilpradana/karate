import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brevetLogo from '../assets/brevet.png';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion dan AnimatePresence
import { CheckCircle, AlertTriangle, LoaderCircle } from 'lucide-react'; // Import ikon untuk notifikasi dan loading

function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: null }); // State untuk notifikasi

    const navigate = useNavigate();
    const { signIn } = useAuth();

    // Gaya glassmorphism untuk notifikasi
    const glassFrameStyle = { 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.3)', 
        boxShadow: `0px 1px 3px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.11), inset -1px -1px 2px rgba(0, 0, 0, 0.1)` 
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ message: '', type: null }); // Reset feedback saat memulai login
        try {
            const { error } = await signIn({ email, password });
            if (error) {
                // Supabase error: email/password salah, user tidak ditemukan, dll.
                // Supabase error.message sudah cukup deskriptif
                throw error; 
            }
            setFeedback({ message: 'Login berhasil! Mengalihkan...', type: 'success' });
            setTimeout(() => {
                navigate('/dashboard'); // Alihkan setelah notifikasi terlihat sebentar
            }, 1500); // Tunda sedikit agar notifikasi terlihat
        } catch (error) {
            console.error('Login error:', error.message);
            // Tangani error berdasarkan pesan dari Supabase atau custom message
            let errorMessage = 'Terjadi kesalahan tidak dikenal saat login.';
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah. Silakan coba lagi.';
            } else if (error.message.includes('User not found')) {
                errorMessage = 'Pengguna tidak ditemukan. Silakan daftar jika belum memiliki akun.';
            } else if (error.message.includes('email not confirmed')) {
                errorMessage = 'Email Anda belum terkonfirmasi. Silakan cek inbox Anda.';
            }
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
            // Feedback akan hilang otomatis setelah beberapa detik
            setTimeout(() => {
                setFeedback({ message: '', type: null });
            }, 5000); // Notifikasi akan hilang setelah 5 detik
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const glassButtonStyle = "group w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        // Wrapper utama untuk layout sticky footer
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white"> {/* Tambah bg-gray-900 */}
            {/* Notifikasi Pop-up */}
            <AnimatePresence>
                {feedback.type && (
                    <motion.div
                        initial={{ opacity: 0, y: -100, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-4 rounded-lg border"
                        style={{ ...glassFrameStyle, borderColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)', }}
                    >
                        {feedback.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}
                        <p className="text-white">{feedback.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Konten utama */}
            <main className="flex-grow flex justify-center items-center pt-20 pb-12 px-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-white">Selamat Datang Kembali</h1>
                    <p className="text-center text-gray-300 text-sm">
                        Silakan masuk untuk melanjutkan.
                    </p>
                    
                    <form onSubmit={handleLogin} className="space-y-6 pt-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className={inputStyle}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={glassButtonStyle}
                        >
                            <span className="transition-colors duration-300 group-hover:battery-style-gradient">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.span animate={{ rotate: 360 }} transition={{ loop: Infinity, duration: 1, ease: "linear" }}>
                                            <LoaderCircle size={20} />
                                        </motion.span>
                                        Memproses...
                                    </span>
                                ) : (
                                    'Masuk'
                                )}
                            </span>
                        </button>

                        <p className="text-center text-sm text-gray-400 pt-2">
                            Belum punya akun?{' '}
                            <Link to="/signup" className="font-medium text-[#FF9F1C] hover:underline">
                                Daftar di sini
                            </Link>
                        </p>
                    </form>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left w-full md:w-1/3">
                        &copy; With Love STMKG Karate Club Periode 2025
                    </div>
                    <div className="w-full md:w-1/3 flex justify-center">
                        <img src={brevetLogo} alt="Logo Brevet" className="h-5" />
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
                        <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                        <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                        <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                        <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Login;