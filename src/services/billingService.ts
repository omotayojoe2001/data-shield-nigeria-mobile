
import { supabase } from '@/integrations/supabase/client';
import { planService } from './planService';
import { toast } from 'sonner';

const PAYG_RATE = 20; // ₦0.20 per MB (20 kobo per MB)

class BillingService {
  private isListening = false;
  private lastChargeTime = 0;
  private chargeDebounceMs = 2000; // 2 second debounce

  startPayAsYouGoBilling() {
    if (this.isListening) return;
    
    this.isListening = true;
    window.addEventListener('vpn-data-usage', this.handleDataUsage.bind(this));
    console.log('Billing service started listening for data usage');
  }

  stopPayAsYouGoBilling() {
    this.isListening = false;
    window.removeEventListener('vpn-data-usage', this.handleDataUsage.bind(this));
    console.log('Billing service stopped listening for data usage');
  }

  private async handleDataUsage(event: CustomEvent) {
    const { dataMB } = event.detail;
    const now = Date.now();
    
    // Prevent multiple charges within debounce period
    if (now - this.lastChargeTime < this.chargeDebounceMs) {
      return;
    }
    
    this.lastChargeTime = now;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentPlan = await planService.getCurrentPlan();
      if (!currentPlan) {
        console.log('No current plan found for data usage billing');
        return;
      }

      console.log(`Processing ${dataMB.toFixed(2)}MB usage on ${currentPlan.plan_type} plan`);

      // Implement smart plan priority consumption
      const consumptionResult = await this.handleSmartPlanConsumption(user.id, currentPlan, dataMB);
      
      if (!consumptionResult.success) {
        // Stop VPN if consumption failed
        window.dispatchEvent(new CustomEvent('vpn-force-disconnect'));
        return;
      }

      // Record usage transaction with proper source indication
      await this.recordUsageTransaction(user.id, consumptionResult.sourceUsed, dataMB, consumptionResult.cost);

      // Trigger UI updates with consumption details
      window.dispatchEvent(new CustomEvent('plan-updated', { 
        detail: { 
          consumed: dataMB, 
          source: consumptionResult.sourceUsed,
          remaining: consumptionResult.remaining 
        } 
      }));

    } catch (error) {
      console.error('Error processing data usage billing:', error);
    }
  }

  private async handleSmartPlanConsumption(userId: string, plan: any, dataMB: number) {
    // Priority: Welcome Bonus > Data Plan > Pay-As-You-Go
    
    // 1. First try to consume from welcome bonus if active
    if (plan.plan_type === 'welcome_bonus') {
      const remaining = Math.max(0, plan.data_allocated - plan.data_used);
      if (remaining > 0) {
        const consumedFromBonus = Math.min(dataMB, remaining);
        await planService.updateDataUsage(consumedFromBonus);
        
        const newRemaining = remaining - consumedFromBonus;
        
        // Dispatch specific event for welcome bonus consumption
        window.dispatchEvent(new CustomEvent('bonus-consumed', {
          detail: { consumed: consumedFromBonus, remaining: newRemaining }
        }));

        if (newRemaining <= 0) {
          toast.warning('Welcome bonus exhausted! Switching to next available plan...');
          // Check for other active plans or suggest plan purchase
          await this.handlePlanExhaustion(userId);
        } else if (newRemaining <= 50) {
          toast.warning(`Welcome bonus running low: ${newRemaining}MB remaining`);
        }

        return {
          success: true,
          sourceUsed: 'welcome_bonus',
          cost: 0,
          remaining: newRemaining
        };
      }
    }

    // 2. Then try data plans
    if (plan.plan_type === 'data') {
      const remaining = Math.max(0, plan.data_allocated - plan.data_used);
      if (remaining > 0) {
        const consumedFromData = Math.min(dataMB, remaining);
        await planService.updateDataUsage(consumedFromData);
        
        const newRemaining = remaining - consumedFromData;
        
        // Dispatch specific event for data plan consumption
        window.dispatchEvent(new CustomEvent('data-consumed', {
          detail: { consumed: consumedFromData, remaining: newRemaining }
        }));

        if (newRemaining <= 0) {
          toast.warning('Data plan exhausted! Consider buying more data or switching to Pay-As-You-Go.');
          await this.handlePlanExhaustion(userId);
        } else if (newRemaining <= 100) {
          const displayRemaining = newRemaining >= 1000 ? `${(newRemaining / 1000).toFixed(1)}GB` : `${newRemaining}MB`;
          toast.warning(`Data plan running low: ${displayRemaining} remaining`);
        }

        return {
          success: true,
          sourceUsed: 'data',
          cost: 0,
          remaining: newRemaining
        };
      }
    }

    // 3. Finally use Pay-As-You-Go
    if (plan.plan_type === 'payg') {
      const cost = Math.round(dataMB * PAYG_RATE);
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (!wallet || wallet.balance < cost) {
        toast.error('Insufficient wallet balance! Please top up to continue.');
        return { success: false, sourceUsed: 'payg', cost: 0, remaining: 0 };
      }

      // Deduct from wallet
      const { error } = await supabase
        .from('wallet')
        .update({ 
          balance: wallet.balance - cost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (!error) {
        const newBalance = wallet.balance - cost;
        
        // Dispatch specific event for wallet consumption
        window.dispatchEvent(new CustomEvent('wallet-consumed', {
          detail: { consumed: cost, remaining: newBalance, dataMB }
        }));

        // Update auth context
        window.dispatchEvent(new CustomEvent('wallet-updated'));

        if (newBalance <= 500) { // Less than ₦5
          toast.warning(`Wallet balance low: ₦${(newBalance / 100).toFixed(2)} remaining`);
        }

        return {
          success: true,
          sourceUsed: 'payg',
          cost,
          remaining: newBalance
        };
      }
    }

    return { success: false, sourceUsed: 'none', cost: 0, remaining: 0 };
  }

  private async handlePlanExhaustion(userId: string) {
    // Check if user has other active plans or suggest alternatives
    const allPlans = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Logic to switch to next available plan or suggest purchase
    // This could automatically switch to PAYG if wallet has balance
    const { data: wallet } = await supabase
      .from('wallet')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (wallet && wallet.balance > 100) {
      // Auto-switch to PAYG
      await planService.switchPlan('payg');
      toast.success('Automatically switched to Pay-As-You-Go plan');
    }
  }

  private async recordUsageTransaction(userId: string, sourceUsed: string, dataMB: number, cost: number) {
    try {
      const description = `${sourceUsed.toUpperCase()}: ${dataMB.toFixed(2)}MB data usage${cost > 0 ? ` (₦${(cost / 100).toFixed(2)})` : ''}`;
      
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'usage',
          amount: sourceUsed === 'payg' ? -cost : 0,
          description,
          status: 'completed'
        });
    } catch (error) {
      console.error('Error recording usage transaction:', error);
    }
  }

  calculateDataCost(dataMB: number): number {
    return Math.round(dataMB * PAYG_RATE);
  }

  getPayGRate(): number {
    return PAYG_RATE;
  }
}

export const billingService = new BillingService();
export { PAYG_RATE };
