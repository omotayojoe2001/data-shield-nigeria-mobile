
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the actual AuthProvider
import { AuthProvider } from './src/contexts/AuthContext';
// Import the MainNavigator from the src directory
import MainNavigator from './src/components/MainNavigator';

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
