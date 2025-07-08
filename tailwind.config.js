/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // 인디고 블루
        background: {
          primary: '#0A0A0A',
          secondary: '#1A1A1A',
          tertiary: '#2D2D2D',
          quaternary: '#3A3A3A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          tertiary: '#6B7280',
        },
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}