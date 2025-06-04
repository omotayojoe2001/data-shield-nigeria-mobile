
import { supabase } from '@/integrations/supabase/client';

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: 'free' | 'payg' | 'data';
  status: 'active' | 'inactive' | 'expired';
  data_allocated: number;
  data_used: number;
  expires_at?: string;
  daily_reset_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyBonusClaim {
  id: string;
  user_id: string;
  last_claimed_at: string;
  next_claim_at: string;
  created_at: string;
}

class PlanService {
  async getCurrentPlan(): Promise<UserPlan | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no active plan found, create and return free plan
      if (!data) {
        console.log('No active plan found, creating free plan');
        await this.createFreePlan(user.id);
        return await this.getCurrentPlan(); // Recursive call to get the newly created plan
      }

      return data as UserPlan;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      return null;
    }
  }

  async createFreePlan(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_type: 'free',
          status: 'active',
          data_allocated: 100,
          data_used: 0,
          daily_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating free plan:', error);
      return false;
    }
  }

  async switchPlan(newPlanType: 'free' | 'payg' | 'data', dataAmount?: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPlan = await this.getCurrentPlan();

      // Deactivate current plan if it exists
      if (currentPlan) {
        await supabase
          .from('user_plans')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .eq('id', currentPlan.id);

        // Record plan change
        await supabase
          .from('plan_history')
          .insert({
            user_id: user.id,
            from_plan: currentPlan.plan_type,
            to_plan: newPlanType,
            notes: `Switched from ${currentPlan.plan_type} to ${newPlanType}`
          });
      }

      // Create new plan
      const newPlan: any = {
        user_id: user.id,
        plan_type: newPlanType,
        status: 'active',
        data_used: 0
      };

      if (newPlanType === 'free') {
        newPlan.data_allocated = 100;
        newPlan.daily_reset_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (newPlanType === 'data' && dataAmount) {
        newPlan.data_allocated = dataAmount;
        newPlan.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (newPlanType === 'payg') {
        newPlan.data_allocated = 0; // Unlimited for PAYG
      }

      const { error } = await supabase
        .from('user_plans')
        .insert(newPlan);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error switching plan:', error);
      return false;
    }
  }

  async getPlanHistory(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('plan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('switch_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plan history:', error);
      return [];
    }
  }

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

      const now = new Date();
      const nextClaimTime = new Date(bonusStatus.next_claim_at);

      if (now < nextClaimTime) {
        const timeLeft = Math.ceil((nextClaimTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        return { success: false, message: `Next bonus available in ${timeLeft}h` };
      }

      // Update bonus claim record
      const nextClaim = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await supabase
        .from('daily_bonus_claims')
        .update({
          last_claimed_at: now.toISOString(),
          next_claim_at: nextClaim.toISOString()
        })
        .eq('user_id', user.id);

      // Add bonus to wallet
      const bonusAmount = 5000; // ₦50 in kobo
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        await supabase
          .from('wallet')
          .update({ 
            balance: wallet.balance + bonusAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'bonus',
            amount: bonusAmount,
            description: 'Daily bonus claimed',
            status: 'completed'
          });
      }

      return { success: true, message: 'Daily bonus claimed successfully!' };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return { success: false, message: 'Failed to claim bonus' };
    }
  }
}

export const planService = new PlanService();
