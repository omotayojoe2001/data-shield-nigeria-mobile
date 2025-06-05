
import { supabase } from '@/integrations/supabase/client';
import { planService } from './planService';
import { toast } from 'sonner';

const PAYG_RATE = 20; // ₦0.20 per MB (20 kobo per MB)

class BillingService {
  private isListening = false;
  private lastChargeTime = 0;
  private chargeDebounceMs = 3000; // 3 second debounce

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

      // Update plan data usage for all plan types
      await planService.updateDataUsage(dataMB);

      // Handle billing based on plan type
      if (currentPlan.plan_type === 'payg') {
        await this.chargePayAsYouGo(user.id, dataMB);
      } else if (currentPlan.plan_type === 'data') {
        await this.deductFromDataPlan(currentPlan, dataMB);
      } else if (currentPlan.plan_type === 'free') {
        await this.deductFromFreePlan(currentPlan, dataMB);
      }

      // Record usage transaction for all plans except when insufficient balance
      const cost = currentPlan.plan_type === 'payg' ? Math.round(dataMB * PAYG_RATE) : 0;
      
      // Only record transaction if we successfully processed the usage
      if (currentPlan.plan_type !== 'payg' || cost === 0) {
        await this.recordUsageTransaction(user.id, currentPlan.plan_type, dataMB, cost);
      }

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('plan-updated'));

    } catch (error) {
      console.error('Error processing data usage billing:', error);
    }
  }

  private async chargePayAsYouGo(userId: string, dataMB: number) {
    const cost = Math.round(dataMB * PAYG_RATE); // Cost in kobo
    
    if (cost === 0) return;

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
        
        // Record successful transaction
        await this.recordUsageTransaction(userId, 'payg', dataMB, cost);
        
        // Update auth context
        window.dispatchEvent(new CustomEvent('wallet-updated'));
      }
    } else {
      // Insufficient balance - notify user and stop VPN
      console.warn('Insufficient wallet balance for data usage');
      toast.error('Insufficient wallet balance. Please top up to continue using VPN.');
      this.triggerLowBalanceNotification();
      
      // Disconnect VPN due to insufficient balance
      window.dispatchEvent(new CustomEvent('vpn-force-disconnect'));
    }
  }

  private async deductFromDataPlan(plan: any, dataMB: number) {
    const remainingData = Math.max(0, plan.data_allocated - plan.data_used);
    
    if (remainingData <= 0) {
      toast.error('Data plan exhausted! Please buy more data or switch to Pay-As-You-Go.');
      window.dispatchEvent(new CustomEvent('vpn-force-disconnect'));
      return;
    }

    console.log(`Data plan: ${dataMB.toFixed(2)}MB deducted. Remaining: ${Math.max(0, remainingData - dataMB).toFixed(0)}MB`);

    // If plan is about to be exhausted, notify user
    if (plan.data_used + dataMB >= plan.data_allocated) {
      toast.warning('Data plan almost exhausted! Consider buying more data or switching plans.');
    }
  }

  private async deductFromFreePlan(plan: any, dataMB: number) {
    const remainingData = Math.max(0, plan.data_allocated - plan.data_used);
    
    if (remainingData <= 0) {
      toast.error('Daily free quota exhausted! Upgrade to Pay-As-You-Go or buy data to continue.');
      window.dispatchEvent(new CustomEvent('vpn-force-disconnect'));
      return;
    }

    console.log(`Free plan: ${dataMB.toFixed(2)}MB deducted. Remaining today: ${Math.max(0, remainingData - dataMB).toFixed(0)}MB`);

    // If daily quota is about to be exhausted, notify user
    if (plan.data_used + dataMB >= plan.data_allocated) {
      toast.warning('Daily free quota almost exhausted! Consider upgrading your plan.');
    }
  }

  private async recordUsageTransaction(userId: string, planType: string, dataMB: number, cost: number) {
    try {
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'usage',
          amount: planType === 'payg' ? -cost : 0,
          description: `${planType.toUpperCase()}: ${dataMB.toFixed(2)}MB data usage`,
          status: 'completed'
        });
    } catch (error) {
      console.error('Error recording usage transaction:', error);
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
