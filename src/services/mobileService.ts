
// Web-compatible mobile service stub
class MobileService {
  isNative(): boolean {
    return false; // Always false for web
  }

  async triggerHaptic(type: 'light' | 'medium' | 'heavy'): Promise<void> {
    // Web doesn't support haptic feedback
    console.log(`Haptic feedback: ${type}`);
  }

  async getNetworkInfo(): Promise<{ connected: boolean; type?: string }> {
    return { 
      connected: navigator.onLine, 
      type: 'wifi' 
    };
  }

  async startBackgroundTask(): Promise<void> {
    // No background tasks needed for web
    console.log('Background task started (web stub)');
  }

  async stopBackgroundTask(): Promise<void> {
    // No background tasks needed for web
    console.log('Background task stopped (web stub)');
  }
}

export const mobileService = new MobileService();
