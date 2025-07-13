import imageCompression from 'browser-image-compression';

/**
 * Kompres dan ubah gambar menjadi format WebP di browser.
 * @param {File} file - File gambar yang akan diproses.
 * @returns {Promise<File>} - Promise yang akan resolve dengan file baru yang sudah dikompres.
 */
export async function compressAndConvertToWebP(file) {
  console.log(`Ukuran asli: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  
  const options = {
    maxSizeMB: 1,          // Batas maksimal ukuran file setelah kompresi (dalam MB)
    maxWidthOrHeight: 1920,  // Batas maksimal lebar atau tinggi gambar
    useWebWorker: true,      // Gunakan Web Worker agar tidak memblokir UI
    fileType: 'image/webp',  // **Ini adalah bagian kuncinya: konversi ke WebP**
    initialQuality: 0.8      // Kualitas awal (0-1)
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Ukuran setelah kompresi: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Gagal melakukan kompresi gambar:', error);
    // Jika gagal, kembalikan file asli agar proses tidak berhenti
    return file;
  }
}