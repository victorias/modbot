/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        index: "repeat(6, minmax(0px, auto))",
      },
      gridTemplateRows: {
        index: "repeat(5, minmax(0px, auto))",
      },
    },
  },
  plugins: [],
};
