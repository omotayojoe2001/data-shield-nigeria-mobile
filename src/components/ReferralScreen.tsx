
import React, { useState } from 'react';
import { Users, Share2, Gift, Trophy, Copy, Check } from 'lucide-react';

const ReferralScreen = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'GOODDEEDS2024';
  const referralLink = `https://gooddeeds.app/ref/${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log('Copy failed');
    }
  };

  const badges = [
    { name: '5GB Saved Champion', icon: '🏆', earned: true, requirement: 'Save 5GB total' },
    { name: 'Referral Master', icon: '👑', earned: true, requirement: 'Refer 10 friends' },
    { name: 'Data Saver Pro', icon: '⚡', earned: false, requirement: 'Save 10GB total' },
    { name: 'Community Builder', icon: '🌟', earned: false, requirement: 'Refer 25 friends' }
  ];

  const milestones = [
    { friends: 1, reward: '500MB Free', achieved: true },
    { friends: 5, reward: '2GB Free', achieved: true },
    { friends: 10, reward: '5GB Free', achieved: false },
    { friends: 25, reward: 'Free Monthly Plan', achieved: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Refer & Earn</h1>
            <p className="text-blue-200">Share and get rewarded together</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white">7</div>
              <div className="text-blue-200 text-sm">Friends Referred</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-300">4.5GB</div>
              <div className="text-blue-200 text-sm">Free Data Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-300">₦1,500</div>
              <div className="text-blue-200 text-sm">Total Earned</div>
            </div>
          </div>
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
            <button className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">1</div>
              <span>Share your referral code with friends</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">2</div>
              <span>They sign up using your code</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">3</div>
              <span>Both of you get free data!</span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Trophy size={20} className="mr-2" />
            Referral Milestones
          </h3>
          
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className={`p-4 rounded-xl border-2 ${
                milestone.achieved 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      milestone.achieved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {milestone.friends}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">{milestone.friends} Friends</p>
                      <p className="text-sm text-blue-600">{milestone.reward}</p>
                    </div>
                  </div>
                  {milestone.achieved && (
                    <Check size={20} className="text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Gift size={20} className="mr-2" />
            Achievement Badges
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className={`p-4 rounded-xl text-center ${
                badge.earned 
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300' 
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
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Earned!</span>
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
