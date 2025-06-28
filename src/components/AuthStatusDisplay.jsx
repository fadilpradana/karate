// src/components/AuthStatusDisplay.jsx
import React from 'react';
import { SkeletonLoader } from './SkeletonLoader'; // Asumsi SkeletonLoader ada di components/SkeletonLoader.jsx

export function AuthStatusDisplay({ authLoading, isAuthorized }) {
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
                <div className="text-center">
                    <p className="mb-4 text-lg">Memverifikasi akses Anda...</p>
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
                <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Akses Ditolak</h2>
                    <p className="text-gray-300 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <button
                        onClick={() => window.location.href = '/artikel'} // Menggunakan window.location untuk redirect penuh
                        className="bg-[#FF9F1C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                    >
                        Kembali ke Artikel
                    </button>
                </div>
            </div>
        );
    }

    return null; // Jika authorized dan tidak loading, tidak render apapun (biarkan children yang render)
}