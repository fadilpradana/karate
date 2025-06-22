// src/pages/ProfilDojo.jsx

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- Import Aset untuk Footer ---
import brevetLogo from "../assets/brevet.png";
// --------------------------------

// --- Data Profil Terintegrasi ---
const profilData = {
  about: {
    title: "Tentang Kami",
    history: "STMKG Karate Club, sebuah wadah pembinaan karakter dan kebugaran taruna, **didirikan pada tahun 2005 oleh Dr. Suko Adi Prayitno**. Dengan visi untuk melahirkan pribadi yang tangguh, berdisiplin tinggi, dan menguasai seni bela diri yang autentik, klub ini hadir sebagai pilar penting dalam pengembangan potensi taruna. Sejak awal, kami berkomitmen untuk menanamkan nilai-nilai luhur karate, membentuk individu yang berintegritas, bermental kuat, dan siap menghadapi tantangan di lingkungan kedinasan maupun masyarakat.",
    vision: "Menjadikan organisasi Karate yang unggul dalam membentuk Taruna berkarakter, berprestasi, dan berjiwa Bushido.",
    mission: [
      "Mengusahakan menjalin kerja sama dengan perguruan/yayasan karate yang legal secara hukum.",
      "Mengutamakan kejujuran dalam hak dan kewajiban baik itu pelatih, senpai, dan kohai.",
      "Mengadakan ujian sabuk legal persemester.",
      "Revolusi mental anggota organisasi.",
      "Memfasilitasi Taruna/i untuk mempelajari bela diri praktis yang dapat diaplikasikan secara nyata."
    ],
    philosophy: "Kami menjunjung tinggi **prinsip kehormatan (Rei), kesopanan (Makoto), keberanian (Yuuki), dan semangat pantang menyerah (Konjo)**. Setiap gerakan adalah cerminan dari dedikasi dan respek terhadap seni bela diri, membentuk pribadi yang tangguh di luar dan dalam."
  },
  highlights: {
    title: "Sekilas Klub",
    items: [
      { id: 1, icon: "🗓️", text: "Latihan Rutin (Sabtu Pagi)" }, // Dipersingkat
      { id: 2, icon: "🥋", text: "Latihan Khusus BDT (Senin Sore)" }, // Dipersingkat
      { id: 3, icon: "🎓", text: "Pengembangan Karakter Taruna" },
      { id: 4, icon: "🤝", text: "Komunitas Solid & Suportif" },
      { id: 5, icon: "🏆", text: "Fokus Pembinaan Bela Diri dan Prestasi" },
      { id: 6, icon: "👨‍🏫", text: "Pembinaan oleh Senpai & Sensei Berpengalaman" }, // Teks diubah dan ikon disesuaikan
    ]
  },
  testimonials: {
    title: "Suara Sang Ksatria",
    items: [
      {
        id: 1,
        quote: "Bergabung dengan Karate STMKG bukan hanya melatih fisik, tapi juga membentuk mental saya menjadi lebih disiplin dan percaya diri. Sensei dan teman-teman sangat mendukung.",
        name: "Taruna R. Wibowo",
        image: "/images/testi-1.jpg"
      },
      {
        id: 2,
        quote: "Saya merasakan peningkatan signifikan dalam fokus dan ketahanan diri sejak berlatih karate di sini. Lingkungan latihannya sangat kondusif untuk berkembang dan berprestasi.",
        name: "Taruni D. Lestari",
        image: "/images/testi-2.jpg"
      },
      {
        id: 3,
        quote: "Karate mengajarkan saya tentang pentingnya ketekunan dan kerendahan hati. STMKG Karate Club adalah keluarga kedua yang selalu memotivasi.",
        name: "Taruna M. Arif",
        image: "/images/testi-3.jpg"
      },
    ]
  }
};
// --- Akhir Data Profil Terintegrasi ---

// --- Shared styles from Home.jsx for consistency ---
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
};

const photoFrameContainerHoverStyle = (e) => {
  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
  e.currentTarget.style.boxShadow = `
    0px 2px 5px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4)
  `;
  e.currentTarget.style.transform = 'scale(1.03)';
};

const photoFrameContainerLeaveStyle = (e) => {
  e.currentTarget.style.backgroundColor = photoFrameContainerBaseStyle.backgroundColor;
  e.currentTarget.style.borderColor = photoFrameContainerBaseStyle.border.split(' ')[2];
  e.currentTarget.style.boxShadow = photoFrameContainerBaseStyle.boxShadow;
  e.currentTarget.style.transform = 'scale(1)';
};

