/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f5',
          100: '#e8ebe6',
          200: '#d1d7cd',
          300: '#b0bbaa',
          400: '#8B9B7E',
          500: '#6d7d62',
          600: '#56634d',
          700: '#454f3f',
          800: '#394135',
          900: '#2C3E2F',
        },
        cream: {
          50: '#fdfcfb',
          100: '#F5F1E8',
          200: '#ebe5d8',
          300: '#dfd5c3',
          400: '#d0c2ab',
          500: '#c0af93',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}