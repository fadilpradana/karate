import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useInView } from "framer-motion";

// Import brevetLogo untuk footer
import brevetLogo from "../assets/brevet.png"; 

export default function Jadwal() {
  // Varian untuk animasi masuk elemen
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

  const sectionTitleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  // Gaya untuk efek glassmorphism pada card dan button
  const glassmorphismStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
      0px 4px 10px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '1rem', // Untuk konsistensi dengan photoFrameContainerBaseStyle
    transition: 'all 0.3s ease-in-out',
  };

  const glassmorphismHoverStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    e.currentTarget.style.boxShadow = `
      0px 2px 5px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.4)
    `;
  };

  const glassmorphismLeaveStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    e.currentTarget.style.boxShadow = `
      0px 4px 10px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `;
  };

  // Ref untuk mendeteksi saat section masuk viewport
  const jadwalRef = useRef(null);
  const isInView = useInView(jadwalRef, { once: true, amount: 0.3 }); // Trigger sekali saat 30% section terlihat

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0E0004] min-h-screen text-white overflow-x-hidden"
    >
      {/* Hero Section untuk Jadwal */}
      <section
        className="relative h-screen flex items-center justify-center text-center px-6"
        style={{
          // Menggunakan warna solid hitam #000000 sebagai background
          backgroundColor: '#000000', 
          backgroundSize: "cover", // Tetap pertahankan ini jika suatu saat mau ganti gambar
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />
        <div className="relative z-20">
          <motion.h1
            className="text-5xl md:text-8xl font-league uppercase leading-tight tracking-widest glow-text-accent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Jadwal Latihan
          </motion.h1>
          <motion.p
            className="mt-4 text-lg md:text-xl font-[Montserrat] font-light text-[#E7E7E7]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Disiplin waktu, disiplin diri.
          </motion.p>
        </div>
      </section>

      {/* Bagian Detail Jadwal */}
      <section
        ref={jadwalRef} // Pasang ref di sini
        className="py-20 px-6 md:px-20 text-center"
      >
        <motion.h2
          className="text-3xl md:text-7xl font-league font-semibold uppercase tracking-wide mb-12 text-accent"
          variants={sectionTitleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          viewport={{ once: true, amount: 0.5 }}
        >
          Waktu Latihan Reguler & Khusus
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Card Latihan Reguler */}
          <motion.div
            className="p-8 rounded-2xl text-center flex flex-col items-center justify-between"
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...cardVariants.visible.transition, delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-4xl md:text-5xl font-league uppercase text-white mb-4">Latihan Rutin</h3>
            <p className="text-base md:text-lg font-[Montserrat] text-[#a7a7a7] mb-6">
              Latihan fisik dan teknik dasar untuk semua anggota.
            </p>
            <div className="text-white text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">
              <p>Setiap Sabtu Pagi</p>
              <p className="text-xl md:text-2xl font-[Montserrat] font-light">07.00 - 09.30 WIB</p>
            </div>
            <Link
              to="/pendaftaran"
              className="inline-block mt-4 px-6 py-2 font-semibold rounded-xl text-sm md:text-base"
              style={{
                ...glassmorphismStyle,
                borderRadius: '0.75rem', // Lebih kecil untuk tombol
                boxShadow: `
                  0px 2px 5px rgba(0, 0, 0, 0.2),
                  inset 1px 1px 2px rgba(255, 255, 255, 0.13),
                  inset -1px -1px 2px rgba(0, 0, 0, 0.25)
                `,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Daftar Sekarang
            </Link>
          </motion.div>

          {/* Card Latihan Khusus BDT */}
          <motion.div
            className="p-8 rounded-2xl text-center flex flex-col items-center justify-between"
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...cardVariants.visible.transition, delay: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-4xl md:text-5xl font-league uppercase text-white mb-4">Latihan Khusus BDT</h3>
            <p className="text-base md:text-lg font-[Montserrat] text-[#a7a7a7] mb-6">
              Bela Diri Taruna (BDT) fokus pada aplikasi praktis dan kecepatan.
            </p>
            <div className="text-white text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">
              <p>Setiap Senin Sore</p>
              <p className="text-xl md:text-2xl font-[Montserrat] font-light">16.00 - 17.45 WIB</p>
            </div>
            <Link
              to="/kontak"
              className="inline-block mt-4 px-6 py-2 font-semibold rounded-xl text-sm md:text-base"
              style={{
                ...glassmorphismStyle,
                borderRadius: '0.75rem', // Lebih kecil untuk tombol
                boxShadow: `
                  0px 2px 5px rgba(0, 0, 0, 0.2),
                  inset 1px 1px 2px rgba(255, 255, 255, 0.13),
                  inset -1px -1px 2px rgba(0, 0, 0, 0.25)
                `,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Hubungi Pengurus
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="mt-16 text-sm text-gray-500 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          *Jadwal dapat berubah sewaktu-waktu. Informasi perubahan akan diumumkan melalui kanal resmi klub.
        </motion.p>
      </section>

      {/* Footer (Copy dari Home.jsx untuk konsistensi) */}
      <footer className="relative z-[50] bg-[#0E0004] text-[#E7E7E7] text-sm py-10 px-6 md:px-20 border-t border-[#333]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">&copy; With Love STMKG Karate Club Periode 2025</div>
          <div className="flex justify-center w-full">
            <img src={brevetLogo} alt="Logo Brevet" className="h-5" />
          </div>
          <div className="flex gap-4 font-[Montserrat] font-light text-center md:text-right">
            <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
            <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
            <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
            <Link to="/berita" className="hover:text-[#FF9F1C]">Berita</Link>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}