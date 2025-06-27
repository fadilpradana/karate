import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brevetLogo from '../assets/brevet.png'; // <-- PASTIKAN PATH LOGO INI BENAR

function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";

    return (
        // Wrapper utama untuk layout sticky footer
        <div className="flex flex-col min-h-screen">
            {/* Konten utama */}
            <main className="flex-grow flex justify-center items-center pt-20 pb-12 px-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-white">Selamat Datang Kembali</h1>
                    <p className="text-center text-gray-300 text-sm">Silakan masuk untuk melanjutkan.</p>
                    <form onSubmit={handleLogin} className="space-y-6 pt-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-6 px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200">
                            {loading ? 'Memproses...' : 'Masuk'}
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
            <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-sm py-10 px-6 md:px-20 border-t border-[#333]">
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
                        <Link to="/berita" className="hover:text-[#FF9F1C]">Berita</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Login;
