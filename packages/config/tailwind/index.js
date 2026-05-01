/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D1B3E',
          50: '#E8EBF3',
          100: '#C6CEDF',
          200: '#9FAEC8',
          300: '#788DB1',
          400: '#5A729F',
          500: '#3D578D',
          600: '#2E4278',
          700: '#1F2E62',
          800: '#0D1B3E',
          900: '#060D1F',
        },
        accent: {
          DEFAULT: '#C9A84C',
          50: '#FAF4E5',
          100: '#F2E5BF',
          200: '#E8D595',
          300: '#DEC46B',
          400: '#D4B752',
          500: '#C9A84C',
          600: '#B8943A',
          700: '#9A7A2C',
          800: '#7C611E',
          900: '#5E4710',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
