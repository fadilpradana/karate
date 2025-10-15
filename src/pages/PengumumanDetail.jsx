// GANTI SELURUH ISI FILE PengumumanDetail.jsx DENGAN KODE INI

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import bg1 from '../assets/bg1.jpg';
import favicon from '../assets/logo_bintangcompress.png';
import { User, Calendar, ArrowLeft, MessageSquare, CornerDownRight, Send, Edit3, Trash2, X, AlertTriangle, FileText, ZoomIn, ZoomOut, LoaderCircle } from 'lucide-react';
import '../TiptapStyles.css';

// Impor pdf.js, sama seperti di DataPendaftar.jsx
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Helper function (tidak berubah)
const stripHtmlAndTruncate = (html, length) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    if (text.length <= length) return text;
    const truncated = text.substring(0, length);
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
};

// --- Komponen Lokal untuk Komentar (tidak berubah) ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { /* ... kode asli Anda ... */ };
const CommentForm = ({ onSubmit, placeholder, initialValue, isSubmitting, submitLabel }) => { /* ... kode asli Anda ... */ };
const Comment = ({ comment, ...props }) => { /* ... kode asli Anda ... */ };

// [FINAL] Komponen PDF Viewer Inline yang teknologinya sama persis dengan CvModal Anda
const EmbeddedPdfViewer = ({ fileUrl }) => {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const pdfDocumentRef = useRef(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [pdfError, setPdfError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);

    const renderPage = useCallback(async (pdf, pageNum, currentScale) => {
        setLoadingPdf(true);
        if (renderTaskRef.current) {
            try { renderTaskRef.current.cancel(); } 
            catch (e) { console.warn("Gagal membatalkan render task:", e); } 
            finally { renderTaskRef.current = null; }
        }
        const canvas = canvasRef.current;
        try {
            if (!canvas || !pdf) return;
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentScale });
            const context = canvas.getContext('2d');
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;
            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            const renderContext = { canvasContext: context, viewport: viewport, transform: transform };
            renderTaskRef.current = page.render(renderContext);
            await renderTaskRef.current.promise;
            renderTaskRef.current = null;
        } catch (error) {
            if (error.name !== 'RenderingCancelledException') {
                console.error('Gagal merender halaman:', error);
                setPdfError('Gagal merender halaman PDF.');
            }
        } finally {
            setLoadingPdf(false);
        }
    }, []);

    useEffect(() => {
        if (!fileUrl) return;
        setLoadingPdf(true); setPdfError(null); setCurrentPage(1); setScale(1.0);
        if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (e) { /* abaikan */ } }
        if (pdfDocumentRef.current) { pdfDocumentRef.current.destroy(); }

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        loadingTask.promise.then(pdf => {
            pdfDocumentRef.current = pdf;
            setNumPages(pdf.numPages);
        }).catch(reason => {
            console.error('Gagal memuat dokumen PDF:', reason);
            setPdfError('Gagal memuat CV. Pastikan URL valid dan file tidak rusak.');
            setLoadingPdf(false);
        });

        return () => {
            if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (e) { /* abaikan */ } }
            if (pdfDocumentRef.current) { pdfDocumentRef.current.destroy(); }
        };
    }, [fileUrl]);

    useEffect(() => {
        if (pdfDocumentRef.current && currentPage && canvasRef.current) {
            renderPage(pdfDocumentRef.current, currentPage, scale);
        }
    }, [pdfDocumentRef.current, currentPage, scale, renderPage]);

    const goToNextPage = () => { if (pdfDocumentRef.current && currentPage < numPages) setCurrentPage(p => p + 1); };
    const goToPrevPage = () => { if (pdfDocumentRef.current && currentPage > 1) setCurrentPage(p => p - 1); };
    const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
    const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.2));

    return (
        <div className="bg-gray-900/80 border border-white/20 rounded-lg p-4 flex flex-col">
            {pdfError ? (
                <div className="flex-grow flex items-center justify-center p-8 text-red-400">{pdfError}</div>
            ) : (
                <>
                    {numPages && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 pb-4 border-b border-white/20">
                            <div className="flex items-center gap-2">
                                <button onClick={zoomOut} disabled={scale <= 0.2 || loadingPdf} className="p-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50"><ZoomOut size={18} /></button>
                                <span className="text-gray-300 font-medium text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                                <button onClick={zoomIn} disabled={scale >= 3.0 || loadingPdf} className="p-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50"><ZoomIn size={18} /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={goToPrevPage} disabled={currentPage <= 1 || loadingPdf} className="px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 text-sm">Prev</button>
                                <span className="text-gray-300 text-sm">Hal {currentPage} / {numPages}</span>
                                <button onClick={goToNextPage} disabled={currentPage >= numPages || loadingPdf} className="px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 disabled:opacity-50 text-sm">Next</button>
                            </div>
                        </div>
                    )}
                    <div className="w-full flex-grow relative overflow-auto flex items-start justify-center" style={{ minHeight: '400px', maxHeight: '80vh' }}>
                        {loadingPdf && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <LoaderCircle className="animate-spin h-10 w-10 text-amber-400" />
                            </div>
                        )}
                        <canvas ref={canvasRef} className={loadingPdf ? 'opacity-0' : 'opacity-100 transition-opacity'}></canvas>
                    </div>
                </>
            )}
        </div>
    );
};


