import { motion, AnimatePresence } from "framer-motion"; // PERBAIKAN: AnimatePresence ditambahkan
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Menu, X, CheckCircle, AlertTriangle, LoaderCircle } from "lucide-react";
import logo from "../assets/logo_bintangcompress.png";
import { useAuth } from '../context/AuthContext';

const staticNavLinks = [
    { name: "Beranda", path: "/" },
    { name: "Profil", path: "/profil" },
    { name: "Jadwal", path: "/jadwal" },
    { name: "Artikel", path: "/artikel" },
    { name: "Kontak", path: "/kontak" },
    { name: "Daftar", path: "/pendaftaran" },
];
const pengurusLink = { name: "Pengurus", path: "/pengurus" };
const loginLink = { name: "Login / Register", path: "/signup" };
const dashboardLink = { name: "Dashboard", path: "/dashboard" };

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { session, signOut } = useAuth();
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [indicatorProps, setIndicatorProps] = useState({ left: 0, width: 0 });
    const navLinksRefs = useRef([]);
    const pengurusRef = useRef(null);
    const navInnerContainerRef = useRef(null);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutFeedback, setLogoutFeedback] = useState({ message: '', type: null });

    const allMainLinks = useMemo(() => (
        session 
            ? staticNavLinks
            : [...staticNavLinks, loginLink]
    ), [session]);

    const handleNavLinkClick = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            setLogoutFeedback({ message: 'Logout berhasil!', type: 'success' });
            setMenuOpen(false); // Menutup menu mobile setelah logout berhasil
            navigate('/login');
        } catch (error) {
            setLogoutFeedback({ message: 'Logout gagal, coba lagi.', type: 'error' });
        } finally {
            setIsLoggingOut(false);
            setTimeout(() => {
                setLogoutFeedback({ message: '', type: null });
            }, 3000);
        }
    };

    useEffect(() => {
        if (menuOpen) { document.body.style.overflow = 'hidden'; } 
        else { document.body.style.overflow = 'unset'; }
        return () => { document.body.style.overflow = 'unset'; };
    }, [menuOpen]);

    useEffect(() => {
        if (location.pathname === loginLink.path || location.pathname === '/login') {
            setIndicatorProps({ left: 0, width: 0 });
            return;
        }
        const activeLinkIndex = allMainLinks.findIndex(link => location.pathname === link.path);
        let targetEl = null;
        if (activeLinkIndex !== -1) {
            targetEl = navLinksRefs.current[activeLinkIndex];
        } else if (location.pathname === pengurusLink.path) {
            targetEl = pengurusRef.current;
        }
        if (targetEl) {
            const { offsetLeft, offsetWidth } = targetEl;
            setIndicatorProps({ left: offsetLeft, width: offsetWidth });
        } else {
            setIndicatorProps({ left: 0, width: 0 });
        }
    }, [location.pathname, allMainLinks]);

    const baseRightNavLinkClass = "hidden md:flex items-center px-3 py-1 text-xs font-medium rounded-md border transition-all duration-300";
    const getPengurusClass = () => location.pathname === pengurusLink.path ? `${baseRightNavLinkClass} border-[#FF9F1C] bg-transparent text-white hover:text-[#FF9F1C] hover:border-[#FF9F1C]` : `${baseRightNavLinkClass} text-white border-white bg-transparent hover:text-[#FF9F1C] hover:border-[#FF9F1C]`;
    const mainContainerVariants = { hidden: { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, visible: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2, when: "beforeChildren", staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };
    const pengurusLinkVariants = { hidden: { opacity: 0, scale: 0 }, visible: { opacity: [0, 1, 1], scale: [0.8, 1.05, 1], transition: { duration: 0.6, ease: "easeOut", delay: 0.8, times: [0, 0.5, 1] } } };
    const mobileMenuVariants = { hidden: { x: "100%" }, visible: { x: "0%", transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.05, delayChildren: 0.1 } }, exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } } };
    const mobileMenuItemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
    const glassFrameStyle = { backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: `0px 1px 3px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.11), inset -1px -1px 2px rgba(0, 0, 0, 0.1)` };

    return (
        <>
            <nav className="fixed top-2 left-2 w-full z-50 px-2 md:px-6">
                <div ref={navInnerContainerRef} className="max-w-7xl mx-auto py-2 flex justify-between items-center relative md:px-0">
                    <div className="flex items-center pl-1 md:pl-0 md:space-x-2">
                        <Link to="/" className="relative z-10 flex-none"><img src={logo} alt="Logo Karate" className="w-9 h-9 rounded-full object-contain flex-shrink-0 hover:opacity-90 transition duration-200" /></Link>
                        <div className="flex flex-col ml-1 md:hidden"><span className="leading-none font-[Montserrat] font-thin" style={{ fontSize: '0.5rem', letterSpacing: '0.05em' }}>KARATE</span><span className="leading-none ml-[0.03rem] font-[Montserrat] font-thin" style={{ fontSize: '0.35rem', letterSpacing: '0.6em' }}>STMKG</span></div>
                        <div className="hidden md:block rounded-md">
                            <motion.div className="md:flex relative items-center gap-1 backdrop-blur-md bg-white/10 px-1 py-1 rounded-md shadow-sm" variants={mainContainerVariants} initial="hidden" animate="visible">
                                {indicatorProps.width > 0 && (<motion.div className="absolute top-1 bottom-1 rounded-md z-0" animate={{ left: indicatorProps.left, width: indicatorProps.width }} transition={{ duration: 0.3, ease: "easeInOut" }} style={glassFrameStyle} />)}
                                {staticNavLinks.map((link, index) => (<motion.div key={link.path} variants={itemVariants}><Link to={link.path} ref={(el) => (navLinksRefs.current[index] = el)} className={`relative z-10 px-2 py-1 text-xs font-medium transition-all duration-200 hover:text-[#FF9F1C] ${location.pathname === link.path ? "text-[#FF9F1C] font-semibold" : "text-white"}`}>{link.name}</Link></motion.div>))}
                                {session ? (
                                <motion.div variants={itemVariants}>
                                    <button onClick={handleLogout} className={`relative z-10 px-4 py-1.5 text-xs rounded-md border border-white/60 bg-black/20 text-white/90 hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300`}>
                                        Logout
                                    </button>
                                </motion.div>) 
                                : 
                                (<motion.div variants={itemVariants}>
                                    <Link to={loginLink.path} ref={(el) => (navLinksRefs.current[staticNavLinks.length] = el)} className={`relative z-10 px-4 py-1.5 text-xs rounded-md border border-white/60 hover:bg-white/10 hover:border-white transition-all duration-300 ${(location.pathname === loginLink.path || location.pathname === '/login') ? 'bg-white/10 text-[#FF9F1C]' : 'text-white/90'}`}>
                                        {loginLink.name}
                                    </Link>
                                </motion.div>)}
                            </motion.div>
                        </div>
                    </div>
                    <div className="flex items-center pr-4 md:pr-0 space-x-2">
                        {session && (
                            <motion.div variants={pengurusLinkVariants} initial="hidden" animate="visible">
                                <Link to={dashboardLink.path} className={`${baseRightNavLinkClass} border-transparent relative`}>
                                    <div className="absolute -inset-px rounded-md" style={glassFrameStyle} />
                                    <span className={`relative z-10 hover:text-green-300 transition-colors ${location.pathname === dashboardLink.path ? 'text-green-300' : 'text-white'}`}>{dashboardLink.name}</span>
                                </Link>
                            </motion.div>
                        )}
                        <motion.div variants={pengurusLinkVariants} initial="hidden" animate="visible">
                            <Link to={pengurusLink.path} ref={pengurusRef} className={`${getPengurusClass()}`}>{pengurusLink.name}</Link>
                        </motion.div>
                        <button className={`md:hidden transition-colors duration-300 text-white relative z-[60] ml-4`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 md:hidden z-50" variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit">
                        {allMainLinks.map((link) => (<motion.div key={`mobile-${link.path}`} variants={mobileMenuItemVariants} onClick={handleNavLinkClick}><Link to={link.path} className={`text-2xl font-league uppercase transition-colors duration-200 ${location.pathname === link.path ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"}`}>{link.name}</Link></motion.div>))}
                        <motion.div key="mobile-pengurus" variants={mobileMenuItemVariants} onClick={handleNavLinkClick}><Link to={pengurusLink.path} className={`text-2xl font-league uppercase transition-colors duration-200 ${location.pathname === pengurusLink.path ? "text-[#FF9F1C]" : "text-white hover:text-[#FF9F1C]"}`}>{pengurusLink.name}</Link></motion.div>
                        {session && ( <> 
                            <motion.div variants={mobileMenuItemVariants} onClick={handleNavLinkClick}>
                                <Link to={dashboardLink.path} className="text-2xl font-league uppercase text-white hover:text-[#FF9F1C] transition-colors">
                                    {dashboardLink.name}
                                </Link>
                            </motion.div> 
                            <motion.div variants={mobileMenuItemVariants}>
                                <button onClick={handleLogout} className="text-2xl font-league uppercase text-white hover:text-red-400 transition-colors">Logout</button>
                            </motion.div> 
                        </> )}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]">
                        <motion.div animate={{ rotate: 360 }} transition={{ loop: Infinity, duration: 1, ease: "linear" }}><LoaderCircle className="w-12 h-12 text-white" /></motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {logoutFeedback.type && (
                    <motion.div
                        initial={{ opacity: 0, y: -100, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-4 rounded-lg border"
                        style={{ ...glassFrameStyle, borderColor: logoutFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)', }}
                    >
                        {logoutFeedback.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}
                        <p className="text-white">{logoutFeedback.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}