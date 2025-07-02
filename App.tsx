
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Simulate app loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('App ready, hiding splash screen...');
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        
        console.log('Splash screen hidden, setting ready state...');
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
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Text style={styles.errorTitle}>⚠️ App Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setError(null)}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app content
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>🎉 GoodDeeds VPN</Text>
        <Text style={styles.subtitle}>React Native App Working!</Text>
        <Text style={styles.success}>✅ Splash screen successfully hidden!</Text>
        <Text style={styles.success}>✅ App is now running!</Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Test Button</Text>
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>✅ SDK 53 compatible</Text>
          <Text style={styles.infoText}>✅ App bundled successfully</Text>
          <Text style={styles.infoText}>✅ No more splash screen stuck!</Text>
        </View>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  success: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#16a34a',
    textAlign: 'center',
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
    marginBottom: 24,
  },
});

export default App;
