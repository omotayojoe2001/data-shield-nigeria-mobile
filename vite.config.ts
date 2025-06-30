
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Alias React Native to our web shim
      'react-native': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      'react-native-safe-area-context': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      '@expo/vector-icons': 'lucide-react',
      'expo-haptics': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      'expo-network': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      'expo-splash-screen': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      'expo-status-bar': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      'expo-linear-gradient': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './src/lib/react-native-web-shim.ts'),
      '@react-navigation/native': path.resolve(__dirname, './src/lib/react-navigation-web-shim.ts'),
      '@react-navigation/bottom-tabs': path.resolve(__dirname, './src/lib/react-navigation-web-shim.ts'),
      '@react-navigation/native-stack': path.resolve(__dirname, './src/lib/react-navigation-web-shim.ts'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: [
      'react-native',
      'react-native-safe-area-context',
      '@expo/vector-icons',
      'expo-haptics',
      'expo-network',
      'expo-splash-screen',
      'expo-status-bar',
      'expo-linear-gradient',
      '@react-native-async-storage/async-storage',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs',
      '@react-navigation/native-stack',
    ]
  }
}));
