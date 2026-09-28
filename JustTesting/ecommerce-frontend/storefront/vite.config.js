import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Customer-facing storefront app — runs on its own port,
// separate from the admin-dashboard app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
