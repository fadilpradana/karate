import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo_bintangcompress.png";
// import { supabase } from '../supabaseClient'; // Tidak perlu lagi diimpor langsung di Navbar
import { useAuth } from '../contexts/AuthContext.jsx'; // ✅ Import useAuth hook

const navLinks = [
  { name: "Beranda", path: "/" },
  { name: "Profil", path: "/profil" },
  { name: "Jadwal", path: "/jadwal" },
  { name: "Berita", path: "/berita" },
  { name: "Kontak", path: "/kontak" },
  { name: "Daftar", path: "/pendaftaran" },
];

const pengurusLink = { name: "Pengurus", path: "/pengurus" };
const dashboardLink = { name: "Dashboard", path: "/dashboard" };

// ✅ HAPUS ini, LOGOUT_TIMEOUT_MS kini diatur di AuthContext
// const LOGOUT_TIMEOUT_MS = 5000;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [indicatorProps, setIndicatorProps] = useState({ left: 0, width: 0 });
  const leftRefs = useRef([]);
  const pengurusRef = useRef(null);
  const dashboardRef = useRef(null);
  const loginRegisterRef = useRef(null);
  const menuContainerRef = useRef(null);
  const navInnerContainerRef = useRef(null);

  // ✅ Gunakan useAuth hook untuk mendapatkan state autentikasi
  const { session, logout } = useAuth(); // Ambil session dan fungsi logout dari AuthContext

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(null);

  const isPengurusActive = location.pathname === pengurusLink.path;
  const isDashboardActive = location.pathname === dashboardLink.path;

  const handleNavLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutMessage(null); // Pastikan pesan sebelumnya bersih

    // ✅ Panggil fungsi logout dari AuthContext
    const { success, error } = await logout(); // AuthContext.logout sudah menangani supabase.auth.signOut() dan timeout

    if (success) {
      console.log("Navbar: Logout successful via AuthContext.");
      setLogoutMessage({ type: 'success', text: 'Logout berhasil!' });
      navigate('/');
    } else {
      console.error("Navbar: Logout failed via AuthContext:", error);
      // ✅ Perbaikan: Tampilkan pesan error timeout langsung jika terjadi
      setLogoutMessage({ type: 'error', text: `Logout gagal: ${error || 'Terjadi kesalahan tidak dikenal.'}` });
    }

    setIsLoggingOut(false); // Setelah logout() selesai (baik sukses atau gagal), sembunyikan spinner
    setMenuOpen(false); // Tutup menu setelah logout

    // ✅ Jika Anda punya komponen Toast/MessageBox yang otomatis hilang,
    // maka setTimeout ini bisa dihapus agar tidak duplikasi logika.
    // Jika tidak, biarkan ini untuk menghilangkan pesan otomatis.
    setTimeout(() => setLogoutMessage(null), 3000); // Hapus pesan setelah 3 detik
  }, [logout, navigate]); // Dependensi 'logout' kini berasal dari useAuth()

  // ✅ HAPUS useEffect ini karena AuthContext sudah menangani onAuthStateChange dan getSession
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //     console.log("Navbar: Initial session check:", session);
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //     console.log("Navbar: Auth state changed event:", _event, "New session:", session);
  //   });

  //   return () => {
  //     if (subscription) {
  //       subscription.unsubscribe();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (menuOpen || isLoggingOut) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen, isLoggingOut]);

  useEffect(() => {
    const isLoginRegisterActiveSemantically =
      (session && location.pathname === '/') || (!session && location.pathname === '/signup');

    const activeNavLinkIndex = navLinks.findIndex(link => location.pathname === link.path);

    if (activeNavLinkIndex !== -1) {
      const el = leftRefs.current[activeNavLinkIndex];
      if (el) {
        const { offsetLeft, offsetWidth } = el;
        setIndicatorProps({ left: offsetLeft, width: offsetWidth });
      } else {
        setIndicatorProps({ left: 0, width: 0 });
      }
    } else if (isLoginRegisterActiveSemantically) {
      const el = loginRegisterRef.current;
      if (el) {
        const { offsetLeft, offsetWidth } = el;
        setIndicatorProps({ left: offsetLeft, width: offsetWidth });
      } else {
        setIndicatorProps({ left: 0, width: 0 });
      }
    } else if (isPengurusActive) { // Tambahkan kondisi untuk Pengurus
        const el = pengurusRef.current;
        if (el) {
          const { offsetLeft, offsetWidth } = el;
          setIndicatorProps({ left: offsetLeft, width: offsetWidth });
        } else {
          setIndicatorProps({ left: 0, width: 0 });
        }
    } else if (isDashboardActive) { // Tambahkan kondisi untuk Dashboard
        const el = dashboardRef.current;
        if (el) {
          const { offsetLeft, offsetWidth } = el;
          setIndicatorProps({ left: offsetLeft, width: offsetWidth });
        } else {
          setIndicatorProps({ left: 0, width: 0 });
        }
    }
    else {
      setIndicatorProps({ left: 0, width: 0 });
    }
  }, [location.pathname, session, isPengurusActive, isDashboardActive]); // Tambahkan dependensi terkait navigasi kanan


  // Kelas dasar untuk elemen di sisi kanan Navbar (Pengurus, Dashboard, Login/Register/Logout)
  // Memiliki px-3 py-1 text-xs font-medium rounded-md border transition-all duration-300
  const baseRightNavLinkClass = "hidden md:flex items-center px-3 py-1 text-xs font-medium rounded-md border transition-all duration-300";


  const getPengurusClass = () => {
    // Menggunakan baseRightNavLinkClass
    if (isPengurusActive) {
      return `${baseRightNavLinkClass} border-[#FF9F1C] bg-transparent text-white hover:text-[#FF9F1C] hover:border-[#FF9F1C]`;
    }
    return `${baseRightNavLinkClass} text-white border-white bg-transparent hover:text-[#FF9F1C] hover:border-[#FF9F1C]`;
  };

  // Kelas untuk Dashboard - Selalu aktifkan frame glassmorphism dan samakan ukuran
  const getDashboardClass = () => {
    const textColorClass = isDashboardActive ? "text-[#FF9F1C] font-semibold" : "text-white hover:text-[#FF9F1C]";

    // Menggunakan baseRightNavLinkClass, lalu menimpa bagian border dan background untuk glassmorphism
    return `${baseRightNavLinkClass} ${textColorClass} relative z-10
                backdrop-blur-md bg-white/10
                border border-white/30
                shadow-[0px_1px_3px_rgba(0,0,0,0.1),inset_1px_1px_2px_rgba(255,255,255,0.11),inset_-1px_-1px_2px_rgba(0,0,0,0.1)]`;
  };


  const getLoginRegisterClass = (isActive) => {
    // Menggunakan baseRightNavLinkClass
    const textColorClass = isActive ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]";

    // Untuk Login/Register/Logout, kita juga ingin border dan background transparan seperti Pengurus
    // kecuali saat aktif, itu akan menjadi text-[#FF9F1C]
    return `${baseRightNavLinkClass} ${textColorClass} bg-transparent border-white relative z-10`;
  };

  const mainContainerVariants = {
    hidden: { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      }
    }
  };

  const pengurusDashboardVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 1, 1],
      scale: [0.8, 1.05, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.8,
        times: [0, 0.5, 1],
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { x: "100%" },
    visible: {
      x: "0%",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const logoutOverlayVariants = {
    hidden: { opacity: 0, pointerEvents: 'none' },
    visible: {
      opacity: 1,
      pointerEvents: 'auto',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const messageBoxVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    <>
      <nav className="fixed top-2 left-2 w-full z-50 px-2 md:px-6">
        <div
          ref={navInnerContainerRef}
          className="max-w-7xl mx-auto py-2 flex justify-between items-center relative md:px-0"
        >
          <div className="flex items-center pl-1 md:pl-0 md:space-x-2">
            <Link to="/" className="relative z-5 flex-none">
              <img
                src={logo}
                alt="Logo Karate"
                className="w-9 h-9 rounded-full md:ml-0 flex-none object-contain flex-shrink-0 hover:opacity-90 transition duration-200"
              />
            </Link>

            <div className="flex flex-col ml-1 md:hidden">
              <span
                className="leading-none font-[Montserrat] font-thin"
                style={{ fontSize: '0.5rem', letterSpacing: '0.05em' }}
              >
                KARATE
              </span>
              <span
                className="leading-none ml-[0.03rem] font-[Montserrat] font-thin"
                style={{ fontSize: '0.35rem', letterSpacing: '0.6em' }}
              >
                STMKG
              </span>
            </div>

            <div className="hidden md:block rounded-md">
              <motion.div
                ref={menuContainerRef}
                className="md:flex relative items-center gap-1 backdrop-blur-md bg-white/10 px-1 py-1 rounded-md shadow-sm"
                variants={mainContainerVariants}
                initial="hidden"
                animate="visible"
                style={{ minWidth: 'fit-content' }}
              >
                {indicatorProps.width > 0 && (
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-md z-0"
                    animate={{ left: indicatorProps.left, width: indicatorProps.width }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: `
                        0px 1px 3px rgba(0, 0, 0, 0.1),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.11),
                        inset -1px -1px 2px rgba(0, 0, 0, 0.1)
                      `,
                    }}
                  />
                )}

                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.path;
                  const linkClasses = isActive
                    ? "text-[#FF9F1C] font-semibold"
                    : "text-white";

                  const currentDelay = (0.8 + 0.1) + (index * 0.1);

                  return (
                    <motion.div
                      key={link.path}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{
                        ...itemVariants.visible.transition,
                        delay: currentDelay,
                      }}
                    >
                      <Link
                        to={link.path}
                        ref={(el) => { if (el) leftRefs.current[index] = el; }}
                        className={`relative z-10 px-2 py-1 text-xs font-medium transition-all duration-200 hover:text-[#FF9F1C] ${linkClasses}`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    ...itemVariants.visible.transition,
                    delay: (0.8 + 0.1) + (navLinks.length * 0.1),
                  }}
                >
                  {session ? (
                    <button
                      onClick={handleLogout}
                      ref={loginRegisterRef}
                      // Logika isActive untuk Logout masih sama: aktif jika di root dan bukan Pengurus/Dashboard
                      className={getLoginRegisterClass(location.pathname === '/' && !isPengurusActive && !isDashboardActive)}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/signup"
                      ref={loginRegisterRef}
                      className={getLoginRegisterClass(location.pathname === '/signup')}
                    >
                      Login / Register
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center pr-4 md:pr-0">
            {session && (
              <motion.div
                variants={pengurusDashboardVariants}
                initial="hidden"
                animate="visible"
                className="mr-4"
              >
                {/* Tombol Dashboard - Gunakan getDashboardClass() yang baru */}
                <Link to={dashboardLink.path} ref={dashboardRef} className={getDashboardClass()}>
                  <span className="text-sm mr-1">🌐</span> {dashboardLink.name}
                </Link>
              </motion.div>
            )}

            <motion.div
              variants={pengurusDashboardVariants}
              initial="hidden"
              animate="visible"
            >
              <Link to={pengurusLink.path} ref={pengurusRef} className={`${getPengurusClass()}`}>
                {pengurusLink.name}
              </Link>
            </motion.div>

            <button
              className={`md:hidden transition-colors duration-300 text-white relative z-[60] ml-4`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 md:hidden z-60"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {[...navLinks, pengurusLink].map((link) => (
                <motion.div
                  key={link.path}
                  variants={mobileMenuItemVariants}
                  onClick={handleNavLinkClick}
                >
                  <Link
                    to={link.path}
                    className={`text-2xl font-league uppercase transition-colors duration-200 ${
                      location.pathname === link.path ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {session && (
                <motion.div
                  variants={mobileMenuItemVariants}
                  onClick={handleNavLinkClick}
                >
                  <Link
                    to={dashboardLink.path}
                    className={`text-2xl font-league uppercase transition-colors duration-200 ${
                      location.pathname === dashboardLink.path ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"
                    }`}
                  >
                    {dashboardLink.name}
                  </Link>
                </motion.div>
              )}

              <motion.div
                variants={mobileMenuItemVariants}
                onClick={handleNavLinkClick}
              >
                {session ? (
                  <button
                    onClick={handleLogout}
                    className={`text-2xl font-league uppercase transition-colors duration-200 ${
                      location.pathname === '/' && !isPengurusActive && !isDashboardActive ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"
                    }`}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/signup"
                    className={`text-2xl font-league uppercase transition-colors duration-200 ${
                      location.pathname === '/signup' ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"
                    }`}
                  >
                    Login / Register
                  </Link>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-[9999]"
            variants={logoutOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="w-16 h-16 border-4 border-t-4 border-t-[#FF9F1C] border-white/20 rounded-full animate-spin"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            ></motion.div>
            <p className="mt-4 text-white text-lg font-medium">Sedang memproses logout...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logoutMessage && (
          <motion.div
            className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-lg z-[10000] backdrop-blur-md border ${
              logoutMessage.type === 'success'
                ? 'bg-white/10 border-white/30 text-white'
                : 'bg-red-900/20 border-red-500 text-red-300'
            }`}
            variants={messageBoxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              boxShadow: `
                0px 4px 15px rgba(0, 0, 0, 0.3),
                inset 1px 1px 3px rgba(255, 255, 255, 0.1),
                inset -1px -1px 3px rgba(0, 0, 0, 0.1)
                ${logoutMessage.type === 'success' ? ', 0 0 10px rgba(255, 159, 28, 0.3)' : ''}
              `,
            }}
          >
            {logoutMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}