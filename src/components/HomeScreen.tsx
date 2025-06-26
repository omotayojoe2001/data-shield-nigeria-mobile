
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { vpnService } from '../services/vpnService';
import { planService, type UserPlan } from '../services/planService';
import { billingService } from '../services/billingService';
import DailyBonusSection from './DailyBonusSection';
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

    window.addEventListener('plan-updated', handlePlanUpdate);
    window.addEventListener('wallet-updated', handlePlanUpdate);
    window.addEventListener('bonus-updated', handlePlanUpdate);

    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdate);
      window.removeEventListener('wallet-updated', handlePlanUpdate);
      window.removeEventListener('bonus-updated', handlePlanUpdate);
    };
  }, []);

  const loadPlanData = async () => {
    try {
      const plan = await planService.getCurrentPlan();
      setCurrentPlan(plan);
      console.log('Loaded plan:', plan);
    } catch (error) {
      console.error('Error loading plan data:', error);
    }
  };

  const handleVPNToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
        billingService.stopPayAsYouGoBilling();
        toast.success('VPN disconnected');
      } else {
        // Check if user can connect based on their plan
        const plan = await planService.getCurrentPlan();
        if (!plan) {
          toast.error('No active plan found! Please claim your welcome bonus first.');
          return;
        }
        
        if (plan.plan_type === 'welcome_bonus') {
          const remainingData = Math.max(0, plan.data_allocated - plan.data_used);
          if (remainingData <= 0) {
            toast.error('Welcome bonus data exhausted! Please choose a plan to continue.');
            onTabChange('plans');
            return;
          }
        }
        
        if (plan.plan_type === 'data') {
          const remainingData = Math.max(0, plan.data_allocated - plan.data_used);
          if (remainingData <= 0) {
            toast.error('Data plan exhausted! Please buy more data or switch to Pay-As-You-Go.');
            return;
          }
        }
        
        if (plan.plan_type === 'payg' && (wallet?.balance || 0) < 100) { // Less than ₦1
          toast.error('Insufficient wallet balance! Please top up your wallet.');
          return;
        }
        
        await vpnService.connect();
        if (plan.plan_type === 'payg') {
          billingService.startPayAsYouGoBilling();
        }
        toast.success('VPN connected successfully!');
      }
    } catch (error) {
      console.error('VPN toggle error:', error);
      toast.error('Failed to toggle VPN connection');
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayInfo = () => {
    if (!currentPlan) return { name: 'No Plan', details: 'Claim your 7-day welcome bonus to get started!' };
    
    switch (currentPlan.plan_type) {
      case 'welcome_bonus':
        const remaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        const expiryDate = currentPlan.expires_at ? new Date(currentPlan.expires_at) : null;
        const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        return { 
          name: 'Welcome Bonus Active', 
          details: `${remaining}MB remaining (${daysLeft} days left)` 
        };
      case 'payg':
        return { 
          name: 'Pay-As-You-Go', 
          details: `₦${((wallet?.balance || 0) / 100).toFixed(2)} balance remaining` 
        };
      case 'data':
        const dataRemaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        const dataRemainingDisplay = dataRemaining >= 1000 ? `${(dataRemaining / 1000).toFixed(1)}GB` : `${dataRemaining}MB`;
        const dataExpiryDate = currentPlan.expires_at ? new Date(currentPlan.expires_at) : null;
        const dataDaysLeft = dataExpiryDate ? Math.max(0, Math.ceil((dataExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        return { 
          name: 'Data Plan', 
          details: `${dataRemainingDisplay} remaining (${dataDaysLeft} days left)` 
        };
      default:
        return { name: 'No Plan', details: 'Claim your 7-day welcome bonus to get started!' };
    }
  };

  const planInfo = getPlanDisplayInfo();

  return (
    <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header - Mobile Optimized */}
      <div className={`px-4 pt-8 pb-6 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        {/* Greeting - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold leading-tight">
              Hello, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Ready to save on data today?</p>
          </div>
          <div className="text-right">
            <div className="text-white text-xs">Wallet Balance</div>
            <div className="text-white text-lg font-bold">₦{((wallet?.balance || 0) / 100).toFixed(2)}</div>
          </div>
        </div>

        {/* Welcome Bonus Alert - Mobile Optimized */}
        {(!currentPlan || currentPlan.plan_type === 'welcome_bonus') && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-3 mb-4 border border-white/20">
            <div className="text-center">
              <h3 className="text-white font-bold text-base mb-1">🎁 7-Day Welcome Bonus</h3>
              <p className="text-white/90 text-xs mb-2">Get 200MB FREE daily for 7 days!</p>
              <DailyBonusSection compact={true} />
            </div>
          </div>
        )}

        {/* VPN Status Card - Mobile Optimized */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${vpnStats.isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <div>
                <h3 className="text-white text-base font-semibold">
                  {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>
                  {vpnStats.isConnected ? `${vpnStats.location} • ${vpnStats.speed}` : 'Tap to connect and start saving'}
                </p>
              </div>
            </div>
            <button
              onClick={handleVPNToggle}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                vpnStats.isConnected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">{vpnStats.isConnected ? 'Disconnecting...' : 'Connecting...'}</span>
                </div>
              ) : (
                <span className="text-xs">{vpnStats.isConnected ? 'Disconnect' : 'Connect'}</span>
              )}
            </button>
          </div>

          {/* Data Usage Today - Mobile Optimized */}
          {vpnStats.isConnected && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center">
                <div className="text-white text-base font-bold">{vpnStats.dataUsed.toFixed(0)}MB</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 text-base font-bold">{vpnStats.dataSaved.toFixed(0)}MB</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Saved Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Status - Mobile Optimized */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{planInfo.name}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>{planInfo.details}</div>
            </div>
            <button 
              onClick={() => onTabChange('plans')}
              className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-all duration-300"
            >
              {!currentPlan ? 'Get Started' : 'View Plans'}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bonus Section - Mobile Optimized */}
      {currentPlan?.plan_type === 'welcome_bonus' && (
        <div className="px-4 mt-4">
          <DailyBonusSection />
        </div>
      )}

      {/* No Plan Warning - Mobile Optimized */}
      {!currentPlan && (
        <div className="px-4 mt-4">
          <div className={`rounded-2xl p-4 shadow-lg border-2 border-purple-500 ${theme === 'dark' ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className={`text-base font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>
                Welcome to GoodDeeds Data!
              </h3>
              <p className={`mb-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
                Start your journey with our 7-day welcome bonus! Get 200MB FREE daily for your first week.
              </p>
              <DailyBonusSection />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Mobile Optimized */}
      <div className="px-4 mt-4">
        <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => onTabChange('plans')}
            className={`rounded-xl p-3 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-blue-600 text-2xl mb-1">📊</div>
            <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Buy Data</h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Plans & subscriptions</p>
          </button>
          
          <button 
            onClick={() => onTabChange('usage')}
            className={`rounded-xl p-3 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-green-600 text-2xl mb-1">📈</div>
            <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>View Usage</h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Track your savings</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onTabChange('referral')}
            className={`rounded-xl p-3 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-red-600 text-2xl mb-1">👥</div>
            <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Refer a Friend</h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Earn rewards</p>
          </button>
          
          <button 
            onClick={() => onTabChange('settings')}
            className={`rounded-xl p-3 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-purple-600 text-2xl mb-1">⚙️</div>
            <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Settings</h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>App preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
