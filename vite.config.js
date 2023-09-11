import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import visualizer from "rollup-plugin-visualizer";
import checker from "vite-plugin-checker";
export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router", "react-router-dom"],
            rollbar: ["rollbar"],
            fbApp: ["@firebase/app"],
            fbAuth: ["@firebase/auth"],
            fbCheck: ["@firebase/app-check"],
            fbDb: ["@firebase/database"],
            fbFunctions: ["@firebase/functions"]
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true
    },
    plugins: [react(), svgr(), visualizer(), checker({ typescript: true })],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts"
    }
  };
});
