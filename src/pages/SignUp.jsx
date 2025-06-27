import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom"; // Import Link dan useNavigate

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [phone, setPhone] = useState("");
  const [npt, setNpt] = useState("");
  const [kelas, setKelas] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading button

  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleSignUp = async () => {
    setMessage("");
    setLoading(true); // Mulai loading

    // 1. Sign up ke auth Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username, // ini masuk ke user_metadata
        },
      },
    });

    if (error) {
      setMessage("Gagal daftar: " + error.message);
      setLoading(false); // Hentikan loading
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      // 2. Simpan ke tabel profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        display_name: username,
        nama_lengkap: namaLengkap,
        phone: phone,
        npt: npt,
        kelas: kelas,
        angkatan: angkatan,
      });

      if (profileError) {
        setMessage("Gagal simpan data profil: " + profileError.message);
        // Pertimbangkan untuk menghapus user dari auth jika gagal simpan profil
        // await supabase.auth.admin.deleteUser(userId); // Ini membutuhkan admin role keys, biasanya tidak dilakukan di frontend
      } else {
        setMessage("Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi dan login.");
        // Opsional: Redirect ke halaman login setelah berhasil daftar
        setTimeout(() => {
          navigate('/login'); // Arahkan ke halaman login
        }, 3000); // Redirect setelah 3 detik
      }
    }
    setLoading(false); // Hentikan loading
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4 md:px-12 py-20 font-montserrat">
      <div
        className="w-full max-w-md p-8 rounded-lg shadow-xl relative overflow-hidden
                   backdrop-blur-md bg-white/5 border border-white/20
                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-30 before:rounded-lg" // Efek glass tambahan
      >
        <h1 className="text-3xl font-bold mb-6 text-white text-center z-10 relative">Daftar Akun Baru</h1>

        <div className="space-y-4 z-10 relative"> {/* Tambahkan z-10 relative agar input di atas before element */}
          <input
            placeholder="Username"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <input
            placeholder="Email"
            type="email"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input
            placeholder="Password"
            type="password"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <input
            placeholder="Nama Lengkap"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setNamaLengkap(e.target.value)}
            value={namaLengkap}
          />
          <input
            placeholder="Nomor HP"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
          <input
            placeholder="NPT (Nomor Pokok Taruna)"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setNpt(e.target.value)}
            value={npt}
          />
          <input
            placeholder="Kelas"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setKelas(e.target.value)}
            value={kelas}
          />
          <input
            placeholder="Angkatan"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
            onChange={(e) => setAngkatan(e.target.value)}
            value={angkatan}
          />
          
          <button
            onClick={handleSignUp}
            className="w-full p-3 rounded-md text-white font-semibold transition-all duration-300
                       bg-[#FF9F1C] hover:bg-opacity-90 active:scale-95
                       flex items-center justify-center gap-2"
            disabled={loading} // Disable button saat loading
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Daftar'
            )}
          </button>

          {message && <p className={`mt-4 text-center text-sm ${message.includes("berhasil") ? "text-green-400" : "text-red-400"}`}>{message}</p>}
        </div>
        
        {/* Tombol Login */}
        <div className="mt-6 text-center z-10 relative">
          <p className="text-gray-300">Sudah punya akun?{' '}
            <Link to="/login" className="text-[#FF9F1C] hover:underline font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}