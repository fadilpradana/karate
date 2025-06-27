// src/pages/Berita.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

export default function Berita() {
  const [beritaList, setBeritaList] = useState([]);

  useEffect(() => {
    const fetchBerita = async () => {
      const { data, error } = await supabase
        .from('berita')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setBeritaList(data);
    };

    fetchBerita();
  }, []);

  return (
    <div className="px-4 md:px-12 pt-28 pb-16 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Berita Terbaru</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {beritaList.map((berita) => (
          <motion.div
            key={berita.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1e1e1e] p-6 rounded-2xl shadow-lg"
          >
            {berita.gambar_url && (
              <img
                src={berita.gambar_url}
                alt={berita.judul}
                className="rounded-xl mb-4 object-cover w-full h-52"
              />
            )}
            <h2 className="text-xl font-semibold">{berita.judul}</h2>
            <p className="text-sm text-gray-400 mt-2">{berita.created_at?.slice(0, 10)}</p>
            <p className="mt-3 text-sm">{berita.deskripsi}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
