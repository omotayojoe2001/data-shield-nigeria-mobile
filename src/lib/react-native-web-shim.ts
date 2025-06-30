
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

// PixelRatio shim for expo-asset
export const PixelRatio = {
  get: () => typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  getPixelSizeForLayoutSize: (layoutSize: number) => Math.round(layoutSize * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)),
};

// NativeModules shim for expo-modules-core
export const NativeModules = {};

// NativeEventEmitter shim for expo-modules-core
export class NativeEventEmitter {
  constructor(nativeModule?: any) {}
  addListener(eventType: string, listener: (...args: any[]) => any, context?: Object) {
    return { remove: () => {} };
  }
  removeAllListeners(eventType?: string) {}
  removeSubscription(subscription: any) {}
  emit(eventType: string, ...params: any[]) {}
  removeListener(eventType: string, listener: (...args: any[]) => any) {}
}

// Component mappings
export const View = 'div';
export const Text = 'span';
export const TouchableOpacity = 'button';
export const ScrollView = 'div';
export const SafeAreaView = 'div';

export const ActivityIndicator: React.FC<{ size?: string; color?: string }> = ({ 
  size = 'small', 
  color = '#007AFF' 
}) => {
  return React.createElement('div', {
    className: "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
    style: { 
      width: size === 'large' ? '32px' : '16px', 
      height: size === 'large' ? '32px' : '16px',
      borderTopColor: color
    }
  });
};

// LinearGradient component for web
export const LinearGradient: React.FC<{ 
  colors: string[]; 
  children: React.ReactNode;
  style?: any;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}> = ({ colors, children, style, start = { x: 0, y: 0 }, end = { x: 0, y: 1 } }) => {
  const gradientDirection = `${start.x * 100}% ${start.y * 100}%, ${end.x * 100}% ${end.y * 100}%`;
  const gradient = `linear-gradient(to bottom, ${colors.join(', ')})`;
  
  return React.createElement('div', {
    style: {
      background: gradient,
      ...style
    }
  }, children);
};

// Safe Area Context
export const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', null, children);
};

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
  PixelRatio,
  NativeModules,
  NativeEventEmitter,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  LinearGradient,
  SafeAreaProvider,
  StatusBar,
  AsyncStorage,
  Haptics,
  Network,
  SplashScreen,
  Alert,
};
