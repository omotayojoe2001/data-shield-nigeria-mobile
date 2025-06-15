
import { supabase } from '@/integrations/supabase/client';

export interface DailyBonusClaim {
  id: string;
  user_id: string;
  last_claimed_at: string;
  next_claim_at: string;
  created_at: string;
  days_claimed: number;
  is_eligible: boolean;
}

class BonusService {
  async getBonusClaimStatus(): Promise<DailyBonusClaim | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('daily_bonus_claims')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no bonus record exists, create one for new users
      if (!data) {
        const now = new Date();
        const { data: newRecord, error: insertError } = await supabase
          .from('daily_bonus_claims')
          .insert({
            user_id: user.id,
            last_claimed_at: new Date(0).toISOString(), // Epoch time
            next_claim_at: now.toISOString(), // Available immediately
            days_claimed: 0,
            is_eligible: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newRecord;
      }

      return data;
    } catch (error) {
      console.error('Error fetching bonus claim status:', error);
      return null;
    }
  }

  async claimDailyBonus(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, message: 'User not authenticated' };

      const bonusStatus = await this.getBonusClaimStatus();
      if (!bonusStatus) {
        return { success: false, message: 'Bonus claim record not found' };
      }

      // Check if user is still eligible (within 7 days and hasn't claimed all 7)
      if (!bonusStatus.is_eligible || bonusStatus.days_claimed >= 7) {
        return { success: false, message: 'You have claimed all your free 200MB bonuses' };
      }

      const now = new Date();
      const nextClaimTime = new Date(bonusStatus.next_claim_at);

      console.log('Bonus claim check:', {
        now: now.toISOString(),
        nextClaimTime: nextClaimTime.toISOString(),
        canClaim: now >= nextClaimTime,
        daysClaimed: bonusStatus.days_claimed
      });

      if (now < nextClaimTime) {
        const hoursLeft = Math.ceil((nextClaimTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        return { success: false, message: `Next 200MB available in ${hoursLeft}h` };
      }

      // Update bonus claim record FIRST to prevent double claims
      const nextClaim = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const newDaysClaimed = bonusStatus.days_claimed + 1;
      const stillEligible = newDaysClaimed < 7;

      const { error: bonusUpdateError } = await supabase
        .from('daily_bonus_claims')
        .update({
          last_claimed_at: now.toISOString(),
          next_claim_at: nextClaim.toISOString(),
          days_claimed: newDaysClaimed,
          is_eligible: stillEligible
        })
        .eq('user_id', user.id);

      if (bonusUpdateError) throw bonusUpdateError;

      // Get current plan to add 200MB data
      const { data: currentPlan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (currentPlan) {
        // Add 200MB to current plan
        const { error: planUpdateError } = await supabase
          .from('user_plans')
          .update({
            data_allocated: currentPlan.data_allocated + 200,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        if (planUpdateError) throw planUpdateError;
      }

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'bonus',
          amount: 0, // No money, just data
          description: `Free 200MB claimed - Day ${newDaysClaimed} of 7`,
          status: 'completed'
        });

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));
      window.dispatchEvent(new CustomEvent('bonus-updated'));

      const remainingDays = 7 - newDaysClaimed;
      const message = remainingDays > 0 
        ? `200MB added! ${remainingDays} more days available`
        : '200MB added! You have claimed all your free bonuses';

      return { success: true, message };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return { success: false, message: 'Failed to claim bonus' };
    }
  }

  async getRemainingBonusDays(): Promise<number> {
    try {
      const bonusStatus = await this.getBonusClaimStatus();
      if (!bonusStatus || !bonusStatus.is_eligible) return 0;
      return Math.max(0, 7 - bonusStatus.days_claimed);
    } catch (error) {
      console.error('Error getting remaining bonus days:', error);
      return 0;
    }
  }
}

export const bonusService = new BonusService();
