
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  currentCommissionRate: number;
  nextMilestone: number;
}

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

  async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      // Get total referrals count
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', userId);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      const totalReferrals = referralsData?.length || 0;

      // Get total earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('referral_earnings')
        .select('commission_amount')
        .eq('referrer_id', userId);

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      const totalEarnings = earningsData?.reduce((sum, earning) => sum + Number(earning.commission_amount), 0) || 0;

      // Determine commission rate based on referrals
      const currentCommissionRate = totalReferrals >= 50 ? 3.0 : 2.0;

      // Calculate next milestone
      let nextMilestone = 0;
      if (totalReferrals < 50) {
        nextMilestone = 50 - totalReferrals;
      }

      return {
        totalReferrals,
        totalEarnings,
        currentCommissionRate,
        nextMilestone
      };
    } catch (error) {
      console.error('Error in getReferralStats:', error);
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
