import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9083;

// =======================================================
// ==         KONEKSI KE DATABASE SUPABASE              ==
// =======================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// =======================================================

// URL gambar sampul default untuk semua halaman
const defaultOgImage = 'https://karate.stmkg.ac.id/logo_bintangcompress.png';

// =================================================================
// ==         PUSAT DATA META TAG (SESUAI PERMINTAAN ANDA)        ==
// =================================================================
const metadataByPath = {
  '/': {
    title: 'STMKG Karate Club',
    description: 'Selamat datang di situs resmi STMKG Karate Club. Lihat prestasi para karateka kami, sampaikan kritik & saran, serta kenali semangat bela diri kami yang menjunjung kehormatan dan disiplin.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/'
  },
  '/jadwal': {
    title: 'Jadwal - STMKG Karate Club',
    description: 'Temukan jadwal lengkap latihan rutin dan program Bela Diri Taruna (BDT) di STMKG Karate Club. Informasi terkini seputar waktu dan lokasi latihan setiap pekan.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/jadwal'
  },
  '/profil': {
    title: 'Profil - STMKG Karate Club',
    description: 'Pelajari tentang sejarah, Sumpah Karate, visi, misi, dan filosofi logo STMKG Karate Club serta brevet STMKG Karate Club. Kenali lebih dalam tentang semangat dan dedikasi kami.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/profil'
  },
  '/artikel': {
    title: 'Artikel - STMKG Karate Club',
    description: 'Temukan berbagai artikel menarik seputar dunia karate, teknik, sejarah, dan tips latihan dari STMKG Karate Club.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/artikel'
  },
  '/pengumuman': {
    title: 'Pengumuman - STMKG Karate Club',
    description: 'Informasi dan berita terbaru seputar kegiatan STMKG Karate Club. Jangan lewatkan pengumuman penting dari kami.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/pengumuman'
  },
  '/kontak': {
    title: 'Kontak - STMKG Karate Club',
    description: 'Hubungi STMKG Karate Club untuk informasi lebih lanjut. Temukan alamat dojo, email, dan kontak Humas kami. Kirim pesan langsung kepada kami.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/kontak'
  },
  '/pengurus': {
    title: 'Struktur Kepengurusan - STMKG Karate Club',
    description: 'Lihat struktur kepengurusan STMKG Karate Club. Kenali komandan, sekretaris, bendahara, dan seluruh anggota bidang.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/pengurus'
  },
  default: {
    title: 'Karate STMKG',
    description: 'Selamat Datang di Website Resmi STMKG Karate Club.',
    ogImage: defaultOgImage,
    url: 'https://karate.stmkg.ac.id/'
  }
};
// =================================================================

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/sitemap.xml', async (req, res) => {
  try {
    const response = await fetch(process.env.SUPABASE_SITEMAP_URL);
    if (!response.ok) throw new Error(`Sitemap fetch failed with status ${response.status}`);
    const sitemapContent = await response.text();
    res.header('Content-Type', 'application/xml');
    res.send(sitemapContent);
  } catch (error) {
    console.error('Gagal mengambil sitemap:', error);
    res.status(500).send('Error fetching sitemap.');
  }
});

// =======================================================
// ==         HANDLER UTAMA DENGAN LOGIKA DINAMIS       ==
// =======================================================
app.get('*', async (req, res) => {
  if (path.extname(req.path).length > 0) {
    return res.status(404).send('Not found');
  }

  const indexPath = path.join(__dirname, 'dist', 'index.html');

  fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading page.');
    }

    let metadata;

    if (req.path.startsWith('/artikel/')) {
      const artikelId = req.path.split('/')[2];
      const { data: artikel } = await supabase.from('artikels').select('judul, deskripsi, gambar_url').eq('id', artikelId).single();
      if (artikel) {
        const cleanDescription = artikel.deskripsi.replace(/<[^>]*>/g, '').substring(0, 160);
        metadata = {
          title: `${artikel.judul} - STMKG Karate Club`,
          description: `${cleanDescription}...`,
          ogImage: artikel.gambar_url, // Halaman detail artikel tetap menggunakan gambar spesifik dari database
          url: `https://karate.stmkg.ac.id/artikel/${artikelId}`
        };
      } else {
        metadata = metadataByPath['/artikel']; 
      }
    } else if (req.path.startsWith('/pengumuman/')) {
      const pengumumanId = req.path.split('/')[2];
      const { data: pengumuman } = await supabase.from('pengumumans').select('judul, konten').eq('id', pengumumanId).single();
      if (pengumuman) {
        const cleanDescription = pengumuman.konten.replace(/<[^>]*>/g, '').substring(0, 160);
        metadata = {
          title: `${pengumuman.judul} - STMKG Karate Club`,
          description: `${cleanDescription}...`,
          ogImage: defaultOgImage, // Halaman detail pengumuman menggunakan logo
          url: `https://karate.stmkg.ac.id/pengumuman/${pengumumanId}`
        };
      } else {
        metadata = metadataByPath['/pengumuman']; 
      }
    } else {
      metadata = metadataByPath[req.path] || metadataByPath.default;
    }

    const finalHtml = htmlData
      .replace(/__META_TITLE__/g, metadata.title)
      .replace(/__META_DESCRIPTION__/g, metadata.description)
      .replace(/__META_OG_IMAGE__/g, metadata.ogImage)
      .replace(/__META_URL__/g, metadata.url);

    res.send(finalHtml);
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});