import { supabase } from '@/integrations/supabase/client';
import { bonusService } from './bonusService';
import { referralService } from './referralService';

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: 'payg' | 'data' | 'welcome_bonus';
  status: 'active' | 'inactive' | 'expired';
  data_allocated: number;
  data_used: number;
  expires_at?: string;
  daily_reset_at?: string;
  created_at: string;
  updated_at: string;
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

      // If no active plan found, create welcome bonus plan for new users
      if (!data) {
        console.log('No active plan found, creating welcome bonus plan for new user');
        
        const created = await this.createWelcomeBonusPlan(user.id);
        if (created) {
          return await this.getCurrentPlan();
        }
        
        return null;
      }

      return data as UserPlan;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      return null;
    }
  }

  async createWelcomeBonusPlan(userId: string): Promise<boolean> {
    try {
      console.log('Creating welcome bonus plan for user:', userId);
      
      // First check if user already has any plan to avoid duplicates
      const { data: existingPlans } = await supabase
        .from('user_plans')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (existingPlans && existingPlans.length > 0) {
        console.log('User already has existing plans, not creating welcome bonus');
        return false;
      }
      
      const { error } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_type: 'welcome_bonus',
          status: 'active',
          data_allocated: 0, // Start with 0, will be added through bonus claims
          data_used: 0,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (error) {
        console.error('Error creating welcome bonus plan:', error);
        return false;
      }
      
      console.log('Welcome bonus plan created successfully');
      return true;
    } catch (error) {
      console.error('Error creating welcome bonus plan:', error);
      return false;
    }
  }

  async switchPlan(newPlanType: 'payg' | 'data', dataMB?: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPlan = await this.getCurrentPlan();

      // Store data plan information before switching
      let preservedDataInfo: { allocated: number; used: number; expires_at?: string } | null = null;
      
      if (currentPlan?.plan_type === 'data') {
        preservedDataInfo = {
          allocated: currentPlan.data_allocated,
          used: currentPlan.data_used,
          expires_at: currentPlan.expires_at
        };
      }

      // Deactivate current plan if it exists
      if (currentPlan) {
        await supabase
          .from('user_plans')
          .update({ 
            status: 'inactive', 
            updated_at: new Date().toISOString()
          })
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

      if (newPlanType === 'payg') {
        newPlan.data_allocated = 0; // Unlimited for PAYG
      } else if (newPlanType === 'data') {
        // Restore previous data plan or use provided data
        if (preservedDataInfo && !dataMB) {
          newPlan.data_allocated = preservedDataInfo.allocated;
          newPlan.data_used = preservedDataInfo.used;
          newPlan.expires_at = preservedDataInfo.expires_at;
        } else {
          newPlan.data_allocated = dataMB || 0;
          newPlan.data_used = 0;
          newPlan.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
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

      // Check wallet balance (cost should be in kobo)
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

      // If user is already on data plan, add to existing allocation
      if (currentPlan && currentPlan.plan_type === 'data') {
        const remainingData = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        newDataAllocated = remainingData + dataMB;
        
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

      // Deduct from wallet (cost is already in kobo)
      const { error: walletError } = await supabase
        .from('wallet')
        .update({ 
          balance: wallet.balance - cost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Process referral earnings for the referrer
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id')
        .eq('referee_id', user.id)
        .eq('status', 'completed')
        .single();

      if (referral?.referrer_id) {
        await referralService.processReferralEarning(referral.referrer_id, cost);
      }

      // Record transaction (amount should be negative for deduction, in kobo)
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'data_purchase',
          amount: -cost, // Negative because it's a deduction
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

  async getBonusClaimStatus() {
    return await bonusService.getBonusClaimStatus();
  }

  async claimDailyBonus(): Promise<{ success: boolean; message: string }> {
    return await bonusService.claimDailyBonus();
  }

  async updateDataUsage(usageMB: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentPlan = await this.getCurrentPlan();
      if (!currentPlan) return false;

      console.log(`Updating data usage: ${usageMB}MB for ${currentPlan.plan_type} plan`);

      // For welcome bonus plan, data usage is tracked but data comes from bonus claims
      if (currentPlan.plan_type === 'welcome_bonus') {
        const newUsage = currentPlan.data_used + usageMB;
        
        console.log(`Welcome bonus plan: ${currentPlan.data_used}MB -> ${newUsage}MB (allocated: ${currentPlan.data_allocated}MB)`);
        
        await supabase
          .from('user_plans')
          .update({
            data_used: newUsage,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        // Trigger UI updates
        window.dispatchEvent(new CustomEvent('plan-updated'));
      } else {
        // For data and payg plans
        const newUsage = currentPlan.data_used + usageMB;

        console.log(`${currentPlan.plan_type} plan: ${currentPlan.data_used}MB -> ${newUsage}MB`);

        await supabase
          .from('user_plans')
          .update({
            data_used: newUsage,
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
