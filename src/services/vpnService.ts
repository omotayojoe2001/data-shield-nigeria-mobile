
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
  connectedSince?: Date;
}

class VPNService {
  private stats: VPNStats = {
    isConnected: false,
    dataUsed: 0,
    dataSaved: 0,
    downloadSpeed: 0,
    uploadSpeed: 0
  };

  private dataUsageInterval?: NodeJS.Timeout;
  private speedTestInterval?: NodeJS.Timeout;

  async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.stats.isConnected = true;
    this.stats.connectedSince = new Date();
    this.stats.downloadSpeed = 12.5;
    this.stats.uploadSpeed = 8.3;
    
    // Start simulating data usage
    this.startDataUsageSimulation();
    
    console.log("VPN Connected with config:", DUMMY_VPN_CONFIG);
    return true;
  }

  async disconnect(): Promise<boolean> {
    this.stats.isConnected = false;
    this.stats.downloadSpeed = 0;
    this.stats.uploadSpeed = 0;
    this.stats.connectedSince = undefined;
    
    // Stop simulating data usage
    this.stopDataUsageSimulation();
    
    console.log("VPN Disconnected");
    return true;
  }

  getStats(): VPNStats {
    return { ...this.stats };
  }

  private startDataUsageSimulation() {
    // Simulate data usage every 10 seconds when connected
    this.dataUsageInterval = setInterval(() => {
      if (this.stats.isConnected) {
        // Simulate random data usage (1-5 MB per interval)
        const newDataUsed = Math.random() * 4 + 1;
        // Calculate data saved based on compression (60-70% savings)
        const savingsRate = 0.6 + Math.random() * 0.1;
        const newDataSaved = newDataUsed * savingsRate;
        
        this.stats.dataUsed += newDataUsed;
        this.stats.dataSaved += newDataSaved;
        
        // Trigger data usage event for billing
        this.onDataUsage(newDataUsed);
      }
    }, 10000);

    // Simulate speed variations
    this.speedTestInterval = setInterval(() => {
      if (this.stats.isConnected) {
        this.stats.downloadSpeed = 10 + Math.random() * 10;
        this.stats.uploadSpeed = 6 + Math.random() * 6;
      }
    }, 5000);
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
    // This will be called to trigger Pay-As-You-Go billing
    const event = new CustomEvent('vpn-data-usage', {
      detail: { dataMB, timestamp: new Date() }
    });
    window.dispatchEvent(event);
  }

  // Get today's app-wise usage (dummy data)
  getAppUsage() {
    return [
      { name: 'WhatsApp', used: '45MB', saved: '28MB', icon: '💬', color: 'bg-green-500' },
      { name: 'Instagram', used: '89MB', saved: '62MB', icon: '📷', color: 'bg-pink-500' },
      { name: 'YouTube', used: '156MB', saved: '94MB', icon: '📺', color: 'bg-red-500' },
      { name: 'Chrome', used: '67MB', saved: '41MB', icon: '🌐', color: 'bg-blue-500' },
      { name: 'TikTok', used: '123MB', saved: '78MB', icon: '🎵', color: 'bg-black' },
      { name: 'Facebook', used: '34MB', saved: '21MB', icon: '👥', color: 'bg-blue-600' }
    ];
  }

  resetDailyStats() {
    this.stats.dataUsed = 0;
    this.stats.dataSaved = 0;
  }

  // Calculate savings percentage correctly
  getSavingsPercentage(): number {
    if (this.stats.dataUsed === 0) return 0;
    return Math.round((this.stats.dataSaved / (this.stats.dataUsed + this.stats.dataSaved)) * 100);
  }
}

export const vpnService = new VPNService();
export type { VPNStats };
