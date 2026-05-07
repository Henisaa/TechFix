import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
    
    proxy: {
      "/gateway": {
        target: "http://localhost:8090",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  define: {
    
    "import.meta.env.VITE_GATEWAY_URL": JSON.stringify(
      process.env.VITE_GATEWAY_URL || "http://localhost:8090"
    ),
  },
});
