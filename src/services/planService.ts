
import { supabase } from '@/integrations/supabase/client';

interface UserPlan {
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
}

export const planService = new PlanService();
