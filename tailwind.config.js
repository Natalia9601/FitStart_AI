/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pink-based Natural Wellness palette
        cream: {
          50: '#FBF7F6',
          100: '#FBF7F6',
          200: '#FFFFFF',
          300: '#F3E8E6',
          400: '#EAE3E5',
          500: '#D8CDD0',
        },
        ink: {
          400: '#8A7E82',
          500: '#6B6065',
          600: '#4A4045',
          700: '#2D2629',
          800: '#1F1A1D',
        },
        primary: {
          50: '#FDF0F3',
          100: '#F5D8DE',
          200: '#E8B4C0',
          300: '#D995A8',
          400: '#C97A8A',
          500: '#B86375',
          600: '#A05A6A',
          700: '#854858',
          800: '#6A3845',
        },
        sage: {
          50: '#FDF0F3',
          100: '#F5D8DE',
          200: '#E8B4C0',
          300: '#D995A8',
          400: '#C97A8A',
          500: '#B86375',
        },
        coral: {
          50: '#FDF5F0',
          100: '#F5E4D8',
          200: '#E8C8A6',
          300: '#D99578',
          400: '#C97A6A',
          500: '#B86355',
        },
        sky: {
          50: '#EDF5FA',
          100: '#D4E6F2',
          200: '#A8CCE4',
          300: '#7BAFD4',
          400: '#5A9EC9',
          500: '#3D7FA8',
        },
        gold: {
          50: '#FBF5E8',
          100: '#F2E4C4',
          200: '#E4CB8F',
          300: '#D4B06A',
          400: '#C9A05A',
          500: '#B08540',
        },
        rose: {
          50: '#F7EEF0',
          100: '#ECD4D8',
          200: '#D4A0A8',
          300: '#B87A8A',
          400: '#A06070',
          500: '#854858',
        },
        green: {
          50: '#EDF5ED',
          100: '#D4E8D4',
          200: '#A8D0A8',
          300: '#7BB87B',
          400: '#5A9A5A',
          500: '#3D7A3D',
        },
        red: {
          50: '#FDF0F0',
          100: '#F5D4D4',
          200: '#E8A8A8',
          300: '#D97A7A',
          400: '#C95A5A',
          500: '#B04040',
        },
        // legacy aliases for compatibility
        blush: {
          50: '#FBF7F6',
          100: '#F3E8E6',
          200: '#EAE3E5',
          300: '#D8CDD0',
          400: '#C97A8A',
          500: '#B86375',
          600: '#B86375',
          700: '#A05A6A',
          800: '#6A3845',
        },
        choco: {
          400: '#7A6B70',
          500: '#C97A8A',
          600: '#B86375',
          700: '#2D2629',
          800: '#1F1A1D',
        },
        amber: {
          soft: '#F3E8E6',
        },
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
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
