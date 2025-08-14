import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// [MODIFIKASI] Menambahkan ikon Palette untuk filter warna
import { LoaderCircle, ServerCrash, CalendarCheck, UserRoundCheck, ChevronLeft, UserPlus, X, ZoomIn, ZoomOut, Search, Trash2, AlertTriangle, ClipboardCheck, Award, BookOpen, ClipboardEdit, ChevronDown, User, Heart, Trophy, Flag, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async'; // Impor Helmet
import favicon from '../assets/logo_bintangcompress.png';

// Impor dari TanStack Table
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

// Impor PDF.js Library
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// ATUR WORKER UNTUK PDF.JS
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';

// Import gambar background
import heroBg from '../assets/bg9.jpg';

// Gaya untuk efek glassmorphism
const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
        0px 4px 10px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '0.8rem',
};

// Gaya khusus untuk modal konfirmasi dengan blur lebih tinggi
const confirmationModalStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
        0px 4px 10px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '0.8rem',
};

// --- Helper & Kalkulasi Nilai ---
const BEEP_TEST_SHUTTLE_MAP = { 1: 7, 2: 15, 3: 23, 4: 32, 5: 41, 6: 51, 7: 61, 8: 72, 9: 83, 10: 94, 11: 106, 12: 117, 13: 129, 14: 141, 15: 153, 16: 165 };
const calculateTotalShuttles = (level, shuttle) => {
    if (!level || level < 1) return 0;
    const baseShuttles = level > 1 ? BEEP_TEST_SHUTTLE_MAP[level - 1] || 0 : 0;
    return baseShuttles + (shuttle || 0);
};
const STANDARDS = {
    'lakilaki': { beepShuttles: calculateTotalShuttles(9, 1), pushUp: 42, sitUp: 40, plankSeconds: 180 },
    'perempuan': { beepShuttles: calculateTotalShuttles(7, 1), pushUp: 37, sitUp: 50, plankSeconds: 120 },
};
const calculateScore = (value, target) => {
    if (!value || !target || value <= 0 || target <= 0) return 0;
    return Math.min(Math.round((value / target) * 100), 100);
};

