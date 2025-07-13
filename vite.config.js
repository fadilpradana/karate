import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tambahkan atau modifikasi bagian ini
  preview: {
    host: true, // Memungkinkan akses dari jaringan
    port: 4173, // Port default untuk preview, bisa disesuaikan
    strictPort: true,
    allowedHosts: ['karate.stmkg.ac.id'], // <-- Tambahkan host Anda di sini
  }
})