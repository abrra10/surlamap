/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fugaz: ["Fugaz One", "cursive"],
        montserrat: ["Montserrat", "sans-serif"],
        marcellus: ["Marcellus", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
