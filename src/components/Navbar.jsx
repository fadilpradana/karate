import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const menuContainerRef = useRef(null); // Ref for the desktop menu container

  const isPengurusActive = location.pathname === pengurusLink.path;

  // Handler to close the menu when a link is clicked
  const handleNavLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Effect to lock/unlock body scroll
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = 'unset'; // Unlock scroll
    }
    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // Effect to update the active indicator on desktop
  useEffect(() => {
    const activeIndex = navLinks.findIndex((link) => link.path === location.pathname);
    // Ensure the corresponding ref exists before accessing its properties
    if (!isPengurusActive && leftRefs.current[activeIndex]) {
      const el = leftRefs.current[activeIndex];
      const { offsetLeft, offsetWidth } = el;
      setIndicatorProps({ left: offsetLeft, width: offsetWidth });
    }
  }, [location.pathname, isPengurusActive]);

  // Effect to calculate running text boundaries
  useEffect(() => {
    const updateRunningTextBounds = () => {
      const daftarIndex = navLinks.findIndex((link) => link.name === "Daftar");
      const daftarEl = leftRefs.current[daftarIndex];
      const pengurusEl = pengurusRef.current;
      const navElement = menuContainerRef.current; // Use menuContainerRef for nav boundaries

      if (daftarEl && pengurusEl && navElement) {
        const daftarRect = daftarEl.getBoundingClientRect();
        const pengurusRect = pengurusEl.getBoundingClientRect();
        const navRect = navElement.getBoundingClientRect();

        // Calculate position relative to the nav container
        const left = (daftarRect.right - navRect.left) + 5;
        const right = (pengurusRect.left - navRect.left) - 40;

        setRunningTextBounds({ left, right });
      }
    };

    // Call on mount and after the first render (with a slight delay to ensure refs are populated)
    const timer = setTimeout(updateRunningTextBounds, 100);
    window.addEventListener('resize', updateRunningTextBounds); // Update on resize

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRunningTextBounds);
    };
  }, [location.pathname]); // Add location.pathname as a dependency to update on navigation


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

  // Variants for mobile menu
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
      <div className="max-w-7xl mx-auto py-2 flex justify-between items-center relative md:px-0">
        {/* Left Block: Logo and Desktop Menu */}
        <div className="flex items-center pl-1 md:pl-0 md:space-x-2">
          {/* Logo with `flex-none` to prevent squishing */}
          <Link to="/">
            <img
              src={logo}
              alt="Logo Karate"
              className="w-9 h-9 rounded-full md:ml-0 flex-none object-contain flex-shrink-0 hover:opacity-90 transition duration-200"
            />
          </Link>
          {/* Fix: Removed duplicate div here */}
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
                      ref={(el) => { if (el) leftRefs.current[index] = el; }}
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

        {/* Running Text - Add 'hidden' class to hide on mobile */}
        <div
          className="absolute top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none z-0 hidden md:block"
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

        {/* Right Block: Pengurus Link (Desktop) and Hamburger Button (Mobile) */}
        <div className="flex items-center pr-4 md:pr-0">
          {/* Pengurus Link (Desktop) */}
          <motion.div
            variants={pengurusVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to={pengurusLink.path} ref={pengurusRef} className={`${getPengurusClass()} mr-4`}>
              {pengurusLink.name}
            </Link>
          </motion.div>

          {/* Hamburger Button (Mobile) - Z-index increased to always be visible */}
          <button
            className={`md:hidden transition-colors duration-300 text-white relative z-[60]`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 md:hidden z-60"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navLinks.map((link) => (
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
            <motion.div
              variants={mobileMenuItemVariants}
              onClick={handleNavLinkClick}
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