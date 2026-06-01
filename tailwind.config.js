/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#04050A',
          800: '#0A0C12',
          700: '#12151D',
          600: '#1B1F2A',
        },
        mist: {
          400: '#6B7180',
          200: '#A8AEBD',
          50:  '#E8EBF2',
        },
        accent: '#7CF0C8',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:  ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

