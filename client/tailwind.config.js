/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': '#2ecc40',
        'eco-light': '#e6faee',
      }
    },
  },
  plugins: [],
}