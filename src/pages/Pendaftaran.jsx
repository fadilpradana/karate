// src/pages/Pendaftaran.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
    LoaderCircle, 
    Lock, 
    CheckCircle, 
    UploadCloud, 
    File as FileIcon,
    X,
    UserCircle,
    FilePenLine,
    Users,
    Heart,
    Star,
    Sparkles
} from 'lucide-react';
import Footer from '../components/Footer';

// Variabel cache ini ada di luar komponen, nilainya akan tetap ada
// selama tab browser tidak di-refresh.
let pendaftaranDataCache = null;

export default function Pendaftaran() {
    const navigate = useNavigate();
    const { session, role, loading: authLoading } = useAuth();

    // State untuk data & UI
    const [periodeAktif, setPeriodeAktif] = useState(null);
    const [profile, setProfile] = useState(null);
    
    // Tampilkan spinner hanya jika cache kosong.
    const [isFetchingData, setIsFetchingData] = useState(!pendaftaranDataCache);
    
    const [mengirim, setMengirim] = useState(false);
    const [sudahKirim, setSudahKirim] = useState(false);

    // State untuk semua kolom formulir
    const [persentaseMinat, setPersentaseMinat] = useState(50);
    const [alasanMinat, setAlasanMinat] = useState('');
    const [pengalamanOrganisasi, setPengalamanOrganisasi] = useState('');
    const [pengalamanKepanitiaan, setPengalamanKepanitiaan] = useState('');
    const [sepuluhCalon, setSepuluhCalon] = useState('');
    const [cvFile, setCvFile] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        // Jika user berganti (misal: logout lalu login dengan akun lain), hapus cache.
        if (pendaftaranDataCache && pendaftaranDataCache.userId !== session?.user?.id) {
            pendaftaranDataCache = null;
            setIsFetchingData(true); // Paksa loading ulang untuk user baru.
        }

        // Jika data sudah ada di cache, langsung gunakan dan hentikan proses.
        if (pendaftaranDataCache) {
            setPeriodeAktif(pendaftaranDataCache.periodeAktif);
            setProfile(pendaftaranDataCache.profile);
            setSudahKirim(pendaftaranDataCache.sudahKirim);
            setIsFetchingData(false); // Pastikan spinner berhenti.
            return;
        }

        if (role && role.toLowerCase() !== 'anggota') {
            navigate('/dashboard', { replace: true });
            return;
        }
        
        if (session && role?.toLowerCase() === 'anggota') {
            const ambilDataAwal = async () => {
                // `setIsFetchingData(true)` sudah diatur di atas jika cache kosong.
                try {
                    const [periodeRes, profileRes] = await Promise.all([
                        supabase.from('periode_pendaftaran').select('*').eq('sedang_aktif', true).maybeSingle(),
                        supabase.from('profiles').select('*').eq('id', session.user.id).single()
                    ]);

                    const periodeData = periodeRes.data;
                    const profileData = profileRes.data;
                    let isAlreadySubmitted = false;

                    if (periodeData) {
                        const { count } = await supabase
                            .from('data_pendaftar')
                            .select('*', { count: 'exact', head: true })
                            .eq('id_pengguna', session.user.id)
                            .eq('id_periode', periodeData.id);
                        isAlreadySubmitted = count > 0;
                    }

                    // Set state komponen
                    setPeriodeAktif(periodeData);
                    setProfile(profileData);
                    setSudahKirim(isAlreadySubmitted);

                    // Simpan ke cache
                    pendaftaranDataCache = {
                        periodeAktif: periodeData,
                        profile: profileData,
                        sudahKirim: isAlreadySubmitted,
                        userId: session.user.id // Simpan userId untuk validasi
                    };

                } catch (error) {
                    console.error('Gagal mengambil data awal pendaftaran:', error);
                    pendaftaranDataCache = null; // Hapus cache jika gagal.
                } finally {
                    setIsFetchingData(false);
                }
            };
            ambilDataAwal();
        } else {
            setIsFetchingData(false);
        }
    }, [authLoading, session, role, navigate]);

    const handleCvFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert("Ukuran file CV tidak boleh lebih dari 2MB."); return; }
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { alert("Format file tidak didukung. Harap unggah PDF, JPG, atau PNG."); return; }
            setCvFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cvFile) { alert('Harap unggah file CV Anda.'); return; }
        setMengirim(true);

        try {
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${periodeAktif.tahun_angkatan}/${profile?.nama_lengkap?.replace(/\s+/g, '_')}_${session.user.id}.${fileExt}`;
            
            // PERUBAHAN NAMA BUCKET DI SINI
            const BUCKET_NAME = 'cvpendaftar';

            const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, cvFile, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);

            const dataIsian = { persentase_minat: persentaseMinat, alasan_minat: alasanMinat, pengalaman_organisasi: pengalamanOrganisasi, pengalaman_kepanitiaan: pengalamanKepanitiaan, sepuluh_calon: sepuluhCalon, cv_url: publicUrlData.publicUrl };
            const { error: submissionError } = await supabase.from('data_pendaftar').insert({ id_pengguna: session.user.id, id_periode: periodeAktif.id, data_isian: dataIsian });
            if (submissionError) throw submissionError;

            setSudahKirim(true);

            // Update cache setelah submit
            if (pendaftaranDataCache) {
                pendaftaranDataCache.sudahKirim = true;
            }

        } catch (error) {
            alert(`Pendaftaran gagal: ${error.message}`);
        } finally {
            setMengirim(false);
        }
    };
    
    // Tampilan loading, sudah kirim, atau pendaftaran ditutup
    if (authLoading || isFetchingData) {
        return ( <div className="min-h-screen bg-gray-900 text-white flex flex-col"> <div className="flex-grow flex justify-center items-center"> <LoaderCircle className="animate-spin h-8 w-8 text-white" /> </div> <Footer /> </div> );
    }
    if (!session) { navigate('/login', { replace: true }); return null; }
    if (sudahKirim) { return ( <div className="min-h-screen bg-gray-900 text-white flex flex-col"> <main className="flex-grow flex justify-center items-center text-center p-4"> <div> <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" /> <h1 className="text-3xl font-bold text-amber-400">Terima Kasih!</h1> <p className="mt-2 text-gray-300">Anda sudah terdaftar pada {periodeAktif?.nama_periode || "periode ini"}.</p> </div> </main> <Footer /> </div> ); }
    if (!periodeAktif || !periodeAktif.telah_dibuka) { return ( <div className="min-h-screen bg-gray-900 text-white flex flex-col"> <main className="flex-grow flex justify-center items-center text-center p-4"> <div> <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" /> <h1 className="text-3xl font-bold text-amber-400">{periodeAktif?.nama_periode || 'Pendaftaran'}</h1> <p className="mt-2 text-gray-300">Saat ini pendaftaran sedang ditutup atau belum ada periode yang dibuka.</p> </div> </main> <Footer /> </div> ); }

    // Tampilan utama formulir pendaftaran
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-10"><h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{periodeAktif.nama_periode}</h1><p className="text-gray-300 max-w-2xl mx-auto">{periodeAktif.deskripsi || ''}</p></div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg"><h2 className="text-2xl font-semibold text-white mb-5 flex items-center gap-3"><UserCircle className="text-amber-400"/>Data Diri Peserta</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm"><div><p className="text-gray-400">Nama Lengkap</p><p className="font-medium text-base">{profile?.nama_lengkap}</p></div><div><p className="text-gray-400">NPT</p><p className="font-medium text-base">{profile?.npt}</p></div><div><p className="text-gray-400">Kelas</p><p className="font-medium text-base">{profile?.kelas}</p></div><div><p className="text-gray-400">Nomor Telepon</p><p className="font-medium text-base">{profile?.nomor_telepon}</p></div></div></div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg space-y-8"><h2 className="text-2xl font-semibold text-white flex items-center gap-3"><FilePenLine className="text-amber-400"/>Formulir Peminatan</h2>
                            <div className="flex flex-col"><label htmlFor="persentaseMinat" className="mb-3 font-medium flex items-center gap-2"><Heart size={16}/> Seberapa besar minat Anda untuk menjadi pengurus?</label><div className="flex items-center gap-4"><input id="persentaseMinat" type="range" min="0" max="100" step="5" value={persentaseMinat} onChange={(e) => setPersentaseMinat(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" /><span className="bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full w-16 text-center">{persentaseMinat}%</span></div></div>
                            <div className="flex flex-col"><label htmlFor="alasanMinat" className="mb-2 font-medium flex items-center gap-2"><Sparkles size={16}/> Alasan Minat</label><textarea id="alasanMinat" value={alasanMinat} onChange={(e) => setAlasanMinat(e.target.value)} required rows="4" className="bg-gray-700/80 p-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-full" placeholder="Jelaskan motivasi utama Anda..."></textarea></div>
                            <div className="flex flex-col"><label htmlFor="pengalamanOrganisasi" className="mb-2 font-medium flex items-center gap-2"><Star size={16}/> Pengalaman Organisasi</label><textarea id="pengalamanOrganisasi" value={pengalamanOrganisasi} onChange={(e) => setPengalamanOrganisasi(e.target.value)} required rows="4" className="bg-gray-700/80 p-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-full" placeholder="Sebutkan organisasi yang pernah diikuti beserta jabatan dan tahunnya..."></textarea></div>
                            <div className="flex flex-col"><label htmlFor="pengalamanKepanitiaan" className="mb-2 font-medium flex items-center gap-2"><Star size={16}/> Pengalaman Kepanitiaan</label><textarea id="pengalamanKepanitiaan" value={pengalamanKepanitiaan} onChange={(e) => setPengalamanKepanitiaan(e.target.value)} required rows="4" className="bg-gray-700/80 p-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-full" placeholder="Sebutkan kepanitiaan yang pernah diikuti beserta jabatan dan tahunnya..."></textarea></div>
                            <div className="flex flex-col"><label htmlFor="sepuluhCalon" className="mb-2 font-medium flex items-center gap-2"><Users size={16}/> 10 Nama Calon Pengurus</label><textarea id="sepuluhCalon" value={sepuluhCalon} onChange={(e) => setSepuluhCalon(e.target.value)} required rows="5" className="bg-gray-700/80 p-3 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-full" placeholder="Tuliskan 10 nama yang menurut Anda pantas menjadi pengurus selanjutnya, pisahkan dengan koma atau baris baru..."></textarea></div>
                            <div className="flex flex-col"><label className="mb-2 font-medium flex items-center gap-2"><UploadCloud size={16}/> Unggah Curriculum Vitae (CV)</label><p className="text-xs text-gray-400 mb-3">Format: PDF, JPG, PNG. Maksimal 2MB. (Harap sertakan: TTL, Alamat Kos, dll. dalam 1 halaman A4).</p><div className="mt-2"><label htmlFor="cv-upload" className="relative cursor-pointer bg-gray-700/80 rounded-lg border-2 border-dashed border-gray-500 hover:border-amber-500 transition-colors flex justify-center items-center p-6 text-center"><div className="flex flex-col items-center"><UploadCloud className="h-10 w-10 text-gray-400 mb-2"/><span className="text-sm text-gray-300">Klik untuk memilih file</span></div><input id="cv-upload" name="cv-upload" type="file" className="sr-only" onChange={handleCvFileChange} accept="application/pdf,image/jpeg,image/png" /></label></div>{cvFile && (<div className="mt-4 flex items-center justify-between bg-green-900/50 border border-green-700 text-sm text-white rounded-md p-3"><div className="flex items-center gap-3"><FileIcon className="h-5 w-5 text-green-400 flex-shrink-0" /><span className="truncate">{cvFile.name}</span></div><button type="button" onClick={() => setCvFile(null)} className="p-1 rounded-full hover:bg-red-500/50 transition-colors"><X className="h-4 w-4"/></button></div>)}</div>
                        </div>
                        <div className="pt-4"><button type="submit" disabled={mengirim || !cvFile} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-4 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-lg shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20">{mengirim ? <LoaderCircle className="animate-spin h-6 w-6" /> : 'Kirim Pendaftaran Saya'}</button></div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}