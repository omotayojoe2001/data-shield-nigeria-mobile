
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Wallet, Clock, Database, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { planService, type UserPlan } from '../services/planService';
import { vpnService } from '../services/vpnService';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface CurrentPlanScreenProps {
  onTabChange: (tab: string) => void;
}

const CurrentPlanScreen = ({ onTabChange }: CurrentPlanScreenProps) => {
  const { user, wallet } = useAuth();
  const { theme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [liveConsumption, setLiveConsumption] = useState<any>(null);

  useEffect(() => {
    loadCurrentPlan();
    
    const statsInterval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(statsInterval);
  }, [user]);

  useEffect(() => {
    // Listen for plan updates and consumption events
    const handlePlanUpdate = () => {
      loadCurrentPlan();
    };

    const handleConsumption = (event: CustomEvent) => {
      setLiveConsumption({
        type: event.type,
        data: event.detail,
        timestamp: Date.now()
      });
      setTimeout(() => setLiveConsumption(null), 5000);
    };

    window.addEventListener('plan-updated', handlePlanUpdate);
    window.addEventListener('bonus-consumed', handleConsumption);
    window.addEventListener('data-consumed', handleConsumption);
    window.addEventListener('wallet-consumed', handleConsumption);

    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdate);
      window.removeEventListener('bonus-consumed', handleConsumption);
      window.removeEventListener('data-consumed', handleConsumption);
      window.removeEventListener('wallet-consumed', handleConsumption);
    };
  }, []);

  const loadCurrentPlan = async () => {
    if (!user) return;
    
    try {
      const plan = await planService.getCurrentPlan();
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading current plan:', error);
      toast.error('Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'welcome_bonus':
        return <Shield size={32} className="text-purple-600" />;
      case 'payg':
        return <Wallet size={32} className="text-green-600" />;
      case 'data':
        return <Database size={32} className="text-blue-600" />;
      default:
        return <Shield size={32} className="text-purple-600" />;
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'welcome_bonus':
        return 'Welcome Bonus';
      case 'payg':
        return 'Pay-As-You-Go';
      case 'data':
        return 'Data Plan';
      default:
        return 'Welcome Bonus';
    }
  };

  const getPlanDescription = (plan: UserPlan) => {
    switch (plan.plan_type) {
      case 'welcome_bonus':
        const remaining = Math.max(0, plan.data_allocated - plan.data_used);
        const expiryDate = plan.expires_at ? new Date(plan.expires_at) : null;
        const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        return `${remaining}MB remaining (${daysLeft} days left)`;
      case 'payg':
        return `₦${((wallet?.balance || 0) / 100).toFixed(2)} wallet balance`;
      case 'data':
        const dataRemaining = Math.max(0, plan.data_allocated - plan.data_used);
        const dataRemainingDisplay = dataRemaining >= 1000 ? `${(dataRemaining / 1000).toFixed(1)}GB` : `${dataRemaining}MB`;
        const dataExpiryDate = plan.expires_at ? new Date(plan.expires_at) : null;
        const dataDaysLeft = dataExpiryDate ? Math.max(0, Math.ceil((dataExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        return `${dataRemainingDisplay} remaining (${dataDaysLeft} days left)`;
      default:
        return 'Basic plan with welcome bonus';
    }
  };

  const getUsagePercentage = (plan: UserPlan) => {
    if (plan.plan_type === 'payg') {
      return 0; // No usage percentage for PAYG
    }
    if (plan.data_allocated === 0) return 0;
    return Math.min(100, (plan.data_used / plan.data_allocated) * 100);
  };

  const getRemainingAmount = (plan: UserPlan) => {
    if (plan.plan_type === 'payg') {
      return `₦${((wallet?.balance || 0) / 100).toFixed(2)}`;
    }
    const remaining = Math.max(0, plan.data_allocated - plan.data_used);
    return remaining >= 1000 ? `${(remaining / 1000).toFixed(1)}GB` : `${remaining}MB`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Loading plan information...</p>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
        <div className="text-center">
          <Shield size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>No Active Plan</h2>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>You don't have an active plan yet.</p>
          <button
            onClick={() => onTabChange('plans')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Choose a Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Live Consumption Alert */}
      {liveConsumption && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`p-3 rounded-xl shadow-lg border ${
            liveConsumption.type === 'bonus-consumed' ? 'bg-purple-500' :
            liveConsumption.type === 'data-consumed' ? 'bg-blue-500' :
            'bg-green-500'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown size={16} />
                <span className="text-sm font-medium">
                  {liveConsumption.type === 'bonus-consumed' ? 'Welcome Bonus' :
                   liveConsumption.type === 'data-consumed' ? 'Data Plan' :
                   'Pay-As-You-Go'} Usage
                </span>
              </div>
              <div className="text-sm font-bold">
                {liveConsumption.type === 'wallet-consumed' 
                  ? `₦${(liveConsumption.data.consumed / 100).toFixed(2)}`
                  : `${liveConsumption.data.consumed.toFixed(1)}MB`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <h1 className="text-white text-3xl font-bold mb-2">Current Plan</h1>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Your active subscription details</p>
      </div>

      <div className="px-6 mt-6">
        {/* Plan Card with Real-time Updates */}
        <div className={`rounded-3xl p-6 shadow-xl border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              currentPlan.plan_type === 'welcome_bonus' ? 'bg-purple-100' :
              currentPlan.plan_type === 'payg' ? 'bg-green-100' :
              'bg-blue-100'
            }`}>
              {getPlanIcon(currentPlan.plan_type)}
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                {getPlanName(currentPlan.plan_type)}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                {getPlanDescription(currentPlan)}
              </p>
            </div>
          </div>

          {/* Real-time Usage Progress */}
          {currentPlan.plan_type !== 'payg' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                  Data Usage (Live)
                </span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                  {currentPlan.data_used}MB / {currentPlan.data_allocated}MB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(currentPlan)} 
                className={`h-4 ${
                  getUsagePercentage(currentPlan) > 80 ? 'text-red-500' :
                  getUsagePercentage(currentPlan) > 60 ? 'text-yellow-500' :
                  'text-green-500'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
                  {getUsagePercentage(currentPlan).toFixed(1)}% used
                </span>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                  {getRemainingAmount(currentPlan)} remaining
                </span>
              </div>
            </div>
          )}

          {/* Real-time Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Database size={16} className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                  {currentPlan.plan_type === 'payg' ? 'Today Used' : 'Total Used'}
                </span>
              </div>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                {currentPlan.plan_type === 'payg' 
                  ? `${vpnStats.dataUsed.toFixed(1)}MB`
                  : `${currentPlan.data_used}MB`
                }
              </p>
            </div>

            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {currentPlan.plan_type === 'payg' ? (
                  <Wallet size={16} className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                ) : (
                  <Clock size={16} className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                )}
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                  {currentPlan.plan_type === 'payg' ? 'Balance' : 'Expires'}
                </span>
              </div>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                {currentPlan.plan_type === 'payg' 
                  ? `₦${((wallet?.balance || 0) / 100).toFixed(2)}`
                  : (currentPlan.expires_at 
                      ? new Date(currentPlan.expires_at).toLocaleDateString()
                      : 'Never')
                }
              </p>
            </div>
          </div>

          {/* VPN Connection Status */}
          <div className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${vpnStats.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
                  VPN Status: {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {vpnStats.isConnected && (
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-green-600'}`}>
                  {vpnStats.location} • {vpnStats.speed}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onTabChange('plans')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              {currentPlan.plan_type === 'welcome_bonus' ? 'Choose Plan After Bonus' : 'Upgrade Plan'}
            </button>
            
            {currentPlan.plan_type !== 'welcome_bonus' && (
              <button
                onClick={() => onTabChange('usage')}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                }`}
              >
                View Usage Details
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Plan Features */}
        <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Plan Features & Benefits</h3>
          
          <div className="space-y-3">
            {currentPlan.plan_type === 'welcome_bonus' && (
              <>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Welcome bonus period</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Daily bonus claim</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>200MB</span>
                </div>
              </>
            )}
            
            {currentPlan.plan_type === 'payg' && (
              <>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Rate per MB</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>₦0.20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Billing</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Real-time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Today's cost</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                    ₦{(vpnStats.dataUsed * 0.20).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            
            {currentPlan.plan_type === 'data' && (
              <>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Data bundle</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                    {currentPlan.data_allocated >= 1000 
                      ? `${(currentPlan.data_allocated / 1000).toFixed(1)}GB` 
                      : `${currentPlan.data_allocated}MB`
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Validity</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>30 days</span>
                </div>
              </>
            )}

            {/* Common features for all plans */}
            <div className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Data compression</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Up to 70%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Real-time monitoring</span>
              <span className={`font-semibold text-green-600`}>✓ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlanScreen;
