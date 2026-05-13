/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sunny: {
          50: '#FFF8E7',
          100: '#FFEFC4',
          200: '#FFD97A',
          300: '#FFC940',
          400: '#FFB000',
          500: '#E69D00',
          600: '#CC8A00',
          700: '#A36E00',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#444444',
          600: '#333333',
          700: '#222222',
          800: '#111111',
          900: '#0A0A0A',
        },
        navy: {
          500: '#1a2744',
          600: '#141e36',
          700: '#0e1628',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'count-up': 'countUp 2s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
