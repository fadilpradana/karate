// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

// Komponen untuk ikon kirim (SVG)
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Oss! Selamat datang di Dojo kami. Ada yang bisa saya bantu?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State untuk fungsionalitas geser (drag)
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ y: window.innerHeight / 2 });
  const dragStartPos = useRef(0);
  const buttonRef = useRef(null);
  
  const chatBodyRef = useRef(null);

  // ==================================================================
  // BAGIAN YANG DIPERBAIKI
  // ==================================================================
  const toggleChatbot = () => {
    // Jika jendela sudah terbuka, maka kita pasti ingin menutupnya.
    // Logika drag tidak perlu diperiksa di sini.
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    // Jika jendela tertutup, baru kita periksa apakah tombol sedang digeser
    // sebelum membukanya.
    if (buttonRef.current && !buttonRef.current.classList.contains('dragging-check')) {
      setIsOpen(true);
    }
  };
  // ==================================================================

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // --- LOGIKA UNTUK PANEL GESER ---
  const handleMouseDown = (e) => {
    // Reset drag check
    if (buttonRef.current) {
        buttonRef.current.classList.remove('dragging-check');
    }
    setIsDragging(true);
    dragStartPos.current = e.clientY - position.y;
    if (buttonRef.current) {
      buttonRef.current.classList.add('dragging');
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Tandai bahwa proses drag sedang terjadi
    if (buttonRef.current) {
        buttonRef.current.classList.add('dragging-check');
    }

    const newY = Math.max(50, Math.min(e.clientY - dragStartPos.current, window.innerHeight - 50));
    setPosition({ y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (buttonRef.current) {
      buttonRef.current.classList.remove('dragging');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  // --- AKHIR LOGIKA PANEL GESER ---

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
      Tugas Anda adalah menjawab pertanyaan pengunjung seputar jadwal, lokasi, dan program latihan. Gunakan format Markdown untuk penekanan (seperti **bold**) dan untuk membuat link.
      - Nama Dojo: STMKG Karate Club
      - Alamat: Jl. Meteorologi No.5, Tanah Tinggi, Kec. Tangerang, Kota Tangerang, Banten 15221
      - Jadwal Latihan Rutin: Setiap Sabtu pagi, jam 07.00 - 09.30 WIB.
      - Jadwal latihan khusus: nama programnya Bela Diri Taruna yang fokus aplikasi bela diri penerapan di dunia nyata. setiap senin sore 16.00 - 17.45
      - Struktur pengurus: Untuk melihat struktur pengurus, silakan kunjungi halaman [berikut ini](https://karate.stmkg.ac.id/pengurus).
      Jika ada pertanyaan di luar topik ini, katakan dengan sopan bahwa Anda hanya bisa menjawab seputar dojo dan sarankan untuk menghubungi pengurus via instagram: @karate.stmkg Jangan menjawab pertanyaan tentang coding, sejarah, atau topik umum lainnya.`
    };
    
    const currentChatHistory = [...messages, userMessage];
    const mappedMessages = currentChatHistory.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text,
    }));
    const chatHistoryForAPI = [systemMessage, ...mappedMessages];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2:free",
          messages: chatHistoryForAPI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData); // Log error detail ke konsol
        throw new Error(errorData.error?.message || 'Gagal mendapatkan respon dari AI.');
      }
      
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.choices[0].message.content };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Error saat handleSend:", error);
      // Tampilkan pesan error yang lebih spesifik ke pengguna
      const errorMessage = { sender: 'bot', text: `Maaf, terjadi gangguan: ${error.message}` };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          {/* ... isi jendela chat tidak berubah ... */}
          <div className="chat-header">
            <div className="header-content">
                <div className="avatar">🥋</div>
                <div>
                    <h2>Sensei AI</h2>
                    <p>Online</p>
                </div>
            </div>
            <button onClick={toggleChatbot} className="close-btn">&times;</button>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
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
          onMouseDown={handleMouseDown}
          onClick={toggleChatbot} 
          className="chatbot-toggle-button"
          style={{ top: `${position.y}px` }} // Atur posisi Y secara dinamis
        >
            <span className="gradient-text-chat">Say Hello! 👋</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
