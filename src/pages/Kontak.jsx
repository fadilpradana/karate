import { Mail, MapPin, Phone, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import brevetLogo from "../assets/brevet.png";
import { Link } from "react-router-dom";

export default function Kontak() {
  const [sukses, setSukses] = useState(false);
  const formRef = useRef(null);

  // Varian animasi untuk elemen
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
    borderRadius: '0.8rem',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const response = await fetch("https://formspree.io/f/meokrapw", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    if (response.ok) {
      setSukses(true);
      formRef.current.reset();
    } else {
      alert("Gagal mengirim pesan. Coba lagi nanti.");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // Terapkan kelas CSS kustom di sini
      className="min-h-screen text-white overflow-x-hidden flex flex-col background-mobile md:background-desktop"
    >
      <section className="pt-24 pb-16 px-4 md:px-16 text-center flex-grow flex flex-col justify-center items-center relative z-40">
        <motion.h1
          className="text-4xl md:text-6xl font-league font-semibold uppercase tracking-wide mb-10 text-accent"
          variants={sectionTitleVariants}
          initial="hidden"
          animate="visible"
        >
          Hubungi Kami
        </motion.h1>

        {/* Info Kontak & Formulir Kirim Pesan */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 max-w-4xl w-full mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card Info Kontak */}
          <motion.div
            className="p-5 rounded-xl flex flex-col justify-start"
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
          >
            <h2 className="text-2xl md:text-3xl font-league uppercase text-white mb-4 md:mt-2">Informasi Dojo</h2>
            <motion.div variants={itemVariants} className="space-y-3 text-left font-[Montserrat] text-[#e7e7e7] flex flex-col justify-evenly h-full md:block">
              <div className="flex items-start gap-3 text-base md:text-lg">
                <MapPin className="text-[#FF9F1C] w-6 h-6 flex-shrink-0 mt-1" />
                <p>Jl. Meteorologi No. 5, Tanah Tinggi, Kec. Tangerang, Kota Tangerang, Banten</p>
              </div>
              <p className="flex items-center gap-3 text-base md:text-lg">
                <Mail className="text-[#FF9F1C] w-5 h-5" />
                karate@stmkg.ac.id
              </p>
              <p className="flex items-center gap-3 text-base md:text-lg">
                <Phone className="text-[#FF9F1C] w-5 h-5" />
                0822-8244-9362
              </p>
              <a
                href="https://www.instagram.com/karate.stmkg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-base md:text-lg hover:text-[#FF9F1C] transition-colors duration-200"
              >
                <Instagram className="text-[#FF9F1C] w-5 h-5" />
                @karate.stmkg
              </a>
            </motion.div>
          </motion.div>

          {/* Formulir Kirim Pesan */}
          <motion.div
            className="p-6 rounded-2xl w-full space-y-5"
            style={glassmorphismStyle}
            onMouseEnter={glassmorphismHoverStyle}
            onMouseLeave={glassmorphismLeaveStyle}
            variants={cardVariants}
            transition={{ ...cardVariants.visible.transition, delay: 0.3 }} // Delay untuk card kedua
          >
            <h2 className="text-2xl md:text-3xl font-league uppercase text-white mb-3">Kirim Pesan</h2>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <input
                type="text"
                name="nama"
                placeholder="Nama kamu..."
                required
                className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email kamu..."
                required
                className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
              />
              <textarea
                name="pesan"
                placeholder="Pesan kamu..."
                required
                rows="3"
                className="w-full p-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#a7a7a7] focus:outline-none focus:border-[#FF9F1C] transition-colors duration-200 text-sm"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
              ></textarea>
              <button
                type="submit"
                className="inline-block mt-2 px-4 py-2 font-semibold rounded-lg text-xs text-white"
                style={{
                  ...glassmorphismStyle,
                  borderRadius: '0.6rem',
                  boxShadow: `
                    0px 2px 5px rgba(0, 0, 0, 0.2),
                    inset 1px 1px 2px rgba(255, 255, 255, 0.13),
                    inset -1px -1px 2px rgba(0, 0, 0, 0.25)
                  `,
                  color: '#e7e7e7'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  // Perbaikan untuk efek glow
                  e.currentTarget.style.boxShadow = `
                    0 0 20px rgba(42, 20, 54, 0.8), /* Efek glow ungu */
                    0px 2px 5px rgba(0, 0, 0, 0.15),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.4)
                  `;
                  e.currentTarget.style.color = '#FF9F1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = `
                    0px 4px 10px rgba(0, 0, 0, 0.3),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.2)
                  `;
                  e.currentTarget.style.color = '#e7e7e7';
                }}
              >
                Kirim Pesan
              </button>
            </form>

            {/* Pesan sukses */}
            {sukses && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-300 mt-3 font-[Montserrat] text-sm"
              >
                🎉 Pesan kamu berhasil dikirim! Terima kasih sudah menghubungi kami.
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Google Maps (sekarang dengan animasi cardVariants) */}
        <motion.div
          className="rounded-xl overflow-hidden shadow-md max-w-4xl w-full p-4"
          style={glassmorphismStyle}
          onMouseEnter={glassmorphismHoverStyle}
          onMouseLeave={glassmorphismLeaveStyle}
          variants={cardVariants}
          initial="hidden" // Pastikan ada initial state
          animate="visible" // Pastikan ada animate state
          transition={{ ...cardVariants.visible.transition, delay: 0.6 }} // Delay untuk card ketiga
        >
          <iframe
            title="Lokasi Dojo"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1667.7895873579346!2d106.64505458838642!3d-6.17164533199761!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f05e4e6d1c27%3A0x8f19299fa86d971f!2sSekolah%20Tinggi%20Meteorologi%20Klimatologi%20dan%20Geofisika%20(STMKG)!5e0!3m2!1sid!2sid!4v1750902604886!5m2!1sid!2sid"
            width="100%"
            height="300"
            className="w-full border-none"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-sm py-10 px-6 md:px-20 border-t border-[#333]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Kiri: Teks */}
          <div className="text-center md:text-left w-full md:w-1/3">
            © With Love STMKG Karate Club Periode 2025
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