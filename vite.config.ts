/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/nutri-care/",
  build: {
    outDir: "dist",
  },
  test: {
    globals: true,
    environment: "node",
  },
});
