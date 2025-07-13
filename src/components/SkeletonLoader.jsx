// src/components/SkeletonLoader.jsx
import React from 'react';

export const SkeletonLoader = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 max-w-2xl w-full animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-6 mx-auto"></div> {/* Skeleton Judul */}
        <div className="space-y-4">
            <div className="h-10 bg-gray-700 rounded"></div> {/* Skeleton Input */}
            <div className="h-32 bg-gray-700 rounded"></div> {/* Skeleton Textarea */}
            <div className="h-10 bg-gray-700 rounded"></div> {/* Skeleton Input */}
            <div className="h-12 bg-gray-700 rounded w-full"></div> {/* Skeleton Tombol */}
        </div>
    </div>
);