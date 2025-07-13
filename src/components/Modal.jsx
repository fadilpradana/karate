import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, actions, statusMessage }) {
    const modalContentVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
        exit: { y: -50, opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.3 } }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    // Tidak ada onClose di sini, jadi klik di luar modal tidak akan menutupnya.
                >
                    <motion.div
                        variants={modalContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        // Kunci perubahan di sini: sesuaikan padding dan max-width umum modal
                        // p-4 akan memberi padding lebih kecil secara default.
                        // max-w-sm sebagai default yang lebih ringkas.
                        // h-fit memastikan tingginya mengikuti konten.
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 w-full max-w-sm relative text-center flex flex-col h-fit"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-[#FF9F1C]">{title}</h2>
                        
                        {/* Wrapper ini memastikan children terpusat vertikal jika ada ruang lebih */}
                        <div className="flex-grow flex flex-col justify-center items-center">
                            <div className="mb-4 text-gray-300 w-full"> {/* Kurangi mb- ke mb-4 */}
                                {children}
                            </div>
                            {statusMessage && (
                                <p className={`text-sm mb-4 ${statusMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {statusMessage.message}
                                </p>
                            )}
                        </div>

                        {actions && (
                            <div className="flex justify-center gap-4 mt-4"> {/* Kurangi mt- ke mt-4 */}
                                {actions}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}