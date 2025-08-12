import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  structuredData 
}) => {
  const fullTitle = title ? `${title} - Karate STMKG` : 'Karate STMKG - Klub Karate STMKG';
  const fullDescription = description || 'Karate STMKG - Tempat belajar dan berlatih karate untuk Taruna/i STMKG. Informasi jadwal latihan, pengumuman, dan kegiatan karate.';
  const fullKeywords = keywords || 'karate, STMKG, klub karate, bela diri, latihan karate, pengumuman karate';
  const fullImage = image || '/src/assets/logo_bintangcompress.png';
  const fullUrl = url || 'https://karate.stmkg.ac.id';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Karate STMKG" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 