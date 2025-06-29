import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, actions, statusMessage }) {
    // Definisi animasi untuk konten modal (yang bergerak dari atas)
    const modalContentVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
        exit: { y: -50, opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && ( // Komponen dirender jika isOpen true
                <motion.div
                    // Animasi untuk overlay hitam (hanya opacity)
                    initial={{ opacity: 0 }} // Mulai dengan transparan penuh
                    animate={{ opacity: 1, transition: { duration: 0.3 } }} // Fade in ke opacity penuh (sesuai bg-opacity-70)
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}    // Fade out kembali ke transparan penuh
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    // Penting: Hapus onClick={onClose} dari div ini
                    // agar klik di luar modal tidak menutupnya. Penutupan hanya dari tombol X.
                >
                    {/* Konten modal itu sendiri (form/pesan konfirmasi) dengan animasinya */}
                    <motion.div
                        variants={modalContentVariants} // Menggunakan variants yang sudah didefinisikan
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 w-full max-w-md relative text-center"
                        onClick={(e) => e.stopPropagation()} // Mencegah event klik menyebar dari konten modal
                    >
                        <button
                            onClick={onClose} // Tombol X yang memanggil fungsi onClose dari parent
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-[#FF9F1C]">{title}</h2>
                        <div className="mb-6 text-gray-300">
                            {children}
                        </div>
                        {statusMessage && (
                            <p className={`text-sm mb-4 ${statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {statusMessage.message}
                            </p>
                        )}
                        <div className="flex justify-center gap-4">
                            {actions}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}