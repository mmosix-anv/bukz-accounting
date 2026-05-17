/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: ['selector', '[data-mantine-color-scheme="dark"]'],
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
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
