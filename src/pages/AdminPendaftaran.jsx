import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { LoaderCircle, Plus, Edit, Trash2, Power, Check, X, CalendarCheck, CalendarOff, Settings, PowerOff, Users, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function AdminPendaftaran() {
    // State
    const [semuaPeriode, setSemuaPeriode] = useState([]);
    const [memuat, setMemuat] = useState(true);
    const [menyimpan, setMenyimpan] = useState(false);
    const [userRole, setUserRole] = useState(null); // State untuk user role

    // State untuk form periode baru
    const [periodeBaru, setPeriodeBaru] = useState({ nama_periode: '', tahun_angkatan: '', deskripsi: '' });

    // Gaya untuk efek glassmorphism pada tombol
    const glassyButtonStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Sangat transparan
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)', // Border lebih tipis
        boxShadow: `
            0px 2px 5px rgba(0, 0, 0, 0.2), // Shadow lebih lembut
            inset 0 0 0 1px rgba(255, 255, 255, 0.1) // Inset shadow lebih lembut
        `,
        borderRadius: '0.5rem', // Sedikit melengkung
    };

    // --- LOGIKA PENGAMBILAN ROLE PENGGUNA (DISALIN DARI PENGURUS.JSX) ---
    useEffect(() => {
        async function getUserAndRole() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError.message);
                    setUserRole(null);
                    return;
                }

                if (session) {
                    const { user } = session;
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching user profile:', profileError.message);
                        setUserRole(null);
                        return;
                    }

                    if (profileData) {
                        setUserRole(profileData.role);
                    } else {
                        setUserRole(null); // Atau 'anggota' jika itu default untuk non-admin/pengurus
                    }
                } else {
                    setUserRole(null); // Jika tidak ada sesi (tidak login)
                }
            } catch (err) {
                console.error('Unexpected error fetching user role:', err.message);
                setUserRole(null);
            }
        }

        getUserAndRole();
    }, []);


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
            // Nonaktifkan semua periode lain
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: false }).neq('id', idPeriode);
            // Aktifkan periode yang dipilih
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: true }).eq('id', idPeriode);

            ambilSemuaPeriode();
        } catch (error) {
            alert(`Gagal mengubah status aktif: ${error.message}`);
        } finally {
            setMenyimpan(false);
        }
    };

    // Handler untuk mengubah status nonaktif sebuah periode
    const handleSetNonAktif = async (idPeriode) => {
        setMenyimpan(true);
        try {
            await supabase.from('periode_pendaftaran').update({ sedang_aktif: false, telah_dibuka: false }).eq('id', idPeriode);
            ambilSemuaPeriode();
        } catch (error) {
            alert(`Gagal mengubah status nonaktif: ${error.message}`);
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
                    <LoaderCircle className="animate-spin h-8 w-8 mr-2 text-amber-400" /> Memuat Data...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Mengatasi Navbar: Tambahkan padding-top ke main content */}
            <main className="flex-grow w-full p-4 md:p-8 pt-12 md:pt-16 lg:pt-20">
                {/* Lebarkan max-width untuk konten utama */}
                <div className="max-w-4xl lg:max-w-[88%] mx-auto space-y-12"> {/* Perubahan di sini */}

                    {/* Mobile Menu Manajemen Pengurus */}
                    {userRole === 'admin' && (
                        <div className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                            <nav className="flex space-x-4 justify-center">
                                <Link
                                    to="/pengurus"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                                    title="Kembali ke Pengurus"
                                >
                                    <ArrowLeft size={20} />
                                </Link>
                                <Link
                                    to="/moderasi-pengurus"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200"
                                    title="Moderasi Pengurus"
                                >
                                    <Settings size={20} />
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Desktop Menu Manajemen Pengurus - fixed di kiri */}
                    {userRole === 'admin' && (
                        <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                            <nav className="space-y-3">
                                <Link
                                    to="/pengurus"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                                    title="Kembali ke Pengurus"
                                >
                                    <ArrowLeft size={20} />
                                </Link>
                                <Link
                                    to="/moderasi-pengurus"
                                    className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block"
                                    title="Moderasi Pengurus"
                                >
                                    <Settings size={20} />
                                </Link>
                            </nav>
                        </div>
                    )}
                    {/* End Sidebar Menu Pengurus */}

                    {/* Header Halaman */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-6xl uppercase font-league font-bold text-amber-400 mb-2 drop-shadow-lg">
                            Admin Pendaftaran
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl">Kelola periode dan status pendaftaran anggota baru.</p>
                    </div>

                    {/* Bagian 1: Form Membuat Periode Baru */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-5 text-white flex items-center">
                            <Plus size={24} className="mr-2 text-amber-300" /> Buat Periode Baru
                        </h2>
                        <form onSubmit={handleBuatPeriode} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nama_periode" className="block text-sm font-medium text-gray-300 mb-1">Nama Periode <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="nama_periode"
                                        name="nama_periode"
                                        value={periodeBaru.nama_periode}
                                        onChange={handleInputPeriodeBaru}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        placeholder="Cth: Pendaftaran Angkatan XXII"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="tahun_angkatan" className="block text-sm font-medium text-gray-300 mb-1">Untuk Angkatan Tahun <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        id="tahun_angkatan"
                                        name="tahun_angkatan"
                                        value={periodeBaru.tahun_angkatan}
                                        onChange={handleInputPeriodeBaru}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        placeholder="Cth: 2025"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
                                <textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    value={periodeBaru.deskripsi}
                                    onChange={handleInputPeriodeBaru}
                                    rows="3"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    placeholder="Deskripsi singkat untuk halaman pendaftaran, akan ditampilkan ke calon pendaftar..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    style={glassyButtonStyle}
                                    className="px-6 py-2 text-amber-400 hover:text-amber-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                                >
                                    <Plus size={18} className="mr-2" /> {menyimpan ? 'Membuat...' : 'Buat Periode'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Bagian 2: Daftar Periode yang Ada */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                            <CalendarCheck size={24} className="mr-2 text-amber-300" /> Daftar Periode
                        </h2>
                        <div className="space-y-4">
                            {semuaPeriode.map(periode => (
                                <div key={periode.id}
                                    className={`p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300
                                        ${periode.sedang_aktif
                                            ? 'bg-white/5 border-l-4 border-amber-500 shadow-md'
                                            : 'bg-gray-700 border-l-4 border-gray-600'
                                        }
                                `}>
                                    <div className="flex-grow text-center md:text-left">
                                        <h3 className="font-bold text-xl text-white">{periode.nama_periode}</h3>
                                        <p className="text-gray-400 text-sm">Angkatan Tahun: {periode.tahun_angkatan}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400 justify-center md:justify-start">
                                            {periode.sedang_aktif ?
                                                (<span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full"><Check size={14}/> Periode Aktif</span>) :
                                                (<span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full"><X size={14}/> Tidak Aktif</span>)
                                            }
                                            {periode.sedang_aktif && (
                                                periode.telah_dibuka ?
                                                (<span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full"><CalendarCheck size={14}/> Pendaftaran Dibuka</span>) :
                                                (<span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full"><CalendarOff size={14}/> Pendaftaran Ditutup</span>)
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                        {/* Kondisi untuk tombol Aktif/Nonaktif */}
                                        {periode.sedang_aktif ? (
                                            <button
                                                onClick={() => handleSetNonAktif(periode.id)}
                                                disabled={menyimpan}
                                                title="Jadikan periode ini nonaktif"
                                                style={glassyButtonStyle}
                                                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                                            >
                                                <PowerOff size={16} className="mr-1"/> Jadikan Nonaktif
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSetAktif(periode.id)}
                                                disabled={menyimpan}
                                                title="Jadikan periode ini aktif"
                                                style={glassyButtonStyle}
                                                className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                                            >
                                                <Power size={16} className="mr-1"/> Jadikan Aktif
                                            </button>
                                        )}

                                        {periode.sedang_aktif && (
                                            <button
                                                onClick={() => handleToggleBuka(periode)}
                                                disabled={menyimpan}
                                                title={periode.telah_dibuka ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                                                style={glassyButtonStyle}
                                                className={`px-4 py-2 text-sm rounded-lg flex items-center transition-colors duration-200
                                                    ${periode.telah_dibuka ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'}`
                                                }
                                            >
                                                {periode.telah_dibuka ? <CalendarOff size={16} className="mr-1"/> : <CalendarCheck size={16} className="mr-1"/>}
                                                {periode.telah_dibuka ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
                                            </button>
                                        )}
                                        {/* Tombol Edit dikomentari karena belum ada fungsinya */}
                                        <button
                                            onClick={() => handleHapusPeriode(periode.id)}
                                            disabled={menyimpan || periode.sedang_aktif} // Tidak bisa hapus jika aktif
                                            title={periode.sedang_aktif ? "Tidak dapat menghapus periode aktif" : "Hapus periode ini"}
                                            style={glassyButtonStyle}
                                            className="p-2 text-red-400 hover:text-red-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {semuaPeriode.length === 0 && <p className='text-center text-gray-500 py-4'>Belum ada periode pendaftaran yang dibuat.</p>}
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}