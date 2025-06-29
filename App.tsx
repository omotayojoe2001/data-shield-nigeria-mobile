
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import MainNavigator from './src/navigation/MainNavigator';
import { mobileService } from './src/services/mobileService';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize mobile services
        console.log('Initializing mobile app...');
        console.log('Platform:', mobileService.getPlatform());
        console.log('Is native:', mobileService.isNative());
        
        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      }
    };

    prepare();

    // Cleanup on unmount
    return () => {
      mobileService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <MainNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;
