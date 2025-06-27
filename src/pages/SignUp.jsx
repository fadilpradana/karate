import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [npt, setNpt] = useState('');
    const [kelas, setKelas] = useState('');
    const [angkatan, setAngkatan] = useState('');
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signUp({
            email,
            password,
            options: {
                data: { username, nama_lengkap: namaLengkap, nomor_telepon: nomorTelepon, npt, kelas, angkatan },
            },
        });
        if (error) {
            alert(error.message);
        } else {
            alert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
            navigate('/login');
        }
        setLoading(false);
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    
    // PERUBAHAN: Style untuk tombol glass
    const glassButtonStyle = "w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        <div className="flex justify-center items-center min-h-screen pt-28 pb-12 px-4">
            <div className="w-full max-w-lg p-8 space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Daftar Akun Baru</h1>
                <p className="text-center text-gray-300 text-sm">Isi data di bawah ini untuk menjadi anggota.</p>
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    {/* ... semua input field Anda ada di sini ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block mb-1 text-sm text-gray-300">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputStyle}/></div>
                        <div><label className="block mb-1 text-sm text-gray-300">Nama Lengkap</label><input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required className={inputStyle}/></div>
                    </div>
                    <div><label className="block mb-1 text-sm text-gray-300">Nomor Telepon</label><input type="tel" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)} required className={inputStyle}/></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block mb-1 text-sm text-gray-300">NPT</label><input type="text" value={npt} onChange={(e) => setNpt(e.target.value)} required className={inputStyle}/></div>
                        <div><label className="block mb-1 text-sm text-gray-300">Kelas</label><input type="text" value={kelas} onChange={(e) => setKelas(e.target.value)} required className={inputStyle}/></div>
                        <div><label className="block mb-1 text-sm text-gray-300">Angkatan</label><input type="text" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} required className={inputStyle}/></div>
                    </div>
                    <hr className="border-white/20 my-6"/>
                    <div className="space-y-4">
                        <div><label className="block mb-1 text-sm text-gray-300">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle}/></div>
                        <div><label className="block mb-1 text-sm text-gray-300">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle}/></div>
                    </div>

                    <button type="submit" disabled={loading} className={glassButtonStyle}>
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>

                    <p className="text-center text-sm text-gray-400 pt-2">
                        Sudah punya akun?{' '}<Link to="/login" className="font-medium text-[#FF9F1C] hover:underline">Masuk di sini</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
