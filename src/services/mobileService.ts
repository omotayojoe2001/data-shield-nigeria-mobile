import { Platform } from 'react-native';
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.log('Mobile service initialized for React Native');
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      console.log('Mobile service initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile service:', error);
    }
  }

  private setupNetworkMonitoring() {
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

  private handleAppResume() {
    console.log('App resumed - checking VPN status');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-resumed'));
    }
  }

  private handleAppPause() {
    console.log('App paused - starting background task');
    this.startBackgroundTask();
  }

  private handleNetworkReconnection() {
    console.log('Network reconnected - checking VPN');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('network-reconnected'));
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        connected: networkState.isConnected || false,
        connectionType: networkState.type || 'unknown'
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
      const impactStyle = style === 'light' ? Haptics.ImpactFeedbackStyle.Light : 
                        style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                        Haptics.ImpactFeedbackStyle.Heavy;
      
      await Haptics.impactAsync(impactStyle);
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }

  async exitApp(): Promise<void> {
    // Not applicable in React Native/Expo
    console.log('Exit app not supported in React Native');
  }

  isNative(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  getPlatform(): string {
    return Platform.OS;
  }

  // Storage utilities using AsyncStorage
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
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
