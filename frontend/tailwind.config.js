/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0f', // Deep space black
          900: '#111118', // Card backgrounds
          800: '#1a1a24', // Secondary elements
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