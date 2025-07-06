import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, CheckCircle, Plus, Edit, Trash2, Power, PowerOff, Check, X } from 'lucide-react';
import Footer from '../components/Footer';

export default function AdminPendaftaran() {
  // State
  const [semuaPeriode, setSemuaPeriode] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  
  // State untuk form periode baru
  const [periodeBaru, setPeriodeBaru] = useState({ nama_periode: '', tahun_angkatan: '', deskripsi: '' });

  // Fungsi untuk mengambil semua data periode dari database
  const ambilSemuaPeriode = useCallback(async () => {
    setMemuat(true);
    try {
      const { data, error } = await supabase
        .from('periode_pendaftaran')
        .select('*')
        .order('tahun_angkatan', { ascending: false }); // Urutkan dari tahun terbaru

      if (error) throw error;
      if (data) setSemuaPeriode(data);
    } catch (error) {
      console.error('Gagal mengambil data periode:', error.message);
      alert('Gagal memuat data periode.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    ambilSemuaPeriode();
  }, [ambilSemuaPeriode]);

  // Handler untuk input form periode baru
  const handleInputPeriodeBaru = (e) => {
    const { name, value } = e.target;
    setPeriodeBaru(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk membuat periode baru
  const handleBuatPeriode = async (e) => {
    e.preventDefault();
    if (!periodeBaru.nama_periode || !periodeBaru.tahun_angkatan) {
        alert('Nama Periode dan Tahun Angkatan wajib diisi!');
        return;
    }
    setMenyimpan(true);
    try {
        const { error } = await supabase.from('periode_pendaftaran').insert(periodeBaru);
        if (error) throw error;
        
        alert('Periode baru berhasil dibuat!');
        setPeriodeBaru({ nama_periode: '', tahun_angkatan: '', deskripsi: '' }); // Reset form
        ambilSemuaPeriode(); // Muat ulang daftar periode
    } catch(error) {
        alert(`Gagal membuat periode: ${error.message}`);
    } finally {
        setMenyimpan(false);
    }
  };
  
  // Handler untuk mengubah status aktif sebuah periode
  const handleSetAktif = async (idPeriode) => {
    setMenyimpan(true);
    try {
      // 1. Nonaktifkan semua periode lain
      await supabase.from('periode_pendaftaran').update({ sedang_aktif: false }).neq('id', idPeriode);
      // 2. Aktifkan periode yang dipilih
      await supabase.from('periode_pendaftaran').update({ sedang_aktif: true }).eq('id', idPeriode);

      ambilSemuaPeriode();
    } catch (error) {
      alert(`Gagal mengubah status aktif: ${error.message}`);
    } finally {
      setMenyimpan(false);
    }
  };

  // Handler untuk membuka/menutup pendaftaran pada periode aktif
  const handleToggleBuka = async (periode) => {
    setMenyimpan(true);
    try {
      await supabase
        .from('periode_pendaftaran')
        .update({ telah_dibuka: !periode.telah_dibuka })
        .eq('id', periode.id);
      
      ambilSemuaPeriode();
    } catch (error) {
      alert(`Gagal mengubah status pendaftaran: ${error.message}`);
    } finally {
      setMenyimpan(false);
    }
  };

  // Handler untuk menghapus periode
  const handleHapusPeriode = async (idPeriode) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus periode ini? Semua data pendaftar terkait akan sulit dilacak.")) {
          setMenyimpan(true);
          try {
              // Idealnya, cek dulu apakah ada pendaftar di periode ini sebelum menghapus.
              // Untuk sederhana, kita langsung hapus.
              await supabase.from('periode_pendaftaran').delete().eq('id', idPeriode);
              ambilSemuaPeriode();
          } catch(error) {
              alert(`Gagal menghapus: ${error.message}. Pastikan tidak ada data pendaftar yang terhubung ke periode ini.`);
          } finally {
              setMenyimpan(false);
          }
      }
  };


  if (memuat) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-white">
        <div className="flex-grow flex items-center justify-center">
            <LoaderCircle className="animate-spin h-8 w-8 mr-2" /> Memuat Data...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow w-full p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Bagian 1: Form Membuat Periode Baru */}
          <div>
            <h1 className="text-3xl font-bold mb-6 text-amber-400">Manajemen Periode Pendaftaran</h1>
            <form onSubmit={handleBuatPeriode} className="space-y-4 bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Buat Periode Baru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nama_periode" className="block text-sm font-medium mb-1">Nama Periode *</label>
                        <input type="text" id="nama_periode" name="nama_periode" value={periodeBaru.nama_periode} onChange={handleInputPeriodeBaru} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" placeholder="Cth: Pendaftaran Pengurus 2025"/>
                    </div>
                    <div>
                        <label htmlFor="tahun_angkatan" className="block text-sm font-medium mb-1">Untuk Angkatan Tahun *</label>
                        <input type="number" id="tahun_angkatan" name="tahun_angkatan" value={periodeBaru.tahun_angkatan} onChange={handleInputPeriodeBaru} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" placeholder="Cth: 2025"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="deskripsi" className="block text-sm font-medium mb-1">Deskripsi</label>
                    <textarea id="deskripsi" name="deskripsi" value={periodeBaru.deskripsi} onChange={handleInputPeriodeBaru} rows="3" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" placeholder="Deskripsi singkat untuk halaman pendaftaran..."></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={menyimpan} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold disabled:opacity-50 flex items-center">
                        <Plus size={18} className="mr-2" /> {menyimpan ? 'Membuat...' : 'Buat Periode'}
                    </button>
                </div>
            </form>
          </div>

          {/* Bagian 2: Daftar Periode yang Ada */}
          <div>
             <h2 className="text-2xl font-bold mb-6 text-amber-400 border-t border-gray-700 pt-8">Daftar Periode</h2>
             <div className="space-y-4">
                {semuaPeriode.map(periode => (
                    <div key={periode.id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-grow text-center md:text-left">
                            <h3 className="font-bold text-lg text-white">{periode.nama_periode}</h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 justify-center md:justify-start">
                                {periode.sedang_aktif ? 
                                    (<span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full"><Check size={14}/> Aktif</span>) : 
                                    (<span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded-full"><X size={14}/> Tidak Aktif</span>)
                                }
                                {periode.sedang_aktif && (
                                    periode.telah_dibuka ? 
                                    (<span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Pendaftaran Dibuka</span>) :
                                    (<span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Pendaftaran Ditutup</span>)
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <button onClick={() => handleSetAktif(periode.id)} disabled={menyimpan || periode.sedang_aktif} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center">
                                <Power size={16} className="mr-1"/> Jadikan Aktif
                            </button>
                            {periode.sedang_aktif && (
                                <button onClick={() => handleToggleBuka(periode)} disabled={menyimpan} className={`px-3 py-1.5 text-sm rounded-md flex items-center ${periode.telah_dibuka ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {periode.telah_dibuka ? 'Tutup' : 'Buka'} Pendaftaran
                                </button>
                            )}
                            <button onClick={() => handleHapusPeriode(periode.id)} disabled={menyimpan} className="p-2 bg-red-600/50 hover:bg-red-600 rounded-md">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {semuaPeriode.length === 0 && <p className='text-center text-gray-500'>Belum ada periode yang dibuat.</p>}
             </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}