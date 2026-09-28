/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class", // toggled via a `dark` class on <html> for the dark/light switch
  theme: {
    extend: {
      colors: {
        // "Paradisiacal lagoon" brand palette — use as gradients
        // (e.g. from brand.green to brand.blue) for hero sections,
        // primary buttons, and active/selected states.
        brand: {
          limeGreen: "#4ce600",
          glowGreen: "#00e000",
          aqua: "#00e1ff",
          blue: "#009dff",
          skyBlue: "#2eaeff",
        },
      },
      fontFamily: {
        // Use `font-kh` for Khmer copy, `font-en` (default) for English.
        // Load both from Google Fonts in index.html.
        en: ["Lexend", "sans-serif"],
        kh: ["Kantumruy Pro", "sans-serif"],
      },
      backgroundImage: {
        "lagoon-gradient": "linear-gradient(135deg, #4ce600 0%, #00e1ff 55%, #009dff 100%)",
      },
    },
  },
  plugins: [],
};
