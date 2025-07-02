import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { compressAndConvertToWebP } from '../utils/imageCompressor'; // Pastikan path ini benar

// Asset & Ikon
import brevetLogo from '../assets/brevet.png';
import { CheckCircle, AlertTriangle, Edit, ChevronDown, Trash2, Camera, Eye, X, Loader2, Replace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Modal
import Modal from '../components/Modal';

// Komponen Action Sheet dengan pengunci scroll
const ActionSheetModal = ({ isOpen, onClose, title, actions }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#1c1c1c] border-t border-white/10 rounded-t-2xl p-4"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                <div className="space-y-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors text-base
                                ${action.isDestructive ? 'text-red-400 hover:bg-red-500/10' : 'text-blue-400 hover:bg-blue-500/10'}
                                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

// Komponen Lightbox dengan ukuran terkontrol
const ImageViewerModal = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-2xl w-full"
            >
                <img src={imageUrl} alt="Tampilan Penuh" className="w-full h-auto object-contain max-h-[85vh] rounded-lg shadow-2xl" />
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                    aria-label="Tutup"
                >
                    <X size={20} />
                </button>
            </motion.div>
        </motion.div>
    );
};


// Komponen AvatarEditor yang dipanggil dari ProfileCard
function AvatarEditor({
    initialUrl,
    isUploading,
    onFileChange,
    onView,
    onEdit,
    onRemove,
    fileInputRef
}) {
    return (
        <div className="flex flex-col items-center sm:items-start relative">
            <label className="block mb-1 text-sm text-gray-300 w-full sm:text-left">Foto Profil</label>
            <div
                className="relative group w-32 h-32 sm:w-28 sm:h-28 flex-shrink-0 cursor-pointer"
                onClick={() => {
                    if (window.innerWidth < 640 && onEdit) {
                        onEdit();
                    }
                }}
            >
                <div className="w-full h-full rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border-2 border-white/10 border-dashed">
                    {isUploading ? (
                        <Loader2 className="animate-spin text-white h-10 w-10" />
                    ) : initialUrl ? (
                        <img src={initialUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={40} className="text-gray-400" />
                    )}
                </div>

                <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 items-center justify-center gap-1.5">
                    <button type="button" title="Lihat Foto" onClick={() => onView(initialUrl)} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70 disabled:opacity-30" disabled={!initialUrl}><Eye size={16} /></button>
                    <button type="button" title="Ganti Foto" onClick={() => fileInputRef.current.click()} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70"><Replace size={16} /></button>
                    <button type="button" title="Hapus Foto" onClick={onRemove} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70 disabled:opacity-30" disabled={!initialUrl || isUploading}><Trash2 size={16} /></button>
                </div>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={onFileChange} className="hidden" />
        </div>
    );
}


// Komponen ProfileCard untuk menampilkan data profil
function ProfileCard({
    profileData,
    session,
    onUpdate,
    isMyProfile = false,
    onLogout,
    onViewAvatar,
    onEditAvatar,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profileData || {});
    const [loading, setLoading] = useState(false);
    
    const [isUploading, setIsUploading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(profileData?.avatar_url || null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setFormData(profileData || {});
        setAvatarPreviewUrl(profileData?.avatar_url || null);
    }, [profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const compressedFile = await compressAndConvertToWebP(file);
            setAvatarFile(compressedFile);
            setAvatarPreviewUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error("Gagal kompresi gambar:", error);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleRemoveAvatar = async () => {
        setIsUploading(true);
        try {
             if (profileData?.avatar_url) {
                 const oldFileName = profileData.avatar_url.split('/').pop();
                 await supabase.storage.from('avatars').remove([oldFileName]);
             }
             await supabase.from('profiles').update({ avatar_url: null }).eq('id', profileData.id);
             setAvatarFile(null);
             setAvatarPreviewUrl(null);
             onUpdate(null, 'Foto profil berhasil dihapus.', 'success', true);
        } catch(error) {
             console.error("Gagal hapus avatar:", error);
             onUpdate(null, `Gagal hapus avatar: ${error.message}`, 'error');
        } finally {
             setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedProfileData = { ...formData };
        
        if (avatarFile) {
            try {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${profileData.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;
    
                if (profileData.avatar_url) {
                    const oldFileName = profileData.avatar_url.split('/').pop();
                    await supabase.storage.from('avatars').remove([oldFileName]);
                }
    
                const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
                if (uploadError) throw uploadError;
    
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                updatedProfileData.avatar_url = publicUrlData.publicUrl;

            } catch (error) {
                onUpdate(null, `Gagal mengunggah foto: ${error.message}`, 'error');
                setLoading(false);
                return;
            }
        }
        
        await onUpdate(updatedProfileData);
        setLoading(false);
        setIsEditing(false);
        setAvatarFile(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setAvatarPreviewUrl(profileData.avatar_url);
        setAvatarFile(null);
        setFormData(profileData);
    }

    const inputStyle = "w-full px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200 text-white";
    const labelStyle = "block mb-1 text-[10px] text-gray-400 uppercase";
    const dataDisplayStyle = "p-2 bg-black/20 rounded-md text-left";
    const glassButtonStyle = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors";
    const textDataStyle = "text-base text-white break-words";

    return (
        <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-white text-center">Profil Anda</h1>
            
            {isEditing ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-6 items-start">
                         <AvatarEditor 
                            initialUrl={avatarPreviewUrl}
                            isUploading={isUploading}
                            fileInputRef={fileInputRef}
                            onFileChange={handleAvatarFileChange}
                            onView={onViewAvatar}
                            onEdit={() => onEditAvatar({ 
                                onRemove: handleRemoveAvatar, 
                                onReplace: () => fileInputRef.current.click(),
                                onShow: () => onViewAvatar(avatarPreviewUrl),
                                avatarUrl: avatarPreviewUrl
                            })}
                            onRemove={handleRemoveAvatar}
                         />
                         <div className="space-y-3 w-full">
                             <div><label className={labelStyle}>Username</label><input type="text" name="username" value={formData.username || ''} onChange={handleInputChange} required className={inputStyle} /></div>
                             <div><label className={labelStyle}>Nama Lengkap</label><input type="text" name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleInputChange} required className={inputStyle}/></div>
                         </div>
                    </div>

                    <div className={dataDisplayStyle}><p className={labelStyle}>Email</p><p className="text-sm text-gray-400 break-words">{session.user.email} (tidak bisa diubah)</p></div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Nomor Telepon</p><input type="tel" name="nomor_telepon" value={formData.nomor_telepon || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className={labelStyle}>NPT</label><input type="text" name="npt" value={formData.npt || ''} onChange={handleInputChange} className={inputStyle} /></div>
                        <div><label className={labelStyle}>Kelas</label><input type="text" name="kelas" value={formData.kelas || ''} onChange={handleInputChange} className={inputStyle} /></div>
                        <div><label className={labelStyle}>Angkatan</label><input type="text" name="angkatan" value={formData.angkatan || ''} onChange={handleInputChange} className={inputStyle} /></div>
                    </div>
                    <div className={dataDisplayStyle}><p className={labelStyle}>Role</p><p className="text-sm text-gray-400 capitalize">{profileData.role} (tidak bisa diubah)</p></div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCancelEdit} className={`${glassButtonStyle} text-white`}>Batal</button>
                        <button type="submit" disabled={loading || isUploading} className={`${glassButtonStyle} text-white hover:border-blue-400`}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    </div>
                </form>
            ) : (
                <div className="mt-6 space-y-3 text-left">
                     <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-6 items-start">
                         <div className="flex flex-col items-center sm:items-start">
                             <label className="block mb-1 text-sm text-gray-300 w-full sm:text-left">Foto Profil</label>
                             {/* [PERMINTAAN BARU] Menambahkan interaksi pada avatar di mode lihat */}
                             <div 
                                className="relative group w-32 h-32 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border-2 border-white/10 cursor-pointer"
                                onClick={() => onViewAvatar(profileData.avatar_url)}
                             >
                                 {profileData.avatar_url ? (
                                     <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                 ) : (
                                     <Camera size={40} className="text-gray-400" />
                                 )}
                                 {/* Overlay hanya untuk lihat foto saat hover di desktop */}
                                 {profileData.avatar_url && (
                                     <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                                         <Eye size={32} className="text-white"/>
                                     </div>
                                 )}
                             </div>
                         </div>
                         <div className="space-y-4 w-full">
                             <div className={dataDisplayStyle}><p className={labelStyle}>Username</p><p className={textDataStyle}>{profileData.username}</p></div>
                             <div className={dataDisplayStyle}><p className={labelStyle}>Nama Lengkap</p><p className={textDataStyle}>{profileData.nama_lengkap}</p></div>
                         </div>
                     </div>
                    
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateStatus, setUpdateStatus] = useState({ message: '', type: null });
    
    // State untuk modal diangkat ke sini
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState(null);
    const [actionSheetActions, setActionSheetActions] = useState([]);

    // State & Ref untuk manajemen profil lain oleh admin
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);
    const [adminAvatarFile, setAdminAvatarFile] = useState(null);
    const [isUploadingAdminAvatar, setIsUploadingAdminAvatar] = useState(false);
    const [isAvatarRemovedByAdmin, setIsAvatarRemovedByAdmin] = useState(false);
    const adminFileInputRef = useRef(null);

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
                        const { data: allData, error: allError } = await supabase.from('profiles').select('*').neq('id', session.user.id).order('nama_lengkap', { ascending: true });
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
    
    const showUpdateFeedback = (message, type = 'success') => {
        setUpdateStatus({ message, type });
        setTimeout(() => setUpdateStatus({ message: '', type: null }), 4000);
    };

    const handleOpenImageViewer = (url) => {
        if (!url) return;
        setViewerImageUrl(url);
        setIsImageViewerOpen(true);
        setIsActionSheetOpen(false);
    };

    const handleOpenActionSheet = (actionsConfig) => {
        const { onShow, onReplace, onRemove, avatarUrl } = actionsConfig;
        const configuredActions = [
            { label: 'Lihat Foto', icon: <Eye size={20} />, onClick: () => { onShow(); setIsActionSheetOpen(false); }, disabled: !avatarUrl },
            { label: 'Ganti Foto', icon: <Replace size={20} />, onClick: () => { onReplace(); setIsActionSheetOpen(false); }},
            { label: 'Hapus Foto', icon: <Trash2 size={20} />, onClick: () => { onRemove(); setIsActionSheetOpen(false); }, disabled: !avatarUrl, isDestructive: true }
        ];
        setActionSheetActions(configuredActions);
        setIsActionSheetOpen(true);
    };

    const handleUpdateMyProfile = async (updatedData, errorMessage = null, successMessage = null, immediateFeedback = false) => {
        if(errorMessage) {
            showUpdateFeedback(errorMessage, 'error');
            return;
        }

        if(immediateFeedback && successMessage){
            showUpdateFeedback(successMessage, 'success');
            const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            setMyProfile(data);
            return;
        }

        try {
            const { id, created_at, email, role, ...updatePayload } = updatedData;
            const { error } = await supabase.from('profiles').update(updatePayload).eq('id', session.user.id);
            if (error) throw error;

            const { data: refreshedProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            setMyProfile(refreshedProfile);

            showUpdateFeedback('Profil Anda berhasil diperbarui!', 'success');
        } catch (err) {
            showUpdateFeedback(`Gagal memperbarui: ${err.message}`, 'error');
        }
    };
    
    const handleAdminAvatarFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploadingAdminAvatar(true);
        try {
            const compressedFile = await compressAndConvertToWebP(file);
            setAdminAvatarFile(compressedFile);
            setEditFormData(prev => ({...prev, avatar_url: URL.createObjectURL(compressedFile)}));
            setIsAvatarRemovedByAdmin(false);
        } catch (error) {
            console.error("Gagal kompresi gambar oleh admin:", error);
        } finally {
            setIsUploadingAdminAvatar(false);
        }
    }

    const handleAdminRemoveAvatar = () => {
        setEditFormData(prev => ({...prev, avatar_url: null}));
        setAdminAvatarFile(null);
        setIsAvatarRemovedByAdmin(true);
    }
    
    const handleUpdateOtherProfileByAdmin = async (e) => {
        e.preventDefault(); 
        setLoading(true);

        const updatePayload = { ...editFormData };
        const originalProfile = allProfiles.find(p => p.id === selectedProfile.id);

        try {
            if (adminAvatarFile) {
                const fileExt = adminAvatarFile.name.split('.').pop();
                const fileName = `${selectedProfile.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, adminAvatarFile);
                if (uploadError) throw uploadError;

                if (originalProfile.avatar_url) {
                    await supabase.storage.from('avatars').remove([originalProfile.avatar_url.split('/').pop()]);
                }
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                updatePayload.avatar_url = publicUrlData.publicUrl;
            } else if (isAvatarRemovedByAdmin && originalProfile.avatar_url) {
                await supabase.storage.from('avatars').remove([originalProfile.avatar_url.split('/').pop()]);
                updatePayload.avatar_url = null;
            }

            delete updatePayload.id;
            delete updatePayload.created_at;
            delete updatePayload.email;
            
            const { error } = await supabase.from('profiles').update(updatePayload).eq('id', selectedProfile.id);
            if (error) throw error;
            
            const { data: refreshedProfiles } = await supabase.from('profiles').select('*').neq('id', session.user.id).order('nama_lengkap', { ascending: true });
            setAllProfiles(refreshedProfiles || []);

            showUpdateFeedback(`Profil ${selectedProfile.username} berhasil diperbarui!`, 'success');
            setSelectedProfile(null);
        } catch (err) {
            showUpdateFeedback(`Gagal memperbarui: ${err.message}`, 'error');
        } finally { 
            setLoading(false); 
            setAdminAvatarFile(null);
            setIsAvatarRemovedByAdmin(false);
        }
    };
    
    const handleAdminEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectProfileToEdit = (profile) => {
        setSelectedProfile(profile);
        setEditFormData(profile);
        setAdminAvatarFile(null);
        setIsAvatarRemovedByAdmin(false);
    };

    const confirmDeleteProfile = (profile) => {
        setProfileToDelete(profile);
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteProfile = async () => {
        if (!profileToDelete) return;
        setLoading(true);
        setShowDeleteConfirmModal(false);
        try {
            if (profileToDelete.avatar_url) {
                await supabase.storage.from('avatars').remove([profileToDelete.avatar_url.split('/').pop()]);
            }

            const { error } = await supabase.functions.invoke('delete-user', {
                body: { userId: profileToDelete.id }
            });
            if (error) throw error;
            
            setAllProfiles(prev => prev.filter(p => p.id !== profileToDelete.id));
            showUpdateFeedback(`Profil ${profileToDelete.username} berhasil dihapus!`, 'success');
            setProfileToDelete(null);
        } catch (err) {
            showUpdateFeedback(`Gagal menghapus akun: ${err.message || 'Error tidak diketahui'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.5 } } };
    const titleVariants = { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } } };

    if (loading && !myProfile) return <div className="flex justify-center items-center min-h-screen text-white text-lg">Memuat data...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">Error: {error}</div>;
    
    const inputStyle = "w-full px-3 py-2 text-sm bg-black/20 border border-white/20 rounded-md focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200 text-white";
    const labelStyle = "block mb-1 text-[10px] text-gray-400 uppercase";
    const glassButtonStyle = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors";

    return (
        <div className="flex flex-col min-h-screen pt-24">
            <main className="flex-grow flex flex-col justify-start items-center pb-12 px-4">
                {myProfile?.role === 'admin' ? (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-7xl">
                        <motion.div variants={titleVariants} className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white">Selamat Datang,</h1>
                            <div className="text-4xl mt-1 font-bold battery-style-gradient">{myProfile.nama_lengkap}!</div>
                        </motion.div>
                        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <ProfileCard 
                                    profileData={myProfile} 
                                    session={session} 
                                    onUpdate={handleUpdateMyProfile} 
                                    isMyProfile={true} 
                                    onLogout={handleLogout}
                                    onViewAvatar={handleOpenImageViewer}
                                    onEditAvatar={handleOpenActionSheet}
                                />
                            </motion.div>
                            <motion.div variants={itemVariants} className="lg:col-span-2">
                                <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                                    <h2 className="text-xl font-bold text-white mb-4">Manajemen Pengguna ({allProfiles.length})</h2>
                                    <AnimatePresence>
                                    {selectedProfile && (
                                        <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} transition={{ ease: "easeInOut", duration: 0.3 }} className="mb-6 overflow-hidden">
                                            <form onSubmit={handleUpdateOtherProfileByAdmin} className="p-4 border border-blue-500/30 rounded-lg bg-black/20 space-y-3">
                                                <h3 className="font-regular text-lg text-white">Edit Profil: <span className="font-semibold">{selectedProfile.username}</span></h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-6 items-start">
                                                    <AvatarEditor 
                                                        initialUrl={editFormData.avatar_url}
                                                        isUploading={isUploadingAdminAvatar}
                                                        fileInputRef={adminFileInputRef}
                                                        onFileChange={handleAdminAvatarFileChange}
                                                        onView={handleOpenImageViewer}
                                                        onRemove={handleAdminRemoveAvatar}
                                                        onEdit={() => handleOpenActionSheet({
                                                            onShow: () => handleOpenImageViewer(editFormData.avatar_url),
                                                            onReplace: () => adminFileInputRef.current.click(),
                                                            onRemove: handleAdminRemoveAvatar,
                                                            avatarUrl: editFormData.avatar_url
                                                        })}
                                                    />
                                                    <div className="space-y-3 w-full">
                                                        <div><label className={labelStyle}>Username</label><input type="text" name="username" value={editFormData.username || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                        <div><label className={labelStyle}>Nama Lengkap</label><input type="text" name="nama_lengkap" value={editFormData.nama_lengkap || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    </div>
                                                </div>
                                                
                                                <div><label className={labelStyle}>Email</label><p className="text-sm text-gray-400 break-words">{selectedProfile.email} (tidak bisa diubah)</p></div>
                                                <div><label className={labelStyle}>Nomor Telepon</label><input type="tel" name="nomor_telepon" value={editFormData.nomor_telepon || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div><label className={labelStyle}>NPT</label><input type="text" name="npt" value={editFormData.npt || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    <div><label className={labelStyle}>Kelas</label><input type="text" name="kelas" value={editFormData.kelas || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                    <div><label className={labelStyle}>Angkatan</label><input type="text" name="angkatan" value={editFormData.angkatan || ''} onChange={handleAdminEditInputChange} className={inputStyle} /></div>
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>Role</label>
                                                    <div className="relative">
                                                        <select name="role" value={editFormData.role || ''} onChange={handleAdminEditInputChange} className={`${inputStyle} appearance-none pr-8`}>
                                                            <option value="anggota" className="bg-gray-900 text-white">Anggota</option>
                                                            <option value="pengurus" className="bg-gray-900 text-white">Pengurus</option>
                                                            <option value="admin" className="bg-gray-900 text-white">Admin</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"><ChevronDown size={16} /></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <button type="button" onClick={() => setSelectedProfile(null)} className={`${glassButtonStyle} text-white`}>Batal</button>
                                                    <button type="submit" disabled={loading || isUploadingAdminAvatar} className={`${glassButtonStyle} text-white hover:border-blue-400`}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                    <div className="space-y-2">
                                        {allProfiles.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-3 bg-black/20 rounded-md gap-3">
                                                <div className="flex items-center gap-3 flex-grow min-w-0">
                                                    {/* [PERMINTAAN BARU] Menambahkan interaksi pada avatar di daftar pengguna */}
                                                    <div
                                                        className="relative group w-10 h-10 rounded-md overflow-hidden bg-black/30 flex-shrink-0 cursor-pointer"
                                                        onClick={() => handleOpenImageViewer(p.avatar_url)}
                                                    >
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover"/>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Camera size={20} className="text-gray-500"/>
                                                            </div>
                                                        )}
                                                        {p.avatar_url && (
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Eye size={20} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-white truncate">{p.nama_lengkap} <span className="text-xs font-normal text-gray-400">({p.username})</span></p>
                                                        <p className="text-xs text-gray-400 capitalize">{p.angkatan} &middot; {p.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button onClick={() => handleSelectProfileToEdit(p)} className="p-2 rounded-md hover:bg-white/20"><Edit size={16} className="text-white"/></button>
                                                    <button onClick={() => confirmDeleteProfile(p)} className="p-2 rounded-md hover:bg-red-500/20"><Trash2 size={16} className="text-red-400"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ) : (
                    myProfile && <motion.div variants={itemVariants} initial="hidden" animate="visible">
                        <ProfileCard 
                            profileData={myProfile} 
                            session={session} 
                            onUpdate={handleUpdateMyProfile} 
                            isMyProfile={true} 
                            onLogout={handleLogout}
                            onViewAvatar={handleOpenImageViewer}
                            onEditAvatar={handleOpenActionSheet}
                        />
                    </motion.div>
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
                        <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                        <Link to="/kontak" className="hover:text-[#FF9F1C]">Kontak</Link>
                    </div>
                </div>
            </footer>
            
            <AnimatePresence>
                {updateStatus.type && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.5 }} transition={{ ease: "easeOut", duration: 0.4 }} className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg border bg-white/10 backdrop-blur-md ${updateStatus.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'}`}>{updateStatus.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}<p className="text-white">{updateStatus.message}</p></motion.div>)}
            </AnimatePresence>

            <ImageViewerModal
                isOpen={isImageViewerOpen}
                onClose={() => setIsImageViewerOpen(false)}
                imageUrl={viewerImageUrl}
            />

            <ActionSheetModal
                isOpen={isActionSheetOpen}
                onClose={() => setIsActionSheetOpen(false)}
                title="Opsi Foto Profil"
                actions={actionSheetActions}
            />

            <Modal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} title="Konfirmasi Hapus Akun">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                    <p className="text-gray-300 text-center">
                        Anda yakin ingin menghapus akun <span className="font-semibold text-white">{profileToDelete?.username}</span>?
                        Tindakan ini akan menghapus data profil dari database dan tidak dapat dibatalkan.
                    </p>
                </div>
                 <div className="flex justify-center gap-4 mt-6">
                     <button onClick={() => setShowDeleteConfirmModal(false)} className="px-6 py-2 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-colors text-white">Batal</button>
                     <button onClick={handleDeleteProfile} className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 text-white" disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</button>
                 </div>
            </Modal>
        </div>
    );
}

export default Dashboard;