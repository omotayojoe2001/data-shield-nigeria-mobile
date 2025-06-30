
import { supabase } from '@/integrations/supabase/client';

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: string;
  data_allocated: number;
  data_used: number;
  status: string;
  expires_at?: string;
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

      if (error) {
        console.error('Error fetching current plan:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentPlan:', error);
      return null;
    }
  }

  async updateDataUsage(usageMB: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_plans')
        .update({ 
          data_used: usageMB,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active');

      return !error;
    } catch (error) {
      console.error('Error updating data usage:', error);
      return false;
    }
  }

  async switchPlan(planType: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Deactivate current plan
      await supabase
        .from('user_plans')
        .update({ status: 'inactive' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Create new plan
      const { error } = await supabase
        .from('user_plans')
        .insert({
          user_id: user.id,
          plan_type: planType,
          data_allocated: planType === 'welcome_bonus' ? 200 : 0,
          status: 'active'
        });

      return !error;
    } catch (error) {
      console.error('Error switching plan:', error);
      return false;
    }
  }

  async activateWelcomeBonus(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Check if user already has welcome bonus plan
      const currentPlan = await this.getCurrentPlan();
      if (currentPlan?.plan_type === 'welcome_bonus') {
        return { success: false, message: 'Welcome bonus already active' };
      }

      // Switch to welcome bonus plan
      const success = await this.switchPlan('welcome_bonus');
      if (success) {
        return { success: true, message: 'Welcome bonus activated successfully!' };
      } else {
        return { success: false, message: 'Failed to activate welcome bonus' };
      }
    } catch (error) {
      console.error('Error activating welcome bonus:', error);
      return { success: false, message: 'Failed to activate welcome bonus' };
    }
  }

  async purchaseDataPlan(dataMB: number, priceKobo: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Check wallet balance
      const { data: walletData } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!walletData || walletData.balance < priceKobo) {
        return { success: false, message: 'Insufficient wallet balance' };
      }

      // Deduct from wallet
      const { error: walletError } = await supabase
        .from('wallet')
        .update({ 
          balance: walletData.balance - priceKobo,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) {
        return { success: false, message: 'Failed to deduct from wallet' };
      }

      // Switch to data plan with allocated data
      await supabase
        .from('user_plans')
        .update({ status: 'inactive' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { error: planError } = await supabase
        .from('user_plans')
        .insert({
          user_id: user.id,
          plan_type: 'data',
          data_allocated: dataMB,
          data_used: 0,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (planError) {
        // Refund wallet if plan creation fails
        await supabase
          .from('wallet')
          .update({ 
            balance: walletData.balance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        return { success: false, message: 'Failed to create data plan' };
      }

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'data_purchase',
          amount: -priceKobo,
          description: `Data plan purchase: ${dataMB >= 1000 ? (dataMB/1000).toFixed(1) + 'GB' : dataMB + 'MB'}`,
          status: 'completed'
        });

      return { success: true, message: `Successfully purchased ${dataMB >= 1000 ? (dataMB/1000).toFixed(1) + 'GB' : dataMB + 'MB'} data plan!` };
    } catch (error) {
      console.error('Error purchasing data plan:', error);
      return { success: false, message: 'Failed to purchase data plan' };
    }
  }
}

export const planService = new PlanService();
