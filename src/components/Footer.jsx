import { Link } from 'react-router-dom';
// Pastikan path ke logo Anda sudah benar
import brevetLogo from '../assets/brevet.png'; 

export default function Footer() {
  return (
    <footer className="relative z-[30] bg-[#0E0004] text-[#E7E7E7] text-xs sm:text-sm py-6 sm:py-10 px-4 sm:px-6 md:px-20 border-t border-[#333]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left w-full md:w-1/3 order-3 md:order-1">&copy; With Love STMKG Karate Club Periode 2025</div>
            <div className="w-full md:w-1/3 flex justify-center order-1 md:order-2"><img src={brevetLogo} alt="Logo Brevet" className="h-4 sm:h-5" /></div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 font-[Montserrat] font-light text-center md:text-right w-full md:w-1/3 order-2 md:order-3">
                <Link to="/" className="hover:text-[#FF9F1C]">Beranda</Link>
                <Link to="/pengurus" className="hover:text-[#FF9F1C]">Pengurus</Link>
                <Link to="/jadwal" className="hover:text-[#FF9F1C]">Jadwal</Link>
                <Link to="/artikel" className="hover:text-[#FF9F1C]">Artikel</Link>
                <Link to="/kontak" className="hover:text-[#FF9F1C]">Kontak</Link>
            </div>
        </div>
    </footer>
  );
}