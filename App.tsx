
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import DebugApp from './DebugApp';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

const App = () => {
  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('Initializing Debug App...');
        
        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      }
    };

    prepare();
  }, []);

  return <DebugApp />;
};

export default App;
