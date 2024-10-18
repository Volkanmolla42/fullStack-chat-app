import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Tüm IP adreslerinden erişime izin vermek için
    port: 5173, // Sunucunun çalışacağı port
  },
});
