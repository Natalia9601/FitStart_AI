/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#FBEDF1',
          100: '#F4DDE3',
          200: '#E8BFCB',
          300: '#DCA7B7',
          400: '#CF8FA3',
          500: '#C0788F',
          600: '#A55E74',
          700: '#83485A',
          800: '#513B35',
        },
        cream: {
          50: '#FFFDF8',
          100: '#FFF6EA',
          200: '#FFFCF8',
          300: '#F5E9D8',
          400: '#EDE0D4',
          500: '#D9C4AE',
        },
        choco: {
          400: '#C2A395',
          500: '#A98270',
          600: '#8A6A59',
          700: '#513B35',
          800: '#3D2A25',
        },
        sage: {
          200: '#DCE8DD',
          300: '#B8D0BB',
          400: '#8FB894',
          500: '#6B9E72',
        },
        amber: {
          soft: '#F2D6A8',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 6px 24px -6px rgba(81, 59, 53, 0.10)',
        'soft-lg': '0 16px 48px -12px rgba(81, 59, 53, 0.16)',
        glow: '0 0 0 1px rgba(169, 130, 112, 0.12), 0 8px 28px -8px rgba(169, 130, 112, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
