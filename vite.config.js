import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import basicSsl from '@vitejs/plugin-basic-ssl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  
  server: {
    https: true,
    host: false, // Desactiva la exposición por IP (vuelve a localhost)
    port: 3000,  // Forzamos el puerto 3000 aquí
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
  },

  build: {
    outDir: "dist",
  },

  assetsInclude: ["*/.png"],
});