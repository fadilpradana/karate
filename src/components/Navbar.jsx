import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react"; // Tambahkan useCallback
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Tambahkan AnimatePresence
import logo from "../assets/logo_bintangcompress.png";

const navLinks = [
  { name: "Beranda", path: "/" },
  { name: "Profil", path: "/profil" },
  { name: "Jadwal", path: "/jadwal" },
  { name: "Berita", path: "/berita" },
  { name: "Galeri", path: "/galeri" },
  { name: "Kontak", path: "/kontak" },
  { name: "Daftar", path: "/pendaftaran" },
];

const pengurusLink = { name: "Pengurus", path: "/pengurus" };

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [indicatorProps, setIndicatorProps] = useState({ left: 0, width: 0 });
  const leftRefs = useRef([]);
  const pengurusRef = useRef(null);
  const [runningTextBounds, setRunningTextBounds] = useState({ left: 0, right: 0 });
  const menuContainerRef = useRef(null);
  // const [initialMenuWidth, setInitialMenuWidth] = useState(0); // Ini tidak lagi diperlukan

  const isPengurusActive = location.pathname === pengurusLink.path;

  // Handler untuk menutup menu saat link diklik
  const handleNavLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Effect untuk mengunci/membuka scroll body
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'; // Kunci scroll
    } else {
      document.body.style.overflow = 'unset'; // Buka scroll
    }
    // Cleanup function untuk memastikan scroll terbuka saat komponen unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // Effect untuk mengupdate indikator aktif pada desktop
  useEffect(() => {
    const activeIndex = navLinks.findIndex((link) => link.path === location.pathname);
    if (!isPengurusActive && leftRefs.current?.[activeIndex]) {
      const el = leftRefs.current?.[activeIndex];
      const { offsetLeft, offsetWidth } = el;
      setIndicatorProps({ left: offsetLeft, width: offsetWidth });
    }
  }, [location.pathname, isPengurusActive]);

  // Effect untuk menghitung batas running text
  useEffect(() => {
    // const updateRunningTextBounds = () => { // Ini sudah ada, tidak perlu didefinisikan ulang
      const daftarIndex = navLinks.findIndex((link) => link.name === "Daftar");
      const daftarEl = leftRefs.current?.[daftarIndex];
      const pengurusEl = pengurusRef.current;

      if (daftarEl && pengurusEl && menuContainerRef.current) {
        const daftarRight = daftarEl.getBoundingClientRect().right;
        const pengurusLeft = pengurusEl.getBoundingClientRect().left;
        const navRect = document.querySelector('nav').getBoundingClientRect();

        const left = (daftarRight - navRect.left) + 5;
        const right = (pengurusLeft - navRect.left) - 40;

        setRunningTextBounds({ left, right });
      }
    // }; // Penutup yang tidak perlu

    const timer = setTimeout(() => { // Panggil fungsi update di dalam setTimeout
        const daftarIndex = navLinks.findIndex((link) => link.name === "Daftar");
        const daftarEl = leftRefs.current?.[daftarIndex];
        const pengurusEl = pengurusRef.current;

        if (daftarEl && pengurusEl && menuContainerRef.current) {
          const daftarRight = daftarEl.getBoundingClientRect().right;
          const pengurusLeft = pengurusEl.getBoundingClientRect().left;
          const navRect = document.querySelector('nav').getBoundingClientRect();

          const left = (daftarRight - navRect.left) + 5;
          const right = (pengurusLeft - navRect.left) - 40;

          setRunningTextBounds({ left, right });
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [leftRefs.current, pengurusRef.current]);

  const getPengurusClass = () => {
    const base = "hidden md:flex items-center px-3 py-1 text-xs font-medium rounded-md border transition-all duration-300";

    if (isPengurusActive) {
      return `${base} border-[#FF9F1C] bg-transparent text-white hover:text-[#FF9F1C] hover:border-[#FF9F1C]`;
    }

    return `${base} text-white border-white bg-transparent hover:text-[#FF9F1C] hover:border-[#FF9F1C]`;
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

  const pengurusVariants = {
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

  const runningTextVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 1.2,
        duration: 0.5,
        ease: "easeOut",
      }
    },
    animate: {
      x: ["100%", "-100%"],
      transition: {
        duration: 35,
        repeat: Infinity,
        ease: "linear",
      }
    }
  };

  // Varian untuk menu mobile
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

  return (
    <nav className="fixed top-2 left-2 w-full z-50 px-2 md:px-6">
      <div className="max-w-7xl mx-auto py-2 flex justify-between items-center relative">
        {/* Logo dan Menu Desktop */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo Karate" className="w-9 h-9 rounded-full" />
          <div className="hidden md:block overflow-hidden rounded-md">
            <motion.div
              ref={menuContainerRef}
              className="md:flex relative items-center gap-1 backdrop-blur-md bg-white/10 px-1 py-1 rounded-md shadow-sm"
              variants={mainContainerVariants}
              initial="hidden"
              animate="visible"
              style={{ minWidth: 'fit-content' }}
            >
              {!isPengurusActive && (
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

                const currentDelay = index === 0
                  ? 0.8 + 0.1
                  : (0.8 + 0.1) + (index * 0.1);

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
                      ref={(el) => (leftRefs.current ? (leftRefs.current[index] = el) : null)}
                      className={`relative z-10 px-2 py-1 text-xs font-medium transition-all duration-200 hover:text-[#FF9F1C] ${linkClasses}`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Running Text */}
        <div
          className="absolute top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none z-0"
          style={{
            left: `${runningTextBounds.left}px`,
            width: `${runningTextBounds.right - runningTextBounds.left}px`,
          }}
        >
          <motion.div
            className={`text-xs font-thin whitespace-nowrap text-white`}
            variants={runningTextVariants}
            initial="hidden"
            animate={["visible", "animate"]}
          >
            {"Selamatkan darah di dunia nyata dengan keringat di dalam Dojo! - Dōjō no ase ga, genjitsu no chi o sukū!"}
          </motion.div>
        </div>

        {/* Link Pengurus (Desktop) */}
        <motion.div
          variants={pengurusVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to={pengurusLink.path} ref={pengurusRef} className={`${getPengurusClass()} mr-4`}>
            {pengurusLink.name}
          </Link>
        </motion.div>

        {/* Tombol Hamburger (Mobile) */}
        <button
          className={`md:hidden transition-colors duration-300 text-white`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 md:hidden z-40"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navLinks.map((link) => (
              <motion.div
                key={link.path}
                variants={mobileMenuItemVariants}
                onClick={handleNavLinkClick} // Tutup menu saat link diklik
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
            <motion.div
              variants={mobileMenuItemVariants}
              onClick={handleNavLinkClick} // Tutup menu saat link diklik
            >
              <Link
                to={pengurusLink.path}
                className={`text-2xl font-league uppercase transition-colors duration-200 ${
                  location.pathname === pengurusLink.path ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"
                }`}
              >
                {pengurusLink.name}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}