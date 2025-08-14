import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // <-- TAMBAHKAN BARIS INI untuk memuat .env

// --- KONFIGURASI SUPABASE ---
// Variabel sekarang akan dibaca dari file .env Anda
const supabaseUrl = process.env.VITE_SUPABASE_URL; // <-- Diubah untuk cocok dengan .env
const supabaseKey = process.env.VITE_SUPABASE_KEY;   // <-- Diubah untuk cocok dengan .env

// Cek apakah variabel berhasil dimuat
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_KEY sudah ada di file .env');
  process.exit(1); // Hentikan skrip jika kredensial tidak ada
}

// Buat Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  baseUrl: 'https://karate.stmkg.ac.id',
  outputPath: path.join(__dirname, '../public/sitemap.xml'), // Pastikan path ini benar
};

/**
 * FUNGSI PENTING: Mengambil rute dinamis dari database (Supabase).
 * Pastikan nama tabel ('articles', 'announcements') dan kolom ('id') sesuai dengan struktur database Anda.
 */
async function fetchDynamicRoutes() {
  console.log('Mengambil data dari Supabase...');

  // Ambil semua ID dari tabel artikel
  // Ganti 'articles' jika nama tabel Anda berbeda
  // Ganti 'id' jika kolom untuk URL slug/ID berbeda
  const { data: articles, error: articlesError } = await supabase
    .from('artikel') 
    .select('id');   

  if (articlesError) {
    console.error('Error mengambil artikel:', articlesError.message);
    return [];
  }

  // Ambil semua ID dari tabel pengumuman
  // Ganti 'announcements' jika nama tabel Anda berbeda
  // Ganti 'id' jika kolom untuk URL slug/ID berbeda
  const { data: announcements, error: announcementsError } = await supabase
    .from('pengumuman') 
    .select('id');         
  
  if (announcementsError) {
    console.error('Error mengambil pengumuman:', announcementsError.message);
    return [];
  }

  const articleUrls = articles.map(article => `/artikel/${article.id}`);
  const announcementUrls = announcements.map(announcement => `/pengumuman/${announcement.id}`);

  console.log(`Ditemukan ${articleUrls.length} artikel dan ${announcementUrls.length} pengumuman.`);
  return [...articleUrls, ...announcementUrls];
}


/**
 * Menghasilkan konten sitemap.xml
 * @param {object[]} staticRoutes - Daftar rute statis
 * @param {string[]} dynamicRoutes - Daftar rute dinamis
 */
function generateSitemapXml(staticRoutes, dynamicRoutes) {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Proses rute statis
  staticRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${config.baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Proses rute dinamis
  dynamicRoutes.forEach(path => {
    xml += '  <url>\n';
    xml += `    <loc>${config.baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>yearly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Fungsi utama untuk menjalankan pembuatan sitemap
 */
async function main() {
  console.log('🚀 Memulai pembuatan sitemap...');

  // Daftar rute statis yang sesuai dengan router React Anda
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/profil', priority: '0.8', changefreq: 'monthly' },
    { path: '/pengurus', priority: '0.7', changefreq: 'monthly' },
    { path: '/jadwal', priority: '0.7', changefreq: 'monthly' },
    { path: '/artikel', priority: '0.9', changefreq: 'weekly' },
    { path: '/kontak', priority: '0.6', changefreq: 'yearly' },
    { path: '/pengumuman', priority: '0.9', changefreq: 'daily' },
    { path: '/login', priority: '0.3', changefreq: 'yearly' },
    { path: '/signup', priority: '0.3', changefreq: 'yearly' },
  ];

  try {
    const dynamicRoutes = await fetchDynamicRoutes();
    const sitemap = generateSitemapXml(staticRoutes, dynamicRoutes);
    
    fs.writeFileSync(config.outputPath, sitemap, 'utf8');
    
    console.log('✅ Sitemap berhasil dibuat!');
    console.log(`📁 Lokasi: ${config.outputPath}`);
    console.log(`📊 Total halaman: ${staticRoutes.length + dynamicRoutes.length}`);
  } catch (error) {
    console.error('❌ Gagal membuat sitemap:', error);
  }
}

main();
