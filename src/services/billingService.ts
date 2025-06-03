
import { supabase } from '@/integrations/supabase/client';

const PAYG_RATE = 200; // ₦200 per GB (200 kobo per MB)

class BillingService {
  private isListening = false;

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
    const cost = Math.round(dataMB * PAYG_RATE); // Cost in kobo
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', user.id)
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
          .eq('user_id', user.id);

        if (!updateError) {
          // Record transaction
          await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              type: 'usage',
              amount: -cost,
              description: `Data usage: ${dataMB.toFixed(2)}MB`,
              status: 'completed'
            });

          console.log(`Charged ₦${(cost / 100).toFixed(2)} for ${dataMB.toFixed(2)}MB data usage`);
        }
      } else {
        // Insufficient balance - could trigger low balance notification
        console.warn('Insufficient wallet balance for data usage');
        this.triggerLowBalanceNotification();
      }
    } catch (error) {
      console.error('Error processing Pay-As-You-Go billing:', error);
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
