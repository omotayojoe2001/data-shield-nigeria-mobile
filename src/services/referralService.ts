
import { supabase } from '@/integrations/supabase/client';

class ReferralService {
  async processReferralEarning(referrerId: string, purchaseAmount: number): Promise<void> {
    try {
      console.log(`Processing referral earning for referrer ${referrerId}, purchase: ₦${purchaseAmount / 100}`);
      
      // Get referrer's total referral count
      const { data: referralCount } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('status', 'completed');

      const totalReferrals = referralCount?.length || 0;
      
      // Determine commission rate: 3% for 50+ referrals, 2% otherwise
      const commissionRate = totalReferrals >= 50 ? 3.0 : 2.0;
      const commissionAmount = Math.round((purchaseAmount * commissionRate) / 100);
      
      console.log(`Commission rate: ${commissionRate}% (${totalReferrals} referrals), earning: ₦${commissionAmount / 100}`);
      
      // Add commission to referrer's wallet
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance, referral_bonus')
        .eq('user_id', referrerId)
        .single();

      if (wallet) {
        await supabase
          .from('wallet')
          .update({
            balance: wallet.balance + commissionAmount,
            referral_bonus: (wallet.referral_bonus || 0) + commissionAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referrerId);

        // Record the earning
        await supabase
          .from('referral_earnings')
          .insert({
            referrer_id: referrerId,
            purchase_amount: purchaseAmount / 100, // Store in naira
            commission_rate: commissionRate,
            commission_amount: commissionAmount / 100, // Store in naira
          });

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: referrerId,
            type: 'referral_earning',
            amount: commissionAmount,
            description: `${commissionRate}% referral commission from data purchase`,
            status: 'completed'
          });

        console.log(`Referral earning processed successfully: ₦${commissionAmount / 100}`);
      }
    } catch (error) {
      console.error('Error processing referral earning:', error);
    }
  }

  async getReferralStats(userId: string) {
    try {
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId);

      const { data: earnings } = await supabase
        .from('referral_earnings')
        .select('commission_amount')
        .eq('referrer_id', userId);

      const totalReferrals = referrals?.length || 0;
      const totalEarnings = earnings?.reduce((sum, e) => sum + (e.commission_amount * 100), 0) || 0; // Convert to kobo
      const currentRate = totalReferrals >= 50 ? 3.0 : 2.0;

      return {
        totalReferrals,
        totalEarnings,
        currentCommissionRate: currentRate,
        nextMilestone: totalReferrals >= 50 ? null : 50 - totalReferrals
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        totalEarnings: 0,
        currentCommissionRate: 2.0,
        nextMilestone: 50
      };
    }
  }
}

export const referralService = new ReferralService();
