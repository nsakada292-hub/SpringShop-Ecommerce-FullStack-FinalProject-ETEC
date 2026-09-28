/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Same brand palette as the storefront, kept consistent
        // across both apps — used sparingly here (accents, active
        // nav item, chart lines) since a dashboard needs more
        // restraint/contrast than the customer-facing site.
        brand: {
          limeGreen: "#4ce600",
          glowGreen: "#00e000",
          aqua: "#00e1ff",
          blue: "#009dff",
          skyBlue: "#2eaeff",
        },
      },
      fontFamily: {
        en: ["Lexend", "sans-serif"],
        kh: ["Kantumruy Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
