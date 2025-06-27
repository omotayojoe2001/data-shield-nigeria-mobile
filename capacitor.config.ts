
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b0fa1f2568b94cff87eae303fc27a756',
  appName: 'GoodDeeds Data VPN',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'gooddeeds-data.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e40af',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small'
    },
    StatusBar: {
      style: 'dark'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    BackgroundTask: {
      enableHighAccuracy: true
    },
    Network: {
      enableWifiInfo: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
