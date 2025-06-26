
import React, { useState, useEffect } from 'react';
import { Users, Share2, Gift, Trophy, Copy, Check, TrendingUp, Award, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

interface ReferralEarning {
  id: string;
  purchase_amount: number;
  commission_rate: number;
  commission_amount: number;
  created_at: string;
}

interface Badge {
  name: string;
  icon: string;
  earned: boolean;
  requirement: string;
  special?: boolean;
  glowing?: boolean;
}

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
  const [recentEarnings, setRecentEarnings] = useState<ReferralEarning[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

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

      // Get recent earnings
      const { data: earnings } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (earnings) {
        setRecentEarnings(earnings);
      }

      // Update badges based on current stats
      updateBadges(stats.totalReferrals);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const updateBadges = (totalReferrals: number) => {
    const newBadges: Badge[] = [
      { 
        name: 'First Steps', 
        icon: '🎯', 
        earned: totalReferrals >= 1, 
        requirement: 'Refer your first friend',
        glowing: totalReferrals === 1
      },
      { 
        name: 'Team Player', 
        icon: '👥', 
        earned: totalReferrals >= 5, 
        requirement: 'Refer 5 friends',
        glowing: totalReferrals === 5
      },
      { 
        name: 'Community Builder', 
        icon: '🌟', 
        earned: totalReferrals >= 10, 
        requirement: 'Refer 10 friends',
        glowing: totalReferrals === 10
      },
      { 
        name: 'Network Champion', 
        icon: '🏆', 
        earned: totalReferrals >= 25, 
        requirement: 'Refer 25 friends',
        glowing: totalReferrals === 25
      },
      { 
        name: 'Elite Ambassador', 
        icon: '👑', 
        earned: totalReferrals >= 50, 
        requirement: '3% commission rate (50+ referrals)',
        special: true,
        glowing: totalReferrals === 50
      }
    ];

    setBadges(newBadges);

    // Show celebration for newly earned badges
    const newlyEarned = newBadges.find(badge => badge.glowing);
    if (newlyEarned) {
      setShowCelebration(true);
      toast.success(`🎉 Congratulations! You earned the "${newlyEarned.name}" badge!`, {
        duration: 5000,
      });
      setTimeout(() => setShowCelebration(false), 3000);
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
    const shareText = `Save money on data with GoodDeeds Data! Get started with 7 days of FREE data using my referral code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GoodDeeds Data - Save on Data!',
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

  const milestones = [
    { friends: 1, reward: 'First Steps Badge', achieved: referralStats.totalReferrals >= 1 },
    { friends: 5, reward: 'Team Player Badge', achieved: referralStats.totalReferrals >= 5 },
    { friends: 10, reward: 'Community Builder Badge', achieved: referralStats.totalReferrals >= 10 },
    { friends: 25, reward: 'Network Champion Badge', achieved: referralStats.totalReferrals >= 25 },
    { friends: 50, reward: '3% Commission Rate + Elite Badge', achieved: referralStats.totalReferrals >= 50, special: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24 relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce">
            <div className="text-6xl animate-pulse">🎉</div>
          </div>
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-12 pb-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold leading-tight">Refer & Earn</h1>
            <p className="text-blue-200 text-sm">
              Earn {referralStats.currentCommissionRate}% commission for life!
              {referralStats.nextMilestone && ` (${referralStats.nextMilestone} more for 3%)`}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
        </div>

        {/* Enhanced Stats Card - Mobile First */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div>
              <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
              <div className="text-blue-200 text-xs">Referrals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-300">
                {formatAmount(referralStats.totalEarnings)}
              </div>
              <div className="text-blue-200 text-xs">Total Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">
                {referralStats.currentCommissionRate}%
              </div>
              <div className="text-blue-200 text-xs">Commission</div>
            </div>
          </div>
          
          {referralStats.nextMilestone && (
            <div className="text-center text-white/80 text-xs">
              {referralStats.nextMilestone} more friends for 3% commission!
            </div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Referral Code Section - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <Share2 size={18} className="mr-2" />
            Your Referral Code
          </h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-900 mb-1">{referralCode}</div>
              <div className="text-xs text-blue-600 break-all">{referralLink}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-1 ${
                copied 
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-1"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* How it Works - Mobile Optimized */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl p-4 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-3">How It Works</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm">Share your referral code with friends</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm">They sign up and start using GoodDeeds Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm">Earn {referralStats.currentCommissionRate}% of their purchases forever!</span>
            </div>
          </div>
        </div>

        {/* Recent Earnings Tracker - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <TrendingUp size={18} className="mr-2" />
            Recent Earnings
          </h3>
          
          {recentEarnings.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentEarnings.slice(0, 5).map((earning) => (
                <div key={earning.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-green-800">
                      +₦{earning.commission_amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600">
                      {earning.commission_rate}% commission
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(earning.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No earnings yet. Start referring friends!</p>
            </div>
          )}
        </div>

        {/* Achievement Badges - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <Award size={18} className="mr-2" />
            Achievement Badges
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, index) => (
              <div key={index} className={`p-3 rounded-xl text-center transition-all duration-500 ${
                badge.earned 
                  ? badge.special
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg' 
                    : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-md'
                  : 'bg-gray-100 border-2 border-gray-200'
              } ${badge.glowing ? 'animate-pulse shadow-2xl' : ''}`}>
                <div className={`text-2xl mb-1 ${badge.glowing ? 'animate-bounce' : ''}`}>
                  {badge.icon}
                </div>
                <div className={`font-semibold text-xs mb-1 ${badge.earned ? 'text-blue-900' : 'text-gray-500'}`}>
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
                      {badge.special ? 'Elite!' : 'Earned!'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <Trophy size={18} className="mr-2" />
            Referral Milestones
          </h3>
          
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <div key={index} className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                milestone.achieved 
                  ? milestone.special 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-green-500 bg-green-50'
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      milestone.achieved 
                        ? milestone.special 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {milestone.friends}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">{milestone.friends} Friends</p>
                      <p className={`text-xs ${milestone.special ? 'text-purple-600 font-bold' : 'text-blue-600'}`}>
                        {milestone.reward}
                      </p>
                    </div>
                  </div>
                  {milestone.achieved && (
                    <div className="flex items-center">
                      <Check size={16} className={milestone.special ? 'text-purple-500' : 'text-green-500'} />
                      {milestone.special && <Star size={16} className="text-purple-500 ml-1" />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralScreen;
