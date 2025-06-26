
import React, { useState, useEffect } from 'react';
import { Users, Share2, Gift, Trophy, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

const ReferralScreen = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    currentCommissionRate: 2.0,
    nextMilestone: 50
  });

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Get user's referral code
      const { data: codeData } = await supabase
        .from('user_referral_codes')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      if (codeData) {
        setReferralCode(codeData.referral_code);
      }

      // Get enhanced referral stats
      const stats = await referralService.getReferralStats(user.id);
      setReferralStats(stats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    const shareText = `Save money on data with GoData VPN! Get started with 7 days of FREE data using my referral code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GoData VPN - Save on Data!',
          text: shareText,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      // Fallback for desktop - create a shareable message
      const shareData = `${shareText}\n\n${referralLink}`;
      try {
        await navigator.clipboard.writeText(shareData);
        toast.success('Share message copied to clipboard!');
      } catch (err) {
        handleCopy();
      }
    }
  };

  const formatAmount = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const badges = [
    { name: 'First Referral', icon: '🎯', earned: referralStats.totalReferrals >= 1, requirement: 'Refer 1 friend' },
    { 
      name: 'High Earner', 
      icon: '💰', 
      earned: referralStats.totalReferrals >= 50, 
      requirement: '3% commission (50+ referrals)',
      special: true 
    },
    { name: 'Community Builder', icon: '🌟', earned: referralStats.totalReferrals >= 10, requirement: 'Refer 10 friends' },
    { name: 'Ambassador', icon: '🏆', earned: referralStats.totalReferrals >= 25, requirement: 'Refer 25 friends' }
  ];

  const milestones = [
    { friends: 1, reward: '₦200', achieved: referralStats.totalReferrals >= 1 },
    { friends: 5, reward: '₦1,000', achieved: referralStats.totalReferrals >= 5 },
    { friends: 10, reward: '₦2,500', achieved: referralStats.totalReferrals >= 10 },
    { friends: 50, reward: '3% Commission Rate', achieved: referralStats.totalReferrals >= 50, special: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Refer & Earn</h1>
            <p className="text-blue-200">
              Earn {referralStats.currentCommissionRate}% commission for life!
              {referralStats.nextMilestone && ` (${referralStats.nextMilestone} more for 3%)`}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
        </div>

        {/* Enhanced Stats Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-3xl font-bold text-white">{referralStats.totalReferrals}</div>
              <div className="text-blue-200 text-sm">Total Referrals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-300">
                {formatAmount(referralStats.totalEarnings)}
              </div>
              <div className="text-blue-200 text-sm">Lifetime Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-300">
                {referralStats.currentCommissionRate}%
              </div>
              <div className="text-blue-200 text-sm">Commission Rate</div>
            </div>
          </div>
          
          {referralStats.nextMilestone && (
            <div className="text-center text-white/80 text-sm">
              Refer {referralStats.nextMilestone} more friends to unlock 3% commission rate!
            </div>
          )}
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Share2 size={20} className="mr-2" />
            Your Referral Code
          </h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 mb-2">{referralCode}</div>
              <div className="text-sm text-blue-600 break-all">{referralLink}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                copied 
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Enhanced How it Works */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">1</div>
              <span>Share your referral code with friends</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">2</div>
              <span>They sign up and start using GoData</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">3</div>
              <span>Earn {referralStats.currentCommissionRate}% of their data purchases forever!</span>
            </div>
            {referralStats.totalReferrals >= 50 && (
              <div className="mt-4 p-3 bg-white/20 rounded-lg">
                <div className="text-center font-bold">🎉 Premium Referrer Status!</div>
                <div className="text-center text-sm">You earn 3% on all referral purchases</div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Milestones */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Trophy size={20} className="mr-2" />
            Referral Milestones
          </h3>
          
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className={`p-4 rounded-xl border-2 ${
                milestone.achieved 
                  ? milestone.special 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-green-500 bg-green-50'
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      milestone.achieved 
                        ? milestone.special 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {milestone.friends}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">{milestone.friends} Friends</p>
                      <p className={`text-sm ${milestone.special ? 'text-purple-600 font-bold' : 'text-blue-600'}`}>
                        {milestone.reward}
                      </p>
                    </div>
                  </div>
                  {milestone.achieved && (
                    <Check size={20} className={milestone.special ? 'text-purple-500' : 'text-green-500'} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Badges */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Gift size={20} className="mr-2" />
            Achievement Badges
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className={`p-4 rounded-xl text-center ${
                badge.earned 
                  ? badge.special
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300' 
                    : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300'
                  : 'bg-gray-100 border-2 border-gray-200'
              }`}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className={`font-semibold mb-1 ${badge.earned ? 'text-blue-900' : 'text-gray-500'}`}>
                  {badge.name}
                </div>
                <div className={`text-xs ${badge.earned ? 'text-blue-600' : 'text-gray-400'}`}>
                  {badge.requirement}
                </div>
                {badge.earned && (
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${
                      badge.special ? 'bg-purple-500' : 'bg-green-500'
                    }`}>
                      {badge.special ? 'Premium!' : 'Earned!'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
