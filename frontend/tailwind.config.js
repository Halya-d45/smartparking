/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(0, 0, 0, 0.05)",
        input: "rgba(0, 0, 0, 0.02)",
        ring: "rgba(59, 130, 246, 0.5)",
        background: "#f9f7f2",
        foreground: "#1a1a1a",
        primary: "#3b82f6",
        cream: {
          50: '#fdfbf7',
          100: '#f8f5f0',
          200: '#eee9e0',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          100: '#f1f5f9',
        },
        blue: {
          500: '#3b82f6', // Electric blue
        },
        indigo: {
          600: '#4f46e5', // Indigo
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}