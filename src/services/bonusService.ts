
import { apiService } from './apiService';

interface BonusInfo {
  daysRemaining: number;
  daysClaimed: number;
  canClaim: boolean;
  nextClaimTime?: Date;
}

interface ClaimResult {
  success: boolean;
  message: string;
  bonusMB?: number;
}

class BonusService {
  async getBonusInfo(): Promise<BonusInfo> {
    try {
      // Get VPN status which includes plan information
      const statusResponse = await apiService.getVpnStatus();
      
      if (!statusResponse.success || !statusResponse.data) {
        return {
          daysRemaining: 0,
          daysClaimed: 0,
          canClaim: false
        };
      }

      // For now, we'll simulate the bonus logic based on plan type
      // In a real implementation, this would come from the backend
      const plan = statusResponse.data.plan;
      
      if (plan.type === 'free') {
        // Free plan users can claim daily bonus
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastClaimKey = `lastBonusClaim_${now.getTime()}`;
        const lastClaim = localStorage.getItem(lastClaimKey);
        
        const canClaim = !lastClaim || new Date(lastClaim) < todayStart;
        const daysClaimed = parseInt(localStorage.getItem('bonusDaysClaimed') || '0');
        const daysRemaining = Math.max(0, 7 - daysClaimed);
        
        let nextClaimTime: Date | undefined;
        if (!canClaim && lastClaim) {
          nextClaimTime = new Date(new Date(lastClaim).getTime() + 24 * 60 * 60 * 1000);
        }

        return {
          daysRemaining,
          daysClaimed,
          canClaim: canClaim && daysRemaining > 0,
          nextClaimTime
        };
      }

      return {
        daysRemaining: 0,
        daysClaimed: 7,
        canClaim: false
      };
    } catch (error) {
      console.error('Error getting bonus info:', error);
      return {
        daysRemaining: 0,
        daysClaimed: 0,
        canClaim: false
      };
    }
  }

  async claimDailyBonus(): Promise<ClaimResult> {
    try {
      const response = await apiService.claimDailyBonus();
      
      if (response.success && response.data) {
        // Update local storage to track claims
        const now = new Date();
        const daysClaimed = parseInt(localStorage.getItem('bonusDaysClaimed') || '0') + 1;
        
        localStorage.setItem('lastBonusClaim', now.toISOString());
        localStorage.setItem('bonusDaysClaimed', daysClaimed.toString());
        
        // Trigger events for UI updates
        window.dispatchEvent(new CustomEvent('bonus-updated'));
        window.dispatchEvent(new CustomEvent('plan-updated'));
        
        return {
          success: true,
          message: `Successfully claimed ${response.data.bonusMB}MB daily bonus!`,
          bonusMB: response.data.bonusMB
        };
      } else {
        return {
          success: false,
          message: response.error || 'Failed to claim daily bonus'
        };
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return {
        success: false,
        message: 'An error occurred while claiming bonus'
      };
    }
  }
}

export const bonusService = new BonusService();
export type { BonusInfo, ClaimResult };
