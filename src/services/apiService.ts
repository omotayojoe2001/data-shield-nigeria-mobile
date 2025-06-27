
import { supabase } from '@/integrations/supabase/client';

const PROJECT_ID = 'atngqhvnzizufimblwmp';
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1`;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  timestamp?: string;
}

class ApiService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  // Daily Bonus API
  async claimDailyBonus(): Promise<ApiResponse<{ bonusMB: number }>> {
    return this.makeRequest('/claim-daily-bonus', {
      method: 'POST'
    });
  }

  // VPN APIs
  async createVpnKey(): Promise<ApiResponse<{ key: string; server: string }>> {
    return this.makeRequest('/create-vpn-key', {
      method: 'POST'
    });
  }

  async getVpnStatus(): Promise<ApiResponse<{
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
  }>> {
    return this.makeRequest('/vpn-status');
  }

  async trackUsage(): Promise<ApiResponse<{ usageMB: number }>> {
    return this.makeRequest('/track-usage', {
      method: 'POST'
    });
  }

  async deductUsageCost(usageMB: number): Promise<ApiResponse<{ deductedAmount: number }>> {
    return this.makeRequest('/deduct-usage-cost', {
      method: 'POST',
      body: JSON.stringify({ usageMB })
    });
  }

  // Wallet Top-up API
  async processPayment(amount: number): Promise<ApiResponse<{ paystackUrl: string }>> {
    return this.makeRequest('/process-payment', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  // Referral APIs
  async processReferral(referralCode: string): Promise<ApiResponse<{ reward: number }>> {
    return this.makeRequest('/process-referral', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode })
    });
  }

  async getReferralStats(): Promise<ApiResponse<{
    referralCode: string;
    referralCount: number;
    totalEarnings: number;
  }>> {
    return this.makeRequest('/referral-stats');
  }
}

export const apiService = new ApiService();
