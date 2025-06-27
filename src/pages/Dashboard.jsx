import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import brevetLogo from '../assets/brevet.png';
import { CheckCircle, AlertTriangle, Edit, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Reusable untuk Menampilkan & Mengedit Kartu Profil
function ProfileCard({ profileData, session, onUpdate, isMyProfile = false, onLogout }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profileData || {});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(profileData || {});
    }, [profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onUpdate(formData);
        setLoading(false);
        setIsEditing(false);
    };

    const inputStyle = "w-full px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const labelStyle = "text-[10px] text-gray-400 uppercase";
    const dataDisplayStyle = "p-2 bg-black/20 rounded-md";
    const glassButtonStyle = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors";
    const textDataStyle = "text-base text-white break-words";

    return (
        <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-center">
            <h1 className="text-2xl font-bold text-white">Profil Anda</h1>
            {isEditing ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
                    <div className={dataDisplayStyle}><p className={labelStyle}>Username</p><input type="text" name="username" value={formData.username || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Nama Lengkap</p><input type="text" name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Email</p><p className="text-base text-gray-400 break-words">{session.user.email} (tidak bisa diubah)</p></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Nomor Telepon</p><input type="tel" name="nomor_telepon" value={formData.nomor_telepon || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={dataDisplayStyle}><p className={labelStyle}>NPT</p><input type="text" name="npt" value={formData.npt || ''} onChange={handleInputChange} className={inputStyle} /></div>
                        <div className={dataDisplayStyle}><p className={labelStyle}>Kelas</p><input type="text" name="kelas" value={formData.kelas || ''} onChange={handleInputChange} className={inputStyle} /></div>
                        <div className={dataDisplayStyle}><p className={labelStyle}>Angkatan</p><input type="text" name="angkatan" value={formData.angkatan || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    </div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Role</p><p className="text-base text-gray-400 capitalize">{profileData.role} (tidak bisa diubah)</p></div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className={`${glassButtonStyle} text-white`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${glassButtonStyle} text-white hover:border-blue-400`}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    </div>
                </form>
            ) : (
                <div className="mt-6 space-y-3 text-left">
                    <div className={dataDisplayStyle}><p className={labelStyle}>Username</p><p className={textDataStyle}>{profileData.username}</p></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Nama Lengkap</p><p className={textDataStyle}>{profileData.nama_lengkap}</p></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Email</p><p className={textDataStyle}>{session.user.email}</p></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Nomor Telepon</p><p className={textDataStyle}>{profileData.nomor_telepon}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={dataDisplayStyle}><p className={labelStyle}>NPT</p><p className={textDataStyle}>{profileData.npt}</p></div>
                        <div className={dataDisplayStyle}><p className={labelStyle}>Kelas</p><p className={textDataStyle}>{profileData.kelas}</p></div>
                        <div className={dataDisplayStyle}><p className={labelStyle}>Angkatan</p><p className={textDataStyle}>{profileData.angkatan}</p></div>
                    </div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Role</p><p className={`${textDataStyle} capitalize`}>{profileData.role}</p></div>
                    {isMyProfile && (
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setIsEditing(true)} className={`${glassButtonStyle} text-white`}><Edit size={16} /> Edit Profil</button>
                            <button onClick={onLogout} className={`${glassButtonStyle} text-white hover:border-red-500/50`}>Logout</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Komponen Dashboard Utama
function Dashboard() {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();

    const [myProfile, setMyProfile] = useState(null);
    const [allProfiles, setAllProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [updateStatus, setUpdateStatus] = useState({ message: '', type: null });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (!session?.user?.id) throw new Error("User tidak ditemukan.");
                const { data: userProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profileError) throw profileError;
                if (userProfile) {
                    setMyProfile(userProfile);
                    if (userProfile.role === 'admin') {
                        const { data: allData, error: allError } = await supabase.from('profiles').select('*').neq('id', session.user.id);
                        if (allError) throw allError;
                        setAllProfiles(allData || []);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [session]);
    
    const showUpdateFeedback = (message, type) => {
        setUpdateStatus({ message, type });
        setTimeout(() => setUpdateStatus({ message: '', type: null }), 3000);
    };

    const handleUpdateMyProfile = async (updatedData) => {
        try {
            const { username, nama_lengkap, nomor_telepon, npt, kelas, angkatan } = updatedData;
            const { error } = await supabase.from('profiles').update({ username, nama_lengkap, nomor_telepon, npt, kelas, angkatan }).eq('id', session.user.id);
            if (error) throw error;
            setMyProfile(updatedData);
            showUpdateFeedback('Profil Anda berhasil diperbarui!', 'success');
        } catch (err) {
            showUpdateFeedback(`Gagal memperbarui: ${err.message}`, 'error');
        }
    };

    const handleUpdateOtherProfileByAdmin = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { username, nama_lengkap, nomor_telepon, npt, kelas, angkatan, role } = editFormData;
            const { error } = await supabase.from('profiles').update({ username, nama_lengkap, nomor_telepon, npt, kelas, angkatan, role }).eq('id', selectedProfile.id);
            if (error) throw error;
            setAllProfiles(prev => prev.map(p => p.id === selectedProfile.id ? editFormData : p));
            showUpdateFeedback(`Profil ${selectedProfile.username} berhasil diperbarui!`, 'success');
            setSelectedProfile(null);
        } catch (err) {
            showUpdateFeedback(`Gagal memperbarui: ${err.message}`, 'error');
        } finally { setLoading(false); }
    };
    
    const handleAdminEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectProfileToEdit = (profile) => {
        setSelectedProfile(profile);
        setEditFormData(profile);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.5 } } };
    const titleVariants = { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } } };

    if (loading && !myProfile) return <div className="flex justify-center items-center min-h-screen">Memuat data...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
    
    const inputStyle = "w-full px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const labelStyle = "text-[10px] text-gray-400 uppercase";
    const glassButtonStyle = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors";
    
    return (
        <div className="flex flex-col min-h-screen pt-24">
            <main className="flex-grow flex flex-col justify-start items-center pb-12 px-4">
                {myProfile?.role === 'admin' ? (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-7xl">
                        <motion.div variants={titleVariants} className="text-center mb-8">
                            {/* PERUBAHAN 2 & 3: Ukuran font diubah dan 'uppercase' dihapus */}
                            <h1 className="text-2xl font-bold text-white">Selamat Datang,</h1>
                            <div className="text-4xl mt-1 font-bold battery-style-gradient">{myProfile.nama_lengkap}!</div>
                        </motion.div>
                        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants} className="lg:col-span-1"><ProfileCard profileData={myProfile} session={session} onUpdate={handleUpdateMyProfile} isMyProfile={true} onLogout={handleLogout} /></motion.div>
                            <motion.div variants={itemVariants} className="lg:col-span-2">
                                <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                                    <h2 className="text-xl font-bold text-white mb-4">Manajemen Pengguna ({allProfiles.length})</h2>
                                    <AnimatePresence>
                                    {selectedProfile && (
                                        <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} transition={{ ease: "easeInOut", duration: 0.3 }} className="mb-6 overflow-hidden">
                                           <form onSubmit={handleUpdateOtherProfileByAdmin} className="p-4 border border-blue-500/30 rounded-lg bg-black/20 space-y-3">
                                                <h3 className="font-regular">Edit Profil: {selectedProfile.username}</h3>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div><p className={labelStyle}>Username</p><input type="text" name="username" value={editFormData.username || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    <div><p className={labelStyle}>Nama Lengkap</p><input type="text" name="nama_lengkap" value={editFormData.nama_lengkap || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                 </div>
                                                 <div><p className={labelStyle}>Nomor Telepon</p><input type="tel" name="nomor_telepon" value={editFormData.nomor_telepon || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div><p className={labelStyle}>NPT</p><input type="text" name="npt" value={editFormData.npt || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    <div><p className={labelStyle}>Kelas</p><input type="text" name="kelas" value={editFormData.kelas || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                 </div>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div><p className={labelStyle}>Angkatan</p><input type="text" name="angkatan" value={editFormData.angkatan || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    <div>
                                                        <p className={labelStyle}>Role</p>
                                                        {/* PERUBAHAN 1: Warna dropdown diselaraskan */}
                                                        <div className="relative">
                                                            <select name="role" value={editFormData.role || ''} onChange={handleAdminEditInputChange} className={`${inputStyle} appearance-none pr-8`}>
                                                                <option value="anggota" className="bg-gray-900 text-white">Anggota</option>
                                                                <option value="pengurus" className="bg-gray-900 text-white">Pengurus</option>
                                                                <option value="admin" className="bg-gray-900 text-white">Admin</option>
                                                            </select>
                                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                                <ChevronDown size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                 </div>
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <button type="button" onClick={() => setSelectedProfile(null)} className={`${glassButtonStyle} text-white`}>Batal</button>
                                                    <button type="submit" disabled={loading} className={`${glassButtonStyle} text-white hover:border-blue-400`}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                                                </div>
                                           </form>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                    <div className="space-y-2">
                                        {allProfiles.map(p => (<div key={p.id} className="flex justify-between items-center p-3 bg-black/20 rounded-md"><div><p className="font-bold text-white break-words">{p.nama_lengkap} <span className="text-xs font-normal text-gray-400 break-words">({p.username})</span></p><p className="text-xs text-gray-400 capitalize">{p.angkatan} &middot; {p.role}</p></div><button onClick={() => handleSelectProfileToEdit(p)} className="p-2 rounded-md hover:bg-white/20 flex-shrink-0 ml-2"><Edit size={16} className="text-white"/></button></div>))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ) : (
                    myProfile && <motion.div variants={itemVariants} initial="hidden" animate="visible"><ProfileCard profileData={myProfile} session={session} onUpdate={handleUpdateMyProfile} isMyProfile={true} onLogout={handleLogout} /></motion.div>
                )}
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
                {updateStatus.type && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.5 }} transition={{ ease: "easeOut", duration: 0.4 }} className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg border bg-white/10 backdrop-blur-md ${updateStatus.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'}`}>{updateStatus.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}<p className="text-white">{updateStatus.message}</p></motion.div>)}
            </AnimatePresence>
        </div>
    );
}

export default Dashboard;
