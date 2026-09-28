/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Kantumruy Pro"', 'sans-serif'],
        sans: ['Lexend', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#4ce600',
          emerald: '#00e000',
          aqua: '#00e1ff',
          blue: '#009dff',
          sky: '#2eaeff',
        },
      },
    },
  },
  plugins: [],
};
