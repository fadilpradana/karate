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
  // Ref chatWindowRef tidak lagi diperlukan untuk deteksi klik di luar,
  // tetapi tetap dipertahankan jika ada kebutuhan lain di masa depan.
  const chatWindowRef = useRef(null); 

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

  const closeChat = useCallback(() => { // Menggunakan useCallback untuk stabilitas
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIsButtonExpanded(false);
    }, 400); 
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Efek untuk mengontrol scrolling halaman (khusus mobile)
  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Cek apakah perangkat mobile

    if (isOpen && isMobile) { // Hanya mencegah scroll jika chatbot terbuka DAN di perangkat mobile
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset'; // Mengembalikan scrolling normal
    }

    // Cleanup function: pastikan overflow dikembalikan saat komponen di-unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); // Bergantung pada state isOpen

  // MENGHAPUS: Efek untuk menutup chatbot saat klik di luar (khusus mobile)
  // useEffect(() => {
  //   const handleOutsideClickToCloseChat = (event) => {
  //     const isMobile = window.innerWidth <= 768;
  //     if (isOpen && isMobile && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
  //       closeChat();
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener('mousedown', handleOutsideClickToCloseChat);
  //     document.addEventListener('touchstart', handleOutsideClickToCloseChat);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleOutsideClickToCloseChat);
  //     document.removeEventListener('touchstart', handleOutsideClickToCloseChat);
  //   };
  // }, [isOpen, closeChat]);

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
    
    const chatHistoryForAPI = messages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text,
    }));
    chatHistoryForAPI.push({ role: 'user', content: userMessage.text });

    try {
      const supabaseFunctionUrl = 'https://unkauvoourtaoxdpdlst.supabase.co/functions/v1/chat-proxy';

      const response = await fetch(supabaseFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        <div ref={chatWindowRef} className={`chat-window on-${panelSide} ${isClosing ? 'closing' : ''}`}>
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
            {/* Indikator "mengetik..." saat isLoading true */}
            {isLoading && (
               <div className="chat-message bot typing-indicator">
                   <p>Mengetik<span>.</span><span>.</span><span>.</span></p>
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
