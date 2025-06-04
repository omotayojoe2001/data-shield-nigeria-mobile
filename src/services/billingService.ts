
import { supabase } from '@/integrations/supabase/client';
import { planService } from './planService';
import { toast } from 'sonner';

const PAYG_RATE = 20; // ₦0.20 per MB (20 kobo per MB)

class BillingService {
  private isListening = false;
  private lastChargeTime = 0;
  private chargeDebounceMs = 5000; // 5 second debounce to prevent multiple charges

  startPayAsYouGoBilling() {
    if (this.isListening) return;
    
    this.isListening = true;
    window.addEventListener('vpn-data-usage', this.handleDataUsage.bind(this));
  }

  stopPayAsYouGoBilling() {
    this.isListening = false;
    window.removeEventListener('vpn-data-usage', this.handleDataUsage.bind(this));
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

      console.log(`Processing data usage: ${dataMB}MB on ${currentPlan.plan_type} plan`);

      // Update plan data usage for all plan types
      await planService.updateDataUsage(dataMB);

      if (currentPlan.plan_type === 'payg') {
        await this.chargePayAsYouGo(user.id, dataMB);
      } else if (currentPlan.plan_type === 'data') {
        await this.deductFromDataPlan(currentPlan, dataMB);
      } else if (currentPlan.plan_type === 'free') {
        await this.deductFromFreePlan(currentPlan, dataMB);
      }

      // Record usage transaction for all plans
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'usage',
          amount: currentPlan.plan_type === 'payg' ? -(Math.round(dataMB * PAYG_RATE)) : 0,
          description: `${currentPlan.plan_type.toUpperCase()}: ${dataMB.toFixed(2)}MB data usage`,
          status: 'completed'
        });

    } catch (error) {
      console.error('Error processing data usage billing:', error);
    }
  }

  private async chargePayAsYouGo(userId: string, dataMB: number) {
    const cost = Math.round(dataMB * PAYG_RATE); // Cost in kobo
    
    // Check current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      console.error('Error fetching wallet:', walletError);
      return;
    }

    // Only charge if user has sufficient balance
    if (wallet.balance >= cost) {
      // Deduct from wallet
      const { error: updateError } = await supabase
        .from('wallet')
        .update({ 
          balance: wallet.balance - cost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (!updateError) {
        console.log(`Charged ₦${(cost / 100).toFixed(2)} for ${dataMB.toFixed(2)}MB data usage`);
      }
    } else {
      // Insufficient balance - notify user and disconnect VPN
      console.warn('Insufficient wallet balance for data usage');
      toast.error('Insufficient wallet balance. Please top up to continue using VPN.');
      this.triggerLowBalanceNotification();
    }
  }

  private async deductFromDataPlan(plan: any, dataMB: number) {
    const newUsage = plan.data_used + Math.round(dataMB);
    
    console.log(`Deducted ${dataMB.toFixed(2)}MB from data plan. Used: ${newUsage}/${plan.data_allocated}MB`);

    // If plan is exhausted, notify user
    if (newUsage >= plan.data_allocated) {
      toast.error('Data plan exhausted! Switch to Pay-As-You-Go or buy more data to continue.');
    }
  }

  private async deductFromFreePlan(plan: any, dataMB: number) {
    const newUsage = plan.data_used + Math.round(dataMB);
    
    console.log(`Deducted ${dataMB.toFixed(2)}MB from free plan. Used: ${newUsage}/${plan.data_allocated}MB`);

    // If daily quota is exhausted, notify user
    if (newUsage >= plan.data_allocated) {
      toast.error('Daily free quota exhausted! Upgrade to Pay-As-You-Go or buy data to continue.');
    }
  }

  private triggerLowBalanceNotification() {
    const event = new CustomEvent('low-wallet-balance');
    window.dispatchEvent(event);
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
