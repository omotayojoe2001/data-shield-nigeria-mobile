
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
        return await this.getCurrentPlan();
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

  async switchPlan(newPlanType: 'free' | 'payg' | 'data', dataMB?: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPlan = await this.getCurrentPlan();
      let preservedDataAllocated = 0;
      let preservedDataUsed = 0;

      // Preserve existing data when switching to data plan
      if (newPlanType === 'data' && currentPlan && currentPlan.plan_type === 'data') {
        preservedDataAllocated = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        preservedDataUsed = 0;
      }

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
        data_allocated: 0,
        data_used: 0
      };

      if (newPlanType === 'free') {
        newPlan.data_allocated = 100;
        newPlan.daily_reset_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (newPlanType === 'payg') {
        newPlan.data_allocated = 0; // Unlimited for PAYG
      } else if (newPlanType === 'data') {
        newPlan.data_allocated = dataMB || preservedDataAllocated;
        newPlan.data_used = preservedDataUsed;
        newPlan.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('user_plans')
        .insert(newPlan);

      if (error) throw error;

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));
      
      return true;
    } catch (error) {
      console.error('Error switching plan:', error);
      return false;
    }
  }

  async purchaseDataPlan(dataMB: number, cost: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, message: 'User not authenticated' };

      // Check wallet balance
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < cost) {
        return { success: false, message: 'Insufficient wallet balance. Please top up your wallet.' };
      }

      const currentPlan = await this.getCurrentPlan();
      let newDataAllocated = dataMB;
      let newDataUsed = 0;

      // If user is already on data plan, add to existing allocation
      if (currentPlan && currentPlan.plan_type === 'data') {
        const remainingData = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        newDataAllocated = remainingData + dataMB;
        newDataUsed = currentPlan.data_used;
        
        // Update existing plan instead of creating new one
        const { error: updateError } = await supabase
          .from('user_plans')
          .update({
            data_allocated: newDataAllocated,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        if (updateError) throw updateError;
      } else {
        // Switch to data plan
        await this.switchPlan('data', newDataAllocated);
      }

      // Deduct from wallet
      const { error: walletError } = await supabase
        .from('wallet')
        .update({ 
          balance: wallet.balance - cost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'data_purchase',
          amount: -cost,
          description: `Purchased ${dataMB}MB data plan`,
          status: 'completed'
        });

      // Record plan history
      await supabase
        .from('plan_history')
        .insert({
          user_id: user.id,
          from_plan: currentPlan?.plan_type || 'none',
          to_plan: 'data',
          notes: `Purchased ${dataMB}MB data plan for ₦${(cost / 100).toFixed(2)}`
        });

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));
      window.dispatchEvent(new CustomEvent('wallet-updated'));

      return { success: true, message: `Successfully purchased ${dataMB}MB data plan!` };
    } catch (error) {
      console.error('Error purchasing data plan:', error);
      return { success: false, message: 'Failed to purchase data plan' };
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
        const hoursLeft = Math.ceil((nextClaimTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        return { success: false, message: `Next bonus available in ${hoursLeft}h` };
      }

      // Update bonus claim record FIRST to prevent double claims
      const nextClaim = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const { error: bonusUpdateError } = await supabase
        .from('daily_bonus_claims')
        .update({
          last_claimed_at: now.toISOString(),
          next_claim_at: nextClaim.toISOString()
        })
        .eq('user_id', user.id);

      if (bonusUpdateError) throw bonusUpdateError;

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

        // Trigger UI updates
        window.dispatchEvent(new CustomEvent('wallet-updated'));
        window.dispatchEvent(new CustomEvent('plan-updated'));
      }

      return { success: true, message: 'Daily bonus claimed successfully!' };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return { success: false, message: 'Failed to claim bonus' };
    }
  }

  async resetDailyFreeData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentPlan = await this.getCurrentPlan();
      if (!currentPlan || currentPlan.plan_type !== 'free') return;

      const now = new Date();
      const resetTime = new Date(currentPlan.daily_reset_at || now);

      if (now >= resetTime) {
        // Reset data usage and set new reset time
        await supabase
          .from('user_plans')
          .update({
            data_used: 0,
            daily_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', currentPlan.id);

        console.log('Daily free data reset completed');
        window.dispatchEvent(new CustomEvent('plan-updated'));
      }
    } catch (error) {
      console.error('Error resetting daily free data:', error);
    }
  }

  async updateDataUsage(usageMB: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPlan = await this.getCurrentPlan();
      if (!currentPlan) return false;

      // For free plan, check daily reset first
      if (currentPlan.plan_type === 'free') {
        await this.resetDailyFreeData();
        // Refetch plan after potential reset
        const updatedPlan = await this.getCurrentPlan();
        if (updatedPlan) {
          const newUsage = updatedPlan.data_used + usageMB;
          const cappedUsage = Math.min(newUsage, updatedPlan.data_allocated);
          
          await supabase
            .from('user_plans')
            .update({
              data_used: cappedUsage,
              updated_at: new Date().toISOString()
            })
            .eq('id', updatedPlan.id);

          // Trigger UI updates
          window.dispatchEvent(new CustomEvent('plan-updated'));
        }
      } else {
        // For data and payg plans
        const newUsage = currentPlan.data_used + usageMB;
        const cappedUsage = currentPlan.plan_type === 'data' 
          ? Math.min(newUsage, currentPlan.data_allocated) 
          : newUsage;

        await supabase
          .from('user_plans')
          .update({
            data_used: cappedUsage,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        // Trigger UI updates
        window.dispatchEvent(new CustomEvent('plan-updated'));
      }

      return true;
    } catch (error) {
      console.error('Error updating data usage:', error);
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
}

export const planService = new PlanService();
