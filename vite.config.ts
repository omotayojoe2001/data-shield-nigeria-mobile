
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Exclude React Native from web builds
      "react-native": path.resolve(__dirname, "src/lib/react-native-web-shim.ts"),
    },
  },
  define: {
    // Ensure we're building for web
    __DEV__: mode === 'development',
  },
  optimizeDeps: {
    exclude: [
      'react-native',
      'expo-network',
      'expo-haptics',
      '@react-native-async-storage/async-storage',
    ],
  },
}));
