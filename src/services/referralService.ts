
import { supabase } from '@/integrations/supabase/client';

class ReferralService {
  async processReferralEarning(referrerId: string, amount: number): Promise<boolean> {
    try {
      // Calculate 2% commission
      const commission = Math.floor(amount * 0.02);
      
      // Add to referrer's wallet
      const { error: walletError } = await supabase
        .from('wallet')
        .update({ 
          referral_bonus: commission,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', referrerId);

      if (walletError) {
        console.error('Error updating referrer wallet:', walletError);
        return false;
      }

      // Record the earning
      const { error: earningError } = await supabase
        .from('referral_earnings')
        .insert({
          referrer_id: referrerId,
          purchase_amount: amount,
          commission_amount: commission
        });

      if (earningError) {
        console.error('Error recording referral earning:', earningError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error processing referral earning:', error);
      return false;
    }
  }
}

export const referralService = new ReferralService();
