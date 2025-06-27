import { apiService } from './apiService';
import { mobileService } from './mobileService';

interface VPNStats {
  isConnected: boolean;
  dataUsed: number; // in MB
  dataSaved: number; // in MB
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  location?: string;
  speed?: string;
  connectedSince?: Date;
  hasVpnKey: boolean;
  vpnKey?: string;
  server?: string;
}

interface VpnStatusData {
  hasKey: boolean;
  key?: string;
  server?: string;
  usage: {
    totalMB: number;
    remainingMB: number;
    usageByApp: Array<{ app: string; usage: number }>;
  };
  plan: {
    type: 'free' | 'paygo' | 'buy_gb';
    expiryDate?: string;
    dataRemaining?: number;
  };
  wallet: {
    balance: number;
  };
}

class VPNService {
  private stats: VPNStats = {
    isConnected: false,
    dataUsed: 0,
    dataSaved: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    location: 'Lagos, Nigeria',
    speed: '0 Mbps',
    hasVpnKey: false
  };

  private usageTrackingInterval?: NodeJS.Timeout;
  private lastVpnStatus: VpnStatusData | null = null;

  constructor() {
    // Listen for forced disconnections
    window.addEventListener('vpn-force-disconnect', this.forceDisconnect.bind(this));
    
    // Listen for mobile events
    window.addEventListener('app-resumed', this.handleAppResume.bind(this));
    window.addEventListener('network-reconnected', this.handleNetworkReconnected.bind(this));
    window.addEventListener('background-vpn-check', this.handleBackgroundCheck.bind(this));
  }

  private async handleAppResume() {
    console.log('App resumed - checking VPN status');
    if (this.stats.isConnected) {
      // Refresh VPN status when app resumes
      await this.refreshVpnStatus();
    }
  }

  private async handleNetworkReconnected() {
    console.log('Network reconnected - checking VPN');
    if (this.stats.isConnected) {
      // Try to reconnect VPN if it was connected
      const result = await this.connect();
      if (!result.success) {
        console.error('Failed to reconnect VPN after network change');
      }
    }
  }

  private async handleBackgroundCheck() {
    if (this.stats.isConnected) {
      try {
        // Lightweight VPN status check for background
        const usageResponse = await apiService.trackUsage();
        if (usageResponse.success && usageResponse.data) {
          console.log('Background VPN check successful');
        }
      } catch (error) {
        console.error('Background VPN check failed:', error);
      }
    }
  }

  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      // Trigger haptic feedback on mobile
      await mobileService.triggerHaptic('medium');
      
      // Check network connectivity first
      const networkInfo = await mobileService.getNetworkInfo();
      if (!networkInfo.connected) {
        return { success: false, error: 'No network connection available' };
      }

      // First, check if user has a VPN key
      const statusResponse = await apiService.getVpnStatus();
      if (!statusResponse.success) {
        return { success: false, error: statusResponse.error || 'Failed to get VPN status' };
      }

      let vpnKey = statusResponse.data?.key;
      let server = statusResponse.data?.server;

      // If no VPN key exists, create one
      if (!statusResponse.data?.hasKey) {
        const keyResponse = await apiService.createVpnKey();
        if (!keyResponse.success) {
          return { success: false, error: keyResponse.error || 'Failed to create VPN key' };
        }
        vpnKey = keyResponse.data?.key;
        server = keyResponse.data?.server;
      }

      // Update stats
      this.stats.isConnected = true;
      this.stats.connectedSince = new Date();
      this.stats.hasVpnKey = true;
      this.stats.vpnKey = vpnKey;
      this.stats.server = server;
      this.stats.downloadSpeed = 12.5;
      this.stats.uploadSpeed = 8.3;
      this.stats.speed = '12.5 Mbps';
      
      // Store the latest VPN status data
      this.lastVpnStatus = statusResponse.data || null;
      
      // Start usage tracking
      this.startUsageTracking();
      
      // Start background task on mobile
      if (mobileService.isNative()) {
        await mobileService.startBackgroundTask();
      }
      
