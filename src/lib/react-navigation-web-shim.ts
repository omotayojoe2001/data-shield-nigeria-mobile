
// React Navigation Web Shim - provides web-compatible implementations

export const NavigationContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen">{children}</div>;
};

export const createNativeStackNavigator = () => ({
  Navigator: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Screen: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
});

export const createBottomTabNavigator = () => ({
  Navigator: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Screen: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
