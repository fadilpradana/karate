import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brevetLogo from '../assets/brevet.png';
import { AnimatePresence } from 'framer-motion';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

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

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const { data, error } = await signUp({
            email,
            password,
            options: {
                data: { username, nama_lengkap: namaLengkap, nomor_telepon: nomorTelepon, npt, kelas, angkatan },
            },
        });

        if (error) {
            setErrorMessage(error.message);
        } else {
            // Karena verifikasi email dimatikan, Supabase langsung mengembalikan sesi.
            // Kita akan menampilkan modal sukses dan menunggu user mengklik OK untuk navigasi.
            setSuccessMessage('Pendaftaran berhasil!');
            // TIDAK ADA setTimeout di sini untuk navigasi otomatis
        }
        setLoading(false);
    };

    // Fungsi untuk menutup modal sukses DAN melakukan navigasi ke dashboard
    const handleSuccessModalClose = () => {
        setSuccessMessage(''); // Tutup modal
        navigate('/dashboard'); // Navigasi ke dashboard saat OK diklik
    };

    // Fungsi untuk menutup modal error
    const handleErrorModalClose = () => {
        setErrorMessage('');
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const glassButtonStyle = "group w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        // Wrapper utama untuk layout sticky footer
        <div className="flex flex-col min-h-screen">
            {/* Success Modal */}
            <AnimatePresence>
                {successMessage && (
                    <SuccessModal
                        message={successMessage}
                        onClose={handleSuccessModalClose} // Panggil fungsi yang juga menavigasi
                    />
                )}
            </AnimatePresence>

            {/* Error Modal */}
            <AnimatePresence>
                {errorMessage && (
                    <ErrorModal
                        message={errorMessage}
                        onClose={handleErrorModalClose}
                    />
                )}
            </AnimatePresence>

            {/* Konten utama */}
            <main className="flex-grow flex justify-center items-center pt-28 pb-12 px-4">
                <div className="w-full max-w-lg p-8 space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-white">Daftar Akun Baru</h1>
                    <p className="text-center text-gray-300 text-sm">Isi data di bawah ini untuk menjadi anggota.</p>
                    <form onSubmit={handleSignUp} className="space-y-4 pt-4">
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
                            <span className="transition-colors duration-300 group-hover:battery-style-gradient">
                                {loading ? 'Mendaftar...' : 'Daftar'}
                            </span>
                        </button>
                        <p className="text-center text-sm text-gray-400 pt-2">
                            Sudah punya akun?{' '}<Link to="/login" className="font-medium text-[#FF9F1C] hover:underline">Masuk di sini</Link>
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
                        <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                        <Link to="/kontak" className="hover:text-[#FF9F1C]">Kontak</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default SignUp;