// Framer Motion Variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5, ease: "easeOut" } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggeredContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemSlideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function ProfilDojo() {
  const aboutRef = useRef(null);
  const highlightsRef = useRef(null);
  const testimonialsRef = useRef(null);

  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });
  const highlightsInView = useInView(highlightsRef, { once: true, amount: 0.3 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0E0004] min-h-screen text-white overflow-x-hidden"
    >
      {/* --- Section Tentang Kami --- */}
      <motion.section
        ref={aboutRef}
        initial="hidden"
        animate={aboutInView ? "visible" : "hidden"}
        variants={slideUp}
        className="py-20 px-6 md:px-20 text-center"
        style={{ backgroundColor: '#0a0a0a', color: 'white' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-12 text-accent"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.about.title}
        </h2>
        <motion.p
          variants={itemSlideUp}
          className="max-w-4xl mx-auto text-lg md:text-xl font-[Montserrat] font-light leading-relaxed text-[#E7E7E7] mb-10"
        >
          {profilData.about.history}
        </motion.p>

        <div className="flex flex-col md:flex-row justify-center items-start gap-12 max-w-5xl mx-auto">
          <motion.div variants={itemSlideUp} className="flex-1 text-left">
            <h3 className="text-2xl md:text-4xl font-league uppercase mb-6 text-accent"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Visi
            </h3>
            <p className="text-lg font-[Montserrat] font-thin leading-relaxed text-[#a7a7a7]">
              {profilData.about.vision}
            </p>
          </motion.div>

          <motion.div variants={itemSlideUp} className="flex-1 text-left">
            <h3 className="text-2xl md:text-4xl font-league uppercase mb-6 text-accent"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Misi
            </h3>
            <ul className="list-none p-0 text-lg font-[Montserrat] font-thin leading-relaxed text-[#a7a7a7]">
              {profilData.about.mission.map((item, index) => (
                <li key={index} className="mb-2 before:content-['\2022\00a0'] before:text-accent before:font-bold">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div variants={itemSlideUp} className="mt-16 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-4xl font-league uppercase mb-6 text-accent"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            Filosofi Kami
          </h3>
          <p className="text-lg font-[Montserrat] font-thin leading-relaxed text-[#a7a7a7]">
            {profilData.about.philosophy}
          </p>
        </motion.div>
      </motion.section>

      {/* --- Section Sekilas Klub / Highlights --- */}
      <motion.section
        ref={highlightsRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={slideUp}
        className="py-20 px-6 md:px-20 text-center"
        style={{ backgroundColor: '#0E0004' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-16 text-accent"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.highlights.title}
        </h2>
        <motion.div
          variants={staggeredContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {profilData.highlights.items.map(item => (
            <motion.div
              key={item.id}
              variants={itemSlideUp}
              className="flex flex-col items-center p-8 rounded-2xl cursor-default"
              style={photoFrameContainerBaseStyle}
              onMouseEnter={photoFrameContainerHoverStyle}
              onMouseLeave={photoFrameContainerLeaveStyle}
            >
              <span className="text-5xl mb-4" role="img" aria-label={item.text}>{item.icon}</span>
              <h3 className="text-xl md:text-2xl font-[Montserrat] font-semibold text-white">
                {item.text}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* --- Section Testimoni --- */}
      <motion.section
        ref={testimonialsRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={slideUp}
        className="py-20 px-6 md:px-20 text-center"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-16 text-accent"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.testimonials.title}
        </h2>
        <motion.div
          variants={staggeredContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {profilData.testimonials.items.map(testimonial => (
            <motion.div
              key={testimonial.id}
              variants={itemSlideUp}
              className="flex flex-col items-center p-8 rounded-2xl"
              style={photoFrameContainerBaseStyle}
            >
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-24 h-24 rounded-full object-cover mb-6 border-2 border-white/30 shadow-lg"
                  loading="lazy"
                />
              )}
              <p className="text-lg font-[Montserrat] font-light italic leading-relaxed text-[#E7E7E7] mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="font-[Montserrat] font-semibold text-base text-accent">
                - {testimonial.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* --- Footer (disertakan langsung di sini) --- */}
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