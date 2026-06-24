import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  
  server: {
    https: false,
    host: false,
    port: 5174, 
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/**'],
  },

  build: {
    outDir: "dist",
  },

  assetsInclude: ["*/.png"],
});