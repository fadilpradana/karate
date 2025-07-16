import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, LoaderCircle } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import { Helmet } from 'react-helmet-async'; // Impor Helmet

function Login() {
    const [loading, setLoading] = useState(false);
    // [MODIFIKASI] Mengubah state dari email menjadi identifier
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: null });

    const navigate = useNavigate();
    const { signIn } = useAuth();

    const glassFrameStyle = { 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.3)', 
        boxShadow: `0px 1px 3px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.11), inset -1px -1px 2px rgba(0, 0, 0, 0.1)` 
    };

    // [MODIFIKASI] Logika handleLogin diubah total untuk mendukung multi-identifier
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ message: '', type: null });

        try {
            // Langkah 1: Panggil fungsi RPC untuk mendapatkan email berdasarkan identifier
            const { data: foundEmail, error: rpcError } = await supabase.rpc('get_email_from_identifier', {
                p_identifier: identifier
            });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                throw new Error("Terjadi kesalahan pada server.");
            }

            // Langkah 2: Cek apakah email ditemukan dari identifier yang diberikan
            if (!foundEmail) {
                throw new Error("Identifier atau password salah.");
            }
            
            // Langkah 3: Gunakan email yang ditemukan untuk login
            const { error: signInError } = await signIn({ 
                email: foundEmail, 
                password 
            });

            if (signInError) {
                // Error dari proses sign-in (kemungkinan besar password salah)
                throw new Error("Identifier atau password salah.");
            }
            
            // Jika semua berhasil
            setFeedback({ message: 'Login berhasil! Mengalihkan...', type: 'success' });
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Login error:', error.message);
            setFeedback({ message: error.message, type: 'error' });
            setTimeout(() => {
                setFeedback({ message: '', type: null });
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const glassButtonStyle = "group w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
            <Helmet>
                <title>Login - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
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

            <main className="flex-grow flex justify-center items-center pt-20 pb-12 px-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-white">Selamat Datang Kembali</h1>
                    <p className="text-center text-gray-300 text-sm">
                        Silakan masuk untuk melanjutkan.
                    </p>
                    
                    <form onSubmit={handleLogin} className="space-y-6 pt-4">
                        <div>
                            {/* [MODIFIKASI] Label diubah */}
                            <label className="block mb-1 text-sm text-gray-300">Email / NPT / Username</label>
                            <input 
                                // [MODIFIKASI] type, value, dan onChange diubah
                                type="text" 
                                value={identifier} 
                                onChange={(e) => setIdentifier(e.target.value)} 
                                required 
                                className={inputStyle}
                                placeholder="Masukkan email, NPT, atau username"
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
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="text-right">
                            <Link to="/lupa-password" className="text-xs text-gray-400 hover:text-[#FF9F1C] hover:underline">
                                Lupa Password?
                            </Link>
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

            <Footer />
        </div>
    );
}

export default Login;