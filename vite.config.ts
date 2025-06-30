
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
      'expo',
      'expo-network',
      'expo-haptics',
      'expo-router',
      'expo-splash-screen',
      'expo-status-bar',
      'expo-linear-gradient',
      'expo-linking',
      'expo-constants',
      'expo-font',
      'expo-web-browser',
      '@react-native-async-storage/async-storage',
      '@expo/metro-config',
      '@expo/vector-icons',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-svg',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs',
      '@react-navigation/native-stack',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        'react-native',
        'expo',
        'expo-network',
        'expo-haptics',
        'expo-router',
        'expo-splash-screen',
        'expo-status-bar',
        'expo-linear-gradient',
        'expo-linking',
        'expo-constants',
        'expo-font',
        'expo-web-browser',
        '@react-native-async-storage/async-storage',
        '@expo/metro-config',
        '@expo/vector-icons',
        'react-native-safe-area-context',
        'react-native-screens',
        'react-native-svg',
        '@react-navigation/native',
        '@react-navigation/bottom-tabs',
        '@react-navigation/native-stack',
      ]
    }
  }
}));
