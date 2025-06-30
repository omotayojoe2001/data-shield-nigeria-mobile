
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, List, BarChart3, Wallet, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import PlansScreen from '../screens/PlansScreen';
import UsageScreen from '../screens/UsageScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Plans') {
            IconComponent = List;
          } else if (route.name === 'Usage') {
            IconComponent = BarChart3;
          } else if (route.name === 'Wallet') {
            IconComponent = Wallet;
          } else if (route.name === 'Profile') {
            IconComponent = User;
          } else {
            IconComponent = Home;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: '#e5e7eb',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Plans" component={PlansScreen} />
      <Tab.Screen name="Usage" component={UsageScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
