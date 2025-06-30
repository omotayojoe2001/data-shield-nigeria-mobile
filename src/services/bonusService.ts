
import { supabase } from '@/integrations/supabase/client';

interface BonusClaimStatus {
  days_claimed: number;
  is_eligible: boolean;
  next_claim_at: string;
  welcome_bonus_active: boolean;
}

class BonusService {
  async getBonusClaimStatus(): Promise<BonusClaimStatus | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('daily_bonus_claims')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching bonus status:', error);
        return null;
      }

      if (!data) {
        return {
          days_claimed: 0,
          is_eligible: true,
          next_claim_at: new Date().toISOString(),
          welcome_bonus_active: true
        };
      }

      return {
        days_claimed: data.days_claimed || 0,
        is_eligible: data.is_eligible || false,
        next_claim_at: data.next_claim_at || new Date().toISOString(),
        welcome_bonus_active: data.welcome_bonus_active || false
      };
    } catch (error) {
      console.error('Error in getBonusClaimStatus:', error);
      return null;
    }
  }

  async claimDailyBonus(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // This would integrate with the backend API
      return { success: true, message: 'Daily bonus claimed successfully!' };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return { success: false, message: 'Failed to claim daily bonus' };
    }
  }
}

export const bonusService = new BonusService();
