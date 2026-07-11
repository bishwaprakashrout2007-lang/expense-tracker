/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        alabaster: '#FAF9F6',
        sand: '#F4F1EA',
        charcoal: '#2C302E',
        sage: '#879A77',
        terracotta: {
          DEFAULT: '#C27D65',
          50: '#FAF8F6',
          100: '#F5EBE6',
          200: '#ECD5CC',
          300: '#DEB4A3',
          400: '#CF9279',
          500: '#C27D65',
          600: '#AF6951',
          700: '#93533F',
          800: '#794333',
          900: '#643629',
          950: '#391D16',
        },
        brand: {
          50: '#FAF9F6',
          100: '#E4EAE0',
          200: '#CBDAC2',
          300: '#A6C19A',
          400: '#879A77',
          500: '#748765',
          600: '#5F6E52',
          700: '#4D5843',
          800: '#3F4738',
          900: '#2C302E',
          950: '#1F2220',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
