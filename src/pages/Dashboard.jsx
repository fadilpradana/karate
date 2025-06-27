import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import brevetLogo from '../assets/brevet.png';
import { CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard() {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [updateStatus, setUpdateStatus] = useState({ message: '', type: null });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!session?.user?.id) throw new Error("User tidak ditemukan.");
                
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setProfile(data);
                    setFormData(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [session]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        // PERUBAHAN 1: 'npt' sekarang disertakan dalam data yang akan diupdate
        const { username, nama_lengkap, nomor_telepon, npt, kelas, angkatan } = formData;
        
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username, nama_lengkap, nomor_telepon, npt, kelas, angkatan })
                .eq('id', session.user.id);

            if (error) throw error;

            setProfile(formData);
            setUpdateStatus({ message: 'Profil berhasil diperbarui!', type: 'success' });
            setIsEditing(false);

        } catch (err) {
            setUpdateStatus({ message: `Gagal memperbarui: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setUpdateStatus({ message: '', type: null }), 3000);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    
    // --- Styling ---
    const inputStyle = "w-full px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const labelStyle = "text-[10px] text-gray-400 uppercase";
    const dataDisplayStyle = "p-2 bg-black/20 rounded-md";
    // PERUBAHAN 2: Base style untuk semua tombol glass
    const glassButtonStyle = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors";


    if (loading && !profile) {
        return <div className="flex justify-center items-center min-h-screen">Memuat data profil...</div>;
    }
    if (error) {
        return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen pt-24">
            <main className="flex-grow flex flex-col justify-start items-center pt-8 pb-12 px-4">
                <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-white">Profil Anda</h1>
                    
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-3 text-left">
                            <div className={dataDisplayStyle}><p className={labelStyle}>Username</p><input type="text" name="username" value={formData.username || ''} onChange={handleInputChange} className={inputStyle} /></div>
                            <div className={dataDisplayStyle}><p className={labelStyle}>Nama Lengkap</p><input type="text" name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleInputChange} className={inputStyle} /></div>
                            <div className={dataDisplayStyle}><p className={labelStyle}>Email</p><p className="text-base text-gray-400">{session.user.email} (tidak bisa diubah)</p></div>
                            <div className={dataDisplayStyle}><p className={labelStyle}>Nomor Telepon</p><input type="tel" name="nomor_telepon" value={formData.nomor_telepon || ''} onChange={handleInputChange} className={inputStyle} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* PERUBAHAN 1: NPT dibuat menjadi input yang bisa diedit */}
                                <div className={dataDisplayStyle}><p className={labelStyle}>NPT</p><input type="text" name="npt" value={formData.npt || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                <div className={dataDisplayStyle}><p className={labelStyle}>Kelas</p><input type="text" name="kelas" value={formData.kelas || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                <div className={dataDisplayStyle}><p className={labelStyle}>Angkatan</p><input type="text" name="angkatan" value={formData.angkatan || ''} onChange={handleInputChange} className={inputStyle} /></div>
                            </div>
                            <div className={dataDisplayStyle}><p className={labelStyle}>Role</p><p className="text-base text-gray-400 capitalize">{profile.role} (tidak bisa diubah)</p></div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                {/* PERUBAHAN 2: Tombol Batal & Simpan menggunakan style glass */}
                                <button type="button" onClick={() => setIsEditing(false)} className={`${glassButtonStyle} text-white`}>Batal</button>
                                <button type="submit" disabled={loading} className={`${glassButtonStyle} text-white hover:border-blue-400`}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 space-y-3 text-left">
                            {profile ? (
                                <>
                                  <div className={dataDisplayStyle}><p className={labelStyle}>Username</p><p className="text-base text-white">{profile.username}</p></div>
                                  <div className={dataDisplayStyle}><p className={labelStyle}>Nama Lengkap</p><p className="text-base text-white">{profile.nama_lengkap}</p></div>
                                  <div className={dataDisplayStyle}><p className={labelStyle}>Email</p><p className="text-base text-white">{session.user.email}</p></div>
                                  <div className={dataDisplayStyle}><p className={labelStyle}>Nomor Telepon</p><p className="text-base text-white">{profile.nomor_telepon}</p></div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className={dataDisplayStyle}><p className={labelStyle}>NPT</p><p className="text-base text-white">{profile.npt}</p></div>
                                    <div className={dataDisplayStyle}><p className={labelStyle}>Kelas</p><p className="text-base text-white">{profile.kelas}</p></div>
                                    <div className={dataDisplayStyle}><p className={labelStyle}>Angkatan</p><p className="text-base text-white">{profile.angkatan}</p></div>
                                  </div>
                                  <div className={dataDisplayStyle}><p className={labelStyle}>Role</p><p className="text-base text-white capitalize">{profile.role}</p></div>
                                </>
                            ) : (<p className="mt-6 text-gray-400">Gagal memuat data profil.</p>)}
                            
                            <div className="flex justify-end gap-3 pt-4">
                                {/* PERUBAHAN 2: Tombol Edit & Logout menggunakan style glass */}
                                <button onClick={() => setIsEditing(true)} className={`${glassButtonStyle} text-white`}><Edit size={16} /> Edit Profil</button>
                                <button onClick={handleLogout} className={`${glassButtonStyle} text-white hover:border-red-500/50`}>Logout</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-sm py-10 px-6 md:px-20 border-t border-[#333]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left w-full md:w-1/3">&copy; With Love STMKG Karate Club Periode 2025</div>
                    <div className="w-full md:w-1/3 flex justify-center"><img src={brevetLogo} alt="Logo Brevet" className="h-5" /></div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
                        <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                        <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                        <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                        <Link to="/berita" className="hover:text-[#FF9F1C]">Berita</Link>
                    </div>
                </div>
            </footer>
            
            <AnimatePresence>
                {updateStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg border bg-white/10 backdrop-blur-md ${updateStatus.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'}`}
                  >
                    {updateStatus.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}
                    <p className="text-white">{updateStatus.message}</p>
                  </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Dashboard;
