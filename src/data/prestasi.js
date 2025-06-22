const originalPrestasiList = [
  // Prestasi yang sudah ada
  {
    judul: "Perhubungan Open Karate Tournament 2001",
    deskripsi:
      "Meraih Juara I Kumite Senior Putra, Juara 1 Umum",
    gambar: "",
    tahun: 2009,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 0, // Juara II Kata Beregu Putra Senior
    medaliPerunggu: 0, // Juara III Kata Beregu Putri Senior
    juaraUmum: 0, // "Juara II Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "- 2003",
    deskripsi:
      "Meraih Juara I Kumite Senior Putra",
    gambar: "",
    tahun: 2009,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 0, // Juara II Kata Beregu Putra Senior
    medaliPerunggu: 0, // Juara III Kata Beregu Putri Senior
    juaraUmum: 0, // "Juara II Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "UNSADA Open Tournament Se-Jawa Bali 2009",
    deskripsi:
      "Meraih Juara II Umum Kata Beregu Putra, Juara II Kata Beregu Putra Senior, dan Juara III Kata Beregu Putri Senior",
    gambar: "",
    tahun: 2009,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 2, // Juara II Kata Beregu Putra Senior
    medaliPerunggu: 1, // Juara III Kata Beregu Putri Senior
    juaraUmum: 0, // "Juara II Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "Sunan Kalijaga Open Tournament 2010",
    deskripsi:
      "Meraih Juara III Umum Kelas Berat 80 kg, Juara II Kumite Under 55 kg Senior Putri, dan Juara III Kumite Up To 68 kg Senior Putra",
    gambar: "",
    tahun: 2010,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 1, // Juara II Kumite Under 55 kg Senior Putri
    medaliPerunggu: 2, // Juara III Kumite Up To 68 kg Senior Putra
    juaraUmum: 0, // "Juara III Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "SBY Cup 2013",
    deskripsi:
      "Meraih Juara III",
    gambar: "",
    tahun: 2010,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 0, // Juara II Kumite Under 55 kg Senior Putri
    medaliPerunggu: 1, // Juara III Kumite Up To 68 kg Senior Putra
    juaraUmum: 0, // "Juara III Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "OPTK 2015",
    deskripsi:
      "Meraih Medali Perunggu Putri",
    gambar: "",
    tahun: 2010,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 0, // Juara II Kumite Under 55 kg Senior Putri
    medaliPerunggu: 1, // Juara III Kumite Up To 68 kg Senior Putra
    juaraUmum: 0, // "Juara III Umum" dihitung sebagai 1 juara umum
  },
  {
    judul: "Kejuaraan Karate UNJ 2016",
    deskripsi:
      "Meraih Juara I Kata Beregu Putra Kelas Junior-Senior, Juara III Kata Perorangan U-21, Juara III Kumite Putra U-21 Kelas -67 kg, Juara III Kumite Putri U-21 Kelas -55 kg, dan Juara III Kumite Putri U-21 Kelas -61 kg",
    gambar: "",
    tahun: 2016,
    // --- Penambahan Medali ---
    medaliEmas: 1, // Juara I Kata Beregu Putra Kelas Junior-Senior
    medaliPerak: 0,
    medaliPerunggu: 4, // Juara III Kata Perorangan U-21, Juara III Kumite Putra U-21 Kelas -67 kg, Juara III Kumite Putri U-21 Kelas -55 kg, Juara III Kumite Putri U-21 Kelas -61 kg
    juaraUmum: 0,
  },
  {
    judul: "OPTK 2016",
    deskripsi:
      "Meraih Medali Emas Kumite Putri -50 kg, Medali Perak Kumite Putra Kelas Bebas, Medali Perunggu Kata Perorangan, Medali Perunggu Kumite Putri -55 kg, Medali Perunggu Kumite Putri -68 kg, Medali Perunggu Kumite Putra -55 kg",
    gambar: "",
    tahun: 2016,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 1,
    medaliPerunggu: 4,
    juaraUmum: 0,
  },
  {
    judul: "OPTK 2017",
    deskripsi:
      "Meraih Medali Emas Kumite Putri -50 kg, Medali Perak Kumite Putra -75 kg, dan Medali Perak Kumite Putra -60 kg",
    gambar: "/images/prestasi-5.jpg",
    tahun: 2017,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 2,
    medaliPerunggu: 0,
    juaraUmum: 0,
  },
  {
    judul: "OPTK 2018",
    deskripsi: "Meraih Medali Perunggu Kumite Putri -55 kg",
    gambar: "",
    tahun: 2018,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 0,
    medaliPerunggu: 1,
    juaraUmum: 0,
  },
  {
    judul: "Funakoshi Open Piala Gubernur DKI Jakarta 2019",
    deskripsi: "Meraih 4 Medali Perak dan 1 Medali Perunggu",
    gambar: "/images/prestasi-7.jpg",
    tahun: 2019,
    // --- Penambahan Medali ---
    medaliEmas: 0,
    medaliPerak: 4,
    medaliPerunggu: 1,
    juaraUmum: 0,
  },
  {
    judul: "OPTK 2022",
    deskripsi: "Meraih Medali Emas Kata Perorangan Putra",
    gambar: "/images/prestasi-8.jpg",
    tahun: 2022,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 0,
    medaliPerunggu: 0,
    juaraUmum: 0,
  },
  {
    judul: "Gadjah Mada Open Karate Championship 2023",
    deskripsi: "Meraih 2 Medali Emas dan 2 Medali Perak",
    gambar: "/images/prestasi-9.jpg",
    tahun: 2023,
    // --- Penambahan Medali ---
    medaliEmas: 2,
    medaliPerak: 2,
    medaliPerunggu: 0,
    juaraUmum: 0,
  },
  {
    judul: "Festival Olahraga Provinsi Banten 2024",
    deskripsi: "Meraih 1 Medali Emas dan 1 Medali Perunggu",
    gambar: "/images/prestasi-10.jpg",
    tahun: 2024,
    // --- Penambahan Medali ---
    medaliEmas: 1,
    medaliPerak: 0,
    medaliPerunggu: 1,
    juaraUmum: 0,
  },
  {
    judul: "Kejurnas Karate YPOK Demak 2024",
    deskripsi: "Meraih 3 Medali Emas, 4 Medali Perak, dan 1 Medali Perunggu",
    gambar: "/images/prestasi-11.jpg",
    tahun: 2024,
    // --- Penambahan Medali ---
    medaliEmas: 3,
    medaliPerak: 4,
    medaliPerunggu: 1,
    juaraUmum: 0,
  },
  {
    judul: "PKTJ Fest 2025",
    deskripsi:
      "Meraih Medali Emas Kata Perorangan Putra, Medali Emas Kumite Perorangan Putra, dan Medali Perunggu Kumite Perorangan Putra",
    gambar: "/images/prestasi-12.jpg",
    tahun: 2025,
    // --- Penambahan Medali ---
    medaliEmas: 2, // Medali Emas Kata Perorangan Putra, Medali Emas Kumite Perorangan Putra
    medaliPerak: 0,
    medaliPerunggu: 1, // Medali Perunggu Kumite Perorangan Putra
    juaraUmum: 0,
  },
];

// Sortir array berdasarkan tahun secara menurun (terbaru di atas)
// Jika tahunnya sama, urutan relatif akan dipertahankan
const prestasiList = [...originalPrestasiList].reverse();

export default prestasiList;