
import { Platform } from 'react-native';

interface NetworkInfo {
  connected: boolean;
  type: string;
}

class MobileService {
  isNative(): boolean {
    return Platform.OS !== 'web';
  }

  getPlatform(): string {
    return Platform.OS;
  }

  async triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    try {
      if (this.isNative() && typeof window !== 'undefined') {
        // Mobile haptic feedback implementation would go here
        console.log(`Haptic feedback: ${type}`);
      }
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        return {
          connected: navigator.onLine,
          type: 'wifi'
        };
      }
      return { connected: true, type: 'wifi' };
    } catch (error) {
      return { connected: true, type: 'wifi' };
    }
  }

  async startBackgroundTask(): Promise<void> {
    console.log('Background task started');
  }

  async stopBackgroundTask(): Promise<void> {
    console.log('Background task stopped');
  }

  cleanup(): void {
    console.log('Mobile service cleanup');
  }
}

export const mobileService = new MobileService();
