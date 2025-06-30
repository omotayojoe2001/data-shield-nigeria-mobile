
import React from 'react';

// React Navigation Web Shim - provides web-compatible implementations

export const NavigationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', { className: "min-h-screen" }, children);
};

export const createNativeStackNavigator = () => ({
  Navigator: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Screen: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
});

export const createBottomTabNavigator = () => ({
  Navigator: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Screen: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
});

export const useNavigation = () => ({
  navigate: (screen: string) => console.log(`Navigate to ${screen}`),
  goBack: () => console.log('Go back'),
});

export const useRoute = () => ({
  params: {},
});

// Default exports
export default {
  NavigationContainer,
  createNativeStackNavigator,
  createBottomTabNavigator,
  useNavigation,
  useRoute,
};
