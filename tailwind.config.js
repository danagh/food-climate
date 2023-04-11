/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'green-theme': '#69f0ae',
        'purple-theme': '#9c27b0'
      }
    },
  },
  plugins: [],
}

