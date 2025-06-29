
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

export const View = 'div';
export const Text = 'span';
export const TouchableOpacity = 'button';
export const ScrollView = 'div';
export const SafeAreaView = 'div';
export const ActivityIndicator = 'div';

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
};
