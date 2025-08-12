import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi website
const config = {
  baseUrl: 'https://karate.stmkg.ac.id', // Ganti dengan domain Anda
  outputPath: path.join(__dirname, '../public/sitemap.xml'),
  routes: [
    {
      path: '/',
      priority: '1.0',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      path: '/Pengumuman',
      priority: '0.8',
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      path: '/Profil',
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      path: '/Kontak',
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      path: '/jadwal-latihan',
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      path: '/galeri',
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    }
  ]
};

// Generate sitemap XML
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  config.routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${config.baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Write sitemap to file
function writeSitemap() {
  try {
    const sitemap = generateSitemap();
    fs.writeFileSync(config.outputPath, sitemap, 'utf8');
    console.log('✅ Sitemap berhasil dibuat!');
    console.log(`📁 Lokasi: ${config.outputPath}`);
    console.log(`🌐 URL: ${config.baseUrl}/sitemap.xml`);
    console.log(`📊 Total halaman: ${config.routes.length}`);
  } catch (error) {
    console.error('❌ Error membuat sitemap:', error.message);
  }
}

// Update lastmod untuk semua routes
function updateLastmod() {
  const today = new Date().toISOString().split('T')[0];
  config.routes.forEach(route => {
    route.lastmod = today;
  });
  console.log('📅 Lastmod updated to:', today);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Generating sitemap...');
  updateLastmod();
  writeSitemap();
}

export { generateSitemap, writeSitemap, config }; 