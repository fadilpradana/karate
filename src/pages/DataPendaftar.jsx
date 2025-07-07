import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoaderCircle, ServerCrash, CalendarCheck, UserRoundCheck, ChevronLeft, Settings, UserPlus, X, ZoomIn, ZoomOut, Search, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

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


// Komponen Modal Konfirmasi
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


// Komponen Modal CV
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

// Komponen untuk teks yang bisa diperluas
const ExpandableText = ({ text, isExpanded }) => {
    const textClasses = isExpanded ? "" : "line-clamp-3";
    return <p className={textClasses}>{text || 'N/A'}</p>;
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

    const fetchDaftarPeriode = useCallback(async () => {
        setLoading(true); setError(null);
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
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPendaftarByPeriode = useCallback(async (periodeId) => {
        if (!periodeId) { setDataPendaftar([]); return; }
        setLoadingPendaftar(true); setError(null);
        try {
            const { data, error } = await supabase.from('data_pendaftar').select(`id, id_pengguna, dibuat_pada, data_isian, profiles:id_pengguna (nama_lengkap, npt, kelas, angkatan, nomor_telepon)`).eq('id_periode', periodeId).order('dibuat_pada', { ascending: true });
            if (error) throw error;
            if (data) {
                const processedData = data.map(pendaftar => {
                    const isian = pendaftar.data_isian && typeof pendaftar.data_isian === 'object' ? pendaftar.data_isian : {};
                    return { ...pendaftar, tanggal_daftar: pendaftar.dibuat_pada, cv_url: isian.cv_url || 'N/A', alasan_minat: isian.alasan_minat || 'N/A', sepuluh_calon: isian.sepuluh_calon || 'N/A', persentase_minat: isian.persentase_minat || 'N/A', pengalaman_organisasi: isian.pengalaman_organisasi || 'N/A', pengalaman_kepanitiaan: isian.pengalaman_kepanitiaan || 'N/A' };
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

    const handleHapusPendaftar = (pendaftarId) => {
        setPendaftarToDelete(pendaftarId);
        setIsConfirmModalOpen(true);
    };

    // --- FUNGSI HAPUS YANG DIPERBARUI ---
    const executeDelete = async () => {
        if (!pendaftarToDelete) return;

        // **PENTING**: Sesuaikan nama bucket dengan yang ada di Supabase Anda
        const BUCKET_NAME = 'cvpendaftar';

        const pendaftarData = dataPendaftar.find(p => p.id === pendaftarToDelete);
        const cvUrl = pendaftarData?.cv_url;

        let filePath = null;
        if (cvUrl && cvUrl !== 'N/A' && cvUrl.includes(`/${BUCKET_NAME}/`)) {
            filePath = cvUrl.split(`/${BUCKET_NAME}/`)[1];
        }

        console.log("Mencoba menghapus pendaftar ID:", pendaftarToDelete);
        console.log("URL CV:", cvUrl);
        console.log("Path file yang diekstrak:", filePath);

        try {
            // Hapus data dari database
            const { error: dbError } = await supabase
                .from('data_pendaftar')
                .delete()
                .eq('id', pendaftarToDelete);

            if (dbError) {
                throw new Error(`Gagal menghapus data dari database: ${dbError.message}`);
            }

            console.log("Data pendaftar berhasil dihapus dari database.");

            // Jika ada path file, hapus dari storage
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([filePath]);

                if (storageError) {
                    // Meskipun file gagal dihapus, data di database sudah terhapus.
                    // Ini tetap dianggap "berhasil" dari sisi data, namun kita beri peringatan.
                    console.warn(`Data pendaftar terhapus, tetapi gagal menghapus file dari storage: ${storageError.message}`);
                    alert(`Peringatan: Gagal menghapus file CV dari storage. Error: ${storageError.message}. Silakan cek RLS Storage Anda.`);
                } else {
                    console.log("File CV berhasil dihapus dari storage.");
                }
            }
            
            // Update UI
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
                fetchDaftarPeriode();
            }
        }
    }, [authLoading, role, navigate, fetchDaftarPeriode]);

    useEffect(() => {
        if (!authLoading && ['admin', 'pengurus'].includes(role) && selectedPeriodeId) {
            fetchPendaftarByPeriode(selectedPeriodeId);
        }
    }, [selectedPeriodeId, authLoading, role, fetchPendaftarByPeriode]);

    const handleLihatCv = (e, url) => {
        e.stopPropagation();
        setCurrentCvUrl(url);
        setIsCvModalOpen(true);
    };
    const handleCloseCvModal = () => { setIsCvModalOpen(false); setCurrentCvUrl(''); };

    const filteredPendaftar = useMemo(() => {
        if (!searchQuery) return dataPendaftar;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return dataPendaftar.filter(pendaftar => {
            const profile = pendaftar.profiles || {};
            const cvData = pendaftar;
            const searchableFields = [profile.nama_lengkap, profile.npt, profile.kelas, profile.angkatan, profile.nomor_telepon, cvData.alasan_minat, cvData.pengalaman_organisasi, cvData.pengalaman_kepanitiaan, cvData.sepuluh_calon, String(new Date(pendaftar.tanggal_daftar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }))];
            return searchableFields.some(field => field && String(field).toLowerCase().includes(lowerCaseQuery));
        });
    }, [dataPendaftar, searchQuery]);

    if (authLoading || loading) {
        return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><LoaderCircle className="animate-spin h-10 w-10 text-amber-400" /></div>;
    }
    if (error) {
        return <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-center p-4"><ServerCrash className="h-16 w-16 text-red-500" /><h1 className="text-3xl font-bold text-red-400 mt-4">Terjadi Kesalahan</h1><p className="text-gray-300 mt-2">{error}</p></div>;
    }

    return (
        <div className="relative min-h-screen text-white">
            <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}><div className="absolute inset-0 bg-black/50 backdrop-brightness-30"></div></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow pt-24 pb-12">

                    {role && ['admin', 'pengurus'].includes(role) && (
                        <>
                            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="block md:hidden mb-8 p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg mx-auto w-fit">
                                <nav className="flex space-x-4 justify-center">
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Kembali ke Struktur Pengurus"><ChevronLeft size={20} /></Link>

                                    {role === 'admin' && (
                                        <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200" title="Admin Pendaftaran"><UserPlus size={20} /></Link>
                                    )}
                                </nav>
                            </motion.div>
                            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }} className="fixed left-4 top-1/2 -translate-y-1/2 flex-col items-center p-2 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg z-20 hidden md:flex">
                                <nav className="space-y-3">
                                    <Link to="/pengurus" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Kembali ke Struktur Pengurus"><ChevronLeft size={20} /></Link>

                                    {role === 'admin' && (
                                        <Link to="/admin-pendaftaran" className="p-1.5 rounded-full text-gray-300 hover:bg-[#FF9F1C] hover:text-white transition-colors duration-200 block" title="Admin Pendaftaran"><UserPlus size={20} /></Link>
                                    )}
                                </nav>
                            </motion.div>
                        </>
                    )}

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 space-y-8">
                        <div className="text-center">
                            <motion.h1 variants={titleVariants} initial="hidden" animate="visible" className="text-4xl md:text-6xl font-league uppercase text-amber-400 mb-2 drop-shadow-lg">Data Pendaftar</motion.h1>
                            <motion.p variants={subtitleVariants} initial="hidden" animate="visible" className="text-gray-300 drop-shadow-md">Lihat dan kelola data pendaftar berdasarkan periode.</motion.p>
                        </div>
                        <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                            <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold mb-4 flex items-center gap-3"><CalendarCheck className="text-amber-400" />Pilih Periode Pendaftaran</motion.h2>
                            <div className="flex flex-col gap-4">
                                <label htmlFor="periode-select" className="block text-sm font-medium text-gray-300">Periode Tahun Angkatan:</label>
                                <select id="periode-select" value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-white focus:ring-amber-500 focus:border-amber-500 transition-colors">
                                    {daftarPeriode.length > 0 ? (
                                        daftarPeriode.map((periode) => (<option key={periode.id} value={periode.id}>{periode.nama_periode} (Angkatan Tahun: {periode.tahun_angkatan})</option>))
                                    ) : (<option value="" disabled>Tidak ada periode pendaftaran tersedia</option>)}
                                </select>
                            </div>
                        </motion.section>
                        <motion.section className="p-6 shadow-lg" style={glassmorphismStyle} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                <motion.h2 variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="text-2xl font-semibold flex items-center gap-3 mb-4 sm:mb-0"><UserRoundCheck className="text-amber-400" />Daftar Pendaftar</motion.h2>
                                <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3 rounded-full" style={{...glassmorphismStyle, borderRadius: '9999px'}}>
                                    <input type="text" placeholder="Cari pendaftar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors border-none rounded-full" />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>
                            {loadingPendaftar ? (
                                <div className="flex justify-center items-center py-8"><LoaderCircle className="animate-spin h-8 w-8 text-amber-400" /><span className="ml-3 text-gray-300">Memuat data pendaftar...</span></div>
                            ) : filteredPendaftar.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-inner">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NPT</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kelas / Angkatan</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">No. Telepon</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CV</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Minat (%)</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alasan Minat</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pengalaman Organisasi</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pengalaman Kepanitiaan</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">10 Calon</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tanggal Daftar</th>
                                                {role === 'admin' && (
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredPendaftar.map((pendaftar) => (
                                                <tr key={pendaftar.id} className="hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => toggleRowExpansion(pendaftar.id)}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{pendaftar.profiles?.nama_lengkap || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pendaftar.profiles?.npt || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${pendaftar.profiles?.kelas || 'N/A'} / ${pendaftar.profiles?.angkatan || 'N/A'}`}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pendaftar.profiles?.nomor_telepon || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {pendaftar.cv_url && pendaftar.cv_url !== 'N/A' ? (<button onClick={(e) => handleLihatCv(e, pendaftar.cv_url)} className="text-blue-300 hover:text-blue-200 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Lihat CV</button>) : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${pendaftar.persentase_minat || 'N/A'}%`}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs whitespace-normal"><ExpandableText text={pendaftar.alasan_minat} isExpanded={expandedRows.has(pendaftar.id)} /></td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs whitespace-normal"><ExpandableText text={pendaftar.pengalaman_organisasi} isExpanded={expandedRows.has(pendaftar.id)} /></td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs whitespace-normal"><ExpandableText text={pendaftar.pengalaman_kepanitiaan} isExpanded={expandedRows.has(pendaftar.id)} /></td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs whitespace-normal"><ExpandableText text={pendaftar.sepuluh_calon} isExpanded={expandedRows.has(pendaftar.id)} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(pendaftar.tanggal_daftar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                    {role === 'admin' && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleHapusPendaftar(pendaftar.id);
                                                                }}
                                                                className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200"
                                                                title="Hapus Pendaftar"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    )}
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
        </div>
    );
}