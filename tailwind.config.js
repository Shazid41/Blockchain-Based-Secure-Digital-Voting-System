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
        page: '#F4F6F5',
        card: '#FFFFFF',
        text: '#1F2937',
        muted: '#5F6B76',
        border: '#D8E0DD',
        success: '#16834A',
        warning: '#D58A00',
        error: '#C62828',
        info: '#2563A6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Hind Siliguri', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(31, 41, 55, 0.08)',
      },
    },
  },
  plugins: [],
};
