import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Konfigurasi untuk menemukan file di Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000; // Anda bisa ganti port ini jika mau

// Ganti dengan URL sitemap Anda dari Supabase
const SUPABASE_SITEMAP_URL = 'https://unkauvoourtaoxdpdlst.supabase.co/storage/v1/object/public/sitemap/sitemap.xml';

// Middleware untuk menyajikan file statis (aplikasi Vite Anda yang sudah dibuild)
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint untuk sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const response = await fetch(SUPABASE_SITEMAP_URL);
    const sitemapContent = await response.text();

    res.header('Content-Type', 'application/xml');
    res.send(sitemapContent);
  } catch (error) {
    console.error('Gagal mengambil sitemap:', error);
    res.status(500).send('Error fetching sitemap.');
  }
});

// Endpoint untuk menangani semua rute React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log(`Buka sitemap di http://localhost:${port}/sitemap.xml`);
});