// --- Komponen Modal Penilaian ---
const PenilaianModal = ({ isOpen, onClose, pendaftar }) => {
    const [openSection, setOpenSection] = useState('jasmani');

    if (!isOpen || !pendaftar) return null;

    const { profiles, penilaian_jasmani_individu, penilaian_materi, penilaian_wawancara, avg_jasmani, avg_materi, avg_wawancara, total_avg } = pendaftar;
    const standard = profiles ? STANDARDS[profiles.jenis_kelamin] : null;

    const AccordionSection = ({ title, icon, isOpen, onToggle, children }) => (
        <motion.div initial={false} className="p-4 rounded-lg bg-white/5">
            <motion.header initial={false} onClick={onToggle} className="flex justify-between items-center cursor-pointer">
                <h3 className="font-bold text-lg flex items-center gap-3">{icon}{title}</h3>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={24} />
                </motion.div>
            </motion.header>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto', marginTop: '1rem' },
                            collapsed: { opacity: 0, height: 0, marginTop: '0rem' },
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
       <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative p-6 shadow-lg max-w-3xl w-full"
                        style={glassmorphismStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"><X size={24} /></button>
                        <div className="flex items-center gap-4 mb-4">
                            <img 
                                src={profiles.avatar_url || `https://placehold.co/80x80/1a202c/FFFFFF?text=${profiles.nama_lengkap.charAt(0)}`} 
                                alt="Foto Profil" 
                                className="w-20 h-20 rounded-lg object-cover border-2 border-white/30"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/1a202c/FFFFFF?text=${profiles.nama_lengkap.charAt(0)}`; }}
                            />
                            <div>
                                <h2 className="text-2xl font-semibold flex items-center gap-3"><User className="text-amber-400" />{profiles.nama_lengkap}</h2>
                                <p className="text-gray-400">NPT: {profiles.npt || 'N/A'} | {profiles.jenis_kelamin === 'lakilaki' ? 'Laki-laki' : 'Perempuan'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                            <AccordionSection title="Penilaian Jasmani" icon={<Award className="text-amber-400" />} isOpen={openSection === 'jasmani'} onToggle={() => setOpenSection(openSection === 'jasmani' ? null : 'jasmani')}>
                                <div className='mt-2 pt-2 border-t border-white/10'>
                                    {penilaian_jasmani_individu && penilaian_jasmani_individu.length > 0 && standard ? (
                                        <div className="space-y-3">
                                            {penilaian_jasmani_individu.map(p => {
                                                let testLabel, testValue, testScore;
                                                switch(p.jenis_tes) {
                                                    case 'beep_test':
                                                        testLabel = 'Beep Test';
                                                        testValue = `${p.nilai || '0'}-${p.keterangan || '0'}`;
                                                        testScore = calculateScore(calculateTotalShuttles(Number(p.nilai), Number(p.keterangan)), standard.beepShuttles);
                                                        break;
                                                    case 'push_up':
                                                        testLabel = 'Push Up';
                                                        testValue = p.nilai || '0';
                                                        testScore = calculateScore(Number(p.nilai), standard.pushUp);
                                                        break;
                                                    case 'sit_up':
                                                        testLabel = 'Sit Up';
                                                        testValue = p.nilai || '0';
                                                        testScore = calculateScore(Number(p.nilai), standard.sitUp);
                                                        break;
                                                    case 'plank':
                                                        testLabel = 'Plank';
                                                        testValue = p.nilai ? `${Math.floor(p.nilai/60)}m ${p.nilai%60}s` : '0m 0s';
                                                        testScore = calculateScore(Number(p.nilai), standard.plankSeconds);
                                                        break;
                                                    default:
                                                        return null;
                                                }
                                                return (
                                                    <div key={p.jenis_tes} className="text-sm">
                                                        <p className="font-semibold text-gray-300">{testLabel}</p>
                                                        <div className="text-xs text-gray-400 pl-2">
                                                            <p>Hasil: <span className="font-bold text-white">{testValue}</span> | Skor: <span className="font-bold text-white">{testScore}</span></p>
                                                            <p>Dinilai oleh: <span className="italic">{p.penilai?.nama_lengkap || 'N/A'}</span></p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian.</p>}
                                </div>
                            </AccordionSection>

                            <AccordionSection title="Penilaian Materi Karate" icon={<BookOpen className="text-amber-400" />} isOpen={openSection === 'materi'} onToggle={() => setOpenSection(openSection === 'materi' ? null : 'materi')}>
                                   <div className='mt-2 pt-2 border-t border-white/10'>
                                       {penilaian_materi.length > 0 ? (
                                           <div className="space-y-2 mt-1">
                                               {penilaian_materi.map(p => (
                                                   <div key={p.id_penilai} className="text-sm text-gray-400">
                                                       <div className="flex justify-between items-center">
                                                           <span>{p.penilai.nama_lengkap}</span>
                                                           <span className="font-bold text-white">{p.nilai || 'N/A'}</span>
                                                       </div>
                                                       {p.keterangan && <p className="text-xs italic pl-2">- {p.keterangan}</p>}
                                                   </div>
                                               ))}
                                           </div>
                                       ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian.</p>}
                                   </div>
                            </AccordionSection>
                            
                            <AccordionSection title="Penilaian Wawancara" icon={<ClipboardEdit className="text-amber-400" />} isOpen={openSection === 'wawancara'} onToggle={() => setOpenSection(openSection === 'wawancara' ? null : 'wawancara')}>
                                   <div className='mt-2 pt-2 border-t border-white/10'>
                                       {penilaian_wawancara.length > 0 ? (
                                           <div className="space-y-2 mt-1">
                                               {penilaian_wawancara.map(p => (
                                                   <div key={p.id_penilai} className="text-sm text-gray-400">
                                                       <div className="flex justify-between items-center">
                                                           <span>{p.penilai.nama_lengkap}</span>
                                                           <span className="font-bold text-white">{p.nilai || 'N/A'}</span>
                                                       </div>
                                                       {p.keterangan && <p className="text-xs italic pl-2">- {p.keterangan}</p>}
                                                   </div>
                                               ))}
                                           </div>
                                       ) : <p className="text-gray-400 text-center py-3 text-sm">Belum ada penilaian.</p>}
                                   </div>
                            </AccordionSection>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-600 text-center">
                            <h3 className="text-xl font-bold">Nilai Akhir Rata-rata</h3>
                            <div className="flex justify-around items-start mt-2">
                                <div>
                                    <div className="text-3xl font-bold text-amber-400">{avg_jasmani}</div>
                                    <div className="text-sm text-gray-300">Jasmani</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-amber-400">{avg_materi}</div>
                                    <div className="text-sm text-gray-300">Materi</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-amber-400">{avg_wawancara}</div>
                                    <div className="text-sm text-gray-300">Wawancara</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold battery-style-gradient">{total_avg}</div>
                                    <div className="text-sm text-gray-300">Total</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.8, transition: { type: "spring", stiffness: 300, damping: 25 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-overlay"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={overlayVariants}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        key="modal-content"
                        variants={modalVariants}
                        className="relative p-6 text-center text-white max-w-md w-full"
                        style={confirmationModalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20 mb-4 border border-amber-500/50">
                                <AlertTriangle size={40} className="text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{title}</h3>
                            <div className="text-gray-300 mb-6">{children}</div>
                            <div className="flex justify-center items-center gap-4 w-full">
                                <button
                                    onClick={onClose}
                                    style={{ ...confirmationModalStyle, backgroundColor: 'transparent' }}
                                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-300 hover:text-white transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={onConfirm}
                                    style={{ ...confirmationModalStyle, backgroundColor: 'transparent' }}
                                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold"
                                >
                                    <span className="text-red-400 hover:text-red-300 transition-colors">Hapus</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const CvModal = ({ cvUrl, onClose, modalGlassmorphismStyle }) => {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const pdfDocumentRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const zoomScrollRatiosRef = useRef(null);
    const initialPinchDistanceRef = useRef(null);
    const lastScaleRef = useRef(1.0);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [pdfError, setPdfError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.7, y: 50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 25 } },
        exit: { opacity: 0, scale: 0.7, y: 50, transition: { type: "spring", stiffness: 250, damping: 25 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' },
        visible: { opacity: 1, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.4)', transition: { duration: 0.2 } },
        exit: { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)', transition: { duration: 0.2 } }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const renderPage = useCallback(async (pdf, pageNum, currentScale) => {
        setLoadingPdf(true);
        setPdfError(null);

        if (renderTaskRef.current) {
            try {
                renderTaskRef.current.cancel();
            } catch (e) {
                console.warn("Gagal membatalkan render task:", e);
            } finally {
                renderTaskRef.current = null;
            }
        }

        const canvas = canvasRef.current;
        const container = canvasContainerRef.current;

        try {
            if (!canvas || !pdf) {
                setLoadingPdf(false);
                return;
            }
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentScale });
            const context = canvas.getContext('2d');
            const outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                transform: transform,
            };

            renderTaskRef.current = page.render(renderContext);
            await renderTaskRef.current.promise;
            renderTaskRef.current = null;

        } catch (error) {
            if (error.name !== 'RenderingCancelledException') {
                console.error('Gagal merender halaman:', error);
                setPdfError('Gagal merender halaman CV.');
            }
        } finally {
            setLoadingPdf(false);
            if (container && canvas && zoomScrollRatiosRef.current) {
                const { centerXRatio, centerYRatio } = zoomScrollRatiosRef.current;
                const newScrollWidth = canvas.offsetWidth;
                const newScrollHeight = canvas.offsetHeight;
                const newScrollLeft = centerXRatio * newScrollWidth - container.clientWidth / 2;
                const newScrollTop = centerYRatio * newScrollHeight - container.clientHeight / 2;
                container.scrollTo({ left: Math.max(0, newScrollLeft), top: Math.max(0, newScrollTop), behavior: 'auto' });
                zoomScrollRatiosRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        if (!cvUrl) return;
        setLoadingPdf(true); setPdfError(null); setCurrentPage(1); setScale(1.0); lastScaleRef.current = 1.0; zoomScrollRatiosRef.current = null;
        if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (e) { /* abaikan */ } finally { renderTaskRef.current = null; } }
        if (pdfDocumentRef.current) { pdfDocumentRef.current.destroy(); pdfDocumentRef.current = null; }

        const loadingTask = pdfjsLib.getDocument(cvUrl);
        loadingTask.promise.then(pdf => {
            pdfDocumentRef.current = pdf;
            setNumPages(pdf.numPages);
        }).catch(reason => {
            console.error('Gagal memuat dokumen PDF:', reason);
            setPdfError('Gagal memuat CV. Pastikan URL valid dan file tidak rusak.');
            setLoadingPdf(false);
        });

        return () => {
            if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (e) { /* abaikan */ } finally { renderTaskRef.current = null; } }
            if (pdfDocumentRef.current) { pdfDocumentRef.current.destroy(); pdfDocumentRef.current = null; }
        };
    }, [cvUrl]);

    useEffect(() => {
        if (pdfDocumentRef.current && currentPage && canvasRef.current) {
            renderPage(pdfDocumentRef.current, currentPage, scale);
        }
    }, [pdfDocumentRef.current, currentPage, scale, renderPage]);

    const getPinchDistance = (touches) => {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialPinchDistanceRef.current = getPinchDistance(e.touches);
            lastScaleRef.current = scale;
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current) {
            e.preventDefault();
            const currentPinchDistance = getPinchDistance(e.touches);
            const zoomFactor = currentPinchDistance / initialPinchDistanceRef.current;
            const newScale = lastScaleRef.current * zoomFactor;
            const clampedScale = Math.max(0.2, Math.min(newScale, 3.0));
            setScale(clampedScale);
        }
    };

    const handleTouchEnd = () => {
        initialPinchDistanceRef.current = null;
    };


    const goToNextPage = () => { if (pdfDocumentRef.current && currentPage < numPages) setCurrentPage(p => p + 1); };
    const goToPrevPage = () => { if (pdfDocumentRef.current && currentPage > 1) setCurrentPage(p => p - 1); };

    const zoomIn = () => {
        const container = canvasContainerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const oldScrollWidth = canvas.offsetWidth;
        const oldScrollHeight = canvas.offsetHeight;
        zoomScrollRatiosRef.current = {
            centerXRatio: oldScrollWidth > 0 ? (container.scrollLeft + container.clientWidth / 2) / oldScrollWidth : 0.5,
            centerYRatio: oldScrollHeight > 0 ? (container.scrollTop + container.clientHeight / 2) / oldScrollHeight : 0.5,
        };
        setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
    };

    const zoomOut = () => {
        const container = canvasContainerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const oldScrollWidth = canvas.offsetWidth;
        const oldScrollHeight = canvas.offsetHeight;
        zoomScrollRatiosRef.current = {
            centerXRatio: oldScrollWidth > 0 ? (container.scrollLeft + container.clientWidth / 2) / oldScrollWidth : 0.5,
            centerYRatio: oldScrollHeight > 0 ? (container.scrollTop + container.clientHeight / 2) / oldScrollHeight : 0.5,
        };
        setScale(prevScale => Math.max(prevScale - 0.2, 0.2));
    };

    return (
        <AnimatePresence>
            {onClose && (
                <motion.div
                    initial="hidden" animate="visible" exit="exit" variants={overlayVariants}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
                >
                    <motion.div
                        variants={modalVariants}
                        className="relative rounded-2xl p-4 sm:p-6 shadow-2xl text-center max-w-4xl w-full h-[85vh] sm:h-[90vh] mx-auto flex flex-col"
                        style={modalGlassmorphismStyle} onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                            <h3 className="text-xl font-bold text-white">Pratinjau CV</h3>
                            <button onClick={onClose} className="text-white hover:text-amber-400 transition-colors duration-200 z-10" aria-label="Tutup Pratinjau CV">
                                <X size={24} />
                            </button>
                        </div>
                        {pdfError ? (
                            <div className="flex-grow flex items-center justify-center"><p className="text-red-400">{pdfError}</p></div>
                        ) : (
                            <>
                                <div
                                    ref={canvasContainerRef}
                                    className="flex-grow relative overflow-auto rounded-lg border border-gray-700 shadow-inner"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {loadingPdf && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1]">
                                            <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
                                            <span className="ml-3 text-gray-300">Memuat halaman...</span>
                                        </div>
                                    )}
                                    <canvas ref={canvasRef} className="block max-w-none h-auto mx-auto"></canvas>
                                </div>
                                {pdfDocumentRef.current && numPages > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <button onClick={zoomOut} disabled={scale <= 0.2 || loadingPdf} className="p-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ZoomOut size={18} /></button>
                                            <span className="text-gray-300 font-medium text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                                            <button onClick={zoomIn} disabled={scale >= 3.0 || loadingPdf} className="p-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ZoomIn size={18} /></button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button onClick={goToPrevPage} disabled={currentPage <= 1 || loadingPdf} className="px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">Prev</button>
                                            <span className="text-gray-300 text-sm whitespace-nowrap">Hal {currentPage} / {numPages}</span>
                                            <button onClick={goToNextPage} disabled={currentPage >= numPages || loadingPdf} className="px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">Next</button>
                                        </div>
                                    </div>
                                )}
                                {numPages === 0 && !loadingPdf && !pdfError && (<p className="text-gray-400">CV tidak memiliki halaman.</p>)}
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ExpandableText = ({ text, isExpanded }) => {
    const textClasses = isExpanded ? "" : "line-clamp-3";
    return <p className={textClasses} style={{ whiteSpace: 'pre-line' }}>{text || 'N/A'}</p>;
};

export default function DataPendaftar() {
    const { role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [daftarPeriode, setDaftarPeriode] = useState([]);
    const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
    const [dataPendaftar, setDataPendaftar] = useState([]);
    const [loadingPendaftar, setLoadingPendaftar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCvModalOpen, setIsCvModalOpen] = useState(false);
    const [currentCvUrl, setCurrentCvUrl] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendaftarToDelete, setPendaftarToDelete] = useState(null);
    const [sortType, setSortType] = useState('default');
    const [isPenilaianModalOpen, setIsPenilaianModalOpen] = useState(false);
    const [selectedPendaftarForNilai, setSelectedPendaftarForNilai] = useState(null);

    const titleVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } } };
    const subtitleVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.7 } } };
    const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12, delayChildren: 0.2, staggerChildren: 0.05 } } };
    const headingVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    const toggleRowExpansion = (pendaftarId) => {
        setExpandedRows(prevExpandedRows => {
            const newExpandedRows = new Set(prevExpandedRows);
            if (newExpandedRows.has(pendaftarId)) {
                newExpandedRows.delete(pendaftarId);
            } else {
                newExpandedRows.add(pendaftarId);
            }
            return newExpandedRows;
        });
    };

    const handleLihatCv = (e, url) => {
        e.stopPropagation();
        setCurrentCvUrl(url);
        setIsCvModalOpen(true);
    };
    const handleCloseCvModal = () => { setIsCvModalOpen(false); setCurrentCvUrl(''); };
    
    const handleLihatNilai = (e, pendaftar) => {
        e.stopPropagation();
        setSelectedPendaftarForNilai(pendaftar);
        setIsPenilaianModalOpen(true);
    };
    const handleClosePenilaianModal = () => {
        setIsPenilaianModalOpen(false);
        setSelectedPendaftarForNilai(null);
    };


    const handleHapusPendaftar = (pendaftarId) => {
        setPendaftarToDelete(pendaftarId);
        setIsConfirmModalOpen(true);
    };
    
    const handleLabelChange = async (pendaftarId, label) => {
        setDataPendaftar(currentData =>
            currentData.map(p =>
                p.id === pendaftarId ? { ...p, status_label: label } : p
            )
        );

        try {
            const { error } = await supabase
                .from('data_pendaftar')
                .update({ status_label: label })
                .eq('id', pendaftarId);
            
            if (error) throw error;

        } catch (err) {
            console.error("Gagal memperbarui label:", err.message);
            alert("Gagal menyimpan tanda. Memuat ulang data...");
            fetchPendaftarByPeriode(selectedPeriodeId);
        }
    };
    
    const columns = useMemo(() => [
        {
            accessorKey: 'profiles.nama_lengkap',
            header: 'Nama Lengkap',
            size: 220,
            cell: ({ row }) => <div className="font-medium text-white">{row.original.profiles?.nama_lengkap || 'N/A'}</div>
        },
        {
            accessorKey: 'profiles.npt',
            header: 'NPT',
            size: 120,
        },
        {
            header: 'Kelas / Angkatan',
            size: 150,
            cell: ({ row }) => `${row.original.profiles?.kelas || 'N/A'} / ${row.original.profiles?.angkatan || 'N/A'}`
        },
        {
            accessorKey: 'profiles.nomor_telepon',
            header: 'No. Telepon',
            size: 150,
        },
        {
            accessorKey: 'cv_url',
            header: 'CV',
            size: 100,
            cell: ({ row }) => {
                const cvUrl = row.original.cv_url;
                return cvUrl && cvUrl !== 'N/A' ? (
                    <button onClick={(e) => handleLihatCv(e, cvUrl)} className="text-blue-300 hover:text-blue-200 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded whitespace-nowrap">
                        Lihat CV
                    </button>
                ) : 'N/A';
            }
        },
        {
            accessorKey: 'persentase_minat',
            header: 'Minat (%)',
            size: 100,
            cell: info => `${info.getValue() || 'N/A'}%`
        },
        {
            accessorKey: 'alasan_minat',
            header: 'Alasan Minat',
            size: 350,
            cell: ({ row }) => <ExpandableText text={row.original.alasan_minat} isExpanded={expandedRows.has(row.original.id)} />
        },
        {
            accessorKey: 'pengalaman_organisasi',
            header: 'Pengalaman Organisasi',
            size: 350,
            cell: ({ row }) => <ExpandableText text={row.original.pengalaman_organisasi} isExpanded={expandedRows.has(row.original.id)} />
        },
        {
            accessorKey: 'pengalaman_kepanitiaan',
            header: 'Pengalaman Kepanitiaan',
            size: 350,
            cell: ({ row }) => <ExpandableText text={row.original.pengalaman_kepanitiaan} isExpanded={expandedRows.has(row.original.id)} />
        },
        {
            accessorKey: 'sepuluh_calon',
            header: '10 Calon',
            size: 350,
            cell: ({ row }) => <ExpandableText text={row.original.sepuluh_calon} isExpanded={expandedRows.has(row.original.id)} />
        },
        {
            accessorKey: 'tanggal_daftar',
            header: 'Tanggal Daftar',
            size: 180,
            cell: info => new Date(info.getValue()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        { accessorKey: 'avg_jasmani', header: 'Jasmani', size: 150, cell: info => info.getValue() || 0 },
        { accessorKey: 'avg_materi', header: 'Materi Karate', size: 150, cell: info => info.getValue() || 0 },
        { accessorKey: 'avg_wawancara', header: 'Wawancara', size: 170, cell: info => info.getValue() || 0 },
        { accessorKey: 'total_avg', header: 'Rata-rata', size: 150, cell: info => <span className="font-bold">{info.getValue() || 0}</span> },
        {
            id: 'detail_nilai',
            header: 'Detail Nilai',
            size: 120,
            cell: ({ row }) => (
                <button onClick={(e) => handleLihatNilai(e, row.original)} className="text-amber-400 hover:text-amber-300 underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded whitespace-nowrap">
                    Lihat Detail
                </button>
            )
        },
        ...(['admin', 'pengurus'].includes(role) ? [{
            id: 'status_label',
            header: 'Tandai',
            size: 120,
            cell: ({ row }) => {
                const pendaftarId = row.original.id;
                const currentLabel = row.original.status_label;
                const labels = ['hijau', 'kuning', 'merah'];
                
                return (
                    <div className="flex items-center justify-center gap-2">
                        {labels.map(label => {
                            const colorClasses = {
                                hijau: 'text-green-500 hover:text-green-400',
                                kuning: 'text-yellow-400 hover:text-yellow-300',
                                merah: 'text-red-500 hover:text-red-400',
                            };
                            const isActive = currentLabel === label;
                            const activeClasses = isActive ? 'bg-white/20 scale-125' : 'opacity-50 hover:opacity-100';

                            return (
                                <button
                                    key={label}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newLabel = isActive ? null : label;
                                        handleLabelChange(pendaftarId, newLabel);
                                    }}
                                    className={`p-1.5 rounded-full transition-all duration-200 ${activeClasses}`}
                                    title={`Tandai ${label}`}
                                >
                                    <Flag size={18} className={colorClasses[label]} />
                                </button>
                            );
                        })}
                    </div>
                );
            }
        }] : []),
        ...(role === 'admin' ? [{
            id: 'aksi',
            header: 'Aksi',
            size: 80,
            cell: ({ row }) => (
                <div className="text-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleHapusPendaftar(row.original.id);
                        }}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200"
                        title="Hapus Pendaftar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }] : [])
    ], [role, expandedRows]);
    
    const fetchDaftarPeriode = useCallback(async () => {
        setError(null);
        try {
            const { data, error } = await supabase.from('periode_pendaftaran').select('id, nama_periode, tahun_angkatan').order('tahun_angkatan', { ascending: false });
            if (error) throw error;
            if (data) {
                setDaftarPeriode(data);
                if (data.length > 0) setSelectedPeriodeId(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching periods:", err.message);
            setError("Gagal memuat daftar periode.");
        }
    }, []);

    const fetchPendaftarByPeriode = useCallback(async (periodeId) => {
        if (!periodeId) { setDataPendaftar([]); return; }
        setLoadingPendaftar(true); setError(null);
        try {
            const { data, error } = await supabase
                .from('data_pendaftar')
                .select(`
                    id, 
                    id_pengguna, 
                    dibuat_pada, 
                    data_isian,
                    status_label, 
                    profiles:id_pengguna (nama_lengkap, npt, kelas, angkatan, nomor_telepon, jenis_kelamin, avatar_url),
                    penilaian_jasmani_individu:penilaian_jasmani_individu(jenis_tes, nilai, keterangan, penilai:id_penilai(nama_lengkap)),
                    penilaian_materi:penilaian_materi!id_pendaftar(id_penilai, nilai, keterangan, penilai:id_penilai(nama_lengkap)),
                    penilaian_wawancara:penilaian_wawancara!id_pendaftar(id_penilai, nilai, keterangan, penilai:id_penilai(nama_lengkap))
                `)
                .eq('id_periode', periodeId)
                .order('dibuat_pada', { ascending: true });

            if (error) throw error;
            
            if (data) {
                const processedData = data.map(pendaftar => {
                    const isian = pendaftar.data_isian && typeof pendaftar.data_isian === 'object' ? pendaftar.data_isian : {};
                    
                    let avg_jasmani = 0;
                    if (pendaftar.penilaian_jasmani_individu && pendaftar.penilaian_jasmani_individu.length > 0) {
                        const standard = STANDARDS[pendaftar.profiles?.jenis_kelamin];
                        if(standard) {
                            const scores = pendaftar.penilaian_jasmani_individu;
                            const beepTest = scores.find(s => s.jenis_tes === 'beep_test');
                            const pushUp = scores.find(s => s.jenis_tes === 'push_up');
                            const sitUp = scores.find(s => s.jenis_tes === 'sit_up');
                            const plank = scores.find(s => s.jenis_tes === 'plank');

                            const totalShuttles = calculateTotalShuttles(Number(beepTest?.nilai), Number(beepTest?.keterangan));
                            const beepScore = calculateScore(totalShuttles, standard.beepShuttles);
                            const pushUpScore = calculateScore(Number(pushUp?.nilai), standard.pushUp);
                            const sitUpScore = calculateScore(Number(sitUp?.nilai), standard.sitUp);
                            const plankScore = calculateScore(Number(plank?.nilai), standard.plankSeconds);
                            avg_jasmani = Math.round((beepScore + pushUpScore + sitUpScore + plankScore) / 4);
                        }
                    }

                    let avg_materi = 0;
                    if (pendaftar.penilaian_materi && pendaftar.penilaian_materi.length > 0) {
                        const total = pendaftar.penilaian_materi.reduce((sum, p) => sum + (Number(p.nilai) || 0), 0);
                        avg_materi = Math.round(total / pendaftar.penilaian_materi.length);
                    }

                    let avg_wawancara = 0;
                    if (pendaftar.penilaian_wawancara && pendaftar.penilaian_wawancara.length > 0) {
                        const total = pendaftar.penilaian_wawancara.reduce((sum, p) => sum + (Number(p.nilai) || 0), 0);
                        avg_wawancara = Math.round(total / pendaftar.penilaian_wawancara.length);
                    }
                    
                    const total_avg = Math.round((avg_jasmani + avg_materi + avg_wawancara) / 3);

                    return { 
                        ...pendaftar,
                        penilaian_jasmani_individu: pendaftar.penilaian_jasmani_individu || [],
                        status_label: pendaftar.status_label,
                        tanggal_daftar: pendaftar.dibuat_pada, 
                        cv_url: isian.cv_url || 'N/A', 
                        alasan_minat: isian.alasan_minat || 'N/A', 
                        sepuluh_calon: isian.sepuluh_calon || 'N/A', 
                        persentase_minat: isian.persentase_minat || 'N/A', 
                        pengalaman_organisasi: isian.pengalaman_organisasi || 'N/A', 
                        pengalaman_kepanitiaan: isian.pengalaman_kepanitiaan || 'N/A',
                        avg_jasmani,
                        avg_materi,
                        avg_wawancara,
                        total_avg
                    };
                });
                setDataPendaftar(processedData);
            }
        } catch (err) {
            console.error("Error fetching pendaftar data:", err.message);
            setError("Gagal memuat data pendaftar untuk periode ini.");
        } finally {
            setLoadingPendaftar(false);
        }
    }, []);

    const executeDelete = async () => {
        if (!pendaftarToDelete) return;
        const BUCKET_NAME = 'cvpendaftar';
        const pendaftarData = dataPendaftar.find(p => p.id === pendaftarToDelete);
        const cvUrl = pendaftarData?.cv_url;
        let filePath = null;
        if (cvUrl && cvUrl !== 'N/A' && cvUrl.includes(`/${BUCKET_NAME}/`)) {
            filePath = cvUrl.split(`/${BUCKET_NAME}/`)[1];
        }
        try {
            const { error: dbError } = await supabase
                .from('data_pendaftar')
                .delete()
                .eq('id', pendaftarToDelete);
            if (dbError) throw new Error(`Gagal menghapus data dari database: ${dbError.message}`);
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([filePath]);
                if (storageError) {
                    console.warn(`Data pendaftar terhapus, tetapi gagal menghapus file dari storage: ${storageError.message}`);
                    alert(`Peringatan: Gagal menghapus file CV dari storage. Error: ${storageError.message}. Silakan cek RLS Storage Anda.`);
                }
            }
            setDataPendaftar(currentPendaftar =>
                currentPendaftar.filter(p => p.id !== pendaftarToDelete)
            );
        } catch (err) {
            console.error("Terjadi kesalahan saat proses penghapusan:", err);
            alert(`Operasi hapus gagal. Silakan cek console untuk detail error.`);
        } finally {
            setIsConfirmModalOpen(false);
            setPendaftarToDelete(null);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!['admin', 'pengurus'].includes(role)) {
                navigate('/dashboard', { replace: true });
            } else {
                fetchDaftarPeriode().finally(() => setLoading(false));
            }
        }
    }, [authLoading, role, navigate, fetchDaftarPeriode]);

    useEffect(() => {
        if (!authLoading && ['admin', 'pengurus'].includes(role) && selectedPeriodeId) {
            fetchPendaftarByPeriode(selectedPeriodeId);
        }
    }, [selectedPeriodeId, authLoading, role, fetchPendaftarByPeriode]);

    const sortedData = useMemo(() => {
        const dataToSort = [...dataPendaftar];
        if (sortType === 'minat') {
            return dataToSort.sort((a, b) => {
                const minatA = Number(a.persentase_minat) || 0;
                const minatB = Number(b.persentase_minat) || 0;
                return minatB - minatA;
            });
        }
        if (sortType === 'nilai') {
            return dataToSort.sort((a, b) => {
                const nilaiA = Number(a.total_avg) || 0;
                const nilaiB = Number(b.total_avg) || 0;
                return nilaiB - nilaiA;
            });
        }
        if (sortType === 'label') {
            const labelOrder = { 'hijau': 1, 'kuning': 2, 'merah': 3 };
            return dataToSort.sort((a, b) => {
                const aValue = labelOrder[a.status_label] || 4;
                const bValue = labelOrder[b.status_label] || 4;
                return aValue - bValue;
            });
        }
        return dataToSort; 
    }, [dataPendaftar, sortType]);

    const filteredPendaftar = useMemo(() => {
        if (!searchQuery) return sortedData;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return sortedData.filter(pendaftar => {
            const profile = pendaftar.profiles || {};
            const cvData = pendaftar;
            const searchableFields = [profile.nama_lengkap, profile.npt, profile.kelas, profile.angkatan, profile.nomor_telepon, cvData.alasan_minat, cvData.pengalaman_organisasi, cvData.pengalaman_kepanitiaan, cvData.sepuluh_calon, String(new Date(pendaftar.tanggal_daftar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }))];
            return searchableFields.some(field => field && String(field).toLowerCase().includes(lowerCaseQuery));
        });
    }, [sortedData, searchQuery]);
    
    const getRowBgClass = (label) => {
        switch (label) {
            case 'hijau':
                return 'bg-green-500/20 hover:bg-green-500/30';
            case 'kuning':
                return 'bg-yellow-500/20 hover:bg-yellow-500/30';
            case 'merah':
                return 'bg-red-500/20 hover:bg-red-500/30';
            default:
                return 'hover:bg-gray-800/50';
        }
    };

    const table = useReactTable({
        data: filteredPendaftar,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    return (
        <div className="relative min-h-screen text-white">
            <Helmet>
                <title>Data Pendaftar - STMKG Karate Club</title>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}><div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div></div>
            
            {(authLoading || loading) ? (
                <div className="relative z-10 flex h-screen justify-center items-center">
                    <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
                </div>
            ) : error ? (
                <div className="relative z-10 flex h-screen flex-col justify-center items-center text-center p-4">
                    <ServerCrash className="h-16 w-16 text-red-500" />
                    <h1 className="text-3xl font-bold text-red-400 mt-4">Terjadi Kesalahan</h1>
                    <p className="text-gray-300 mt-2">{error}</p>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col min-h-screen">
                    <main className="flex-grow pt-24 pb-12">
                        {role && ['admin', 'pengurus'].includes(role) && (
                            <>
                                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                                    <nav className="flex space-x-4 justify-center">
                                        <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Struktur Pengurus"><ChevronLeft size={20} /></Link>
                                        <Link to="/penilaian-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Penilaian Pendaftar"><ClipboardCheck size={20} /></Link>
                                        {role === 'admin' && (
                                            <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Admin Pendaftaran"><UserPlus size={20} /></Link>
                                        )}
                                    </nav>
                                </motion.div>
                                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="fixed left-4 top-1/2 -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                                    <nav className="space-y-3">
                                        <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Struktur Pengurus"><ChevronLeft size={20} /></Link>
                                        <Link to="/penilaian-pendaftar" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Penilaian Pendaftar"><ClipboardCheck size={20} /></Link>
                                        {role === 'admin' && (
                                            <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Admin Pendaftaran"><UserPlus size={20} /></Link>
                                        )}
                                    </nav>
                                </motion.div>
                            </>
                        )}

                        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 space-y-8">
                            <div className="text-center">
                                <motion.h1 variants={titleVariants} initial="hidden" animate="visible" className="text-4xl md:text-6xl font-league uppercase text-accent mb-2 drop-shadow-lg">Data Pendaftar</motion.h1>
                                <motion.p variants={subtitleVariants} initial="hidden" animate="visible" className="text-gray-300 drop-shadow-md">Lihat dan kelola data pendaftar berdasarkan periode.</motion.p>
                            </div>
                            <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                                <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold mb-4 flex items-center gap-3"><CalendarCheck className="text-amber-400" />Pilih Periode Pendaftaran</motion.h2>
                                <div className="flex flex-col gap-4">
                                    <label htmlFor="periode-select" className="block text-sm font-medium text-gray-300">Periode Tahun Angkatan:</label>
                                    <div className="relative w-full" style={glassmorphismStyle}>
                                        <select 
                                            id="periode-select" 
                                            value={selectedPeriodeId} 
                                            onChange={(e) => setSelectedPeriodeId(e.target.value)} 
                                            className="w-full bg-transparent p-2.5 pr-8 text-white focus:outline-none appearance-none cursor-pointer"
                                        >
                                            {daftarPeriode.length > 0 ? (
                                                daftarPeriode.map((periode) => (
                                                    <option key={periode.id} value={periode.id} className="bg-gray-800 text-white">
                                                        {periode.nama_periode} (Angkatan Tahun: {periode.tahun_angkatan})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled className="bg-gray-800 text-white">
                                                    Tidak ada periode pendaftaran tersedia
                                                </option>
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                            <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                                    <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold flex items-center gap-3"><UserRoundCheck className="text-amber-400" />Daftar Pendaftar</motion.h2>
                                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => setSortType(prev => prev === 'label' ? 'default' : 'label')}
                                            title="Urutkan berdasarkan label warna"
                                            className={`p-2.5 rounded-full transition-colors duration-200 ${sortType === 'label' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                        >
                                            <Palette size={18} />
                                        </button>
                                        <button
                                            onClick={() => setSortType(prev => prev === 'minat' ? 'default' : 'minat')}
                                            title="Urutkan berdasarkan minat tertinggi"
                                            className={`p-2.5 rounded-full transition-colors duration-200 ${sortType === 'minat' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                        >
                                            <Heart size={18} />
                                        </button>
                                        <button
                                            onClick={() => setSortType(prev => prev === 'nilai' ? 'default' : 'nilai')}
                                            title="Urutkan berdasarkan total nilai tertinggi"
                                            className={`p-2.5 rounded-full transition-colors duration-200 ${sortType === 'nilai' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                        >
                                            <Trophy size={18} />
                                        </button>
                                        <div className="relative w-full sm:w-auto flex-grow" style={{...glassmorphismStyle, borderRadius: '9999px'}}>
                                            <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors border-none rounded-full" />
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        </div>
                                    </div>
                                </div>
                                {loadingPendaftar ? (
                                    <div className="flex justify-center items-center py-8"><LoaderCircle className="animate-spin h-8 w-8 text-amber-400" /><span className="ml-3 text-gray-300">Memuat data pendaftar...</span></div>
                                ) : filteredPendaftar.length > 0 ? (
                                    <div 
                                        className="overflow-auto rounded-lg border border-gray-700 shadow-inner transition-all duration-300 ease-in-out" 
                                        style={{ maxHeight: expandedRows.size > 0 ? '80vh' : '60vh' }}
                                    >
                                        <table className="min-w-full text-sm text-left">
                                            <thead className="sticky top-0 z-10 bg-gray-800">
                                                {table.getHeaderGroups().map(headerGroup => (
                                                    <tr key={headerGroup.id}>
                                                        {headerGroup.headers.map(header => (
                                                            <th 
                                                                key={header.id}
                                                                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                                                style={{ width: header.getSize() }}
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {table.getRowModel().rows.map(row => (
                                                    <tr 
                                                        key={row.id}
                                                        className={`transition-colors cursor-pointer ${getRowBgClass(row.original.status_label)}`}
                                                        onClick={() => toggleRowExpansion(row.original.id)}
                                                    >
                                                        {row.getVisibleCells().map(cell => (
                                                            <td 
                                                                key={cell.id}
                                                                className={`px-6 py-4 text-gray-300 ${expandedRows.has(row.original.id) ? 'align-top' : 'align-middle'}`}
                                                                style={{ width: cell.column.getSize() }}
                                                            >
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (<p className="text-center text-gray-400 py-8">{searchQuery ? "Tidak ada pendaftar yang cocok dengan pencarian Anda." : "Tidak ada data pendaftar untuk periode ini."}</p>)}
                            </motion.section>
                        </div>
                    </main>
                    <Footer />
                </div>
            )}
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeDelete}
                title="Konfirmasi Penghapusan"
            >
                <p>Anda yakin ingin menghapus data pendaftar ini secara permanen? Tindakan ini juga akan menghapus file CV yang terhubung.</p>
            </ConfirmationModal>

            <AnimatePresence>
                {isCvModalOpen && (<CvModal cvUrl={currentCvUrl} onClose={handleCloseCvModal} modalGlassmorphismStyle={glassmorphismStyle} />)}
            </AnimatePresence>
            
            <PenilaianModal 
                isOpen={isPenilaianModalOpen}
                onClose={handleClosePenilaianModal}
                pendaftar={selectedPendaftarForNilai}
            />
        </div>
    );
}
