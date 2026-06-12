/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-end premium amber-gold and orange marketplace colors
        primary: {
          50: '#f0f5ff',
          100: '#dce8ff',
          200: '#c1d7ff',
          300: '#97beff',
          400: '#649cff',
          500: '#2874F0',
          550: '#2874F0',
          600: '#1e5ecb',
          700: '#184bab',
          800: '#183f8c',
          900: '#193674',
          955: '#112149',
          950: '#112149',
        },
        accent: {
          50: '#fff9eb',
          100: '#ffeed1',
          200: '#ffdba0',
          300: '#ffc166',
          400: '#ffa62b',
          500: '#FF9F00',
          600: '#db8200',
          700: '#b46400',
          800: '#904e03',
          900: '#764006',
          950: '#442100',
        }
      },
    },
  },
  plugins: [],
}
