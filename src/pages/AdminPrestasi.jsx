import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Plus, Edit, Trash, Loader2, UploadCloud, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { compressAndConvertToWebP } from '../utils/imageCompressor'; 

import brevetLogo from "../assets/brevet.png";

const glassButtonClasses = "flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

// --- Komponen Form Inline ---
const PrestasiForm = ({ currentPrestasi, onSave, onCancel, uploading, isCompressing }) => {
    // State dan logika form tidak berubah
    const [formData, setFormData] = useState(currentPrestasi);
    const [imagePreview, setImagePreview] = useState(currentPrestasi.gambar || null);
    const [internalCompressing, setInternalCompressing] = useState(isCompressing);

    const handleInputChange = async (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setInternalCompressing(true);
            try {
                const compressedFile = await compressAndConvertToWebP(file);
                // Saat file baru dipilih, kita simpan sebagai object File dan kosongkan gambar_url
                setFormData(prev => ({ ...prev, gambar: compressedFile, gambar_url: '' }));
                setImagePreview(URL.createObjectURL(compressedFile));
            } catch (error) { console.error("Gagal kompresi gambar:", error); } 
            finally { setInternalCompressing(false); }
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
        }
    };

    const removeImage = () => { 
        // Saat gambar dihapus, kita set `gambar` dan `gambar_url` menjadi null
        setFormData(prev => ({ ...prev, gambar: null, gambar_url: null })); 
        setImagePreview(null); 
        const fileInput = document.getElementById('gambar-input'); 
        if (fileInput) fileInput.value = ''; 
    };
    
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    const glassFormStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)'};
    const glassInputStyle = { backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', borderRadius: '0.5rem', outline: 'none', width: '100%', transition: 'all 0.2s ease' };

    return (
        <motion.div 
            key="form-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto p-6 rounded-2xl" style={glassFormStyle} >
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
                            <textarea id="deskripsi" name="deskripsi" value={formData?.deskripsi || ''} onChange={handleInputChange} className="p-2.5 resize-y" style={glassInputStyle} rows="1" required></textarea>
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


// --- Komponen Halaman Utama ---
export default function AdminPrestasi() {
    const navigate = useNavigate();
    const [prestasiList, setPrestasiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPrestasi, setCurrentPrestasi] = useState(null); 
    const [uploading, setUploading] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => { const checkUser = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { navigate('/login'); return; } const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single(); if (profileError || profileData?.role !== 'admin') { navigate('/'); } else { setUserRole(profileData.role); fetchPrestasi(); }}; checkUser(); }, [navigate]);
    
    const fetchPrestasi = async () => { setLoading(true); setError(null); const { data, error } = await supabase.from('prestasi').select('*').order('created_at', { ascending: false }); if (error) { setError("Gagal memuat prestasi."); console.error(error); } else { const dataWithImageUrls = await Promise.all(data.map(async (item) => { let imageUrl = item.gambar_url; if (imageUrl) { const { data: publicUrlData } = supabase.storage.from('gambarprestasi').getPublicUrl(imageUrl); imageUrl = publicUrlData ? publicUrlData.publicUrl : null; } return { ...item, gambar: imageUrl }; })); setPrestasiList(dataWithImageUrls); } setLoading(false); };
    
    // --- PERUBAHAN UTAMA DI FUNGSI handleSave ---
    const handleSave = async (formData) => {
        setUploading(true);
        setError(null);

        if (!formData.judul || !formData.deskripsi) {
            setError("Judul dan Deskripsi tidak boleh kosong.");
            setUploading(false);
            return;
        }

        // Dapatkan path gambar original dari state 'currentPrestasi' (data sebelum diedit)
        const originalImagePath = currentPrestasi ? currentPrestasi.gambar_url : null;
        let finalImagePath = originalImagePath;

        try {
            // KASUS 1: Ada file gambar baru yang diunggah dari form
            if (formData.gambar && typeof formData.gambar === 'object') {
                const file = formData.gambar;
                const fileName = `${Date.now()}-prestasi.webp`;
                
                // Unggah file baru
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('gambarprestasi')
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw uploadError;

                finalImagePath = uploadData.path; // Path gambar final adalah path file yang baru

                // Jika ada gambar lama, hapus dari storage
                if (originalImagePath) {
                    const { error: removeError } = await supabase.storage
                        .from('gambarprestasi')
                        .remove([originalImagePath]);
                    if (removeError) {
                        // Log error tapi jangan hentikan proses, agar data tetap tersimpan
                        console.error("Gagal hapus gambar lama saat mengganti:", removeError);
                    }
                }
            }
            // KASUS 2: Tidak ada file baru, TAPI gambar lama dihapus dari form
            else if (originalImagePath && !formData.gambar_url && !formData.gambar) {
                // Hapus gambar lama dari storage
                const { error: removeError } = await supabase.storage
                    .from('gambarprestasi')
                    .remove([originalImagePath]);
                
                if (removeError) {
                    console.error("Gagal hapus gambar lama:", removeError);
                }
                finalImagePath = null; // Set path gambar menjadi null untuk database
            }

            // Siapkan data untuk disimpan ke database
            const dataToSave = {
                judul: formData.judul,
                deskripsi: formData.deskripsi,
                medali_emas: formData.medali_emas,
                medali_perak: formData.medali_perak,
                medali_perunggu: formData.medali_perunggu,
                gambar_url: finalImagePath, // Gunakan path gambar final
            };

            // Lakukan update atau insert ke database
            const { error: dbError } = await (formData.id
                ? supabase.from('prestasi').update(dataToSave).eq('id', formData.id)
                : supabase.from('prestasi').insert(dataToSave));

            if (dbError) throw dbError;

            // Sukses, kembali ke daftar prestasi
            setCurrentPrestasi(null);
            fetchPrestasi();

        } catch (error) {
            console.error("Error saat menyimpan prestasi:", error);
            setError(`Gagal menyimpan prestasi: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };
    
    const handleDelete = async (id, imageUrl) => { if (!window.confirm("Yakin hapus prestasi ini?")) return; try { const { error: dbError } = await supabase.from('prestasi').delete().eq('id', id); if (dbError) throw dbError; if (imageUrl) { const imagePath = new URL(imageUrl).pathname.split('/gambarprestasi/')[1]; const { error: storageError } = await supabase.storage.from('gambarprestasi').remove([imagePath]); if (storageError) console.error("Gagal hapus file dari storage:", storageError); } fetchPrestasi(); } catch (error) { setError("Gagal hapus prestasi."); console.error(error); }};
    
    const showAddForm = () => setCurrentPrestasi({ judul: '', deskripsi: '', medali_emas: 0, medali_perak: 0, medali_perunggu: 0, gambar_url: null, gambar: null });
    
    // Saat form edit ditampilkan, kita simpan data original ke 'currentPrestasi'
    const showEditForm = (prestasi) => {
      // Pastikan 'gambar' sesuai dengan URL, dan 'gambar_url' adalah path-nya
      const originalPath = prestasisList.find(p => p.id === prestasi.id)?.gambar_url;
      setCurrentPrestasi({ ...prestasi, gambar_url: originalPath });
    };

    const showListView = () => setCurrentPrestasi(null);
    
    if (userRole === null || loading) { return <div className="flex items-center justify-center min-h-screen bg-[#0E0004] text-white"><Loader2 className="animate-spin mr-2" /> Memuat...</div>; }

    return (
        <div className="bg-[#0E0004] min-h-screen text-white flex flex-col">
            <main className="flex-grow pt-28 pb-10 px-4 md:px-12 relative z-10 flex justify-center items-start">
                <AnimatePresence mode="wait">
                    {currentPrestasi ? (
                        <PrestasiForm key="form" currentPrestasi={currentPrestasi} onSave={handleSave} onCancel={showListView} uploading={uploading} />
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                                <h1 className="text-2xl md:text-4xl font-league uppercase text-accent text-center md:text-left">Kelola Prestasi</h1>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={showAddForm} className={`${glassButtonClasses} px-4 py-2 font-semibold text-sm text-accent battery-style-gradient hover:text-yellow-400`}>
                                    + Tambah Prestasi
                                </motion.button>
                            </div>
                            {error && <div className="text-red-400 p-3 bg-red-500/10 rounded-md mb-4">{error}</div>}
                            {prestasiList.length === 0 ? (
                                <p className="text-center text-xl text-gray-500 mt-16">Belum ada prestasi yang ditambahkan.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {prestasiList.map((item) => (
                                        <motion.div key={item.id} className="p-5 rounded-xl relative overflow-hidden bg-white/5 border border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                            {item.gambar && <img src={item.gambar} alt={item.judul} className="w-full h-40 object-cover rounded-md mb-4" />}
                                            <h3 className="text-xl font-league uppercase text-accent mb-2">{item.judul}</h3>
                                            <p className="text-sm font-[Montserrat] text-gray-300 mb-4 line-clamp-3">{item.deskripsi}</p>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => showEditForm(item)} className={`${glassButtonClasses} p-2 text-blue-400 hover:text-blue-300`}>
                                                    <Edit size={16} />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(item.id, item.gambar)} className={`${glassButtonClasses} p-2 text-red-500 hover:text-red-400`}>
                                                    <Trash size={16} />
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
            <footer className="relative z-[30] bg-[#0E0004] text-gray-400 text-sm py-10 px-6 md:px-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">&copy; {new Date().getFullYear()} STMKG Karate Club</div>
                    <img src={brevetLogo} alt="Logo Brevet" className="h-5" />
                    <div className="flex gap-4">
                        <Link to="/" className="hover:text-white">Beranda</Link>
                        <Link to="/artikel" className="hover:text-white">Artikel</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}