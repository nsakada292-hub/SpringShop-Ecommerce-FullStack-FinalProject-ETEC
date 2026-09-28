// Shared brand tokens — copy-paste source of truth for both
// storefront/tailwind.config.js and admin-dashboard/tailwind.config.js.
// (Kept as a plain JS file, not an npm package, to stay simple —
// promote to a real shared workspace package later if the two
// tailwind configs drift.)

export const brandColors = {
  limeGreen: "#4ce600",
  glowGreen: "#00e000",
  aqua: "#00e1ff",
  blue: "#009dff",
  skyBlue: "#2eaeff",
};

export const fonts = {
  en: "Lexend",
  kh: "Kantumruy Pro",
};
