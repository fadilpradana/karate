// src/pages/Home.jsx
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Import Supabase client Anda

// Import komponen PrestasiCard yang baru
import PrestasiCard from '../components/PrestasiCard';

// --- Import Aset ---
import heroVideo from "../assets/hero.mp4";
import ctaBackground from "../assets/background1.jpg";
import Footer from '../components/Footer';
import totalMedalsBackground from "../assets/bg-total-medali.jpg";
// ------------------

const mainTitleWords = ["Karate", "Club"];
const fullMainTitle = mainTitleWords.join(" ");

const subHeadline = "Sekolah Tinggi Meteorologi Klimatologi dan Geofisika";
const subHeadlineWords = subHeadline.split(" ");

// Custom hook for counting animation with sequential delay
const useCountingAnimation = (targetValue, delay = 0, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    let timer;
    if (isInView) {
      const initialDelayTimer = setTimeout(() => {
        let start = 0;
        const end = targetValue;
        const incrementTime = 50;
        const totalSteps = duration / incrementTime;
        const incrementAmount = (end - start) / totalSteps;

        timer = setInterval(() => {
          start += incrementAmount;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setCount(Math.round(start));
        }, incrementTime);
      }, delay);

      return () => {
        clearTimeout(initialDelayTimer);
        clearInterval(timer);
      };
    }
    return () => clearInterval(timer);
  }, [targetValue, duration, isInView, delay]);

  return [count, ref];
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [prestasiList, setPrestasiList] = useState([]);
  const [loadingPrestasi, setLoadingPrestasi] = useState(true);
  const [errorPrestasi, setErrorPrestasi] = useState(null);

  // --- State untuk Modal Form Kritik & Saran ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [saranStatus, setSaranStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const saranFormRef = useRef(null);
  // ------------------------------------------

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efek untuk mengambil data prestasi dari Supabase
  useEffect(() => {
    const fetchPrestasi = async () => {
      setLoadingPrestasi(true);
      const { data, error } = await supabase
        .from('prestasi')
        .select('id, judul, deskripsi, gambar_url, medali_emas, medali_perak, medali_perunggu, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching prestasi:", error);
        setErrorPrestasi("Gagal memuat daftar prestasi. Silakan coba lagi nanti.");
        setLoadingPrestasi(false);
      } else {
        const dataWithImageUrls = await Promise.all(data.map(async (item) => {
          let imageUrl = item.gambar_url;
          if (imageUrl) {
            const { data: publicUrlData } = supabase
                .storage
                .from('gambarprestasi')
                .getPublicUrl(imageUrl);
            imageUrl = publicUrlData ? publicUrlData.publicUrl : null;
          }
          return { ...item, gambar: imageUrl };
        }));
        setPrestasiList(dataWithImageUrls);
        setLoadingPrestasi(false);
      }
    };

    fetchPrestasi();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const ctaTextVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const ctaButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.8
      }
    }
  };
  
  const openImageModal = (src) => {
    setModalImageSrc(src);
    setShowImageModal(true);
  };

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setModalImageSrc('');
  }, []);
  
  // Menangani penutupan modal form saran dan reset state-nya
  const closeFormModal = () => {
      setShowFormModal(false);
      // Reset status setelah modal ditutup agar form kembali normal saat dibuka lagi
      setTimeout(() => {
          setSaranStatus('idle');
      }, 300); // delay untuk transisi exit
  }

  useEffect(() => {
    if (showFormModal || showImageModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFormModal, showImageModal]);

  useEffect(() => {
    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            if (showImageModal) closeImageModal();
            if (showFormModal) closeFormModal();
        }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showImageModal, showFormModal, closeImageModal]);

  const glassButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    boxShadow: `
      0px 2px 5px rgba(0, 0, 0, 0.2),
      inset 1px 1px 2px rgba(255, 255, 255, 0.13),
      inset -1px -1px 2px rgba(0, 0, 0, 0.25)
    `,
    transition: 'all 0.3s ease-in-out',
  };

  const glassButtonHoverStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    e.currentTarget.style.boxShadow = `
      0px 1px 2px rgba(0, 0, 0, 0.1),
      inset 0.5px 0.5px 1px rgba(255, 255, 255, 0.3),
      inset -0.5px -0.5px 1px rgba(0, 0, 0, 0.05)
    `;
  };

  const glassButtonLeaveStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    e.currentTarget.style.boxShadow = `
      0px 2px 5px rgba(0, 0, 0, 0.2),
      inset 1px 1px 2px rgba(255, 255, 255, 0.13),
      inset -1px -1px 2px rgba(0, 0, 0, 0.25)
    `;
  };

  const photoFrameContainerBaseStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
      0px 4px 10px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '1rem',
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    transform: 'scale(1)',
    cursor: 'pointer',
  };

  const prestasiBackgroundStyle = {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  };

  // --- FUNGSI BARU UNTUK SUBMIT FORM KRITIK & SARAN ---
  const handleSubmitSaran = async (event) => {
    event.preventDefault();
    setSaranStatus('loading');
    
    const formData = new FormData(saranFormRef.current);
    const kritik = formData.get('kritik');
    const saran = formData.get('saran');
    const pertahankan = formData.get('pertahankan');

    // Panggil Edge Function 'send-telegram-saran'
    // Pastikan Anda sudah membuat Edge Function ini di Supabase
    const { error } = await supabase.functions.invoke('send-telegram-saran', {
        body: { kritik, saran, pertahankan },
    });

    if (error) {
        console.error("Error sending suggestion:", error);
        setSaranStatus('error');
    } else {
        setSaranStatus('success');
        saranFormRef.current.reset();
    }
  };
  // ----------------------------------------------------

  // --- KALKULASI MEDALI ---
  const { totalGold: rawTotalGold, totalSilver: rawTotalSilver, totalBronze: rawTotalBronze } = prestasiList.reduce((acc, item) => {
    acc.totalGold += item.medali_emas || 0;
    acc.totalSilver += item.medali_perak || 0;
    acc.totalBronze += item.medali_perunggu || 0;
    return acc;
  }, { totalGold: 0, totalSilver: 0, totalBronze: 0 });

  const rawFinalTotalMedals = rawTotalGold + rawTotalSilver + rawTotalBronze;
  // --- AKHIR KALKULASI MEDALI ---

  const countDuration = 1000;

  const [animatedGold, goldRef] = useCountingAnimation(rawTotalGold, 0, countDuration);
  const [animatedSilver, silverRef] = useCountingAnimation(rawTotalSilver, countDuration * 0.75, countDuration);
  const [animatedBronze, bronzeRef] = useCountingAnimation(rawTotalBronze, countDuration * 1.5, countDuration);
  const [animatedTotal, totalRef] = useCountingAnimation(rawFinalTotalMedals, countDuration * 2.25, countDuration);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0E0004] min-h-screen text-white overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />

        <div className="relative z-20 text-center max-w-2xl px-6">
          <motion.p
            className="text-lg md:text-sm font-[Montserrat] font-semibold uppercase leading-tight text-white mb-2"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {subHeadlineWords.map((word, index) => (
              <motion.span
                key={index}
                variants={itemVariants}
                style={{ display: 'inline-block' }}
                className="mr-1 sm:mr-2"
              >
                {word}
                {index < subHeadlineWords.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl md:text-7xl font-league uppercase leading-tight tracking-widest glow-text-accent"
            data-text={fullMainTitle}
            style={{
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              transform: 'translateZ(0)',
            }}
          >
            {fullMainTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="mt-4 text-lg font-[Montserrat] font-light text-[#E7E7E7]"
          >
            Train the body. Sharpen the mind. Honor the way.
          </motion.p>
          <Link
            to="/jadwal"
            className="inline-block mt-8 px-8 py-3 font-semibold rounded-2xl shadow-xl transition-all duration-300 ease-in-out"
            style={glassButtonStyle}
            onMouseEnter={glassButtonHoverStyle}
            onMouseLeave={glassButtonLeaveStyle}
          >
            Latihan Sekarang
          </Link>
        </div>
      </section>

      {/* Daftar Prestasi */}
      <section
        className="relative overflow-hidden py-20 px-6 md:px-20 shadow-inner"
        style={prestasiBackgroundStyle}
      >
        <h2 className="text-3xl md:text-7xl font-league font-semibold uppercase tracking-wide mb-12 relative z-10 text-accent text-center">
          Daftar Prestasi
        </h2>

        {loadingPrestasi && (
          <p className="text-center text-xl font-[Montserrat] text-[#a7a7a7]">Memuat prestasi...</p>
        )}

        {errorPrestasi && (
          <p className="text-center text-red-500 text-xl font-[Montserrat]">{errorPrestasi}</p>
        )}

        {!loadingPrestasi && !errorPrestasi && prestasiList.length === 0 && (
          <p className="text-center text-xl font-[Montserrat] text-[#a7a7a7]">Belum ada prestasi yang ditambahkan.</p>
        )}

        <div className="relative z-10">
          {prestasiList.map((item, index) => (
            <PrestasiCard
              key={item.id}
              item={item}
              index={index}
              isMobile={isMobile}
              openImageModal={openImageModal}
              isLastItem={index === prestasiList.length - 1}
            />
          ))}
        </div>
        <p className="mt-16 text-xs text-gray-500 relative z-10 text-center">
          *Mohon maaf atas keterbatasan dokumentasi gambar pada beberapa prestasi. Jika memiliki dokumentasi terkait prestasi ini, mohon kontak pengembang website.
        </p>
      </section>

      {/* Bagian Total Medali */}
      <section
        className="relative z-[40] py-20 px-6 md:px-20 text-center"
        style={{
          backgroundImage: `url('${totalMedalsBackground}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: '#0E0004'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-90"></div>

        <h2 className="relative z-10 text-3xl md:text-7xl font-league uppercase text-center mb-12">
          TOTAL MEDALI
        </h2>
        <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-10">
          <motion.div
            ref={goldRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center p-6 rounded-lg"
            style={glassButtonStyle}
          >
            <span className="text-6xl md:text-8xl font-bold text-yellow-400" role="img" aria-label="Gold Medal">&#x1F3C5;</span>
            <p className="mt-2 text-4xl md:text-6xl font-league">{animatedGold}</p>
            <p className="font-[Montserrat] font-semibold text-lg md:text-xl">Emas</p>
          </motion.div>

          <motion.div
            ref={silverRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center p-6 rounded-lg"
            style={glassButtonStyle}
          >
            <span className="text-6xl md:text-8xl font-bold text-gray-400" role="img" aria-label="Silver Medal">&#x1F948;</span>
            <p className="mt-2 text-4xl md:text-6xl font-league">{animatedSilver}</p>
            <p className="font-[Montserrat] font-semibold text-lg md:text-xl">Perak</p>
          </motion.div>

          <motion.div
            ref={bronzeRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center p-6 rounded-lg"
            style={glassButtonStyle}
          >
            <span className="text-6xl md:text-8xl font-bold text-orange-700" role="img" aria-label="Bronze Medal">&#x1F949;</span>
            <p className="mt-2 text-4xl md:text-6xl font-league">{animatedBronze}</p>
            <p className="font-[Montserrat] font-semibold text-lg md:text-xl">Perunggu</p>
          </motion.div>

          <motion.div
            ref={totalRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center p-6 rounded-lg"
            style={glassButtonStyle}
          >
            <span className="text-6xl md:text-8xl font-bold text-white" role="img" aria-label="Trophy">&#x1F3C6;</span>
            <p className="mt-2 text-4xl md:text-6xl font-league">{animatedTotal}</p>
            <p className="font-[Montserrat] font-semibold text-lg md:text-xl">Total</p>
          </motion.div>
        </div>
      </section>

      {/* Bagian Kritik dan Saran */}
      <section
        className="py-20 text-center text-[#E7E7E7] px-6 relative"
        style={{
          backgroundImage: `url('${ctaBackground}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 text-center">
          <motion.h2
            variants={ctaTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-7xl font-league uppercase text-accent"
          >
            Suara Sang Ksatria
          </motion.h2>
          <motion.h2
            variants={ctaTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-league uppercase text-accent"
          >
            Untuk Kemajuan Bersama
          </motion.h2>
          <motion.p
            variants={ctaTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.4 }}
            className="mt-4 font-[Montserrat] font-light max-w-4xl mx-auto text-justify"
          >
            Jiwa ksatria sejati tak gentar menghadapi tantangan, bahkan dari diri sendiri. Kami menjunjung tinggi semangat kaizen (perbaikan berkelanjutan). Untuk itu, kami membuka borang ini bagi setiap suara kejujuran dan keberanian. Sampaikan kritik dan saran membangun Anda, agar setiap gerakan dan langkah STMKG Karate Club semakin kokoh, seimbang, dan mengarah pada kesempurnaan.
          </motion.p>
          <motion.button
            onClick={() => setShowFormModal(true)}
            variants={ctaButtonVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="mt-6 inline-block px-8 py-3 font-semibold rounded-2xl shadow relative z-10 transition-all duration-300 ease-in-out"
            style={glassButtonStyle}
            onMouseEnter={glassButtonHoverStyle}
            onMouseLeave={glassButtonLeaveStyle}
          >
            Persembahkan Kritik dan Saranmu
          </motion.button>
        </div>
      </section>

      <Footer />

      {/* MODAL KRITIK & SARAN (DENGAN PERUBAHAN) */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"
            // onClick={closeFormModal} DIHAPUS agar tidak tertutup saat klik luar
          >
            <motion.div
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-lg shadow-xl w-full max-w-md"
              style={{
                backgroundColor: 'rgba(17, 24, 39, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-white">
                    <h3 className="text-xl md:text-2xl font-league uppercase text-accent">Suara Ksatria</h3>
                    <p className="text-sm text-gray-300 font-light mt-1">Sampaikan masukan Anda! Kami percaya setiap kritik adalah jalan menuju perbaikan.</p>
                  </div>
                  <button
                    onClick={closeFormModal}
                    className="text-gray-400 hover:text-white z-10 p-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Tutup Formulir"
                  >
                    <X size={24} />
                  </button>
                </div>

                {saranStatus === 'success' ? (
                    <div className="text-center py-10 px-4">
                        <p className="text-2xl mb-2">🎉</p>
                        <h4 className="text-xl font-semibold text-green-400">Terima Kasih!</h4>
                        <p className="text-gray-300 mt-2">Masukan Anda telah kami terima. Kontribusi Anda sangat berarti bagi kami.</p>
                        <button 
                            onClick={closeFormModal} 
                            className="mt-6 text-green-400 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                            style={glassButtonStyle} 
                            onMouseEnter={glassButtonHoverStyle} 
                            onMouseLeave={glassButtonLeaveStyle}
                        >
                            Tutup
                        </button>
                    </div>
                ) : (
                    <form ref={saranFormRef} onSubmit={handleSubmitSaran} className="space-y-4">
                        <div>
                            <label htmlFor="kritik" className="block text-sm font-medium text-gray-300 mb-1">Kritik</label>
                            <textarea id="kritik" name="kritik" rows="3" required className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-500 text-white placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="saran" className="block text-sm font-medium text-gray-300 mb-1">Saran</label>
                            <textarea id="saran" name="saran" rows="3" required className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-500 text-white placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="pertahankan" className="block text-sm font-medium text-gray-300 mb-1">Apa yang sudah berjalan dengan baik dan perlu dipertahankan?</label>
                            <textarea id="pertahankan" name="pertahankan" rows="3" required className="w-full p-2.5 rounded-lg bg-gray-900/50 border border-gray-500 text-white placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 text-sm"></textarea>
                        </div>

                        {saranStatus === 'error' && (
                            <p className="text-sm text-red-500 text-center">Gagal mengirim masukan. Mohon coba lagi.</p>
                        )}

                        <div className="pt-2 text-right">
                            <button type="submit" disabled={saranStatus === 'loading'} className="text-accent font-semibold py-2 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" style={glassButtonStyle} onMouseEnter={glassButtonHoverStyle} onMouseLeave={glassButtonLeaveStyle}>
                                {saranStatus === 'loading' ? 'Mengirim...' : 'Kirim Masukan'}
                            </button>
                        </div>
                    </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Gambar Prestasi */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-8 z-[110]"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-full max-h-full overflow-hidden rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={photoFrameContainerBaseStyle}
                className="p-4"
              >
                <img
                  src={modalImageSrc}
                  alt="Detail Prestasi"
                  className="block object-contain rounded-xl"
                  style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '0.75rem' }}
                  loading="lazy"
                />
              </div>
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                aria-label="Tutup Gambar"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.main>
  );
}