import { defineConfig } from "vite";
//import reactRefresh from "@vitejs/plugin-react-refresh";
import react from "@vitejs/plugin-react";
import path from "path";
import rollupReplace from "@rollup/plugin-replace";
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        // "@": path.resolve(__dirname, "./src"),
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },

  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      },
    }),
    react(),
    //reactRefresh(),
  ],

  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },

  // Add SPA routing support for production builds
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },

  // Ensure proper base path handling
  base: '/',
});
