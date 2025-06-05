
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { vpnService } from '../services/vpnService';
import { planService, type UserPlan, type DailyBonusClaim } from '../services/planService';
import { billingService } from '../services/billingService';
import CountdownTimer from './CountdownTimer';
import { Power, ShieldCheck, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface HomeScreenProps {
  onTabChange: (tab: string) => void;
}

const HomeScreen = ({ onTabChange }: HomeScreenProps) => {
  const { user, profile, wallet } = useAuth();
  const { theme } = useTheme();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [bonusStatus, setBonusStatus] = useState<DailyBonusClaim | null>(null);
  const [bonusLoading, setBonusLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadPlanData();
    }
  }, [user]);

  useEffect(() => {
    // Listen for plan updates
    const handlePlanUpdate = () => {
      loadPlanData();
    };

    const handleWalletUpdate = () => {
      // Wallet updates are handled by AuthContext
    };

    window.addEventListener('plan-updated', handlePlanUpdate);
    window.addEventListener('wallet-updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdate);
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, []);

  const loadPlanData = async () => {
    try {
      const [plan, bonus] = await Promise.all([
        planService.getCurrentPlan(),
        planService.getBonusClaimStatus()
      ]);
      setCurrentPlan(plan);
      setBonusStatus(bonus);
    } catch (error) {
      console.error('Error loading plan data:', error);
    }
  };

  const handleVPNToggle = async () => {
    setLoading(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
        billingService.stopPayAsYouGoBilling();
      } else {
        // Check if user can connect based on their plan
        const plan = await planService.getCurrentPlan();
        if (plan) {
          if (plan.plan_type === 'free' && plan.data_used >= plan.data_allocated) {
            toast.error('Daily free data exhausted! Please upgrade your plan.');
            return;
          }
          if (plan.plan_type === 'data' && plan.data_used >= plan.data_allocated) {
            toast.error('Data plan exhausted! Please buy more data or switch to Pay-As-You-Go.');
            return;
          }
          if (plan.plan_type === 'payg' && (wallet?.balance || 0) < 100) { // Less than ₦1
            toast.error('Insufficient wallet balance! Please top up your wallet.');
            return;
          }
        }
        
        await vpnService.connect();
        billingService.startPayAsYouGoBilling();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    setBonusLoading(true);
    try {
      const result = await planService.claimDailyBonus();
      if (result.success) {
        toast.success(result.message);
        await loadPlanData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to claim bonus');
    } finally {
      setBonusLoading(false);
    }
  };

  const getPlanDisplayInfo = () => {
    if (!currentPlan) return { name: 'Free Plan', details: '100MB daily allowance' };
    
    switch (currentPlan.plan_type) {
      case 'free':
        const remaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        return { 
          name: 'Free Plan', 
          details: `${remaining}MB remaining today` 
        };
      case 'payg':
        return { 
          name: 'Pay-As-You-Go', 
          details: `₦${((wallet?.balance || 0) / 100).toFixed(2)} balance remaining` 
        };
      case 'data':
        const dataRemaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        const dataRemainingGB = dataRemaining >= 1000 ? `${(dataRemaining / 1000).toFixed(1)}GB` : `${dataRemaining}MB`;
        return { 
          name: 'Data Plan', 
          details: `${dataRemainingGB} remaining` 
        };
      default:
        return { name: 'Free Plan', details: '100MB daily allowance' };
    }
  };

  const planInfo = getPlanDisplayInfo();
  const canClaimBonus = bonusStatus && new Date() >= new Date(bonusStatus.next_claim_at);

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        {/* Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Hello, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Ready to save on data today?</p>
          </div>
          <div className="text-right">
            <div className="text-white text-sm">Wallet Balance</div>
            <div className="text-white text-xl font-bold">₦{((wallet?.balance || 0) / 100).toFixed(2)}</div>
          </div>
        </div>

        {/* VPN Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${vpnStats.isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <div>
                <h3 className="text-white text-lg font-semibold">
                  {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>
                  {vpnStats.isConnected ? `${vpnStats.location} • ${vpnStats.speed}` : 'Tap to connect and start saving'}
                </p>
              </div>
            </div>
            <button
              onClick={handleVPNToggle}
              disabled={loading}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                vpnStats.isConnected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Connecting...' : (vpnStats.isConnected ? 'Disconnect' : 'Connect')}
            </button>
          </div>

          {/* Data Usage Today */}
          {vpnStats.isConnected && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-white text-lg font-bold">{vpnStats.dataUsed.toFixed(0)}MB</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 text-lg font-bold">{vpnStats.dataSaved.toFixed(0)}MB</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Saved Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{planInfo.name}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>{planInfo.details}</div>
            </div>
            <button 
              onClick={() => onTabChange('current-plan')}
              className="px-4 py-2 bg-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-all duration-300"
            >
              View Plan
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="px-6 mt-6">
        <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Daily Bonus</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Claim your daily ₦50 bonus!</p>
              {bonusStatus && !canClaimBonus && (
                <CountdownTimer 
                  targetTime={bonusStatus.next_claim_at}
                  onComplete={loadPlanData}
                />
              )}
            </div>
            <div className="text-3xl">🎁</div>
          </div>
          
          <button 
            onClick={handleClaimBonus}
            disabled={!canClaimBonus || bonusLoading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bonusLoading ? 'Claiming...' : (canClaimBonus ? 'Claim ₦50 Bonus' : 'Bonus Claimed')}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => onTabChange('plans')}
            className={`rounded-2xl p-4 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-blue-600 text-3xl mb-2">📊</div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Buy Data</h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Plans & subscriptions</p>
          </button>
          
          <button 
            onClick={() => onTabChange('usage')}
            className={`rounded-2xl p-4 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-green-600 text-3xl mb-2">📈</div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>View Usage</h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Track your savings</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onTabChange('referral')}
            className={`rounded-2xl p-4 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-red-600 text-3xl mb-2">🛡️</div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Refer a Friend</h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Earn rewards</p>
          </button>
          
          <button 
            onClick={() => onTabChange('settings')}
            className={`rounded-2xl p-4 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-purple-600 text-3xl mb-2">⚙️</div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Settings</h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>App preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
