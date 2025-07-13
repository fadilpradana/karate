/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        league: ['"League Gothic"', 'sans-serif'],
        mont: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#2A1436',     // ungu
        accent: '#FF9F1C',      // kuning/oranye
        dark: '#0E0004',        // hitam
        light: '#E7E7E7',       // abu terang
      }
    },
  },
  plugins: [],
}
