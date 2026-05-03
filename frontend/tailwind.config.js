/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#f7f4ef',
          cream: '#f0ebe3',
          border: '#e5e0d8',
          card: '#ffffff',
          hover: '#ede9e3',
          muted: '#b5a9a2',
          text: '#2c2420',
          secondary: '#7a6e68',
        },
        brand: {
          50: '#edf7f4',
          100: '#d2ede7',
          200: '#a8dbd0',
          300: '#72c3b6',
          400: '#3ea89b',
          500: '#2b8a7e',
          600: '#226f65',
          700: '#1c5a52',
          800: '#184843',
          900: '#153c38',
        },
        teal: {
          DEFAULT: '#2b8a7e',
          dark: '#226f65',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'nav': '0 1px 0 0 #e5e0d8',
        'card': '0 1px 3px 0 rgba(44,36,32,0.08)',
        'panel': '0 0 0 1px rgba(44,36,32,0.08), 0 4px 20px rgba(44,36,32,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-left': 'slideLeft 0.25s ease-out',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideLeft: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.25 } },
      }
    },
  },
  plugins: [],
}
