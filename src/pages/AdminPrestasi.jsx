import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { compressAndConvertToWebP } from '../utils/imageCompressor';
import { Helmet } from 'react-helmet-async';
import favicon from '../assets/logo_bintangcompress.png';

// Asset & Ikon
import Footer from '../components/Footer';
import { CheckCircle, AlertTriangle, Edit, ChevronDown, Trash2, Camera, Eye, X, Loader2, Replace, Search, Plus, UploadCloud, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Path yang sudah dikonfirmasi: dari /src/pages/dashboard.jsx ke /src/assets/bg11.jpg
import bgImage from '../assets/bg10.jpg';

// Komponen Modal
import Modal from '../components/Modal';

const glassButtonClasses = "flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm p-6 rounded-2xl"
                    style={{ backgroundColor: 'rgba(28, 28, 28, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-400" />
                        {title}
                    </h3>
                    <div className="text-gray-300 text-sm mb-6">{children}</div>
                    <div className="flex justify-end gap-3">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className={`${glassButtonClasses} px-4 py-2 text-sm text-white`}>
                            Batal
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors">
                            Hapus
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const PrestasiForm = ({ currentPrestasi, onSave, onCancel, uploading, isCompressing, style }) => {
    const [formData, setFormData] = useState(currentPrestasi);
    const [imagePreview, setImagePreview] = useState(currentPrestasi.gambar || null);
    const [internalCompressing, setInternalCompressing] = useState(isCompressing);
    
    const deskripsiRef = useRef(null);

    useEffect(() => {
        if (deskripsiRef.current) {
            const textarea = deskripsiRef.current;
            textarea.style.height = 'auto'; 
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [formData?.deskripsi]);

    const handleInputChange = async (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setInternalCompressing(true);
            try {
                const compressedFile = await compressAndConvertToWebP(file);
                setFormData(prev => ({ ...prev, gambar: compressedFile, gambar_url: '' }));
                setImagePreview(URL.createObjectURL(compressedFile));
            } catch (error) { console.error("Gagal kompresi gambar:", error); } 
            finally { setInternalCompressing(false); }
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
        }
    };

    const removeImage = () => { 
        setFormData(prev => ({ ...prev, gambar: null, gambar_url: null })); 
        setImagePreview(null); 
        const fileInput = document.getElementById('gambar-input'); 
        if (fileInput) fileInput.value = ''; 
    };
    
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    const glassInputStyle = { backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', borderRadius: '0.5rem', outline: 'none', width: '100%', transition: 'all 0.2s ease' };

    return (
        <motion.div 
            key="form-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto p-6 rounded-2xl" style={style} >
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-4xl font-league uppercase text-accent">{formData.id ? "Edit Prestasi" : "Tambah Prestasi Baru"}</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCancel} className={`${glassButtonClasses} px-3 py-1.5 text-xs`}>
                    <ArrowLeft size={14} /> Batal
                </motion.button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-2/5">
                        <label className="block text-sm font-semibold mb-2">Gambar</label>
                        <div className="flex justify-center items-center p-4 border-2 border-white/20 border-dashed rounded-md h-[280px] min-h-[150px]">
                            <div className="space-y-2 text-center">
                                {internalCompressing ? ( <><Loader2 className="animate-spin mx-auto h-8 w-8 text-white" /><p className="mt-2 text-xs text-gray-300">Mengompres...</p></>
                                ) : imagePreview ? ( <div className="relative group mx-auto h-32 w-auto"><img src={imagePreview} alt="Pratinjau" className="h-full w-auto rounded-md object-cover" /><button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100" aria-label="Hapus Gambar"><X size={16} /></button></div>
                                ) : ( <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />)}
                                <div className="text-xs text-gray-400">
                                    <label htmlFor="gambar-input" className={`relative cursor-pointer rounded-md font-medium text-accent hover:text-yellow-400 ${internalCompressing ? 'pointer-events-none opacity-50' : ''}`}>
                                        <span>Unggah file</span><input id="gambar-input" name="gambar" type="file" className="sr-only" onChange={handleInputChange} accept="image/*" disabled={internalCompressing || uploading} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-3/5 space-y-3 flex flex-col">
                        <div>
                            <label htmlFor="judul" className="block text-sm font-semibold mb-1.5">Judul</label>
                            <input id="judul" name="judul" type="text" value={formData?.judul || ''} onChange={handleInputChange} className="p-2.5" style={glassInputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="deskripsi" className="block text-sm font-semibold mb-1.5">Deskripsi</label>
                            <textarea 
                                id="deskripsi" 
                                name="deskripsi" 
                                ref={deskripsiRef}
                                value={formData?.deskripsi || ''} 
                                onChange={handleInputChange} 
                                className="p-2.5 overflow-hidden" 
                                style={glassInputStyle}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Perolehan Medali</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div><input id="medali_emas" name="medali_emas" type="number" placeholder="Emas" value={formData?.medali_emas || ''} onChange={handleInputChange} className="p-2.5 text-center" style={glassInputStyle} min="0" /></div>
                                <div><input id="medali_perak" name="medali_perak" type="number" placeholder="Perak" value={formData?.medali_perak || ''} onChange={handleInputChange} className="p-2.5 text-center" style={glassInputStyle} min="0" /></div>
                                <div><input id="medali_perunggu" name="medali_perunggu" type="number" placeholder="Perunggu" value={formData?.medali_perunggu || ''} onChange={handleInputChange} className="p-2.5 text-center" style={glassInputStyle} min="0" /></div>
                            </div>
                        </div>
                        <div className="pt-3 mt-auto">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className={`${glassButtonClasses} w-full py-2.5 font-semibold text-accent hover:text-yellow-400 disabled:opacity-50`} disabled={uploading || internalCompressing}>
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : null}
                                {formData.id ? "Simpan Perubahan" : "Tambah Prestasi"}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default function AdminPrestasi() {
    const navigate = useNavigate();
    const [prestasiList, setPrestasiList] = useState([]);
    const [filteredPrestasi, setFilteredPrestasi] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPrestasi, setCurrentPrestasi] = useState(null); 
    const [uploading, setUploading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const glassCardStyle = { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    useEffect(() => { const checkUser = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { navigate('/login'); return; } const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single(); if (profileError || profileData?.role !== 'admin') { navigate('/'); } else { setUserRole(profileData.role); fetchPrestasi(); }}; checkUser(); }, [navigate]);
    
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = prestasiList.filter(item =>
            (item.judul && item.judul.toLowerCase().includes(lowercasedQuery)) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredPrestasi(filtered);
    }, [searchQuery, prestasiList]);

    const fetchPrestasi = async () => { setLoading(true); setError(null); const { data, error } = await supabase.from('prestasi').select('*').order('created_at', { ascending: false }); if (error) { setError("Gagal memuat prestasi."); console.error(error); } else { const dataWithImageUrls = await Promise.all(data.map(async (item) => { let imageUrl = item.gambar_url; if (imageUrl) { const { data: publicUrlData } = supabase.storage.from('gambarprestasi').getPublicUrl(imageUrl); imageUrl = publicUrlData ? publicUrlData.publicUrl : null; } return { ...item, gambar: imageUrl }; })); setPrestasiList(dataWithImageUrls); } setLoading(false); };
    
    const handleSave = async (formData) => {
        setUploading(true);
        setError(null);

        if (!formData.judul || !formData.deskripsi) {
            setError("Judul dan Deskripsi tidak boleh kosong.");
            setUploading(false);
            return;
        }

        const originalImagePath = currentPrestasi ? currentPrestasi.gambar_url : null;
        let finalImagePath = originalImagePath;

        try {
            if (formData.gambar && typeof formData.gambar === 'object') {
                const file = formData.gambar;
                const fileName = `${Date.now()}-prestasi.webp`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('gambarprestasi')
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw uploadError;

                finalImagePath = uploadData.path;

                if (originalImagePath && originalImagePath !== finalImagePath) {
                    const { error: removeError } = await supabase.storage
                        .from('gambarprestasi')
                        .remove([originalImagePath]);
                    if (removeError) {
                        console.error("Gagal hapus gambar lama saat mengganti:", removeError);
                    }
                }
            }
            else if (originalImagePath && !formData.gambar_url && !formData.gambar) {
                const { error: removeError } = await supabase.storage
                    .from('gambarprestasi')
                    .remove([originalImagePath]);
                
                if (removeError) {
                    console.error("Gagal hapus gambar lama:", removeError);
                }
                finalImagePath = null;
            }

            const dataToSave = {
                judul: formData.judul,
                deskripsi: formData.deskripsi,
                medali_emas: formData.medali_emas,
                medali_perak: formData.medali_perak,
                medali_perunggu: formData.medali_perunggu,
                gambar_url: finalImagePath,
            };

            const { error: dbError } = await (formData.id
                ? supabase.from('prestasi').update(dataToSave).eq('id', formData.id)
                : supabase.from('prestasi').insert(dataToSave));

            if (dbError) throw dbError;

            setCurrentPrestasi(null);
            fetchPrestasi();

        } catch (error) {
            console.error("Error saat menyimpan prestasi:", error);
            setError(`Gagal menyimpan prestasi: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            const { error: dbError } = await supabase.from('prestasi').delete().eq('id', itemToDelete.id);
            if (dbError) throw dbError;

            if (itemToDelete.gambar_url) { 
                const { error: storageError } = await supabase.storage.from('gambarprestasi').remove([itemToDelete.gambar_url]);
                if (storageError) console.error("Gagal hapus file dari storage:", storageError);
            }
            fetchPrestasi();
        } catch (error) {
            setError("Gagal hapus prestasi.");
            console.error(error);
        } finally {
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const promptDelete = (item) => {
        const itemWithOriginalPath = prestasiList.find(p => p.id === item.id);
        setItemToDelete(itemWithOriginalPath);
        setIsConfirmModalOpen(true);
    };

    const showAddForm = () => setCurrentPrestasi({ judul: '', deskripsi: '', medali_emas: 0, medali_perak: 0, medali_perunggu: 0, gambar_url: null, gambar: null });
    
    const showEditForm = (prestasi) => {
        const originalItem = prestasiList.find(p => p.id === prestasi.id);
        setCurrentPrestasi({ 
            ...prestasi, 
            gambar_url: originalItem.gambar_url 
        });
    };

    const showListView = () => setCurrentPrestasi(null);
    
    if (userRole === null || loading) { 
        return (
            <div className="relative min-h-screen text-white">
                <motion.div
                    className="fixed inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </motion.div>
                
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <Loader2 className="animate-spin mr-2 text-accent" />
                </div>
            </div>
        ); 
    }

    return (
        <div className="min-h-screen text-white">
            <Helmet>
                <title>Admin: Kelola Prestasi - STMKG Karate Club</title>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <motion.div
                className="fixed inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-black/70" /> 
            </motion.div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow pt-28 pb-10 px-4 md:px-12 flex justify-center items-start">
                    <AnimatePresence mode="wait">
                        {currentPrestasi ? (
                            <PrestasiForm 
                                key="form" 
                                currentPrestasi={currentPrestasi} 
                                onSave={handleSave} 
                                onCancel={showListView} 
                                uploading={uploading} 
                                style={glassCardStyle} // Menggunakan style yang sama
                            />
                        ) : (
                            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                                    <h1 className="text-4xl md:text-5xl font-league uppercase text-accent text-center md:text-left">Kelola Prestasi</h1>
                                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                                        <div className="relative w-full md:w-auto">
                                            <input
                                                type="text"
                                                placeholder="Cari prestasi..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="px-4 py-2 pl-10 text-sm bg-white/5 border border-white/10 rounded-full focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none transition-all duration-200 text-white w-full md:w-56"
                                                style={{ backdropFilter: 'blur(10px)' }}
                                            />
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={showAddForm} className={`${glassButtonClasses} px-4 py-2 font-semibold text-sm text-accent battery-style-gradient hover:text-yellow-400 w-full md:w-auto`}>
                                            <span>+ Tambah Prestasi Baru</span>
                                        </motion.button>
                                    </div>
                                </div>
                                {error && <div className="text-red-400 p-3 bg-red-500/10 rounded-md mb-4">{error}</div>}
                                {filteredPrestasi.length === 0 ? (
                                    <p className="text-center text-xl text-gray-500 mt-16">{searchQuery ? 'Prestasi tidak ditemukan.' : 'Belum ada prestasi yang ditambahkan.'}</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPrestasi.map((item) => (
                                            <motion.div 
                                                key={item.id} 
                                                className="p-6 rounded-2xl relative flex flex-col"
                                                style={glassCardStyle} 
                                                initial={{ opacity: 0, y: 20 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {item.gambar && <img src={item.gambar} alt={item.judul} className="w-full h-40 object-cover rounded-md mb-4" />}
                                                <h3 className="text-xl font-league uppercase text-accent mb-2">{item.judul}</h3>
                                                <p className="text-sm font-[Montserrat] text-gray-300 mb-4 line-clamp-3 flex-grow">{item.deskripsi}</p>
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => showEditForm(item)} className={`${glassButtonClasses} p-2 text-blue-400 hover:text-blue-300`}>
                                                        <Edit size={16} />
                                                    </motion.button>
                                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => promptDelete(item)} className={`${glassButtonClasses} p-2 text-red-500 hover:text-red-400`}>
                                                        <Trash2 size={16} />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
                
                <Footer />
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi Hapus"
            >
                <p>Apakah Anda yakin ingin menghapus prestasi <strong className="text-white">{itemToDelete?.judul}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            </ConfirmationModal>
        </div>
    );
}
