import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import MainNavigator from './src/components/MainNavigator';
import { mobileService } from './src/services/mobileService';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const FullApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('Initializing full React Native app...');
        
        // Initialize mobile services
        console.log('Platform:', mobileService.getPlatform());
        console.log('Is native:', mobileService.isNative());
        
        // Add a small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('App ready, hiding splash screen...');
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        
        console.log('Splash screen hidden, app ready!');
        setIsReady(true);
        
      } catch (e) {
        console.error('Error during app initialization:', e);
        setError(e.message);
        // Force hide splash screen even if there's an error
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.error('Error hiding splash screen:', splashError);
        }
        setIsReady(true);
      }
    };

    prepare();

    // Cleanup on unmount
    return () => {
      mobileService.cleanup();
    };
  }, []);

  // Show loading state while app is initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading GoodDeeds VPN...</Text>
      </View>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <StatusBar style="auto" />
          <Text style={styles.errorTitle}>⚠️ App Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app with all functionality
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <MainNavigator />
            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default FullApp;