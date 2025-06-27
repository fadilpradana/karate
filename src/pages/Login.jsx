// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom"; // Import Link

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null); // Ubah dari error menjadi message untuk pesan sukses/gagal
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null); // Clear previous messages

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage("Login gagal: " + error.message);
    } else {
      setMessage("Login berhasil! Mengarahkan ke dasbor...");
      // Tambahkan timeout agar user bisa membaca pesan sukses sebelum redirect
      setTimeout(() => {
        navigate("/dashboard"); // Redirect ke halaman dashboard
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4 md:px-12 py-20 font-montserrat">
      <div
        className="w-full max-w-md p-8 rounded-lg shadow-xl relative overflow-hidden
                   backdrop-blur-md bg-white/5 border border-white/20
                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-30 before:rounded-lg" // Efek glass tambahan
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center z-10 relative">Masuk Akun</h2>

        <form onSubmit={handleLogin} className="space-y-4 z-10 relative">
          <div>
            <label className="block mb-2 text-white text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-white text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] border border-white/10"
              required
            />
          </div>

          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes("berhasil") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-md text-white font-semibold transition-all duration-300
                       bg-[#FF9F1C] hover:bg-opacity-90 active:scale-95
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Tombol Daftar */}
        <div className="mt-6 text-center z-10 relative">
          <p className="text-gray-300">Belum punya akun?{' '}
            <Link to="/signup" className="text-[#FF9F1C] hover:underline font-semibold">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;