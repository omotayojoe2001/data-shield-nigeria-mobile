
import * as Haptics from 'expo-haptics';
import * as Network from 'expo-network';

// React Native mobile service
class MobileService {
  isNative(): boolean {
    return true; // Always true for React Native
  }

  async triggerHaptic(type: 'light' | 'medium' | 'heavy'): Promise<void> {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  }

  async getNetworkInfo(): Promise<{ connected: boolean; type?: string }> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        connected: networkState.isConnected || false,
        type: networkState.type || 'unknown'
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return { connected: false };
    }
  }

  async startBackgroundTask(): Promise<void> {
    // Background tasks for React Native
    console.log('Background task started (React Native)');
  }

  async stopBackgroundTask(): Promise<void> {
    // Stop background tasks for React Native
    console.log('Background task stopped (React Native)');
  }

  getPlatform(): string {
    return 'react-native';
  }

  cleanup(): void {
    // Cleanup any resources
    console.log('Mobile service cleanup');
  }
}

export const mobileService = new MobileService();
