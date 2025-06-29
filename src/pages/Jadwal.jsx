import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useInView } from "framer-motion";

// Import brevetLogo untuk footer
import brevetLogo from "../assets/brevet.png"; 

// Pastikan ini mengimpor index.css Anda dengan benar
import '../index.css'; 

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
    borderRadius: '0.8rem', // Dikecilkan sedikit
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
      // Perubahan di sini: Menggunakan kelas background khusus untuk Jadwal
      className="min-h-screen text-white overflow-x-hidden flex flex-col jadwal-background-mobile md:jadwal-background-desktop" 
    >
      {/* Bagian Detail Jadwal */}
      <section
        ref={jadwalRef} // Pasang ref di sini
        className="pt-24 pb-16 px-4 md:px-16 text-center flex-grow flex flex-col justify-center items-center relative z-20" // Z-index 20 agar di atas overlay (z-index 1)
      >
        <motion.h2
          className="text-2xl md:text-6xl font-league font-semibold uppercase tracking-wide mb-10 text-accent" 
          variants={sectionTitleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          viewport={{ once: true, amount: 0.5 }}
        >
          Waktu Latihan Reguler & Khusus
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full"> 
          {/* Card Latihan Reguler */}
          <motion.div
            className="p-6 rounded-xl text-center flex flex-col items-center justify-between" 
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...cardVariants.visible.transition, delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-3xl md:text-4xl font-league uppercase text-white mb-3">Latihan Rutin</h3> 
            <p className="text-sm md:text-base font-[Montserrat] text-[#a7a7a7] mb-5"> 
              Latihan teknik dasar dan fisik untuk Taruna/i tahun pertama.
            </p>
            <div className="text-white text-2xl md:text-3xl font-bold font-[Montserrat] mb-3"> 
              <p className="battery-style-gradient">Setiap Sabtu Pagi</p> {/* Ini tetap gradien */}
              <p className="text-lg md:text-xl font-[Montserrat] font-light">07.00 - 09.30 WIB</p> 
            </div>
            <Link
              to="/kontak" // PERUBAHAN: Mengarahkan ke halaman kontak
              className="inline-block mt-3 px-5 py-1.5 font-semibold rounded-lg text-xs md:text-sm" 
              style={{
                ...glassmorphismStyle,
                borderRadius: '0.6rem', 
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
              Hubungi Pengurus {/* PERUBAHAN: Teks tombol */}
            </Link>
          </motion.div>

          {/* Card Latihan Khusus BDT */}
          <motion.div
            className="p-6 rounded-xl text-center flex flex-col items-center justify-between" 
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...cardVariants.visible.transition, delay: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-3xl md:text-4xl font-league uppercase text-white mb-3">Latihan Khusus</h3> 
            <p className="text-sm md:text-base font-[Montserrat] text-[#a7a7a7] mb-5"> 
              Bela Diri Taruna (BDT) fokus pada aplikasi praktis pertarungan.
            </p>
            <div className="text-white text-2xl md:text-3xl font-bold font-[Montserrat] mb-3"> 
              <p className="battery-style-gradient">Setiap Senin Sore</p> {/* Ini tetap gradien */}
              <p className="text-lg md:text-xl font-[Montserrat] font-light">16.00 - 17.45 WIB</p> 
            </div>
            <Link
              to="/kontak"
              className="inline-block mt-3 px-5 py-1.5 font-semibold rounded-lg text-xs md:text-sm" 
              style={{
                ...glassmorphismStyle,
                borderRadius: '0.6rem', 
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
          className="mt-12 text-xs text-gray-500 max-w-xl mx-auto" 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          *Jadwal dapat berubah sewaktu-waktu. Informasi perubahan akan diumumkan melalui kanal resmi klub.
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-sm py-10 px-6 md:px-20 border-t border-[#333]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Kiri: Teks */}
          <div className="text-center md:text-left w-full md:w-1/3">
            &copy; With Love STMKG Karate Club Periode 2025
          </div>

          {/* Tengah: Logo selalu di tengah */}
          <div className="w-full md:w-1/3 flex justify-center">
            <img src={brevetLogo} alt="Logo Brevet" className="h-5" />
          </div>

          {/* Kanan: Link navigasi */}
          <div className="flex flex-wrap justify-center md:justify-end gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3">
            <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
            <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
            <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
            <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
          </div>

        </div>
      </footer>

    </motion.main>
  );
}