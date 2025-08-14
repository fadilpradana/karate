import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoaderCircle, User, Award, ClipboardEdit, Save, ChevronLeft, Lock, ChevronDown, Pencil, XCircle, BookOpen, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import heroBg from '../assets/bg9.jpg';
import favicon from '../assets/logo_bintangcompress.png';

// Gaya untuk efek glassmorphism
const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`,
    borderRadius: '0.8rem',
};

// Komponen Modal Notifikasi
const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;
    const icons = { success: <CheckCircle size={40} className="text-green-400" />, error: <XCircle size={40} className="text-red-400" />, warning: <AlertTriangle size={40} className="text-amber-400" />, };
    const iconBgColors = { success: 'bg-green-500/20', error: 'bg-red-500/20', warning: 'bg-amber-500/20', };
    const iconBorderColors = { success: 'border-green-500/50', error: 'border-red-500/50', warning: 'border-amber-500/50', };
    const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }, exit: { opacity: 0, scale: 0.8 } };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial="hidden" animate="visible" exit="exit" variants={overlayVariants} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                    <motion.div variants={modalVariants} className="relative p-6 text-center text-white max-w-md w-full" style={glassmorphismStyle} onClick={(e) => e.stopPropagation()} >
                        <div className="flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 border ${iconBgColors[type]} ${iconBorderColors[type]}`}>{icons[type]}</div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <p className="text-gray-300 mb-6">{message}</p>
                            <button onClick={onClose} style={{...glassmorphismStyle, backgroundColor: 'rgba(255, 255, 255, 0.1)'}} className="w-full py-2.5 px-4 rounded-lg font-semibold text-white hover:bg-white/20 transition-colors">Tutup</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Komponen Accordion
const AccordionSection = ({ title, icon, isOpen, onToggle, children }) => {
    return (
        <motion.div initial={false} className="p-6" style={glassmorphismStyle}>
            <motion.header initial={false} onClick={onToggle} className="flex justify-between items-center cursor-pointer">
                <h2 className="text-2xl font-semibold flex items-center gap-3">{icon}{title}</h2>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}> <ChevronDown size={24} /> </motion.div>
            </motion.header>
            <AnimatePresence initial={false}>
                {isOpen && ( <motion.section key="content" initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: 'auto', marginTop: '1rem' }, collapsed: { opacity: 0, height: 0, marginTop: '0rem' }, }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">{children}</motion.section> )}
            </AnimatePresence>
        </motion.div>
    );
};

// Helper & Kalkulasi Nilai
const BEEP_TEST_SHUTTLE_MAP = { 1: 7, 2: 15, 3: 23, 4: 32, 5: 41, 6: 51, 7: 61, 8: 72, 9: 83, 10: 94, 11: 106, 12: 117, 13: 129, 14: 141, 15: 153, 16: 165 };
const BEEP_LEVEL_MAX_SHUTTLE = { 1: 7, 2: 8, 3: 8, 4: 9, 5: 9, 6: 10, 7: 10, 8: 11, 9: 11, 10: 12, 11: 12, 12: 13, 13: 13, 14: 14, 15: 14, 16: 15 };
const calculateTotalShuttles = (level, shuttle) => { if (!level || level < 1) return 0; const baseShuttles = level > 1 ? BEEP_TEST_SHUTTLE_MAP[level - 1] || 0 : 0; return baseShuttles + (shuttle || 0); };
const STANDARDS = { 'lakilaki': { beepShuttles: calculateTotalShuttles(9, 1), pushUp: 42, sitUp: 40, plankSeconds: 180 }, 'perempuan': { beepShuttles: calculateTotalShuttles(7, 1), pushUp: 37, sitUp: 50, plankSeconds: 120 } };
const calculateScore = (value, target) => { if (!value || !target || value <= 0 || target <= 0) return 0; const score = (value / target) * 100; return Math.min(Math.round(score), 100); };
const ScoreDisplay = ({ label, value }) => ( <div className="text-sm mt-1"> <span className="font-semibold text-gray-300">{label}: </span> <span className="font-bold text-amber-400">{value}</span> <span className="text-gray-400"> / 100</span> </div> );


