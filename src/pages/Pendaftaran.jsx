import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { LoaderCircle, Lock, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer'; // 1. Impor komponen Footer

export default function Pendaftaran() {
  const { session } = useAuth();
  const [pengaturan, setPengaturan] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [sudahKirim, setSudahKirim] = useState(false);
  const [dataForm, setDataForm] = useState({ alasan: '', visi_misi: '' });

  const cekStatusPendaftaran = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data: profil } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single();
    
    if (profil && (profil.role === 'calon pengurus' || profil.role === 'pengurus')) {
        setSudahKirim(true);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const ambilPengaturan = async () => {
      setMemuat(true);
      await cekStatusPendaftaran();
      try {
        const { data, error } = await supabase
          .from('pengaturan_pendaftaran')
          .select('*').eq('id', 1).single();
        if (error) throw error;
        setPengaturan(data);
      } catch (error) {
        console.error('Gagal mengambil pengaturan:', error.message);
      } finally {
        setMemuat(false);
      }
    };
    ambilPengaturan();
  }, [cekStatusPendaftaran]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDataForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataForm.alasan || !dataForm.visi_misi) {
        alert('Harap isi semua kolom yang wajib diisi.');
        return;
    }
    setMengirim(true);
    try {
      const { error: submissionError } = await supabase
        .from('data_pendaftar')
        .insert({
          id_pengguna: session.user.id,
          data_isian: dataForm,
        });
      if (submissionError) throw submissionError;

      const { error: roleError } = await supabase
        .from('profiles').update({ role: 'calon pengurus' }).eq('id', session.user.id);
      if (roleError) throw roleError;

      setSudahKirim(true);
    } catch (error) {
      alert(`Pendaftaran gagal: ${error.message}`);
    } finally {
      setMengirim(false);
    }
  };

  if (memuat) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
            <div className="flex-grow flex items-center justify-center">
                <LoaderCircle className="animate-spin h-8 w-8" />
            </div>
            <Footer />
        </div>
    );
  }

  if (sudahKirim) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
            <div className="flex-grow flex items-center justify-center text-center p-4">
                <div>
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-amber-400">Pendaftaran Berhasil!</h1>
                    <p className="mt-2 text-gray-300">Terima kasih, data Anda telah kami terima.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
  }

  if (!pengaturan?.sedang_dibuka) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
             <div className="flex-grow flex items-center justify-center text-center p-4">
                <div>
                    <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-amber-400">{pengaturan?.judul || 'Pendaftaran'}</h1>
                    <p className="mt-2 text-gray-300">Saat ini pendaftaran sedang ditutup.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center text-amber-400">{pengaturan.judul}</h1>
          <p className="text-gray-300 mb-8 text-center">{pengaturan.deskripsi_formulir}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
              <div>
                  <label htmlFor="alasan" className="block text-sm font-medium mb-1">Alasan Bergabung *</label>
                  <textarea id="alasan" name="alasan" value={dataForm.alasan} onChange={handleInputChange} rows="5" required
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Jelaskan alasan kuat Anda ingin menjadi bagian dari kepengurusan..."></textarea>
              </div>
              <div>
                  <label htmlFor="visi_misi" className="block text-sm font-medium mb-1">Visi & Misi Anda *</label>
                  <textarea id="visi_misi" name="visi_misi" value={dataForm.visi_misi} onChange={handleInputChange} rows="5" required
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Jelaskan visi dan misi yang akan Anda bawa untuk kemajuan UKM Karate..."></textarea>
              </div>
              <div className="flex justify-end">
                  <button type="submit" disabled={mengirim}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-md font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center">
                      {mengirim && <LoaderCircle className="animate-spin h-4 w-4 mr-2" />}
                      {mengirim ? 'Mengirim...' : 'Kirim Pendaftaran'}
                  </button>
              </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}