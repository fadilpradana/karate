// src/components/ActionSheetModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ActionSheetModal({ isOpen, onClose, title, actions }) {
    if (!isOpen) return null;

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    ></motion.div>

                    {/* Action Sheet Content */}
                    <motion.div
                        className="relative bg-gray-800 rounded-t-2xl p-4 shadow-lg"
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {title && <h3 className="text-center text-gray-400 text-sm font-medium mb-4">{title}</h3>}
                        
                        <div className="flex flex-col gap-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick();
                                        onClose();
                                    }}
                                    className={`flex items-center gap-4 w-full p-4 rounded-lg text-left text-base transition-colors ${
                                        action.isDestructive 
                                            ? 'text-red-400 bg-white/5 hover:bg-red-500/20' 
                                            : 'text-white bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {action.icon && <div className="w-6 flex justify-center">{action.icon}</div>}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-4 p-4 rounded-lg text-base text-white bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Batal
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}