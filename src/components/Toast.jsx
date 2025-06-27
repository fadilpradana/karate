// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 4000); // Notifikasi akan hilang setelah 4 detik

    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const backgroundColor = type === 'success'
    ? 'rgba(76, 175, 80, 0.7)' // Hijau transparan untuk sukses
    : 'rgba(244, 67, 54, 0.7)'; // Merah transparan untuk gagal

  const borderColor = type === 'success'
    ? 'rgba(102, 187, 106, 0.4)'
    : 'rgba(229, 115, 115, 0.4)';

  const boxShadowColor = type === 'success'
    ? 'rgba(76, 175, 80, 0.4)'
    : 'rgba(244, 67, 54, 0.4)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 text-white max-w-sm w-full"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            background: backgroundColor,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${borderColor}`,
            boxShadow: `
              0px 4px 15px rgba(0, 0, 0, 0.3),
              0 0 15px ${boxShadowColor}
            `,
          }}
        >
          {type === 'success' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span className="font-semibold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;