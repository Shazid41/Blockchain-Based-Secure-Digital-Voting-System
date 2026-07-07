/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#006A4E',
        'primary-dark': '#004D38',
        'primary-light': '#E8F3EF',
        accent: '#F42A41',
        page: '#F8F9FF',
        card: '#FFFFFF',
        text: '#121C2A',
        muted: '#5F6B76',
        border: '#BEC9C2',
        success: '#16834A',
        warning: '#D58A00',
        error: '#C62828',
        info: '#2563A6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Hind Siliguri', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        soft: '0 16px 45px rgba(18, 28, 42, 0.10)',
        glow: '0 22px 60px rgba(0, 106, 78, 0.16)',
      },
    },
  },
  plugins: [],
};
