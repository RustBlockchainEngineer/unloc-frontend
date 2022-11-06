const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  prefix: "tw-",
  corePlugins: {
    preflight: false,
  },
  darkMode: ["class", ".theme-dark"],
  important: true,
  theme: {
    screens: {
      xs: "480px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        primary: "#e00a7f",
        primaryDark: "#ad1468",
      },
    },
  },
  plugins: [],
};
