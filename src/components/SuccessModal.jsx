import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// Komponen untuk menampilkan popup notifikasi sukses
const SuccessModal = ({ message, onClose }) => {
    // Gaya glassmorphism untuk modal
    const glassmorphismStyle = {
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.37)',
    };

    return (
        // Overlay yang menutupi seluruh layar
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // Menutup modal saat mengklik di luar
        >
            {/* Konten Modal */}
            <motion.div
                className="w-full max-w-sm p-8 rounded-2xl flex flex-col items-center text-center"
                style={glassmorphismStyle}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat mengklik di dalam modal
            >
                {/* Ikon Sukses */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <CheckCircle className="text-green-400" size={64} strokeWidth={1.5} />
                </motion.div>

                {/* Judul Notifikasi */}
                <h2 className="text-4xl uppercase font-bold font-league text-green-400 mt-6">Berhasil!</h2>

                {/* Pesan Notifikasi */}
                <p className="text-gray-300 mt-2 mb-8 font-[Montserrat]">
                    {message}
                </p>

                {/* Tombol OK */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-white/20"
                >
                    OK
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default SuccessModal;
