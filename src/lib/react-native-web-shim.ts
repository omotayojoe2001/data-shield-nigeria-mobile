
import React from 'react';

// React Native Web Shim - provides empty implementations for web
export const Platform = {
  OS: 'web' as const,
  select: (obj: any) => obj.web || obj.default,
};

export const Dimensions = {
  get: () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }),
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

// Component mappings
export const View = 'div';
export const Text = 'span';
export const TouchableOpacity = 'button';
export const ScrollView = 'div';
export const SafeAreaView = 'div';
export const ActivityIndicator = ({ size = 'small', color = '#007AFF' }: { size?: string; color?: string }) => (
  <div 
    className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
    style={{ 
      width: size === 'large' ? '32px' : '16px', 
      height: size === 'large' ? '32px' : '16px',
      borderTopColor: color
    }}
  />
);

// Safe Area Context
export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

// Expo modules
export const StatusBar = () => null;

// AsyncStorage shim
export const AsyncStorage = {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
};

// Haptics shim
export const Haptics = {
  impactAsync: async () => {},
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
};

// Network shim
export const Network = {
  getNetworkStateAsync: async () => ({
    isConnected: navigator.onLine,
    type: 'wifi',
  }),
};

// Splash Screen shim
export const SplashScreen = {
  preventAutoHideAsync: async () => {},
  hideAsync: async () => {},
};

// Alert shim
export const Alert = {
  alert: (title: string, message?: string) => {
    if (message) {
      alert(`${title}: ${message}`);
    } else {
      alert(title);
    }
  },
};

// Default export
export default {
  Platform,
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  SafeAreaProvider,
  StatusBar,
  AsyncStorage,
  Haptics,
  Network,
  SplashScreen,
  Alert,
};
