
import { supabase } from '@/integrations/supabase/client';

export interface DailyBonusClaim {
  id: string;
  user_id: string;
  last_claimed_at: string;
  next_claim_at: string;
  days_claimed: number;
  is_eligible: boolean;
  created_at: string;
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

      // If no bonus record exists, create one that's immediately claimable for new users
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
        return newRecord as DailyBonusClaim;
      }

      return data as DailyBonusClaim;
    } catch (error) {
      console.error('Error fetching bonus claim status:', error);
      return null;
    }
  }

  async canClaimBonus(): Promise<{ canClaim: boolean; reason?: string; daysRemaining?: number }> {
    try {
      const bonusStatus = await this.getBonusClaimStatus();
      if (!bonusStatus) {
        return { canClaim: false, reason: 'Bonus claim record not found' };
      }

      // Check if user is still eligible (within 7 days)
      if (!bonusStatus.is_eligible || bonusStatus.days_claimed >= 7) {
        return { 
          canClaim: false, 
          reason: '7-day bonus period completed',
          daysRemaining: 0
        };
      }

      const now = new Date();
      const nextClaimTime = new Date(bonusStatus.next_claim_at);

      if (now < nextClaimTime) {
        const hoursLeft = Math.ceil((nextClaimTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        return { 
          canClaim: false, 
          reason: `Next bonus available in ${hoursLeft}h`,
          daysRemaining: 7 - bonusStatus.days_claimed
        };
      }

      return { 
        canClaim: true,
        daysRemaining: 7 - bonusStatus.days_claimed
      };
    } catch (error) {
      console.error('Error checking bonus eligibility:', error);
      return { canClaim: false, reason: 'Error checking eligibility' };
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

      const eligibilityCheck = await this.canClaimBonus();
      if (!eligibilityCheck.canClaim) {
        return { success: false, message: eligibilityCheck.reason || 'Cannot claim bonus' };
      }

      const now = new Date();
      const nextClaim = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const newDaysClaimed = bonusStatus.days_claimed + 1;
      const stillEligible = newDaysClaimed < 7;

      // Update bonus claim record
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

      // Get current plan to add bonus data
      const { data: currentPlan, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError) throw planError;

      if (currentPlan) {
        // Add 200MB to current plan's allocated data
        const { error: updatePlanError } = await supabase
          .from('user_plans')
          .update({
            data_allocated: (currentPlan.data_allocated || 0) + 200,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        if (updatePlanError) throw updatePlanError;
      }

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'bonus',
          amount: 0, // No monetary value, just data
          description: `Daily bonus: 200MB data (Day ${newDaysClaimed}/7)`,
          status: 'completed'
        });

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));
      window.dispatchEvent(new CustomEvent('bonus-updated'));

      const daysRemaining = 7 - newDaysClaimed;
      const message = daysRemaining > 0 
        ? `200MB bonus claimed! ${daysRemaining} days remaining.`
        : '200MB bonus claimed! 7-day bonus period completed.';

      return { success: true, message };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return { success: false, message: 'Failed to claim bonus' };
    }
  }

  async getBonusInfo(): Promise<{
    daysRemaining: number;
    daysClaimed: number;
    canClaim: boolean;
    nextClaimTime?: Date;
  }> {
    try {
      const bonusStatus = await this.getBonusClaimStatus();
      if (!bonusStatus) {
        return {
          daysRemaining: 0,
          daysClaimed: 0,
          canClaim: false
        };
      }

      const eligibilityCheck = await this.canClaimBonus();
      
      return {
        daysRemaining: Math.max(0, 7 - bonusStatus.days_claimed),
        daysClaimed: bonusStatus.days_claimed,
        canClaim: eligibilityCheck.canClaim,
        nextClaimTime: bonusStatus.next_claim_at ? new Date(bonusStatus.next_claim_at) : undefined
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
}

export const bonusService = new BonusService();
