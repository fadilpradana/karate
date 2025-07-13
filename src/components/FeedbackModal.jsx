import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react'; // Hanya memerlukan CheckCircle untuk sukses

const FeedbackModal = ({ message, type, onClose }) => {
  const isSuccess = type === 'success';
  const icon = isSuccess && <CheckCircle className="h-12 w-12 text-[#64FFDA]" />; // Ikon centang hijau
  const title = isSuccess ? "BERHASIL!" : "GAGAL!";
  const titleColor = isSuccess ? "text-[#64FFDA]" : "text-red-500";

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.8 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-[#1D232A] rounded-xl p-8 flex flex-col items-center text-center space-y-4 w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {icon}
            <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
            <p className="text-gray-300">{message}</p>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;