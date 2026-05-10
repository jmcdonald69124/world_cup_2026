/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wcGreen: '#00A550',
        wcRed:   '#DA291C',
        wcBlue:  '#003DA5',
        wcGold:  '#FFD700',
        wcDark:  '#080808',
        wcCard:  '#111111',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};