export default function PenilaianPendaftar() {
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [daftarPeriode, setDaftarPeriode] = useState([]);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [pendaftarList, setPendaftarList] = useState([]);
    const [selectedPendaftarId, setSelectedPendaftarId] = useState('');
    const [selectedPendaftar, setSelectedPendaftar] = useState(null);

    const [existingJasmaniScores, setExistingJasmaniScores] = useState([]);
    const [jasmaniInput, setJasmaniInput] = useState({ beep_level: '', beep_shuttle: '', push_up: '', sit_up: '', plank_minutes: '', plank_seconds: '' });
    
    const [materiInput, setMateriInput] = useState({ nilai: '', keterangan: '' });
    const [wawancaraInput, setWawancaraInput] = useState({ nilai: '', keterangan: '' });

    const [existingWawancara, setExistingWawancara] = useState([]);
    const [existingMateri, setExistingMateri] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [currentUserMateri, setCurrentUserMateri] = useState(null);
    const [isMateriFormActive, setIsMateriFormActive] = useState(false);
    const [currentUserWawancara, setCurrentUserWawancara] = useState(null);
    const [isWawancaraFormActive, setIsWawancaraFormActive] = useState(false);

    const [openSection, setOpenSection] = useState('jasmani');
    const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        const fetchPeriode = async () => {
            const { data, error } = await supabase.from('periode_pendaftaran').select('id, nama_periode').order('dibuat_pada', { ascending: false });
            if (error) throw error;
            setDaftarPeriode(data);
            if (data.length > 0) setSelectedPeriodeId(data[0].id);
        };
        if (role === 'admin' || role === 'pengurus') {
            fetchPeriode().catch(err => setError(err.message));
        }
    }, [role]);

    useEffect(() => {
        if (!selectedPeriodeId) return;
        const fetchPendaftar = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('data_pendaftar').select('id, profiles:id_pengguna (nama_lengkap, npt, jenis_kelamin)').eq('id_periode', selectedPeriodeId);
            if (error) { setError(error.message); } else {
                setPendaftarList(data);
                setSelectedPendaftarId('');
                setSelectedPendaftar(null);
                setExistingWawancara([]);
                setExistingMateri([]);
                setExistingJasmaniScores([]);
            }
            setLoading(false);
        };
        fetchPendaftar();
    }, [selectedPeriodeId]);

    const fetchDetails = useCallback(async (pendaftarId) => {
        if (!pendaftarId) return;
        setLoading(true);
        setError(null);
        setExistingJasmaniScores([]);
        setJasmaniInput({ beep_level: '', beep_shuttle: '', push_up: '', sit_up: '', plank_minutes: '', plank_seconds: '' });
        
        setCurrentUserMateri(null);
        setIsMateriFormActive(false);
        setCurrentUserWawancara(null);
        setIsWawancaraFormActive(false);
        
        const pendaftarData = pendaftarList.find(p => p.id === parseInt(pendaftarId));
        setSelectedPendaftar(pendaftarData);

        try {
            const { data: jasmaniData, error: jasmaniError } = await supabase
                .from('penilaian_jasmani_individu')
                .select('*, penilai:id_penilai (id, nama_lengkap)')
                .eq('id_pendaftar', pendaftarId);

            if (jasmaniError) throw jasmaniError;
            
            if (jasmaniData) {
                setExistingJasmaniScores(jasmaniData);
                const pushUp = jasmaniData.find(d => d.jenis_tes === 'push_up')?.nilai || '';
                const sitUp = jasmaniData.find(d => d.jenis_tes === 'sit_up')?.nilai || '';
                const beepTest = jasmaniData.find(d => d.jenis_tes === 'beep_test');
                const plank = jasmaniData.find(d => d.jenis_tes === 'plank');
                
                const beepLevel = beepTest?.nilai || '';
                const beepShuttle = beepTest?.keterangan || ''; 
                
                const plankSecondsTotal = plank?.nilai || 0;
                const plankMinutes = Math.floor(plankSecondsTotal / 60) || '';
                const plankSeconds = plankSecondsTotal % 60 || '';

                setJasmaniInput({ push_up: pushUp, sit_up: sitUp, beep_level: beepLevel, beep_shuttle: beepShuttle, plank_minutes: plankMinutes, plank_seconds: plankSeconds });
            }

            const { data: materiData, error: materiError } = await supabase.from('penilaian_materi').select('*, penilai:id_penilai(nama_lengkap)').eq('id_pendaftar', pendaftarId);
            if (materiError) throw materiError;
            setExistingMateri(materiData || []);
            const userMateri = materiData.find(p => p.id_penilai === user.id);
            if (userMateri) {
                setCurrentUserMateri(userMateri);
                setMateriInput({ nilai: userMateri.nilai || '', keterangan: userMateri.keterangan || '' });
                setIsMateriFormActive(false);
            } else {
                setMateriInput({ nilai: '', keterangan: '' });
                setIsMateriFormActive(true);
            }

            const { data: wawancaraData, error: wawancaraError } = await supabase.from('penilaian_wawancara').select('*, penilai:id_penilai(nama_lengkap)').eq('id_pendaftar', pendaftarId);
            if (wawancaraError) throw wawancaraError;
            setExistingWawancara(wawancaraData || []);
            const userWawancara = wawancaraData.find(p => p.id_penilai === user.id);
            if (userWawancara) {
                setCurrentUserWawancara(userWawancara);
                setWawancaraInput({ nilai: userWawancara.nilai || '', keterangan: userWawancara.keterangan || '' });
                setIsWawancaraFormActive(false);
            } else {
                setWawancaraInput({ nilai: '', keterangan: '' });
                setIsWawancaraFormActive(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pendaftarList, user]);

    useEffect(() => {
        if (selectedPendaftarId) { fetchDetails(selectedPendaftarId); }
        else { setSelectedPendaftar(null); setExistingMateri([]); setExistingWawancara([]); setExistingJasmaniScores([]); }
    }, [selectedPendaftarId, fetchDetails]);

    const isJasmaniDirty = useMemo(() => {
        const originalPushUp = existingJasmaniScores.find(d => d.jenis_tes === 'push_up')?.nilai || '';
        const originalSitUp = existingJasmaniScores.find(d => d.jenis_tes === 'sit_up')?.nilai || '';
        const originalBeepTest = existingJasmaniScores.find(d => d.jenis_tes === 'beep_test');
        const originalPlank = existingJasmaniScores.find(d => d.jenis_tes === 'plank');

        const originalBeepLevel = originalBeepTest?.nilai || '';
        const originalBeepShuttle = originalBeepTest?.keterangan || '';
        const originalPlankSecondsTotal = originalPlank?.nilai || 0;
        const originalPlankMinutes = Math.floor(originalPlankSecondsTotal / 60) || '';
        const originalPlankSeconds = originalPlankSecondsTotal % 60 || '';
        
        return (
            String(jasmaniInput.push_up) !== String(originalPushUp) ||
            String(jasmaniInput.sit_up) !== String(originalSitUp) ||
            String(jasmaniInput.beep_level) !== String(originalBeepLevel) ||
            String(jasmaniInput.beep_shuttle) !== String(originalBeepShuttle) ||
            String(jasmaniInput.plank_minutes) !== String(originalPlankMinutes) ||
            String(jasmaniInput.plank_seconds) !== String(originalPlankSeconds)
        );
    }, [jasmaniInput, existingJasmaniScores]);

    const isMateriDirty = useMemo(() => { if (!isMateriFormActive) return false; if (!currentUserMateri) return materiInput.nilai !== '' || materiInput.keterangan !== ''; return (String(materiInput.nilai) !== String(currentUserMateri.nilai || '') || materiInput.keterangan !== (currentUserMateri.keterangan || '')); }, [materiInput, currentUserMateri, isMateriFormActive]);
    const isWawancaraDirty = useMemo(() => { if (!isWawancaraFormActive) return false; if (!currentUserWawancara) return wawancaraInput.nilai !== '' || wawancaraInput.keterangan !== ''; return (String(wawancaraInput.nilai) !== String(currentUserWawancara.nilai || '') || wawancaraInput.keterangan !== (currentUserWawancara.keterangan || '')); }, [wawancaraInput, currentUserWawancara, isWawancaraFormActive]);
    
    const hasUnsavedChanges = isJasmaniDirty || (isMateriFormActive && isMateriDirty) || (isWawancaraFormActive && isWawancaraDirty);

    const calculatedScores = useMemo(() => {
        if (!selectedPendaftar?.profiles?.jenis_kelamin) return {};
        const standard = STANDARDS[selectedPendaftar.profiles.jenis_kelamin];
        if (!standard) return {};
        const totalShuttles = calculateTotalShuttles(parseInt(jasmaniInput.beep_level), parseInt(jasmaniInput.beep_shuttle));
        const plankTotalSeconds = (parseInt(jasmaniInput.plank_minutes || 0) * 60) + parseInt(jasmaniInput.plank_seconds || 0);
        const beepScore = calculateScore(totalShuttles, standard.beepShuttles);
        const pushUpScore = calculateScore(parseInt(jasmaniInput.push_up), standard.pushUp);
        const sitUpScore = calculateScore(parseInt(jasmaniInput.sit_up), standard.sitUp);
        const plankScore = calculateScore(plankTotalSeconds, standard.plankSeconds);
        const avgJasmani = Math.round((beepScore + pushUpScore + sitUpScore + plankScore) / 4);
        return { beepScore, pushUpScore, sitUpScore, plankScore, avgJasmani };
    }, [jasmaniInput, selectedPendaftar]);

    const finalScores = useMemo(() => {
        if (!selectedPendaftar?.profiles?.jenis_kelamin) return { jasmani: 0, materi: 0, wawancara: 0 };
        const standard = STANDARDS[selectedPendaftar.profiles.jenis_kelamin];
        if (!standard) return { jasmani: 0, materi: 0, wawancara: 0 };

        let jasmaniFinalScore = 0;
        if (existingJasmaniScores.length > 0) {
            const beepTest = existingJasmaniScores.find(d => d.jenis_tes === 'beep_test');
            const pushUp = existingJasmaniScores.find(d => d.jenis_tes === 'push_up');
            const sitUp = existingJasmaniScores.find(d => d.jenis_tes === 'sit_up');
            const plank = existingJasmaniScores.find(d => d.jenis_tes === 'plank');
            const totalShuttles = calculateTotalShuttles(Number(beepTest?.nilai), Number(beepTest?.keterangan));
            const beepScore = calculateScore(totalShuttles, standard.beepShuttles);
            const pushUpScore = calculateScore(Number(pushUp?.nilai), standard.pushUp);
            const sitUpScore = calculateScore(Number(sitUp?.nilai), standard.sitUp);
            const plankScore = calculateScore(Number(plank?.nilai), standard.plankSeconds);
            jasmaniFinalScore = Math.round((beepScore + pushUpScore + sitUpScore + plankScore) / 4);
        }
        const calculateAverage = (assessments) => {
            const validAssessments = assessments.filter(p => p.nilai > 0);
            if (validAssessments.length === 0) return 0;
            const total = validAssessments.reduce((sum, p) => sum + (Number(p.nilai) || 0), 0);
            return Math.round(total / validAssessments.length);
        };
        return { jasmani: jasmaniFinalScore, materi: calculateAverage(existingMateri), wawancara: calculateAverage(existingWawancara) };
    }, [existingMateri, existingWawancara, existingJasmaniScores, selectedPendaftar]);

    const handleCancelMateriEdit = () => { setIsMateriFormActive(false); if (currentUserMateri) { setMateriInput({ nilai: currentUserMateri.nilai || '', keterangan: currentUserMateri.keterangan || '' }); } };
    const handleCancelWawancaraEdit = () => { setIsWawancaraFormActive(false); if (currentUserWawancara) { setWawancaraInput({ nilai: currentUserWawancara.nilai || '', keterangan: currentUserWawancara.keterangan || '' }); } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPendaftarId || !user) {
            setNotification({ isOpen: true, type: 'warning', title: 'Peringatan', message: 'Silakan pilih pendaftar terlebih dahulu.' });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const submissionPromises = [];
            if (isJasmaniDirty) {
                const tests = ['push_up', 'sit_up', 'plank', 'beep_test'];
                for (const test of tests) {
                    const originalData = existingJasmaniScores.find(d => d.jenis_tes === test);
                    let hasChanged = false;
                    let payload = {};

                    if (test === 'plank') {
                        const newPlankSeconds = (parseInt(jasmaniInput.plank_minutes || 0) * 60) + parseInt(jasmaniInput.plank_seconds || 0);
                        if (newPlankSeconds !== (originalData?.nilai || 0)) { hasChanged = true; payload = { nilai: newPlankSeconds }; }
                    } else if (test === 'beep_test') {
                        const newLevel = parseInt(jasmaniInput.beep_level) || null;
                        const newShuttle = jasmaniInput.beep_shuttle || null;
                        if (newLevel !== (originalData?.nilai || null) || String(newShuttle) !== String(originalData?.keterangan || null)) { hasChanged = true; payload = { nilai: newLevel, keterangan: newShuttle }; }
                    } else {
                        const newValue = parseInt(jasmaniInput[test]) || null;
                        if (newValue !== (originalData?.nilai || null)) { hasChanged = true; payload = { nilai: newValue }; }
                    }

                    if (hasChanged) {
                        const submission = supabase.from('penilaian_jasmani_individu').upsert({ id_pendaftar: selectedPendaftarId, jenis_tes: test, id_penilai: user.id, ...payload }, { onConflict: 'id_pendaftar, jenis_tes' });
                        submissionPromises.push(submission);
                    }
                }
            }

            if (isMateriFormActive && isMateriDirty && materiInput.nilai && parseInt(materiInput.nilai, 10) > 0) {
                const submission = supabase.from('penilaian_materi').upsert({ id_pendaftar: selectedPendaftarId, id_penilai: user.id, nilai: parseInt(materiInput.nilai), keterangan: materiInput.keterangan }, { onConflict: 'id_pendaftar, id_penilai' });
                submissionPromises.push(submission);
            }
            if (isWawancaraFormActive && isWawancaraDirty && wawancaraInput.nilai && parseInt(wawancaraInput.nilai, 10) > 0) {
                const submission = supabase.from('penilaian_wawancara').upsert({ id_pendaftar: selectedPendaftarId, id_penilai: user.id, nilai: parseInt(wawancaraInput.nilai), keterangan: wawancaraInput.keterangan }, { onConflict: 'id_pendaftar, id_penilai' });
                submissionPromises.push(submission);
            }

            if (submissionPromises.length === 0) {
                setNotification({ isOpen: true, type: 'warning', title: 'Tidak Ada Perubahan', message: 'Tidak ada data baru atau perubahan yang perlu disimpan.' });
                setIsSubmitting(false);
                return;
            }

            const results = await Promise.all(submissionPromises);
            const aSubmissionFailed = results.some(res => res.error);
            if (aSubmissionFailed) { const firstError = results.find(res => res.error).error; throw firstError; }
            
            setNotification({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Penilaian Anda telah berhasil disimpan atau diperbarui.' });
            await fetchDetails(selectedPendaftarId);

        } catch (error) {
            console.error("Error submitting assessment:", error);
            setNotification({ isOpen: true, type: 'error', title: 'Gagal Menyimpan', message: `Terjadi kesalahan: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isButtonDisabled = isSubmitting || !hasUnsavedChanges;
    if (authLoading) return <div className="relative z-10 flex h-screen justify-center items-center"><LoaderCircle className="animate-spin h-10 w-10 text-amber-400" /></div>;
    
    const getTestProps = (testName) => {
        const data = existingJasmaniScores.find(s => s.jenis_tes === testName);
        return { data, canEdit: !data || data.id_penilai === user.id };
    };

    return (
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Penilaian Pendaftaran - STMKG Karate Club</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
            </Helmet>
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}><div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24">
                    {(role === 'admin' || role === 'pengurus') && (
                        <>
                            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                                <nav className="flex space-x-4 justify-center">
                                    <Link to="/data-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Data Pendaftar"><ChevronLeft size={20} /></Link>
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Manajemen Pengurus"><Users size={20} /></Link>
                                </nav>
                            </motion.div>
                            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="fixed left-4 top-1/2 -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                                <nav className="space-y-3">
                                    <Link to="/data-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Data Pendaftar"><ChevronLeft size={20} /></Link>
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Manajemen Pengurus"><Users size={20} /></Link>
                                </nav>
                            </motion.div>
                        </>
                    )}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto w-full">
                        <div className="text-center md:text-left mb-8">
                            <h1 className="text-4xl md:text-5xl font-league uppercase text-accent drop-shadow-lg">Penilaian Pendaftar</h1>
                        </div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 mb-8" style={glassmorphismStyle}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div> <label htmlFor="periode-select" className="block text-sm font-medium text-gray-300 mb-2">Pilih Periode</label> <select id="periode-select" value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} className="w-full bg-transparent p-2.5 pr-8 text-white focus:outline-none appearance-none cursor-pointer border border-gray-600 rounded-lg"> <option value="" disabled className="bg-gray-800">-- Pilih Periode --</option> {daftarPeriode.map(p => <option key={p.id} value={p.id} className="bg-gray-800">{p.nama_periode}</option>)} </select> </div>
                                <div> <label htmlFor="pendaftar-select" className="block text-sm font-medium text-gray-300 mb-2">Pilih Pendaftar</label> <select id="pendaftar-select" value={selectedPendaftarId} onChange={(e) => setSelectedPendaftarId(e.target.value)} disabled={!selectedPeriodeId || loading} className="w-full bg-transparent p-2.5 pr-8 text-white focus:outline-none appearance-none cursor-pointer border border-gray-600 rounded-lg disabled:opacity-50"> <option value="" disabled className="bg-gray-800">-- Pilih Pendaftar --</option> {pendaftarList.map(p => <option key={p.id} value={p.id} className="bg-gray-800">{p.profiles?.nama_lengkap || `Pendaftar ID ${p.id}`} ({p.profiles?.npt || 'N/A'})</option>)} </select> </div>
                            </div>
                        </motion.div>

                        {loading && !selectedPendaftarId && <div className="flex justify-center items-center py-8"><LoaderCircle className="animate-spin h-8 w-8 text-amber-400" /></div>}
                        {error && <p className="text-center text-red-400">{error}</p>}
                        
                        {selectedPendaftar && selectedPendaftar.profiles && (
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col lg:flex-row lg:gap-8">
                                    <div className="lg:w-2/5 space-y-8 order-2 lg:order-1 mt-8 lg:mt-0">
                                        <AccordionSection title="Penilaian Jasmani" icon={<Award className="text-amber-400" />} isOpen={openSection === 'jasmani'} onToggle={() => setOpenSection(openSection === 'jasmani' ? null : 'jasmani')}>
                                            <div className="space-y-4 pt-4 border-t border-gray-700/50">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300">Beep Test</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input type="number" placeholder="Level" disabled={!getTestProps('beep_test').canEdit} value={jasmaniInput.beep_level} onChange={e => { const newLevel = e.target.value; const currentShuttle = parseInt(jasmaniInput.beep_shuttle, 10); const maxShuttle = BEEP_LEVEL_MAX_SHUTTLE[newLevel]; if (maxShuttle && currentShuttle > maxShuttle) { setJasmaniInput({ ...jasmaniInput, beep_level: newLevel, beep_shuttle: maxShuttle.toString() }); } else { setJasmaniInput({ ...jasmaniInput, beep_level: newLevel }); } }} className="w-full bg-white/10 p-2 rounded-md text-center disabled:opacity-60 disabled:cursor-not-allowed" />
                                                        <input type="number" placeholder="Shuttle" disabled={!getTestProps('beep_test').canEdit} value={jasmaniInput.beep_shuttle} onChange={e => { const newShuttle = parseInt(e.target.value, 10); const currentLevel = parseInt(jasmaniInput.beep_level, 10); const maxShuttle = BEEP_LEVEL_MAX_SHUTTLE[currentLevel]; if (maxShuttle && newShuttle > maxShuttle) { setJasmaniInput({ ...jasmaniInput, beep_shuttle: maxShuttle.toString() }); } else { setJasmaniInput({ ...jasmaniInput, beep_shuttle: e.target.value }); } }} className="w-full bg-white/10 p-2 rounded-md text-center disabled:opacity-60 disabled:cursor-not-allowed" />
                                                    </div>
                                                    <ScoreDisplay label="Skor" value={calculatedScores.beepScore || 0} />
                                                    {getTestProps('beep_test').data && !getTestProps('beep_test').canEdit && <p className="text-xs text-red-300 mt-1">Dinilai oleh: {getTestProps('beep_test').data.penilai?.nama_lengkap || 'N/A'}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300">Push Up</label>
                                                    <input type="number" placeholder="Jumlah" disabled={!getTestProps('push_up').canEdit} value={jasmaniInput.push_up} onChange={e => setJasmaniInput({...jasmaniInput, push_up: e.target.value})} className="w-full bg-white/10 p-2 rounded-md mt-1 disabled:opacity-60 disabled:cursor-not-allowed" />
                                                    <ScoreDisplay label="Skor" value={calculatedScores.pushUpScore || 0} />
                                                    {getTestProps('push_up').data && !getTestProps('push_up').canEdit && <p className="text-xs text-red-300 mt-1">Dinilai oleh: {getTestProps('push_up').data.penilai?.nama_lengkap || 'N/A'}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300">Sit Up</label>
                                                    <input type="number" placeholder="Jumlah" disabled={!getTestProps('sit_up').canEdit} value={jasmaniInput.sit_up} onChange={e => setJasmaniInput({...jasmaniInput, sit_up: e.target.value})} className="w-full bg-white/10 p-2 rounded-md mt-1 disabled:opacity-60 disabled:cursor-not-allowed" />
                                                    <ScoreDisplay label="Skor" value={calculatedScores.sitUpScore || 0} />
                                                    {getTestProps('sit_up').data && !getTestProps('sit_up').canEdit && <p className="text-xs text-red-300 mt-1">Dinilai oleh: {getTestProps('sit_up').data.penilai?.nama_lengkap || 'N/A'}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300">Plank</label>
                                                    <div className="flex gap-2 mt-1">
                                                        <input type="number" placeholder="Menit" disabled={!getTestProps('plank').canEdit} value={jasmaniInput.plank_minutes} onChange={e => setJasmaniInput({...jasmaniInput, plank_minutes: e.target.value})} className="w-full bg-white/10 p-2 rounded-md text-center disabled:opacity-60 disabled:cursor-not-allowed" />
                                                        <input type="number" placeholder="Detik" disabled={!getTestProps('plank').canEdit} value={jasmaniInput.plank_seconds} onChange={e => { const seconds = e.target.value; const cappedSeconds = seconds && parseInt(seconds, 10) > 59 ? '59' : seconds; setJasmaniInput({...jasmaniInput, plank_seconds: cappedSeconds}); }} className="w-full bg-white/10 p-2 rounded-md text-center disabled:opacity-60 disabled:cursor-not-allowed" />
                                                    </div>
                                                    <ScoreDisplay label="Skor" value={calculatedScores.plankScore || 0} />
                                                    {getTestProps('plank').data && !getTestProps('plank').canEdit && <p className="text-xs text-red-300 mt-1">Dinilai oleh: {getTestProps('plank').data.penilai?.nama_lengkap || 'N/A'}</p>}
                                                </div>

                                                <div className="pt-4 mt-2 border-t border-gray-700/50 text-lg font-bold text-center">Rata-rata Jasmani: <span className="text-amber-400">{finalScores.jasmani || 0}</span></div>
                                            </div>
                                        </AccordionSection>

                                        <AccordionSection title="Penilaian Materi Karate" icon={<BookOpen className="text-amber-400" />} isOpen={openSection === 'materi'} onToggle={() => setOpenSection(openSection === 'materi' ? null : 'materi')}>
                                            <div className="space-y-4 pt-4 border-t border-gray-700/50">
                                                <div className="mb-4"> {currentUserMateri && !isMateriFormActive && <button type="button" onClick={() => setIsMateriFormActive(true)} style={glassmorphismStyle} className="w-full flex items-center justify-center gap-2 py-2 px-4 text-amber-400 hover:bg-amber-500/20 font-bold transition-colors"><Pencil size={18}/> Aktifkan Mode Edit</button>} {isMateriFormActive && currentUserMateri && <button type="button" onClick={handleCancelMateriEdit} style={glassmorphismStyle} className="w-full flex items-center justify-center gap-2 py-2 px-4 text-red-400 hover:bg-red-500/20 font-bold transition-colors"><XCircle size={18}/> Batal Edit</button>} </div>
                                                <div> <label className="block text-sm font-medium text-gray-300 mb-1">Nilai Materi (1-100)</label> <input type="number" min="1" max="100" placeholder="Nilai pemahaman materi" disabled={!isMateriFormActive} value={materiInput.nilai} onChange={e => setMateriInput({...materiInput, nilai: e.target.value})} className="w-full bg-white/10 p-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed" /> </div>
                                                <div> <label className="block text-sm font-medium text-gray-300 mb-1">Keterangan Materi</label> <textarea placeholder="Catatan tambahan (opsional)" disabled={!isMateriFormActive} value={materiInput.keterangan} onChange={e => setMateriInput({...materiInput, keterangan: e.target.value})} rows="2" className="w-full bg-white/10 p-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"></textarea> </div>
                                            </div>
                                        </AccordionSection>
                                        
                                        <AccordionSection title="Penilaian Wawancara" icon={<ClipboardEdit className="text-amber-400" />} isOpen={openSection === 'wawancara'} onToggle={() => setOpenSection(openSection === 'wawancara' ? null : 'wawancara')}>
                                            <div className="space-y-4 pt-4 border-t border-gray-700/50">
                                                <div className="mb-4"> {currentUserWawancara && !isWawancaraFormActive && <button type="button" onClick={() => setIsWawancaraFormActive(true)} style={glassmorphismStyle} className="w-full flex items-center justify-center gap-2 py-2 px-4 text-amber-400 hover:bg-amber-500/20 font-bold transition-colors"><Pencil size={18}/> Aktifkan Mode Edit</button>} {isWawancaraFormActive && currentUserWawancara && <button type="button" onClick={handleCancelWawancaraEdit} style={glassmorphismStyle} className="w-full flex items-center justify-center gap-2 py-2 px-4 text-red-400 hover:bg-red-500/20 font-bold transition-colors"><XCircle size={18}/> Batal Edit</button>} </div>
                                                <div> <label className="block text-sm font-medium text-gray-300 mb-1">Nilai Wawancara (1-100)</label> <input type="number" min="1" max="100" placeholder="Nilai sikap dan jawaban" disabled={!isWawancaraFormActive} value={wawancaraInput.nilai} onChange={e => setWawancaraInput({...wawancaraInput, nilai: e.target.value})} className="w-full bg-white/10 p-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed" /> </div>
                                                <div> <label className="block text-sm font-medium text-gray-300 mb-1">Keterangan Wawancara</label> <textarea placeholder="Catatan tambahan (opsional)" disabled={!isWawancaraFormActive} value={wawancaraInput.keterangan} onChange={e => setWawancaraInput({...wawancaraInput, keterangan: e.target.value})} rows="2" className="w-full bg-white/10 p-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"></textarea> </div>
                                            </div>
                                        </AccordionSection>

                                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                            <button type="submit" disabled={isButtonDisabled} style={glassmorphismStyle} className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold transition-all duration-300 disabled:cursor-not-allowed hover:enabled:bg-green-500/20 hover:enabled:scale-[1.02]">
                                                {isSubmitting ? ( <span className="flex items-center gap-2 text-gray-400"> <LoaderCircle className="animate-spin" /> Menyimpan... </span> ) : ( <> <Save className={`transition-colors duration-300 ${isButtonDisabled ? 'text-gray-500' : 'text-[#A8EB4B]'}`} /> <span className={`transition-colors duration-300 ${isButtonDisabled ? 'text-gray-500' : 'battery-style-gradient'}`}> Simpan Penilaian Saya </span> </> )}
                                            </button>
                                        </motion.div>
                                    </div>
                                    
                                    <div className="lg:w-3/5 order-1 lg:order-2">
                                        <div className="p-6" style={glassmorphismStyle}>
                                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><User className="text-amber-400" />Hasil Penilaian: {selectedPendaftar.profiles.nama_lengkap}</h2>
                                            <p className="mb-4 text-gray-400"> Jenis Kelamin: {selectedPendaftar.profiles.jenis_kelamin === 'lakilaki' ? 'Laki-laki' : selectedPendaftar.profiles.jenis_kelamin === 'perempuan' ? 'Perempuan' : 'N/A'} </p>
                                            
                                            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                                                <div className="p-3 rounded-lg bg-white/5">
                                                    <div className='flex justify-between items-center'> <h3 className="font-bold text-lg">Penilaian Jasmani</h3> <div className="font-bold text-amber-300 text-lg">{finalScores.jasmani}</div> </div>
                                                    {existingJasmaniScores.length > 0 ? (
                                                        <div className='mt-2 pt-2 border-t border-white/10 space-y-2'>
                                                            {existingJasmaniScores.map(score => {
                                                                // [PERUBAHAN] Logika untuk menampilkan nilai plank dalam format menit dan detik
                                                                let displayValue;
                                                                if (score.jenis_tes === 'beep_test') {
                                                                    displayValue = `${score.nilai || 'N/A'} / ${score.keterangan || 'N/A'}`;
                                                                } else if (score.jenis_tes === 'plank') {
                                                                    const totalSeconds = score.nilai ?? 0;
                                                                    const minutes = Math.floor(totalSeconds / 60);
                                                                    const seconds = totalSeconds % 60;
                                                                    displayValue = `${minutes}m ${seconds}s`;
                                                                } else {
                                                                    displayValue = score.nilai ?? 'N/A';
                                                                }

                                                                return (
                                                                    <div key={score.jenis_tes} className="text-xs text-gray-400 flex justify-between">
                                                                        <span className="capitalize">{score.jenis_tes.replace('_', ' ')}: <span className="text-white font-bold">{displayValue}</span></span>
                                                                        <span>Dinilai oleh: {score.penilai?.nama_lengkap || 'N/A'}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian jasmani.</p>}
                                                </div>

                                                <div className="p-3 rounded-lg bg-white/5">
                                                    <div className='flex justify-between items-center'> <h3 className="font-bold text-lg">Penilaian Materi</h3> <div className="font-bold text-amber-300 text-lg">{finalScores.materi}</div> </div>
                                                    {existingMateri.length > 0 ? ( <div className='mt-2 pt-2 border-t border-white/10'> <p className="text-sm text-gray-400">Telah dinilai oleh: {existingMateri.length} penilai</p> <div className="space-y-2 mt-1"> {existingMateri.map(p => ( <div key={p.id_penilai} className="text-xs text-gray-400"> <div className="flex justify-between items-center"> <span>{p.penilai?.nama_lengkap || 'N/A'}</span> <span className="font-bold text-white text-sm">{p.nilai || 'N/A'}</span> </div> {p.keterangan && <p className="italic pl-2">- {p.keterangan}</p>} </div> ))} </div> </div> ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian.</p>}
                                                </div>
                                                
                                                <div className="p-3 rounded-lg bg-white/5">
                                                    <div className='flex justify-between items-center'> <h3 className="font-bold text-lg">Penilaian Wawancara</h3> <div className="font-bold text-amber-300 text-lg">{finalScores.wawancara}</div> </div>
                                                    {existingWawancara.length > 0 ? ( <div className='mt-2 pt-2 border-t border-white/10'> <p className="text-sm text-gray-400">Telah dinilai oleh: {existingWawancara.length} penilai</p> <div className="space-y-2 mt-1"> {existingWawancara.map(p => ( <div key={p.id_penilai} className="text-xs text-gray-400"> <div className="flex justify-between items-center"> <span>{p.penilai?.nama_lengkap || 'N/A'}</span> <span className="font-bold text-white text-sm">{p.nilai || 'N/A'}</span> </div> {p.keterangan && <p className="italic pl-2">- {p.keterangan}</p>} </div> ))} </div> </div> ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian.</p>}
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-600 text-center">
                                                <h3 className="text-xl font-bold">Nilai Akhir Rata-rata</h3>
                                                <div className="flex justify-around items-start mt-2">
                                                    <div> <div className="text-3xl font-bold text-amber-400">{finalScores.jasmani}</div> <div className="text-sm text-gray-300">Jasmani</div> </div>
                                                    <div> <div className="text-3xl font-bold text-amber-400">{finalScores.materi}</div> <div className="text-sm text-gray-300">Materi</div> </div>
                                                    <div> <div className="text-3xl font-bold text-amber-400">{finalScores.wawancara}</div> <div className="text-sm text-gray-300">Wawancara</div> </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                        {selectedPendaftar && !selectedPendaftar.profiles && ( <div className="p-6 text-center" style={glassmorphismStyle}> <p className="text-amber-400">Data profil untuk pendaftar ini tidak ditemukan. Penilaian tidak dapat dilakukan.</p> </div> )}
                    </motion.div>
                </main>
                <Footer />
            </div>
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} type={notification.type} title={notification.title} message={notification.message} />
        </div>
    );
}