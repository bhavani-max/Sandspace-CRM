/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563eb", dark: "#1d4ed8", light: "#eff6ff" },
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
      },
    },
  },
  plugins: [],
};
