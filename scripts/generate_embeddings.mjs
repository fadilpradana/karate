// scripts/generate_embeddings.mjs
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";

// Ambil variabel dari environment Node.js
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Memulai skrip generate_embeddings.mjs (Mode Node.js)...");
if (!supabaseUrl || !supabaseKey) {
  console.error("!!! Variabel environment yang dibutuhkan hilang !!!");
  throw new Error("Harap sediakan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.");
}
console.log("✅ Variabel Supabase berhasil ditemukan.");

const supabase = createClient(supabaseUrl, supabaseKey);

// Siapkan pipeline untuk embedding.
console.log("Menyiapkan model embedding lokal (mungkin butuh beberapa saat saat pertama kali)...");
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
console.log("✅ Model embedding lokal siap digunakan.");

// Data lengkap yang akan kita proses
const documentsToProcess = [
  "Sumpah Karate: 1. Sanggup memelihara kepribadian; 2. Sanggup patuh pada kejujuran; 3. Sanggup mempertinggi prestasi; 4. Sanggup menjaga sopan santun; 5. Sanggup menguasai diri.",
  "Sejarah STMKG Karate Club: STMKG Karate Club, sebuah wadah pembinaan penguasaan bela diri dan karakter yang berdedikasi tinggi bagi para Taruna dan Taruni. Awal berdirinya organisasi ini didirikan atas inisiatif Bapak Dr. Ir. Suko Adi Prayitno, M.Si., M.I.Kom. STMKG Karate Club beroperasi di bawah naungan Komandan Batalyon 2 Resimen Taruna STMKG, dengan Komandan Karate sebagai pimpinan tertinggi di dalam organisasi. Saat ini, pembinaan diberikan oleh Pembina Ayu Adi Justicea S.T., S.ST., M.App.Sc. Dengan semangat yang membara serta visi kuat untuk mencetak Taruna dan Taruni yang tak hanya tangguh secara fisik namun juga disiplin tinggi serta menguasai seni bela diri karate yang autentik, STMKG Karate Club menjadi pilar fundamental dalam pengembangan potensi holistik setiap Taruna. Kami berkomitmen menanamkan nilai-nilai karate seperti kehormatan, integritas, dan ketekunan, yang membentuk individu bermental kuat dan siap menghadapi berbagai tantangan baik di lingkungan kampus maupun dalam kehidupan bermasyarakat.",
  "Filosofi Logo: Bintang Prestasi melambangkan pencapaian luar biasa dalam perlombaan karate. Setiap satu bintang mewakili lima medali emas yang diraih oleh karateka STMKG pada tingkat nasional. Lingkaran melambangkan kebulatan tekad dan semangat karateka dalam melaksanakan aktivitasnya di bidang karate. Arah Mata Angin melambangkan arah dan tujuan yang ingin dicapai. Merah melambangkan keberanian akan sebuah tindakan. Kuning melambangkan kreativitas. Biru melambangkan tanggungjawab dan bisa diandalkan. Tulisan Warna Hitam melambangkan kekuasaan karateka yang harus sanggup menguasai diri sesuai dengan sumpah karate yang kelima. Putih melambangkan ketulusan dan saling menghargai.",
  "Filosofi Brevet: Lingkaran sebagai bentuk kewaspadaan seorang karateka, mengembangkan rasa empati, dan simpati. Arah Mata Angin melambangkan arah dan tujuan yang ingin dicapai, serta menandakan naungan Sekolah Tinggi Meteorologi Klimatologi dan Geofisika. Dua Tate Zuki, pukulan mengepal setengah terbalik dan pukulan ke arah kepala, melambangkan tekad, semangat, dan kemauan kuat seorang Taruna/i untuk berlatih. Dua Tangan Nukite, serangan dengan tangan seperti tombak, melambangkan perjuangan sensei dan senpai terdahulu karena tombak merupakan senjata tradisional. Dua Sayap (6 Bulu) merupakan perwujudan STMKG Karate sebagai organisasi dinamis. Enam bulu menunjukkan jumlah warna sabuk di karate dan semangat membangun prestasi. STMKG KARATE CLUB adalah wadah latihan fisik, mental baja, dan penempaan diri dengan penuh kesadaran, itikad baik, serta tanggung jawab terhadap cita-cita Bangsa.",
  "Prosedur Izin/Sakit untuk Tingkat 1: Jika sakit atau berhalangan hadir, taruna/i tingkat 1 wajib memberitahukan kepada Komandan Karate dan Pembina Ketarunaan. Untuk izin sakit, baik ringan maupun berat, wajib melampirkan surat sakit kepada Komandan Karate.",
  "Kewajiban Latihan: Latihan karate adalah wajib untuk seluruh Taruna dan Taruni tingkat 1.",
  "Informasi Prestasi: Untuk melihat daftar prestasi lengkap, silakan kunjungi website resmi di karate.stmkg.ac.id.",
  "Informasi Pengurus: Untuk melihat struktur pengurus, silakan kunjungi website resmi di karate.stmkg.ac.id/pengurus."
];

for (const content of documentsToProcess) {
  console.log(`\nMemproses: "${content.substring(0, 40)}..."`);
  
  // Hasilkan embedding menggunakan model lokal
  const output = await extractor(content, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  // Simpan konten dan embedding ke database Supabase
  const { error } = await supabase.from("documents").insert({
    content: content,
    embedding: embedding,
  });

  if (error) {
    console.error("Error saat menyimpan dokumen:", error);
  } else {
    console.log(`✅ Berhasil disimpan ke database.`);
  }
}

console.log("\nSkrip selesai dijalankan.");
