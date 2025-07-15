// src/App.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot'; // Pastikan import ini ada

function App() {
  return (
    // Div ini menjadi layout utama untuk seluruh halaman
    <div className="min-h-screen bg-[#0E0004] text-white font-[Montserrat]">
      <Navbar />

      <main>
        {/* <Outlet> adalah placeholder dari React Router. 
          Semua komponen child (Home, Jadwal, Artikel, dll) dari main.jsx 
          akan dirender di sini.
        */}
        <Outlet />
      </main>
      
      {/* Kita letakkan Chatbot di sini, di luar <main>, 
        agar ia tetap berada di posisi yang sama (fixed) 
        di semua halaman yang ditampilkan oleh <Outlet>.
      */}
      <Chatbot />
    </div>
  );
}

export default App;
