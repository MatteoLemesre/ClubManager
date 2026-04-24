/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2fd',
          100: '#dce5fb',
          200: '#b9caf7',
          300: '#96aff3',
          400: '#5b7eec',
          500: '#3560ea',
          600: '#1f4fe8',
          700: '#1840c6',
          800: '#1333a4',
          900: '#0e2782',
        },
        surface: {
          50:  '#f7f8fc',
          100: '#eef0f7',
          200: '#dde0ed',
          300: '#c4c9df',
          400: '#9ba3c4',
          500: '#7880a8',
          600: '#5c648d',
          700: '#474f72',
          800: '#333a57',
          900: '#1e2340',
        },
      },
    },
  },
  plugins: [],
}
