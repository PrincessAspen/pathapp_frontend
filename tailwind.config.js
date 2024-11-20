/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontSize: {
        '10xl': '12rem',   // 10xl - 12rem is a huge size
        '12xl': '15rem',   // 12xl - 15rem even larger
        '14xl': '20rem',   // 14xl - 20rem even larger
        '16xl': '25rem',   // 16xl - 25rem for colossal text
      },
    },

  },
  plugins: [],
}

