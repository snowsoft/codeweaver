/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007ACC',
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#007ACC', // default
          600: '#005A9E',
          700: '#004175',
          800: '#00294D',
          900: '#001124'
        },
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
      },
      ringColor: {
        primary: '#007ACC',
      }
    },
  },
  plugins: [],
}