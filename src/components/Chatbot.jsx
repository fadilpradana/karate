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

// Komponen untuk ikon Salin (SVG)
const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

// Komponen untuk ikon Centang setelah Salin (SVG)
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#34AF52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


// Ikon Regenerate yang lebih bersih
const RegenerateIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
);


// Komponen untuk layar awal
const InitialScreen = ({ onSuggestionClick }) => {
    const suggestions = [
        { 
            text: 'Tanya Jadwal', 
            emoji: '📅', 
            query: 'Kapan jadwal latihan reguler dan latihan khusus STMKG Karate Club?' 
        },
        { 
            text: 'Tanya Filosofi', 
            emoji: '🥋',
            query: 'Apa filosofi logo dan filosofi brevet STMKG Karate Club?' 
        },      
        { 
            text: 'Struktur Pengurus', 
            emoji: '👥',
            query: 'Bagaimana struktur kepengurusan STMKG Karate Club?' 
        },
    ];

    return (
        <div className="initial-screen-container">
            <div className="welcome-text">
                Oss! Selamat datang di Dojo kami. Ada yang bisa saya bantu?
            </div>
            <div className="suggestion-buttons">
                {suggestions.map((suggestion, index) => (
                    <button 
                        key={suggestion.text}
                        onClick={() => onSuggestionClick(suggestion.query)} 
                        className="suggestion-button suggestion-button-animated"
                        style={{ '--animation-delay-index': index }}
                    >
                        <span role="img" aria-label="icon">{suggestion.emoji}</span>
                        {suggestion.text}
                    </button>
                ))}
            </div>
        </div>
    );
};


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  
  const initialMessages = [{ sender: 'bot', text: 'Oss! Selamat datang di Dojo kami. Ada yang bisa saya bantu?' }];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ y: window.innerHeight / 2 });
  const [panelSide, setPanelSide] = useState('left');
  
  const dragStartPos = useRef(0);
  const buttonRef = useRef(null);
  const chatBodyRef = useRef(null);
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

  const closeChat = useCallback(() => {
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

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => prev.length === 1 && prev[0].text === initialMessages[0].text ? [userMessage] : [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);
    
    const chatHistoryForAPI = messages
        .filter(msg => msg.text !== initialMessages[0].text)
        .map(msg => ({
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
      console.error("Error saat sendMessage:", error);
      const errorMessage = { sender: 'bot', text: 'Oss! Maaf, sepertinya Sensei AI sedang beristirahat sejenak. 🙏 Silakan coba bertanya lagi dalam beberapa saat ya.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (textToCopy) => {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;

    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            console.error('Gagal menyalin: Perintah tidak berhasil');
        }
    } catch (err) {
        console.error('Gagal menyalin', err);
    }

    document.body.removeChild(textArea);
  };

  const handleRegenerateResponse = async () => {
    if (isLoading) return;

    const historyWithoutLastBot = messages.slice(0, -1);
    const lastUserMessage = [...historyWithoutLastBot].reverse().find(msg => msg.sender === 'user');

    if (!lastUserMessage) return;

    setMessages(historyWithoutLastBot);
    setIsLoading(true);

    const chatHistoryForAPI = historyWithoutLastBot
        .filter(msg => msg.text !== initialMessages[0].text)
        .map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.text,
        }));

    try {
        const supabaseFunctionUrl = 'https://unkauvoourtaoxdpdlst.supabase.co/functions/v1/chat-proxy';
        const response = await fetch(supabaseFunctionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: chatHistoryForAPI }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gagal mendapatkan respon dari AI.');
        }
        
        const data = await response.json();
        const botMessage = { sender: 'bot', text: data.choices[0].message.content };
        setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
        console.error("Error saat handleRegenerateResponse:", error);
        const errorMessage = { sender: 'bot', text: 'Oss! Maaf, sepertinya Sensei AI sedang beristirahat sejenak. 🙏 Silakan coba bertanya lagi dalam beberapa saat ya.' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // [PERUBAHAN] Fungsi ini sekarang langsung mengirim pesan
  const handleSuggestionClick = (suggestionQuery) => {
    sendMessage(suggestionQuery);
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
            {messages.length === 1 && messages[0].text === initialMessages[0].text ? (
                <InitialScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
                messages.map((msg, index) => {
                    const isLastMessage = index === messages.length - 1;
                    const isBot = msg.sender === 'bot';

                    return (
                        <div key={index} className={`chat-message-container ${msg.sender}`}>
                            <div className={`chat-message ${msg.sender}`}>
                                <ReactMarkdown
                                    components={{
                                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                            {isLastMessage && isBot && !isLoading && (
                                <div className="message-actions">
                                    <button onClick={() => handleCopy(msg.text)} className="action-btn" title="Salin">
                                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                    <button onClick={handleRegenerateResponse} className="action-btn" title="Ulangi">
                                        <RegenerateIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
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
