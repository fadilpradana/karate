// src/App.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

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
      
    </div>
  );
}

export default App;
