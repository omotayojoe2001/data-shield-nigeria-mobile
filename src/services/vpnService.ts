
// Dummy VPN configuration for simulation
const DUMMY_VPN_CONFIG = {
  serverIP: "123.45.67.89",
  serverPublicKey: "DUMMY_SERVER_PUBLIC_KEY_12345",
  serverPort: 51820,
  allowedIPs: "0.0.0.0/0",
  clientPrivateKey: "DUMMY_CLIENT_PRIVATE_KEY_ABCDE",
  clientPublicKey: "DUMMY_CLIENT_PUBLIC_KEY_ABCDE",
  clientIP: "10.0.0.2"
};

interface VPNStats {
  isConnected: boolean;
  dataUsed: number; // in MB
  dataSaved: number; // in MB
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  location?: string; // VPN server location
  speed?: string; // formatted speed string
  connectedSince?: Date;
}

interface CurrentPlan {
  type: 'payg' | 'data' | 'subscription' | 'none';
  isActive: boolean;
  totalMB: number;
  usedMB: number;
  expiryDate?: string;
}

class VPNService {
  private stats: VPNStats = {
    isConnected: false,
    dataUsed: 0,
    dataSaved: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    location: 'Lagos, Nigeria',
    speed: '0 Mbps'
  };

  private dataUsageInterval?: NodeJS.Timeout;
  private speedTestInterval?: NodeJS.Timeout;

  constructor() {
    // Listen for forced disconnections
    window.addEventListener('vpn-force-disconnect', this.forceDisconnect.bind(this));
  }

  async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.stats.isConnected = true;
    this.stats.connectedSince = new Date();
    this.stats.downloadSpeed = 12.5;
    this.stats.uploadSpeed = 8.3;
    this.stats.location = 'Lagos, Nigeria';
    this.stats.speed = '12.5 Mbps';
    
    // Start simulating data usage immediately
    this.startDataUsageSimulation();
    
    console.log("VPN Connected - starting real-time data usage");
    return true;
  }

  async disconnect(): Promise<boolean> {
    this.stats.isConnected = false;
    this.stats.downloadSpeed = 0;
    this.stats.uploadSpeed = 0;
    this.stats.speed = '0 Mbps';
    this.stats.connectedSince = undefined;
    
    // Stop simulating data usage
    this.stopDataUsageSimulation();
    
    console.log("VPN Disconnected - stopped data usage simulation");
    return true;
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

  private startDataUsageSimulation() {
    // Clear any existing intervals
    this.stopDataUsageSimulation();
    
    // Simulate data usage every 5 seconds for faster testing
    this.dataUsageInterval = setInterval(() => {
      if (this.stats.isConnected) {
        // Simulate random data usage (0.5-2 MB per interval)
        const newDataUsed = Math.random() * 1.5 + 0.5;
        // Calculate data saved based on compression (60-70% savings)
        const savingsRate = 0.6 + Math.random() * 0.1;
        const newDataSaved = newDataUsed * savingsRate;
        
        this.stats.dataUsed += newDataUsed;
        this.stats.dataSaved += newDataSaved;
        
        // Trigger data usage event for billing and plan deduction
        this.onDataUsage(newDataUsed);
        
        console.log(`VPN Usage: +${newDataUsed.toFixed(2)}MB (Total: ${this.stats.dataUsed.toFixed(2)}MB)`);
      }
    }, 5000); // Every 5 seconds for faster testing

    // Simulate speed variations
    this.speedTestInterval = setInterval(() => {
      if (this.stats.isConnected) {
        this.stats.downloadSpeed = 10 + Math.random() * 10;
        this.stats.uploadSpeed = 6 + Math.random() * 6;
        this.stats.speed = `${this.stats.downloadSpeed.toFixed(1)} Mbps`;
      }
    }, 3000);
  }

  private stopDataUsageSimulation() {
    if (this.dataUsageInterval) {
      clearInterval(this.dataUsageInterval);
      this.dataUsageInterval = undefined;
    }
    if (this.speedTestInterval) {
      clearInterval(this.speedTestInterval);
      this.speedTestInterval = undefined;
    }
  }

  private onDataUsage(dataMB: number) {
    // This will be called to trigger billing and plan deduction
    const event = new CustomEvent('vpn-data-usage', {
      detail: { dataMB, timestamp: new Date() }
    });
    window.dispatchEvent(event);
    console.log(`Data usage event dispatched: ${dataMB.toFixed(2)}MB`);
  }

  // Get today's app-wise usage (dummy data with randomized values)
  getAppUsage() {
    const baseApps = [
      { name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
      { name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
      { name: 'YouTube', icon: '📺', color: 'bg-red-500' },
      { name: 'Chrome', icon: '🌐', color: 'bg-blue-500' },
      { name: 'TikTok', icon: '🎵', color: 'bg-black' },
      { name: 'Facebook', icon: '👥', color: 'bg-blue-600' }
    ];

    return baseApps.map(app => {
      const used = Math.floor(Math.random() * 150 + 20); // 20-170 MB
      const savingsRate = 0.45 + Math.random() * 0.4; // 45-85% savings
      const saved = Math.floor(used * savingsRate);
      
      return {
        ...app,
        used: `${used}MB`,
        saved: `${saved}MB`
      };
    });
  }

  resetDailyStats() {
    this.stats.dataUsed = 0;
    this.stats.dataSaved = 0;
  }

  // Calculate savings percentage with randomized realistic values
  getSavingsPercentage(): number {
    if (this.stats.dataUsed === 0) {
      // Return a randomized savings percentage when no real data
      return Math.floor(Math.random() * 40 + 45); // 45-85%
    }
    return Math.round((this.stats.dataSaved / (this.stats.dataUsed + this.stats.dataSaved)) * 100);
  }
}

export const vpnService = new VPNService();
export type { VPNStats, CurrentPlan };
