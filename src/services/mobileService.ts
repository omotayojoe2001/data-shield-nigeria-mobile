import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web mode - native features disabled');
      return;
    }

    try {
      // Set up status bar
      await StatusBar.setStyle({ style: Style.Dark });
      
      // Set up app state listeners
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
        if (isActive) {
          this.handleAppResume();
        } else {
          this.handleAppPause();
        }
      });

      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      console.log('Mobile service initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile service:', error);
    }
  }

  private setupNetworkMonitoring() {
    if (!Capacitor.isNativePlatform()) return;

    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      
      // Dispatch custom event for network changes
      window.dispatchEvent(new CustomEvent('mobile-network-change', {
        detail: {
          connected: status.connected,
          connectionType: status.connectionType
        }
      }));
      
      // Handle VPN reconnection if needed
      if (status.connected) {
        this.handleNetworkReconnection();
      }
    });
  }

  private handleAppResume() {
    console.log('App resumed - checking VPN status');
    // Trigger VPN status check
    window.dispatchEvent(new CustomEvent('app-resumed'));
  }

  private handleAppPause() {
    console.log('App paused - starting background task');
    this.startBackgroundTask();
  }

  private handleNetworkReconnection() {
    console.log('Network reconnected - checking VPN');
    // Trigger VPN reconnection check
    window.dispatchEvent(new CustomEvent('network-reconnected'));
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    if (!Capacitor.isNativePlatform()) {
      return {
        connected: navigator.onLine,
        connectionType: 'wifi'
      };
    }

    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType
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
    if (!Capacitor.isNativePlatform()) {
      console.log('Background tasks not available in web mode');
      return null;
    }

    try {
      // Generate a unique task ID
      const taskId = `background-task-${Date.now()}`;
      
      console.log('Background task started for VPN maintenance');
      
      // Keep VPN connection alive and track usage
      this.backgroundInterval = setInterval(async () => {
        try {
          // Check VPN status and maintain connection
          window.dispatchEvent(new CustomEvent('background-vpn-check'));
        } catch (error) {
          console.error('Background VPN check failed:', error);
        }
      }, 30000); // Every 30 seconds

      // Clean up after 5 minutes (iOS/Android background limit)
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
    if (!Capacitor.isNativePlatform()) return;

    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light : 
                        style === 'medium' ? ImpactStyle.Medium : 
                        ImpactStyle.Heavy;
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }

  async exitApp(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }

  cleanup() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
    this.backgroundTaskId = null;
  }
}

export const mobileService = new MobileService();
export type { NetworkInfo, BackgroundTaskInfo };
