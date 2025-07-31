import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient'; // Make sure this path is correct
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import { compressAndConvertToWebP } from '../utils/imageCompressor'; // Make sure this path is correct

import Footer from '../components/Footer';
import favicon from '../assets/logo_bintangcompress.png';
import { AnimatePresence } from 'framer-motion';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import { ImageIcon, X, Loader2, ChevronDown } from 'lucide-react'; // Import icons

function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // State untuk konfirmasi password
    const [username, setUsername] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [jenisKelamin, setJenisKelamin] = useState(''); // State baru untuk jenis kelamin
    const [npt, setNpt] = useState('');
    const [kelas, setKelas] = useState('');
    const [angkatan, setAngkatan] = useState('');

    // State for profile picture
    const [avatarFile, setAvatarFile] = useState(null); // The actual File object
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null); // URL for display
    const [isAvatarRemoved, setIsAvatarRemoved] = useState(false); // Flag if avatar was explicitly removed
    const [isCompressingAvatar, setIsCompressingAvatar] = useState(false); // For image compression loading

    const avatarFileInputRef = useRef(null); // Ref for hidden file input

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsCompressingAvatar(true);
        setIsAvatarRemoved(false); // Ensure removal flag is off
        setErrorMessage(''); // Clear any previous error

        try {
            const compressedFile = await compressAndConvertToWebP(file);
            setAvatarFile(compressedFile);
            setAvatarPreviewUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error("Error compressing avatar:", error);
            setErrorMessage('Gagal memproses gambar profil.');
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
        } finally {
            setIsCompressingAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreviewUrl(null);
        setIsAvatarRemoved(true); // Set flag to indicate removal
        if (avatarFileInputRef.current) {
            avatarFileInputRef.current.value = ''; // Clear file input
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validasi konfirmasi password
        if (password !== confirmPassword) {
            setErrorMessage('Password dan konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        let finalAvatarUrl = null;
        let avatarPathInStorage = null; // To store the path within the bucket

        try {
            // 1. Upload avatar to Supabase Storage if a new file is selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`; // Example path in storage

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars') // Make sure you have an 'avatars' bucket in Supabase Storage
                    .upload(filePath, avatarFile, {
                        cacheControl: '3600',
                        upsert: false // We don't want to overwrite unless explicitly handling
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                finalAvatarUrl = publicUrlData.publicUrl;
                avatarPathInStorage = filePath; // Keep track of the path for potential deletion later
            } else if (isAvatarRemoved) {
                finalAvatarUrl = null; // User explicitly removed it
            }

            // 2. Sign up the user with Supabase Auth
            const { data: authData, error: authError } = await signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        nama_lengkap: namaLengkap,
                        nomor_telepon: nomorTelepon,
                        jenis_kelamin: jenisKelamin, // Tambahkan jenis kelamin
                        npt,
                        kelas,
                        angkatan,
                        avatar_url: finalAvatarUrl
                    },
                },
            });

            if (authError) {
                // If signup fails, and an avatar was uploaded, try to delete it to clean up storage
                if (avatarPathInStorage) {
                    const { error: deleteError } = await supabase.storage.from('avatars').remove([avatarPathInStorage]);
                    if (deleteError) console.warn('Warning: Failed to clean up avatar from storage:', deleteError.message);
                }
                throw authError;
            }

            // 3. Update the 'profiles' table with all user data including avatar_url
            if (authData.user) {
                const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update({
                        username,
                        nama_lengkap: namaLengkap,
                        nomor_telepon: nomorTelepon,
                        jenis_kelamin: jenisKelamin, // Tambahkan jenis kelamin
                        npt,
                        kelas,
                        angkatan,
                        avatar_url: finalAvatarUrl,
                    })
                    .eq('id', authData.user.id);

                if (profileUpdateError) {
                    console.error("Error updating profile table after signup:", profileUpdateError.message);
                    setErrorMessage("Pendaftaran berhasil, tetapi gagal menyimpan detail profil lengkap. Silakan coba perbarui profil Anda nanti.");
                }
            }

            setSuccessMessage('Pendaftaran berhasil!');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessModalClose = () => {
        setSuccessMessage('');
        navigate('/dashboard');
    };

    const handleErrorModalClose = () => {
        setErrorMessage('');
    };

    const inputStyle = "w-full px-4 py-2 bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200";
    const glassButtonStyle = "group w-full mt-6 px-4 py-3 font-bold text-white rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 transition-all duration-300";

    return (
        <div className="flex flex-col min-h-screen">
            <Helmet>
                <title>Sign Up - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="icon" href={favicon} />
            </Helmet>
            <AnimatePresence>
                {successMessage && (
                    <SuccessModal
                        message={successMessage}
                        onClose={handleSuccessModalClose}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {errorMessage && (
                    <ErrorModal
                        message={errorMessage}
                        onClose={handleErrorModalClose}
                    />
                )}
            </AnimatePresence>

            <main className="flex-grow flex justify-center items-center pt-28 pb-12 px-4">
                <div className="w-full max-w-lg p-8 space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-white">Daftar Akun Baru</h1>
                    <p className="text-center text-gray-300 text-sm">Isi data di bawah ini untuk menjadi anggota.</p>
                    <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                        {/* Profile Picture and Basic Info Section - Adjusted for horizontal layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] sm:gap-6 gap-4 mb-6">
                            {/* Left Column for Profile Picture */}
                            <div className="flex flex-col items-center sm:items-start">
                                <label className="block mb-1 text-sm text-gray-300 w-full sm:text-left">Foto Profil</label>
                                <div
                                    className="relative w-32 h-32 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center cursor-pointer border-2 border-white/10 border-dashed hover:border-[#FF9F1C] transition-colors duration-200 flex-shrink-0"
                                    onClick={() => avatarFileInputRef.current.click()}
                                >
                                    {isCompressingAvatar ? (
                                        <Loader2 className="animate-spin text-gray-400 h-10 w-10" />
                                    ) : avatarPreviewUrl ? (
                                        <>
                                            <img src={avatarPreviewUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-lg" />
                                            {/* Overlay button for delete on hover (desktop) */}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                                                className="absolute inset-0 bg-black/60 text-white rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group"
                                                aria-label="Hapus Foto Profil"
                                            >
                                                <X size={24} className="text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <ImageIcon size={40} className="mx-auto" />
                                            <p className="text-xs text-accent mt-1">Pilih Gambar</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={avatarFileInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        disabled={isCompressingAvatar || loading}
                                    />
                                </div>
                                {/* Mobile-only "Hapus Foto Profil" button, for images */}
                                {avatarPreviewUrl && !isCompressingAvatar && (
                                    <div className="sm:hidden text-center mt-2">
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <X size={14} /> Hapus Foto Profil
                                        </button>
                                    </div>
                                )}
                                {isCompressingAvatar && <p className="text-xs text-gray-400 mt-2">Mengompres gambar...</p>}
                            </div>

                            {/* Right Column for Username and Nama Lengkap */}
                            <div className="flex flex-col justify-between w-full">
                                <div>
                                    <label className="block mb-1 text-sm text-gray-300">Username</label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputStyle}/>
                                </div>
                                <div className="mt-4 sm:mt-auto">
                                    <label className="block mb-1 text-sm text-gray-300">Nama Lengkap</label>
                                    <input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required className={inputStyle}/>
                                </div>
                            </div>
                        </div>
                        {/* End Profile Picture and Basic Info Section */}


                        <div><label className="block mb-1 text-sm text-gray-300">Nomor Telepon</label><input type="tel" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)} required className={inputStyle}/></div>
                        
                        <div>
                            <label className="block mb-1 text-sm text-gray-300">Jenis Kelamin</label>
                            <div className="relative">
                                <select
                                    value={jenisKelamin}
                                    onChange={(e) => setJenisKelamin(e.target.value)}
                                    required
                                    className={`${inputStyle} appearance-none pr-8`}
                                >
                                    <option value="" disabled className="bg-gray-800 text-gray-500">Pilih Jenis Kelamin</option>
                                    <option value="lakilaki" className="bg-gray-900 text-white">Laki-laki</option>
                                    <option value="perempuan" className="bg-gray-900 text-white">Perempuan</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* --- [DIPERBAIKI] Ukuran font placeholder dikecilkan dan teks dikembalikan --- */}
                            <div><label className="block mb-1 text-sm text-gray-300">NPT</label><input type="text" value={npt} onChange={(e) => setNpt(e.target.value)} required className={`${inputStyle} placeholder:text-[11px]`} placeholder="Contoh: 41.22.0001"/></div>
                            <div><label className="block mb-1 text-sm text-gray-300">Kelas</label><input type="text" value={kelas} onChange={(e) => setKelas(e.target.value)} required className={inputStyle}/></div>
                            <div><label className="block mb-1 text-sm text-gray-300">Angkatan</label><input type="text" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} required className={inputStyle}/></div>
                        </div>
                        <hr className="border-white/20 my-6"/>
                        <div className="space-y-4">
                            <div><label className="block mb-1 text-sm text-gray-300">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle}/></div>
                            <div><label className="block mb-1 text-sm text-gray-300">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle}/></div>
                            {/* Input untuk konfirmasi password */}
                            <div><label className="block mb-1 text-sm text-gray-300">Konfirmasi Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputStyle}/></div>
                        </div>
                        <button type="submit" disabled={loading || isCompressingAvatar} className={glassButtonStyle}>
                            <span className="transition-colors duration-300 group-hover:battery-style-gradient">
                                {loading || isCompressingAvatar ? 'Mendaftar...' : 'Daftar'}
                            </span>
                        </button>
                        <p className="text-center text-sm text-gray-400 pt-2">
                            Sudah punya akun?{' '}<Link to="/login" className="font-medium text-[#FF9F1C] hover:underline">Masuk di sini</Link>
                        </p>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SignUp;