
// Platform detection
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isExpo = typeof global !== 'undefined' && global.__expo;
const isWeb = typeof window !== 'undefined' && !isReactNative;

// Conditionally import React Native modules only when in RN environment
let Platform: any = null;
let Network: any = null;
let Haptics: any = null;
let AsyncStorage: any = null;

if (isReactNative || isExpo) {
  try {
    Platform = require('react-native').Platform;
    Network = require('expo-network');
    Haptics = require('expo-haptics');
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('React Native modules not available:', e);
  }
}

interface NetworkInfo {
  connected: boolean;
  connectionType: string;
  strength?: number;
}

interface BackgroundTaskInfo {
  taskId: string;
  isRunning: boolean;
}

class MobileService {
  private backgroundTaskId: string | null = null;
  private networkListener: any = null;
  private backgroundInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMobile();
  }

  private async initializeMobile() {
    try {
      if (isReactNative || isExpo) {
        console.log('Mobile service initialized for React Native');
        this.setupNetworkMonitoring();
      } else {
        console.log('Mobile service initialized for Web');
        this.setupWebNetworkMonitoring();
      }
      
      console.log('Mobile service initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile service:', error);
    }
  }

  private setupNetworkMonitoring() {
    if (!Network) return;
    
    // Monitor network state changes
    this.networkListener = setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        
        // Dispatch custom event for network changes
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mobile-network-change', {
            detail: {
              connected: networkState.isConnected,
              connectionType: networkState.type
            }
          }));
        }
      } catch (error) {
        console.error('Network monitoring error:', error);
      }
    }, 5000);
  }

  private setupWebNetworkMonitoring() {
    // Web-based network monitoring
    if (typeof window !== 'undefined' && 'navigator' in window) {
      this.networkListener = setInterval(() => {
        const connected = navigator.onLine;
        window.dispatchEvent(new CustomEvent('mobile-network-change', {
          detail: {
            connected,
            connectionType: connected ? 'wifi' : 'none'
          }
        }));
      }, 5000);
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      if (Network) {
        const networkState = await Network.getNetworkStateAsync();
        return {
          connected: networkState.isConnected || false,
          connectionType: networkState.type || 'unknown'
        };
      } else if (typeof navigator !== 'undefined') {
        // Web fallback
        return {
          connected: navigator.onLine,
          connectionType: navigator.onLine ? 'wifi' : 'none'
        };
      }
      
      return {
        connected: false,
        connectionType: 'none'
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        connected: false,
        connectionType: 'none'
      };
    }
  }

  async startBackgroundTask(): Promise<BackgroundTaskInfo | null> {
    try {
      const taskId = `background-task-${Date.now()}`;
      
      console.log('Background task started for VPN maintenance');
      
      // Keep VPN connection alive and track usage
      this.backgroundInterval = setInterval(async () => {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('background-vpn-check'));
          }
        } catch (error) {
          console.error('Background VPN check failed:', error);
        }
      }, 30000);

      // Clean up after 5 minutes
      setTimeout(() => {
        this.stopBackgroundTask();
        console.log('Background task finished');
      }, 5 * 60 * 1000);

      this.backgroundTaskId = taskId;
      return {
        taskId,
        isRunning: true
      };
    } catch (error) {
      console.error('Error starting background task:', error);
      return null;
    }
  }

  async stopBackgroundTask(): Promise<void> {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
    }
    
    this.backgroundTaskId = null;
    console.log('Background task stopped');
  }

  async triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      if (Haptics) {
        const impactStyle = style === 'light' ? Haptics.ImpactFeedbackStyle.Light : 
                          style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                          Haptics.ImpactFeedbackStyle.Heavy;
        
        await Haptics.impactAsync(impactStyle);
      } else {
        // Web fallback - vibrate API
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          const duration = style === 'light' ? 50 : style === 'medium' ? 100 : 200;
          navigator.vibrate(duration);
        }
      }
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }

  async exitApp(): Promise<void> {
    console.log('Exit app not supported in React Native/Web');
  }

  isNative(): boolean {
    return isReactNative || isExpo;
  }

  getPlatform(): string {
    if (Platform) {
      return Platform.OS;
    }
    return isWeb ? 'web' : 'unknown';
  }

  // Storage utilities
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      } else if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  cleanup() {
    if (this.networkListener) {
      clearInterval(this.networkListener);
    }
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
    this.backgroundTaskId = null;
  }
}

export const mobileService = new MobileService();
export type { NetworkInfo, BackgroundTaskInfo };