// --- KOMPONEN UTAMA ---
export default function PengumumanDetail() {
    // ... (Semua state dan fungsi di dalam PengumumanDetail tetap sama, saya sertakan lengkap di bawah)
    const { id } = useParams();
    const navigate = useNavigate();
    const [pengumuman, setPengumuman] = useState(null);
    const [otherAnnouncements, setOtherAnnouncements] = useState([]);
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('id, username, nama_lengkap, avatar_url').eq('id', session.user.id).single();
                setUser(profile);
            } else {
                setUser(null);
            }
        };
        checkUser();
        const { data: authListener } = supabase.auth.onAuthStateChange(() => { checkUser(); });
        return () => { authListener.subscription.unsubscribe(); };
    }, []);

    const fetchComments = useCallback(async () => {
        if (!id) return;
        const { data, error } = await supabase.from('komentar_pengumuman').select(`*, profiles:user_id (id, username, nama_lengkap, avatar_url)`).eq('pengumuman_id', id).order('created_at', { ascending: true });
        if (error) {
            console.error("Error fetching comments:", error);
        } else {
            const commentsById = {};
            data.forEach(comment => { commentsById[comment.id] = { ...comment, replies: [] }; });
            const nestedComments = [];
            data.forEach(comment => {
                if (comment.parent_id && commentsById[comment.parent_id]) {
                    commentsById[comment.parent_id].replies.push(commentsById[comment.id]);
                } else {
                    nestedComments.push(commentsById[comment.id]);
                }
            });
            setComments(nestedComments);
        }
    }, [id]);

    useEffect(() => {
        const fetchPengumumanData = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);

            const { data: pengumumanData, error: pengumumanError } = await supabase.from('pengumuman').select(`*, profiles!penulis_id (nama_lengkap)`).eq('id', id).single();
            if (pengumumanError) {
                console.error("Error fetching detail pengumuman:", pengumumanError);
                setError('Gagal memuat detail pengumuman.');
                setLoading(false);
                return;
            }
            setPengumuman(pengumumanData);

            const { data: otherData, error: otherError } = await supabase.from('pengumuman').select('id, judul').neq('id', id).limit(3).order('published_at', { ascending: false });
            if (otherError) console.error("Error fetching other announcements:", otherError);
            else setOtherAnnouncements(otherData);

            await fetchComments();
            setLoading(false);
        };
        fetchPengumumanData();
    }, [id, fetchComments]);

    const handleCommentSubmit = async (content, parentId = null) => {
        if (!user) { navigate('/login'); return; }
        setIsSubmitting(true);
        const { error } = await supabase.from('komentar_pengumuman').insert({ konten: content, pengumuman_id: id, user_id: user.id, parent_id: parentId });
        if (error) { console.error("Error submitting comment:", error); alert("Gagal mengirim komentar."); }
        else { await fetchComments(); setActiveReplyId(null); }
        setIsSubmitting(false);
    };

    const handleCommentUpdate = async (commentId, newContent) => {
        setIsSubmitting(true);
        const { error } = await supabase.from('komentar_pengumuman').update({ konten: newContent }).eq('id', commentId);
        if (error) { console.error('Error updating comment:', error); alert('Gagal memperbarui komentar.'); }
        else { await fetchComments(); }
        setIsSubmitting(false);
    };

    const handleCommentDelete = async () => {
        if (!deletingCommentId) return;
        const { error } = await supabase.from('komentar_pengumuman').delete().eq('id', deletingCommentId);
        if (error) { console.error('Error deleting comment:', error); alert('Gagal menghapus komentar.'); }
        else { await fetchComments(); }
        setDeletingCommentId(null);
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}><div className="absolute inset-0 bg-black opacity-70"></div><div className="relative z-10 text-lg">Memuat pengumuman...</div></div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}><div className="absolute inset-0 bg-black opacity-70"></div><div className="relative z-10 text-lg text-red-400">{error}</div></div>;
    if (!pengumuman) return <div className="flex justify-center items-center min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}><div className="absolute inset-0 bg-black opacity-70"></div><div className="relative z-10 text-lg">Pengumuman tidak ditemukan.</div></div>;

    const metaDescription = stripHtmlAndTruncate(pengumuman.konten, 160);

    return (
        <div className="relative min-h-screen text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg1})` }}>
            <Helmet>
                <title>{`${pengumuman.judul} - STMKG Karate Club`}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={`${pengumuman.judul}, pengumuman, karate, STMKG, ${pengumuman.profiles?.nama_lengkap || 'Admin'}`} />
                <meta property="og:title" content={`${pengumuman.judul} - STMKG Karate Club`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={`https://karate.stmkg.ac.id/pengumuman/${pengumuman.id}`} />
                <meta property="og:type" content="article" />
                <link rel="icon" href={favicon} /><link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
                <meta name="author" content={pengumuman.profiles?.nama_lengkap || 'STMKG Karate Club'} />
                <link rel="canonical" href={`https://karate.stmkg.ac.id/pengumuman/${pengumuman.id}`} />
            </Helmet>

            <ConfirmationModal isOpen={!!deletingCommentId} onClose={() => setDeletingCommentId(null)} onConfirm={handleCommentDelete} title="Hapus Komentar" message="Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat diurungkan." />
            <AnimatePresence>
                {viewingImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingImage(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.img layoutId={viewingImage} src={viewingImage} alt="Tampilan foto profil" className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} />
                        <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => setViewingImage(null)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"><X size={24} /></motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-grow px-4 md:px-12 pt-28 pb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut", duration: 0.6 }} className="max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
                            <Link to="/pengumuman" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm sm:text-base"><ArrowLeft size={16} /> Kembali ke semua pengumuman</Link>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-[#FF9F1C]">{pengumuman.judul}</h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 mt-4 mb-8 border-y border-white/10 py-4">
                                <div className="flex items-center gap-2"><User size={16} /><span>Ditulis oleh <span className="font-semibold text-white">{pengumuman.profiles?.nama_lengkap || 'Admin'}</span></span></div>
                                <div className="flex items-center gap-2"><Calendar size={16} /><span>{new Date(pengumuman.published_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                            </div>
                            <div className="tiptap text-gray-200" dangerouslySetInnerHTML={{ __html: pengumuman.konten }} />
                        </div>

                        {pengumuman.pdf_url && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mt-12 shadow-lg">
                                <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                                    <FileText /> Lampiran Dokumen
                                </h2>
                                <EmbeddedPdfViewer fileUrl={pengumuman.pdf_url} />
                            </div>
                        )}

                        <div className="mt-16 border-t-2 border-white/10 pt-8">
                            <div id="komentar" className="mb-16">
                                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4"><MessageSquare /> Komentar ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})</h2>
                                {user ? <CommentForm onSubmit={(content) => handleCommentSubmit(content)} isSubmitting={isSubmitting} /> : <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center text-gray-300"><Link to="/login" className="font-bold text-[#FF9F1C] hover:underline">Masuk</Link> untuk meninggalkan komentar.</div>}
                                <div className="mt-6">
                                    {comments.map(comment => <Comment key={comment.id} comment={comment} onReply={setActiveReplyId} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} onReplySubmit={handleCommentSubmit} user={user} isSubmitting={isSubmitting} onUpdate={handleCommentUpdate} onDeleteRequest={setDeletingCommentId} onViewImage={setViewingImage} />)}
                                    {comments.length === 0 && !loading && <p className="text-gray-400 text-center mt-8">Jadilah yang pertama berkomentar!</p>}
                                </div>
                            </div>

                            {otherAnnouncements.length > 0 && (
                                <div className="mb-16">
                                    <h2 className="text-2xl font-bold mb-6">Pengumuman Lainnya</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {otherAnnouncements.map(item => (
                                            <Link to={`/pengumuman/${item.id}`} key={item.id} className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl overflow-hidden group p-4">
                                                <h3 className="font-bold text-white group-hover:text-[#FF9F1C] transition-colors">{item.judul}</h3>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <Link to="/pengumuman" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"><ArrowLeft size={16} /> Kembali ke semua pengumuman</Link>
                            </div>
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        </div>
    );
}