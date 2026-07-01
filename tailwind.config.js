/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff4ed',
          100: '#ffe6d4',
          200: '#ffc9a8',
          300: '#ffa372',
          400: '#ff7540',
          500: '#ff531a',
          600: '#C8611A',
          700: '#a34c12',
          800: '#8B3A0F',
          900: '#6b2c0b',
          950: '#3a1404',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F5A623',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          900: '#0d0500',
          800: '#1a0a00',
          700: '#2d1200',
          600: '#3d1800',
          500: '#5c2400',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Playfair Display', 'ui-serif', 'Georgia'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'ticker': 'ticker 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245,166,35,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8611A 0%, #F5A623 50%, #8B3A0F 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0d0500 0%, #1a0a00 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(13,5,0,0.3) 0%, rgba(13,5,0,0.7) 60%, rgba(13,5,0,0.95) 100%)',
      },
    },
  },
  plugins: [],
}
