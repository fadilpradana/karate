import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    
    // PERUBAHAN: Style untuk tombol glass
    const glassButtonStyle = "w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        <div className="flex justify-center items-center min-h-screen pt-20 pb-12 px-4">
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
                        // PERUBAHAN: Menggunakan style glass
                        className={glassButtonStyle}
                    >
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
        </div>
    );
}

export default Login;
