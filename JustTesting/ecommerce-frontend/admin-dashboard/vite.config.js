import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Admin-only app — separate build/deploy from the storefront,
// runs on a different port during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
