// src/components/PrestasiCard.jsx
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react"; // Pastikan semua hooks yang digunakan diimpor

// Menggunakan gaya dari Home.jsx untuk konsistensi
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

const photoFrameContainerHoverStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    e.currentTarget.style.boxShadow = `
      0px 2px 5px rgba(0, 0, 0, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.4)
    `;
    e.currentTarget.style.transform = 'scale(1.05)';
};

const photoFrameContainerLeaveStyle = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    e.currentTarget.style.boxShadow = `
      0px 4px 10px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2)
    `;
    e.currentTarget.style.transform = 'scale(1)';
};

const innerImageStyle = {
    borderRadius: '0.75rem',
};


// Custom hook for animating elements on scroll (dipindahkan ke sini)
const useAnimateOnScroll = (initialX, isMobile) => {
    const ref = useRef(null);
    // Menggunakan `once: true` di sini lebih aman untuk animasi masuk saja
    const isInView = useInView(ref, { once: true, amount: 0.5 }); 

    const variants = {
        hidden: { opacity: 0, x: isMobile ? 0 : initialX, y: isMobile ? 20 : 0 },
        visible: { opacity: 1, x: 0, y: 0 },
    };

    return { ref, isInView, variants };
};

export default function PrestasiCard({ item, index, isMobile, openImageModal }) {
    const isImageOnLeft = index % 2 === 0;
    const { ref: itemRef, isInView, variants } = useAnimateOnScroll(isImageOnLeft ? -100 : 100, isMobile);

    // Hapus isLastItem dari sini, karena ini adalah komponen tunggal
    // Jika Anda membutuhkan border-gradient-bottom, Anda harus menanganinya di Home.jsx
    // atau melewati prop `isLastItem` ke sini dan menambahkannya ke className di motion.div

    return (
        <motion.div
            key={item.id} // Penting: Gunakan ID unik sebagai key
            ref={itemRef}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            transition={isMobile ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className={`flex flex-col gap-8 relative py-8
                        ${isMobile ? 'items-center justify-center' : (isImageOnLeft ? 'md:flex-row md:items-start' : 'md:flex-row-reverse md:items-start')}
                        /* Anda bisa menambahkan border-gradient-bottom di Home.jsx jika perlu */
                        `}
            style={isImageOnLeft ? { /* style khusus jika dibutuhkan untuk layout */ } : { /* style khusus jika dibutuhkan untuk layout */ }}
        >
            {/* Bagian untuk Gambar (atau Placeholder Kosong) */}
            <div
                className={`w-full md:w-1/2 flex ${isMobile ? 'justify-center' : ''} items-center relative
                                ${item.gambar ? 'h-60' : 'h-auto md:h-0 md:opacity-0 md:pointer-events-none'}`}
                style={item.gambar ? photoFrameContainerBaseStyle : {}}
                onMouseEnter={item.gambar ? photoFrameContainerHoverStyle : null}
                onMouseLeave={item.gambar ? photoFrameContainerLeaveStyle : null}
                onClick={item.gambar ? () => openImageModal(item.gambar) : null}
            >
                {item.gambar ? (
                    <img
                        src={item.gambar}
                        alt={item.judul}
                        className="w-[calc(100%-10px)] h-[calc(100%-10px)] object-cover rounded-xl transition-transform duration-300 relative z-10"
                        style={innerImageStyle}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-0"></div>
                )}
            </div>

            {/* Bagian untuk Deskripsi */}
            <div className={`w-full md:w-1/2 relative ${isMobile ? 'text-left px-4' : 'text-left'}`}>
                <h3 className="text-xl md:text-2xl font-[Montserrat] font-semibold uppercase glow-text-accent">
                    {item.judul}
                </h3>
                <p className="mt-2 font-[Montserrat] text-sm md:text-base font-thin text-[#a7a7a7]">
                    <strong>{item.deskripsi}</strong>
                </p>
            </div>
        </motion.div>
    );
}