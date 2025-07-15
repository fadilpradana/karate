// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';
import bgImage from '../assets/bg13.jpg'; // Pastikan path ini sesuai dengan struktur proyek Anda

// Komponen untuk ikon kirim (SVG)
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
  </svg>
);

// Komponen untuk ikon refresh (SVG)
const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="#AEAEB2"/>
    </svg>
);


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  
  const initialMessages = [{ sender: 'bot', text: 'Oss! Selamat datang di Dojo kami. Ada yang bisa saya bantu?' }];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ y: window.innerHeight / 2 });
  const [panelSide, setPanelSide] = useState('right');
  
  const dragStartPos = useRef(0);
  const buttonRef = useRef(null);
  const chatBodyRef = useRef(null);

  const toggleChatbot = () => {
    if (isOpen) {
      closeChat();
      return;
    }

    if (buttonRef.current && buttonRef.current.classList.contains('dragging-check')) {
        return;
    }

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      if (!isButtonExpanded) {
        setIsButtonExpanded(true);
      } else {
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIsButtonExpanded(false);
    }, 400);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isButtonExpanded && !isOpen && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsButtonExpanded(false);
      }
    };

    if (isButtonExpanded && !isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isButtonExpanded, isOpen]);


  const handleDragStart = useCallback((e) => {
    if (buttonRef.current) {
        buttonRef.current.classList.remove('dragging-check');
    }
    setIsDragging(true);
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = clientY - position.y;
    if (buttonRef.current) {
      buttonRef.current.classList.add('dragging');
    }
  }, [position.y]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
    
    if (buttonRef.current) {
        buttonRef.current.classList.add('dragging-check');
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const viewportWidth = window.innerWidth;
    if (clientX < viewportWidth / 2 && panelSide === 'right') {
        setPanelSide('left');
    } else if (clientX > viewportWidth / 2 && panelSide === 'left') {
        setPanelSide('right');
    }

    const newY = Math.max(50, Math.min(clientY - dragStartPos.current, window.innerHeight - 50));
    setPosition({ y: newY });
  }, [isDragging, panelSide]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (buttonRef.current) {
      buttonRef.current.classList.remove('dragging');
    }
  }, []);

  useEffect(() => {
    const options = { passive: false };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, options);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove, options);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    const systemMessage = {
      role: 'system',
      content: `Anda adalah "Sensei AI", asisten virtual untuk Dojo Karate 'STMKG KARATE CLUB'. Anda harus selalu ramah, sopan, dan menggunakan sapaan "Oss!". 
      Tugas Anda adalah menjawab pertanyaan pengunjung seputar informasi umum dojo. Gunakan format Markdown untuk penekanan (seperti **bold**) dan untuk membuat link.
      
      Berikut adalah informasi yang Anda miliki:
      - **Nama Dojo**: STMKG Karate Club
      - **Alamat**: Jl. Meteorologi No.5, Tanah Tinggi, Kec. Tangerang, Kota Tangerang, Banten 15221
      - **Jadwal Latihan Rutin**: Setiap Sabtu pagi, jam 07.00 - 09.30 WIB.
      - **Jadwal Latihan Khusus**: Program Bela Diri Taruna (fokus aplikasi bela diri di dunia nyata), setiap Senin sore, jam 16.00 - 17.45 WIB.
      - **Kewajiban Latihan**: Latihan karate **wajib** untuk seluruh Taruna/i tingkat 1.
      - **Prosedur Izin/Sakit (Tingkat 1)**: Jika sakit atau berhalangan hadir, wajib memberitahukan kepada Komandan Karate dan Pembina Ketarunaan. Untuk izin sakit (baik ringan maupun berat), **wajib** melampirkan surat sakit kepada Komandan Karate.
      - **Struktur Pengurus**: Untuk melihat struktur pengurus, silakan kunjungi halaman [berikut ini](https://karate.stmkg.ac.id/pengurus).
      - **Prestasi**: Untuk melihat daftar prestasi, silakan kunjungi [halaman ini](https://karate.stmkg.ac.id).
      
      - **Sumpah Karate**:
        1. Sanggup memelihara kepribadian;
        2. Sanggup patuh pada kejujuran;
        3. Sanggup mempertinggi prestasi;
        4. Sanggup menjaga sopan santun;
        5. Sanggup menguasai diri.

      - **Sejarah STMKG Karate Club**:
        STMKG Karate Club, sebuah wadah pembinaan penguasaan bela diri dan karakter yang berdedikasi tinggi bagi para Taruna dan Taruni. Awal berdirinya organisasi ini didirikan atas inisiatif Bapak Dr. Ir. Suko Adi Prayitno, M.Si., M.I.Kom. STMKG Karate Club beroperasi di bawah naungan Komandan Batalyon 2 Resimen Taruna STMKG, dengan Komandan Karate sebagai pimpinan tertinggi di dalam organisasi. Saat ini, pembinaan diberikan oleh Pembina Ayu Adi Justicea S.T., S.ST., M.App.Sc. Dengan semangat yang membara serta visi kuat untuk mencetak Taruna dan Taruni yang tak hanya tangguh secara fisik namun juga disiplin tinggi serta menguasai seni bela diri karate yang autentik, STMKG Karate Club menjadi pilar fundamental dalam pengembangan potensi holistik setiap Taruna. Kami berkomitmen menanamkan nilai-nilai karate seperti kehormatan, integritas, dan ketekunan, yang membentuk individu bermental kuat dan siap menghadapi berbagai tantangan baik di lingkungan kampus maupun dalam kehidupan bermasyarakat.

      - **Filosofi Logo**:
        **Bintang Prestasi** melambangkan pencapaian luar biasa dalam perlombaan karate. Setiap satu bintang mewakili lima medali emas yang diraih oleh karateka STMKG pada tingkat nasional. **Lingkaran** melambangkan kebulatan tekad dan semangat karateka dalam melaksanakan aktivitasnya di bidang karate. **Arah Mata Angin** melambangkan arah dan tujuan yang ingin dicapai. **Merah** melambangkan keberanian akan sebuah tindakan. **Kuning** melambangkan kreativitas. **Biru** melambangkan tanggungjawab dan bisa diandalkan. **Tulisan Warna Hitam** melambangkan kekuasaan karateka yang harus sanggup menguasai diri sesuai dengan sumpah karate yang kelima. **Putih** melambangkan ketulusan dan saling menghargai.

      - **Filosofi Brevet**:
        **Lingkaran** sebagai bentuk kewaspadaan seorang karateka, mengembangkan rasa empati, dan simpati. **Arah Mata Angin** melambangkan arah dan tujuan yang ingin dicapai, serta menandakan naungan Sekolah Tinggi Meteorologi Klimatologi dan Geofisika. **Dua Tate Zuki**, pukulan mengepal setengah terbalik dan pukulan ke arah kepala, melambangkan tekad, semangat, dan kemauan kuat seorang Taruna/i untuk berlatih. **Dua Tangan Nukite**, serangan dengan tangan seperti tombak, melambangkan perjuangan sensei dan senpai terdahulu karena tombak merupakan senjata tradisional. **Dua Sayap (6 Bulu)** merupakan perwujudan STMKG Karate sebagai organisasi dinamis. Enam bulu menunjukkan jumlah warna sabuk di karate dan semangat membangun prestasi. **STMKG KARATE CLUB** adalah wadah latihan fisik, mental baja, dan penempaan diri dengan penuh kesadaran, itikad baik, serta tanggung jawab terhadap cita-cita Bangsa.

      Jika ada pertanyaan di luar topik ini, katakan dengan sopan bahwa Anda hanya bisa menjawab seputar dojo dan sarankan untuk menghubungi pengurus via Instagram: @karate.stmkg. Jangan menjawab pertanyaan tentang coding, atau topik umum lainnya.`
    };
    
    const currentChatHistory = [...messages, userMessage];
    const mappedMessages = currentChatHistory.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text,
    }));
    const chatHistoryForAPI = [systemMessage, ...mappedMessages];

    try {
      // PERUBAHAN: Panggil Edge Function Anda, bukan OpenRouter langsung
      // Ganti URL ini dengan URL Edge Function Anda
      const supabaseFunctionUrl = 'https://unkauvoourtaoxdpdlst.supabase.co/functions/v1/chat-proxy';

      const response = await fetch(supabaseFunctionUrl, {
        method: "POST",
        headers: {
          // Tidak perlu lagi mengirim Authorization header dari client
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Kirim hanya messages, karena model dan detail lain diatur di Edge Function
          messages: chatHistoryForAPI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error?.message || 'Gagal mendapatkan respon dari AI.');
      }
      
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.choices[0].message.content };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Error saat handleSend:", error);
      const errorMessage = { sender: 'bot', text: 'Oss! Maaf, sepertinya Sensei AI sedang beristirahat sejenak. 🙏 Silakan coba bertanya lagi dalam beberapa saat ya.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className={`chat-window on-${panelSide} ${isClosing ? 'closing' : ''}`}>
          <div className="chat-header">
            <div className="header-content">
                <div className="avatar">🥋</div>
                <div>
                    <h2>Sensei AI</h2>
                    <p>Asisten virtual kamu..!</p>
                </div>
            </div>
            <div className="header-buttons">
                <button onClick={handleRefresh} className="refresh-btn" title="Mulai percakapan baru">
                    <RefreshIcon />
                </button>
                <button onClick={closeChat} className="close-btn" title="Tutup chat">&times;</button>
            </div>
          </div>
          <div 
            className="chat-body" 
            ref={chatBodyRef}
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}
            {isLoading && (
               <div className="chat-message bot">
                 <p className="loading-dots">
                     <span>.</span><span>.</span><span>.</span>
                 </p>
               </div>
            )}
          </div>
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaanmu..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
              <SendIcon />
            </button>
          </form>
        </div>
      )}
      {!isOpen && (
        <button 
          ref={buttonRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={toggleChatbot} 
          className={`chatbot-toggle-button ${isButtonExpanded ? 'expanded' : ''} on-${panelSide}`}
          style={{ top: `${position.y}px` }}
        >
          <div className="toggle-button-inner">
            <span className="gradient-text-chat">Say Hello!</span>
            <span className="emoji-wave">👋</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
