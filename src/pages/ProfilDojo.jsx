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
    history: "STMKG Karate Club, sebuah wadah pembinaan karakter dan kebugaran yang berdedikasi tinggi bagi para taruna dan taruni, **telah eksis sejak awal berdirinya lembaga ini dan didirikan atas inisiatif Bapak Dr. Suko Adi Prayitno**. Klub ini beroperasi di bawah naungan Komandan Batalyon 2 Resimen Taruna STMKG, dengan Komandan Karate sebagai pimpinan tertinggi di dalam organisasi. Saat ini, pembinaan dan arahan diberikan oleh Ibu **Ayu Adi Justicea S.T., S.ST., M.App.Sc.** Dengan semangat yang membara serta visi kuat untuk mencetak pribadi yang tak hanya tangguh secara fisik namun juga disiplin tinggi serta menguasai seni bela diri karate autentik, klub ini menjadi pilar fundamental dalam pengembangan potensi holistik setiap taruna. Kami berkomitmen penuh menanamkan nilai-nilai inti karate seperti kehormatan, integritas, dan ketekunan, yang membentuk individu bermental kuat dan siap menghadapi berbagai tantangan baik di lingkungan kedinasan maupun dalam kehidupan bermasyarakat.",
    vision: "Menjadikan organisasi Karate yang unggul dalam membentuk Taruna berkarakter, berprestasi, dan berjiwa Bushido.",
    mission: [
      "Mengusahakan menjalin kerja sama dengan perguruan/yayasan karate yang legal secara hukum.",
      "Mengutamakan kejujuran dalam hak dan kewajiban baik itu pelatih, senpai, dan kohai.",
      "Mengadakan ujian sabuk legal persemester.",
      "Revolusi mental anggota organisasi.",
      "Memfasilitasi Taruna/i untuk mempelajari bela diri praktis yang dapat diaplikasikan secara nyata."
    ],
    philosophy: "Kami menjunjung tinggi **prinsip kehormatan (Rei), kesopopan (Makoto), keberanian (Yuuki), dan semangat pantang menyerah (Konjo)**. Setiap gerakan adalah cerminan dari dedikasi dan respek terhadap seni bela diri, membentuk pribadi yang tangguh di luar dan dalam."
  },
  highlights: {
    title: "Sekilas Klub",
    items: [
      { id: 1, icon: "🗓️", text: "Latihan Rutin (Sabtu Pagi)" },
      { id: 2, icon: "🥋", text: "Latihan Khusus BDT (Senin Sore)" },
      { id: 3, icon: "🎓", text: "Pengembangan Karakter Taruna" },
      { id: 4, icon: "🤝", text: "Komunitas Solid & Suportif" },
      { id: 5, icon: "🏆", text: "Fokus Pembinaan Prestasi Internal" },
      { id: 6, icon: "👨‍🏫", text: "Pembinaan oleh Senpai & Sensei Berpengalaman" },
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
      {/* --- Section Tentang Kami, Visi & Misi (2 Kolom) --- */}
      <motion.section
        ref={aboutRef}
        initial="hidden"
        // Gunakan aboutInView untuk mengaktifkan animasi saat section terlihat
        animate={aboutInView ? "visible" : "hidden"} 
        variants={slideUp}
        className="py-12 px-6 md:py-20 md:px-20 text-center relative z-10" // Tambahkan z-10
        style={{ backgroundColor: '#0a0a0a', color: 'white' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-8 md:mb-12 mt-4 text-accent jadwal-title-gradient"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.about.title}
        </h2>
        {/* Konten utama tentang kami, visi, misi, dan filosofi */}
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Kolom Kiri: Tentang Kami */}
          <motion.div variants={itemSlideUp} className="flex-1 text-left w-full"> {/* Tambahkan w-full */}
            <h3 className="text-xl md:text-4xl font-league uppercase mb-4 md:mb-6 text-accent"
              style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              Sejarah Singkat
            </h3>
            <p className="text-base md:text-lg font-[Montserrat] font-light leading-relaxed text-justify text-[#a7a7a7]">
              {profilData.about.history}
            </p>
          </motion.div>

          {/* Kolom Kanan: Visi & Misi */}
          <div className="flex-1 text-left w-full"> {/* Tambahkan w-full */}
            <motion.div variants={itemSlideUp}>
              <h3 className="text-xl md:text-4xl font-league uppercase mb-4 md:mb-6 text-accent"
                style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
              >
                Visi
              </h3>
              <p className="text-base md:text-lg font-[Montserrat] font-thin leading-relaxed text-justify text-[#a7a7a7]">
                {profilData.about.vision}
              </p>
            </motion.div>

            <motion.div variants={itemSlideUp} className="mt-8 md:mt-12">
              <h3 className="text-xl md:text-4xl font-league uppercase mb-4 md:mb-6 text-accent"
                style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
              >
                Misi
              </h3>
              <ul className="list-none p-0 text-base md:text-lg font-[Montserrat] font-thin leading-relaxed text-justify text-[#a7a7a7]">
                {profilData.about.mission.map((item, index) => (
                  <li key={index} className="mb-2 before:content-['\2022\00a0'] before:text-accent before:font-bold">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Filosofi Kami (di bawah 2 kolom) */}
        <motion.div variants={itemSlideUp} className="mt-12 md:mt-16 max-w-4xl mx-auto text-center">
          <h3 className="text-xl md:text-4xl font-league uppercase mb-4 md:mb-6 text-accent"
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            Filosofi Kami
          </h3>
          <p className="text-base md:text-lg font-[Montserrat] font-thin leading-relaxed text-justify text-[#a7a7a7]">
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
        className="py-12 px-6 md:py-20 md:px-20 text-center relative z-10" // Tambahkan z-10
        style={{ backgroundColor: '#0E0004' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-12 md:mb-16 text-accent"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.highlights.title}
        </h2>
        <motion.div
          variants={staggeredContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
        >
          {profilData.highlights.items.map(item => (
            <motion.div
              key={item.id}
              variants={itemSlideUp}
              className="flex flex-col items-center p-6 md:p-8 rounded-2xl cursor-default"
              style={photoFrameContainerBaseStyle}
              onMouseEnter={photoFrameContainerHoverStyle}
              onMouseLeave={photoFrameContainerLeaveStyle}
            >
              <span className="text-4xl md:text-5xl mb-3 md:mb-4" role="img" aria-label={item.text}>{item.icon}</span>
              <h3 className="text-lg md:text-2xl font-[Montserrat] font-semibold text-white text-center">
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
        className="py-12 px-6 md:py-20 md:px-20 text-center relative z-10" // Tambahkan z-10
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <h2 className="text-3xl md:text-6xl font-league uppercase mb-12 md:mb-16 text-accent"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {profilData.testimonials.title}
        </h2>
        <motion.div
          variants={staggeredContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
        >
          {profilData.testimonials.items.map(testimonial => (
            <motion.div
              key={testimonial.id}
              variants={itemSlideUp}
              className="flex flex-col items-center p-6 md:p-8 rounded-2xl"
              style={photoFrameContainerBaseStyle}
            >
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mb-4 md:mb-6 border-2 border-white/30 shadow-lg"
                  loading="lazy"
                />
              )}
              <p className="text-base md:text-lg font-[Montserrat] font-light italic leading-relaxed text-[#E7E7E7] mb-3 md:mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="font-[Montserrat] font-semibold text-sm md:text-base text-accent">
                - {testimonial.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

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