/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        sidebar: '#111827',
        primary: '#5B3FD4',
        accent: '#8B5CF6',
        text: '#F8FAFC',
      }
    },
  },
  plugins: [],
}
