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
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      console.log(`Fetching current plan for user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching current plan:', error);
        return null;
      }

      const plan = data && data.length > 0 ? data[0] as UserPlan : null;
      console.log('Current plan fetched:', plan);
      return plan;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      return null;
    }
  }

  async createWelcomeBonusPlan(userId: string): Promise<boolean> {
    try {
      console.log('Creating welcome bonus plan for user:', userId);
      
      // Deactivate any existing active plans first
      const { error: deactivateError } = await supabase
        .from('user_plans')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (deactivateError) {
        console.error('Error deactivating existing plans:', deactivateError);
      }
      
      // Create welcome bonus plan
      const { data: newPlan, error } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_type: 'welcome_bonus',
          status: 'active',
          data_allocated: 200, // Start with first day bonus
          data_used: 0,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating welcome bonus plan:', error);
        return false;
      }
      
      console.log('Welcome bonus plan created successfully:', newPlan);
      return true;
    } catch (error) {
      console.error('Error creating welcome bonus plan:', error);
      return false;
    }
  }

  async activateWelcomeBonus(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, message: 'User not authenticated' };

      // Check bonus eligibility (allow activation even if user has other plans)
      const bonusStatus = await bonusService.getBonusClaimStatus();
      if (bonusStatus && bonusStatus.days_claimed >= 7) {
        return { success: false, message: 'Welcome bonus period has ended - you have already claimed all 7 days' };
      }

      // Create the welcome bonus plan (this will deactivate other plans)
      const success = await this.createWelcomeBonusPlan(user.id);
      if (!success) {
        return { success: false, message: 'Failed to activate welcome bonus' };
      }

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));
      
      return { success: true, message: 'Welcome bonus activated! Start claiming your daily 200MB.' };
    } catch (error) {
      console.error('Error activating welcome bonus:', error);
      return { success: false, message: 'Failed to activate welcome bonus' };
    }
  }

  async switchPlan(newPlanType: 'payg' | 'data' | 'welcome_bonus', dataMB?: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log(`Switching to plan: ${newPlanType} for user: ${user.id}`);

      const currentPlan = await this.getCurrentPlan();

      // Check if already on the requested plan type
      if (currentPlan && currentPlan.plan_type === newPlanType) {
        console.log(`User is already on ${newPlanType} plan`);
        return true; // Return true since they're already on the correct plan
      }

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
        const { error: deactivateError } = await supabase
          .from('user_plans')
          .update({ 
            status: 'inactive', 
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        if (deactivateError) {
          console.error('Error deactivating current plan:', deactivateError);
        }

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
        newPlan.data_allocated = 0; // No limit for PAYG
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
      } else if (newPlanType === 'welcome_bonus') {
        newPlan.data_allocated = 200;
        newPlan.data_used = 0;
        newPlan.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: createdPlan, error } = await supabase
        .from('user_plans')
        .insert(newPlan)
        .select()
        .single();

      if (error) {
        console.error('Error creating new plan:', error);
        throw error;
      }

      console.log('New plan created successfully:', createdPlan);

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
