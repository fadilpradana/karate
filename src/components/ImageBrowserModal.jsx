// src/components/ImageBrowserModal.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from './Modal';
import { CheckCircle, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageBrowserModal({ isOpen, onClose, onImageSelect }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Variabel untuk gaya tombol yang konsisten
    const glassButtonClasses = "flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md shadow-lg transition-all duration-200";

    useEffect(() => {
        const fetchImages = async () => {
            if (!isOpen) {
                // Reset state saat modal ditutup
                setSelectedImage(null);
                return;
            };

            setLoading(true);
            setError(null);
            setImages([]);

            try {
                const { data, error: listError } = await supabase.storage
                    .from('gambarartikel')
                    .list('', {
                        limit: 100,
                        offset: 0,
                        sortBy: { column: 'created_at', order: 'desc' },
                    });

                if (listError) throw listError;

                const imageUrls = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .map(file => {
                        const { data: publicURLData } = supabase.storage
                            .from('gambarartikel')
                            .getPublicUrl(file.name);
                        return {
                            name: file.name,
                            url: publicURLData.publicUrl,
                        };
                    });

                setImages(imageUrls);
            } catch (err) {
                console.error("Error fetching images from storage:", err);
                setError("Gagal memuat gambar dari galeri.");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [isOpen]);

    const handleSelect = (image) => {
        setSelectedImage(image.url);
    };
    
    const handleConfirmSelection = () => {
        if (selectedImage) {
            onImageSelect(selectedImage);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Pilih Gambar dari Galeri"
            actions={
                <div className="flex justify-center gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmSelection}
                        disabled={!selectedImage}
                        className={`${glassButtonClasses} text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    >
                       <Check size={16}/> Jadikan Cover
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={onClose} 
                        className={`${glassButtonClasses} text-gray-400 hover:text-gray-300`}
                    >
                        <X size={16}/> Batal
                    </motion.button>
                </div>
            }
        >
            <div className="w-full h-[60vh] overflow-y-auto p-1">
                {loading && <p className="text-center">Memuat gambar...</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                
                {!loading && !error && images.length === 0 && (
                    <p className="text-center text-gray-400">Tidak ada gambar di galeri.</p>
                )}

                {/* Grid diubah untuk menampilkan gambar lebih besar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div 
                            key={image.name} 
                            className="relative aspect-square cursor-pointer group rounded-md overflow-hidden"
                            onClick={() => handleSelect(image)}
                        >
                            <img 
                                src={image.url} 
                                alt={image.name} 
                                className="w-full h-full object-cover bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                            />
                            {selectedImage === image.url && (
                                <div className="absolute inset-0 border-4 border-green-400 rounded-md flex items-center justify-center bg-black/50">
                                    <CheckCircle size={40} className="text-green-400" />
                                </div>
                            )}
                             <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
                                {image.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}