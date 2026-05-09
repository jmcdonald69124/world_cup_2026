/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wcGreen: '#00A550',
        wcRed: '#DA291C',
        wcBlue: '#003DA5',
        wcGold: '#FFD700',
        wcDark: '#0a0a0f',
        wcCard: '#111827',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
