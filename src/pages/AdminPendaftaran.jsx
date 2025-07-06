import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer'; // Impor komponen Footer

export default function AdminPendaftaran() {
  const [pengaturan, setPengaturan] = useState({ id: 1, sedang_dibuka: false, judul: '', deskripsi_formulir: '' });
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [sukses, setSukses] = useState(false);

  const ambilPengaturan = useCallback(async () => {
    setMemuat(true);
    try {
      const { data, error } = await supabase
        .from('pengaturan_pendaftaran')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      if (data) setPengaturan(data);
    } catch (error) {
      console.error('Gagal mengambil pengaturan:', error.message);
      alert('Gagal memuat pengaturan.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    ambilPengaturan();
  }, [ambilPengaturan]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPengaturan(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setMenyimpan(true);
    setSukses(false);
    try {
      const { error } = await supabase
        .from('pengaturan_pendaftaran')
        .update({
          sedang_dibuka: pengaturan.sedang_dibuka,
          judul: pengaturan.judul,
          deskripsi_formulir: pengaturan.deskripsi_formulir,
        })
        .eq('id', 1);

      if (error) throw error;
      setSukses(true);
      setTimeout(() => setSukses(false), 2000);
    } catch (error) {
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setMenyimpan(false);
    }
  };

  if (memuat) {
    return (
      // Pastikan footer tampil juga saat loading
      <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
        <div className="flex-grow flex items-center justify-center">
            <LoaderCircle className="animate-spin h-8 w-8 mr-2" /> Memuat Pengaturan...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      {/* Konten Utama */}
      <main className="w-full p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-amber-400">Pengaturan Halaman Pendaftaran</h1>
          <form onSubmit={handleSimpan} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
              <span className="font-medium">Status Pendaftaran</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="sedang_dibuka"
                  checked={pengaturan.sedang_dibuka}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-3 text-sm font-medium">{pengaturan.sedang_dibuka ? "Dibuka" : "Ditutup"}</span>
              </label>
            </div>

            <div>
              <label htmlFor="judul" className="block text-sm font-medium mb-1">Judul Halaman</label>
              <input
                type="text" id="judul" name="judul" value={pengaturan.judul}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="deskripsi_formulir" className="block text-sm font-medium mb-1">Deskripsi / Instruksi Form</label>
              <textarea
                id="deskripsi_formulir" name="deskripsi_formulir" value={pengaturan.deskripsi_formulir || ''}
                onChange={handleInputChange} rows="4"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Jelaskan instruksi pendaftaran di sini..."
              ></textarea>
            </div>

            <div className="flex justify-end items-center">
              {sukses && <CheckCircle className="h-5 w-5 text-green-400 mr-3" />}
              <button type="submit" disabled={menyimpan}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-md font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center">
                {menyimpan && <LoaderCircle className="animate-spin h-4 w-4 mr-2" />}
                {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Panggil Komponen Footer */}
      <Footer />
    </div>
  );
}