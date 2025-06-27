import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <--- penting untuk Tailwind
import { AuthProvider } from './context/AuthContext.jsx' // <-- Impor AuthProvider
import { BrowserRouter } from 'react-router-dom'; // <-- Impor BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* <-- Bungkus dengan BrowserRouter untuk routing */}
      <AuthProvider> {/* <-- Bungkus dengan AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)