
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { vpnService } from '../services/vpnService';
import { apiService } from '../services/apiService';
import DailyBonusSection from './DailyBonusSection';
import { Power, ShieldCheck, BarChart3, Zap, Wallet, Database } from 'lucide-react';
import { toast } from 'sonner';

interface HomeScreenProps {
  onTabChange: (tab: string) => void;
}

const HomeScreen = ({ onTabChange }: HomeScreenProps) => {
  const { user, profile, wallet } = useAuth();
  const { theme } = useTheme();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [loading, setLoading] = useState(false);
  const [vpnStatusData, setVpnStatusData] = useState<any>(null);
  const [liveConsumption, setLiveConsumption] = useState<{
    source: string;
    amount: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadVpnStatus();
    }
  }, [user]);

  useEffect(() => {
    // Listen for consumption events
    const handleBonusConsumed = (event: CustomEvent) => {
      setLiveConsumption({
        source: 'Welcome Bonus',
        amount: event.detail.consumed,
        remaining: event.detail.remaining
      });
      setTimeout(() => setLiveConsumption(null), 3000);
    };

    const handleDataConsumed = (event: CustomEvent) => {
      setLiveConsumption({
        source: 'Data Plan',
        amount: event.detail.consumed,
        remaining: event.detail.remaining
      });
      setTimeout(() => setLiveConsumption(null), 3000);
    };

    const handleWalletConsumed = (event: CustomEvent) => {
      setLiveConsumption({
        source: 'Pay-As-You-Go',
        amount: event.detail.consumed,
        remaining: event.detail.remaining
      });
      setTimeout(() => setLiveConsumption(null), 3000);
    };

    window.addEventListener('bonus-consumed', handleBonusConsumed);
    window.addEventListener('data-consumed', handleDataConsumed);
    window.addEventListener('wallet-consumed', handleWalletConsumed);

    return () => {
      window.removeEventListener('bonus-consumed', handleBonusConsumed);
      window.removeEventListener('data-consumed', handleDataConsumed);
      window.removeEventListener('wallet-consumed', handleWalletConsumed);
    };
  }, []);

  const loadVpnStatus = async () => {
    try {
      const response = await apiService.getVpnStatus();
      if (response.success && response.data) {
        setVpnStatusData(response.data);
        console.log('VPN Status loaded:', response.data);
      }
    } catch (error) {
      console.error('Error loading VPN status:', error);
    }
  };

  const handleVPNToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
        toast.success('VPN disconnected');
      } else {
        // Try to connect using backend
        const result = await vpnService.connect();
        if (result.success) {
          toast.success('VPN connected successfully!');
          // Refresh VPN status after connection
          await loadVpnStatus();
        } else {
          throw new Error(result.error || 'Failed to connect');
        }
      }
    } catch (error) {
      console.error('VPN toggle error:', error);
      toast.error(`Failed to ${vpnStats.isConnected ? 'disconnect' : 'connect'} VPN: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayInfo = () => {
    if (!vpnStatusData) {
      return { 
        name: 'Loading...', 
        details: 'Fetching plan information...',
        icon: ShieldCheck, 
        color: 'text-gray-500' 
      };
    }
    
    const { plan, wallet: backendWallet } = vpnStatusData;
    
    switch (plan.type) {
      case 'free':
        return { 
          name: 'Free Plan', 
          details: 'Limited daily usage with ads',
          icon: Database,
          color: 'text-blue-600'
        };
      case 'buy_gb':
        const dataRemaining = plan.dataRemaining || 0;
        const dataRemainingDisplay = dataRemaining >= 1000 ? `${(dataRemaining / 1000).toFixed(1)}GB` : `${dataRemaining}MB`;
        const expiryDate = plan.expiryDate ? new Date(plan.expiryDate) : null;
        const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        return { 
          name: 'Data Plan', 
          details: `${dataRemainingDisplay} remaining (${daysLeft} days left)`,
          icon: Database,
          color: 'text-blue-600'
        };
      case 'paygo':
        return { 
          name: 'Pay-As-You-Go', 
          details: `₦${((backendWallet?.balance || 0) / 100).toFixed(2)} balance remaining`,
          icon: Wallet,
          color: 'text-green-600'
        };
      default:
        return { 
          name: 'No Plan', 
          details: 'Please select a plan to get started',
          icon: ShieldCheck, 
          color: 'text-gray-500' 
        };
    }
  };

  const planInfo = getPlanDisplayInfo();

  return (
    <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Live Consumption Indicator */}
      {liveConsumption && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Using: {liveConsumption.source}</span>
              </div>
              <div className="text-sm">
                {liveConsumption.source === 'Pay-As-You-Go' 
                  ? `₦${(liveConsumption.amount / 100).toFixed(2)} deducted`
                  : `${liveConsumption.amount.toFixed(1)}MB consumed`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className={`px-4 pt-8 pb-6 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        {/* Greeting - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold leading-tight">
              Hello, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Ready to save on data with GoodDeeds VPN?</p>
          </div>
          <div className="text-right">
            <div className="text-white text-xs">Wallet Balance</div>
            <div className="text-white text-lg font-bold">
              ₦{vpnStatusData?.wallet ? ((vpnStatusData.wallet.balance || 0) / 100).toFixed(2) : ((wallet?.balance || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Daily Bonus Section - Compact */}
        <div className="mb-4">
          <DailyBonusSection compact={true} />
        </div>

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

          {/* Real-time Data Usage Today */}
          {(vpnStats.isConnected || vpnStatusData?.usage) && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="text-center">
                <div className="text-white text-base font-bold">
                  {vpnStatusData?.usage ? `${vpnStatusData.usage.totalMB.toFixed(1)}MB` : `${vpnStats.dataUsed.toFixed(1)}MB`}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 text-base font-bold">
                  {vpnStatusData?.usage ? `${(vpnStatusData.usage.totalMB * 0.65).toFixed(1)}MB` : `${vpnStats.dataSaved.toFixed(1)}MB`}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Saved Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Current Plan Status with Real-time Updates */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <planInfo.icon size={16} className={`${planInfo.color} opacity-80`} />
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{planInfo.name}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>{planInfo.details}</div>
              </div>
            </div>
            <button 
              onClick={() => onTabChange('plans')}
              className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-all duration-300"
            >
              {planInfo.name === 'No Plan' ? 'Get Started' : 'View Plans'}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bonus Section - Full version */}
      <div className="px-4 mt-4">
        <DailyBonusSection />
      </div>

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
            onClick={() => onTabChange('profile')}
            className={`rounded-xl p-3 shadow-lg border hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}
          >
            <div className="text-red-600 text-2xl mb-1">👥</div>
            <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Referrals</h4>
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
