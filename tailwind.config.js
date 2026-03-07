/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tiktok-black': '#000000',
        'tiktok-gray': '#121212',
        'tiktok-pink': '#ff0050',
        'tiktok-cyan': '#00f2ea',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}