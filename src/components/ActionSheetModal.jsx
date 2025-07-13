// src/components/ActionSheetModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionSheetModal({ isOpen, onClose, title, actions }) {
    const sheetVariants = {
        hidden: { y: "100%" },
        visible: { y: "0%", transition: { type: 'spring', damping: 25, stiffness: 200 } },
        exit: { y: "100%", transition: { type: 'easeIn', duration: 0.2 } }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Fungsi ini diperbarui untuk menangani beberapa warna utama
    const getActionClasses = (action) => {
        const baseClasses = 'flex items-center gap-4 w-full p-4 rounded-lg text-left text-base transition-colors border bg-white/10 hover:bg-white/20 border-white/10';

        if (action.isDestructive) {
            return `${baseClasses} text-red-400`; // Aksi berbahaya
        }
        if (action.isPrimary) {
            return `${baseClasses} text-blue-400`; // Aksi utama #1 (Biru Cerah)
        }
        if (action.isSecondary) {
            return `${baseClasses} text-teal-400`; // Aksi utama #2 (Teal Cerah)
        }
        return `${baseClasses} text-white`; // Aksi standar
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <motion.div
                        className="absolute inset-0 bg-black/60"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    ></motion.div>

                    <motion.div
                        className="relative bg-white/10 backdrop-blur-lg rounded-t-2xl p-4 shadow-lg border-t border-x border-white/20"
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {title && <h3 className="text-center text-gray-300 text-sm font-medium mb-4">{title}</h3>}
                        
                        <div className="flex flex-col gap-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick();
                                        onClose();
                                    }}
                                    className={getActionClasses(action)}
                                >
                                    {action.icon && <div className="w-6 flex justify-center">{action.icon}</div>}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-4 p-4 rounded-lg text-base text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                        >
                            Batal
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}