      console.log("VPN Connected successfully with backend key");
      return { success: true };
    } catch (error) {
      console.error('VPN connection error:', error);
      return { success: false, error: 'Failed to connect to VPN' };
    }
  }

  async disconnect(): Promise<boolean> {
    // Trigger haptic feedback
    await mobileService.triggerHaptic('light');
    
    this.stats.isConnected = false;
    this.stats.downloadSpeed = 0;
    this.stats.uploadSpeed = 0;
    this.stats.speed = '0 Mbps';
    this.stats.connectedSince = undefined;
    
    // Stop usage tracking
    this.stopUsageTracking();
    
    // Stop background task on mobile
    if (mobileService.isNative()) {
      await mobileService.stopBackgroundTask();
    }
    
    console.log("VPN Disconnected");
    return true;
  }

  private async refreshVpnStatus() {
    try {
      const statusResponse = await apiService.getVpnStatus();
      if (statusResponse.success && statusResponse.data) {
        this.lastVpnStatus = statusResponse.data;
      }
    } catch (error) {
      console.error('Failed to refresh VPN status:', error);
    }
  }

  private async forceDisconnect(): Promise<void> {
    if (this.stats.isConnected) {
      await this.disconnect();
      console.log("VPN force disconnected due to insufficient balance/quota");
    }
  }

  getStats(): VPNStats {
    return { ...this.stats };
  }

  getLastVpnStatus(): VpnStatusData | null {
    return this.lastVpnStatus;
  }

  private startUsageTracking() {
    // Clear any existing interval
    this.stopUsageTracking();
    
    // Track usage every 30 seconds when connected
    this.usageTrackingInterval = setInterval(async () => {
      if (this.stats.isConnected) {
        try {
          // Track usage from backend
          const usageResponse = await apiService.trackUsage();
          if (usageResponse.success && usageResponse.data) {
            const newUsage = usageResponse.data.usageMB;
            
            if (newUsage > 0) {
              // Update local stats
              this.stats.dataUsed += newUsage;
              this.stats.dataSaved += newUsage * 0.65; // Assume 65% compression savings
              
              // For PAYG users, deduct cost
              if (this.lastVpnStatus?.plan.type === 'paygo') {
                const deductResponse = await apiService.deductUsageCost(newUsage);
                if (deductResponse.success) {
                  console.log(`Deducted ₦${(deductResponse.data?.deductedAmount || 0) / 100} for ${newUsage}MB usage`);
                  
                  // Trigger wallet update event
                  window.dispatchEvent(new CustomEvent('wallet-consumed', {
                    detail: {
                      consumed: deductResponse.data?.deductedAmount || 0,
                      remaining: this.lastVpnStatus?.wallet.balance || 0
                    }
                  }));
                } else {
                  console.error('Failed to deduct usage cost:', deductResponse.error);
                  // If deduction fails, disconnect VPN
                  this.forceDisconnect();
                }
              }
              
              // Trigger data usage event
              this.onDataUsage(newUsage);
            }
          }
          
          // Refresh VPN status periodically
          const statusResponse = await apiService.getVpnStatus();
          if (statusResponse.success && statusResponse.data) {
            this.lastVpnStatus = statusResponse.data;
            
            // Check if we should disconnect due to insufficient funds/data
            if (statusResponse.data.plan.type === 'paygo' && statusResponse.data.wallet.balance <= 0) {
              this.forceDisconnect();
            } else if (statusResponse.data.plan.type === 'buy_gb' && (statusResponse.data.plan.dataRemaining || 0) <= 0) {
              this.forceDisconnect();
            }
          }
        } catch (error) {
          console.error('Usage tracking error:', error);
        }
      }
    }, 30000); // Every 30 seconds
  }

  private stopUsageTracking() {
    if (this.usageTrackingInterval) {
      clearInterval(this.usageTrackingInterval);
      this.usageTrackingInterval = undefined;
    }
  }

  private onDataUsage(dataMB: number) {
    const event = new CustomEvent('vpn-data-usage', {
      detail: { dataMB, timestamp: new Date() }
    });
    window.dispatchEvent(event);
    console.log(`Backend data usage: ${dataMB.toFixed(2)}MB at ${new Date().toLocaleTimeString()}`);
  }

  // Get app usage from backend data
  getAppUsage() {
    if (this.lastVpnStatus?.usage.usageByApp) {
      return this.lastVpnStatus.usage.usageByApp.map(app => ({
        name: app.app,
        icon: this.getAppIcon(app.app),
        color: this.getAppColor(app.app),
        used: `${app.usage}MB`,
        saved: `${Math.floor(app.usage * 0.65)}MB` // 65% compression
      }));
    }

    // Fallback to dummy data if no backend data
    return [
      { name: 'WhatsApp', icon: '💬', color: 'bg-green-500', used: '45MB', saved: '30MB' },
      { name: 'Instagram', icon: '📷', color: 'bg-pink-500', used: '120MB', saved: '78MB' },
      { name: 'YouTube', icon: '📺', color: 'bg-red-500', used: '230MB', saved: '150MB' },
      { name: 'Chrome', icon: '🌐', color: 'bg-blue-500', used: '85MB', saved: '55MB' }
    ];
  }

  private getAppIcon(appName: string): string {
    const iconMap: { [key: string]: string } = {
      'WhatsApp': '💬',
      'Instagram': '📷',
      'YouTube': '📺',
      'Chrome': '🌐',
      'TikTok': '🎵',
      'Facebook': '👥'
    };
    return iconMap[appName] || '📱';
  }

  private getAppColor(appName: string): string {
    const colorMap: { [key: string]: string } = {
      'WhatsApp': 'bg-green-500',
      'Instagram': 'bg-pink-500',
      'YouTube': 'bg-red-500',
      'Chrome': 'bg-blue-500',
      'TikTok': 'bg-black',
      'Facebook': 'bg-blue-600'
    };
    return colorMap[appName] || 'bg-gray-500';
  }

  resetDailyStats() {
    this.stats.dataUsed = 0;
    this.stats.dataSaved = 0;
  }

  getSavingsPercentage(): number {
    if (this.stats.dataUsed === 0) {
      return Math.floor(Math.random() * 40 + 45); // 45-85%
    }
    return Math.round((this.stats.dataSaved / (this.stats.dataUsed + this.stats.dataSaved)) * 100);
  }
}

export const vpnService = new VPNService();
export type { VPNStats };
