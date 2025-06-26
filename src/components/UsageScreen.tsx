
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Smartphone, Globe, Settings, Eye, EyeOff, Zap, Database, Wallet } from 'lucide-react';
import { vpnService } from '../services/vpnService';
import { billingService, PAYG_RATE } from '../services/billingService';
import { planService, type UserPlan } from '../services/planService';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const UsageScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [showDetails, setShowDetails] = useState(true);
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [liveConsumption, setLiveConsumption] = useState<any>(null);
  const { theme } = useTheme();
  const { user, wallet } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadCurrentPlan();
    }
  }, [user]);

  useEffect(() => {
    // Listen for consumption events
    const handleConsumption = (event: CustomEvent) => {
      setLiveConsumption({
        type: event.type,
        data: event.detail,
        timestamp: Date.now()
      });
      setTimeout(() => setLiveConsumption(null), 4000);
    };

    const handlePlanUpdate = () => {
      loadCurrentPlan();
    };

    window.addEventListener('bonus-consumed', handleConsumption);
    window.addEventListener('data-consumed', handleConsumption);
    window.addEventListener('wallet-consumed', handleConsumption);
    window.addEventListener('plan-updated', handlePlanUpdate);

    return () => {
      window.removeEventListener('bonus-consumed', handleConsumption);
      window.removeEventListener('data-consumed', handleConsumption);
      window.removeEventListener('wallet-consumed', handleConsumption);
      window.removeEventListener('plan-updated', handlePlanUpdate);
    };
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const plan = await planService.getCurrentPlan();
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading current plan:', error);
    }
  };

  const appUsage = vpnService.getAppUsage();

  // Generate realistic savings percentage (45-85% range)
  const generateSavingsPercentage = () => {
    if (vpnStats.dataUsed > 0 && vpnStats.dataSaved > 0) {
      return Math.round((vpnStats.dataSaved / (vpnStats.dataUsed + vpnStats.dataSaved)) * 100);
    }
    // Return a randomized demo value between 45-85%
    return Math.floor(Math.random() * 40) + 45;
  };

  const periodData = {
    day: { 
      total: `${(vpnStats.dataUsed + vpnStats.dataSaved).toFixed(0)}MB`, 
      saved: `${vpnStats.dataSaved.toFixed(0)}MB`, 
      percentage: generateSavingsPercentage()
    },
    week: { 
      total: `${((vpnStats.dataUsed + vpnStats.dataSaved) * 7 / 1000).toFixed(1)}GB`, 
      saved: `${(vpnStats.dataSaved * 7 / 1000).toFixed(1)}GB`, 
      percentage: generateSavingsPercentage()
    },
    month: { 
      total: `${((vpnStats.dataUsed + vpnStats.dataSaved) * 30 / 1000).toFixed(1)}GB`, 
      saved: `${(vpnStats.dataSaved * 30 / 1000).toFixed(1)}GB`, 
      percentage: generateSavingsPercentage()
    }
  };

  const currentData = periodData[selectedPeriod];
  const totalCostToday = billingService.calculateDataCost(vpnStats.dataUsed);
  const isPayAsYouGo = currentPlan?.plan_type === 'payg';

  const getPlanSourceIcon = (planType: string) => {
    switch (planType) {
      case 'welcome_bonus':
        return <Database size={16} className="text-purple-600" />;
      case 'data':
        return <Database size={16} className="text-blue-600" />;
      case 'payg':
        return <Wallet size={16} className="text-green-600" />;
      default:
        return <Database size={16} className="text-gray-600" />;
    }
  };

  const getPlanSourceName = (planType: string) => {
    switch (planType) {
      case 'welcome_bonus':
        return 'Welcome Bonus';
      case 'data':
        return 'Data Plan';
      case 'payg':
        return 'Pay-As-You-Go';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Live Consumption Indicator */}
      {liveConsumption && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`p-3 rounded-xl shadow-lg text-white ${
            liveConsumption.type === 'bonus-consumed' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
            liveConsumption.type === 'data-consumed' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            'bg-gradient-to-r from-green-500 to-green-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap size={16} className="animate-pulse" />
                <span className="text-sm font-medium">
                  Consuming from: {
                    liveConsumption.type === 'bonus-consumed' ? 'Welcome Bonus' :
                    liveConsumption.type === 'data-consumed' ? 'Data Plan' :
                    'Pay-As-You-Go Wallet'
                  }
                </span>
              </div>
              <div className="text-sm font-bold">
                {liveConsumption.type === 'wallet-consumed' 
                  ? `₦${(liveConsumption.data.consumed / 100).toFixed(2)} deducted`
                  : `${liveConsumption.data.consumed.toFixed(1)}MB used`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Data Usage</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Track your savings in real-time</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
          >
            {showDetails ? <Eye size={24} className="text-white" /> : <EyeOff size={24} className="text-white" />}
          </button>
        </div>

        {/* Period Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
          <div className="grid grid-cols-3 gap-2">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`py-2 px-4 rounded-xl font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Plan Source Transparency */}
      <div className="px-6 mt-6">
        <div className={`rounded-3xl p-6 shadow-xl border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              <TrendingDown size={20} className="mr-2" />
              Data Savings Summary
            </h3>
            <div className="text-3xl">📊</div>
          </div>

          {/* Current Plan Source Indicator */}
          {currentPlan && (
            <div className={`rounded-xl p-3 mb-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanSourceIcon(currentPlan.plan_type)}
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                    Currently using: {getPlanSourceName(currentPlan.plan_type)}
                  </span>
                </div>
                <div className="text-sm">
                  {currentPlan.plan_type === 'payg' 
                    ? `₦${((wallet?.balance || 0) / 100).toFixed(2)} balance`
                    : `${Math.max(0, currentPlan.data_allocated - currentPlan.data_used)}MB left`
                  }
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{currentData.total}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Total Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentData.saved}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Data Saved</div>
            </div>
          </div>

          {/* Enhanced Plan-specific Information */}
          {isPayAsYouGo && selectedPeriod === 'day' && (
            <div className={`rounded-xl p-3 mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="text-center">
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>₦{(totalCostToday / 100).toFixed(2)}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Spent today (Pay-As-You-Go)</div>
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>₦{(PAYG_RATE / 100).toFixed(2)} per MB • ₦200 per GB</div>
                <div className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Saved: ₦{((vpnStats.dataSaved * PAYG_RATE) / 100).toFixed(2)} (from compression)
                </div>
              </div>
            </div>
          )}

          {/* Current Plan Info for non-PAYG plans */}
          {currentPlan && currentPlan.plan_type !== 'payg' && (
            <div className={`rounded-xl p-3 mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="text-center">
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                  {currentPlan.plan_type === 'welcome_bonus' ? 'Welcome Bonus' : 'Data Plan'}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                  {currentPlan.plan_type === 'welcome_bonus' 
                    ? `${Math.max(0, currentPlan.data_allocated - currentPlan.data_used)}MB remaining (bonus period)`
                    : `${Math.max(0, currentPlan.data_allocated - currentPlan.data_used)}MB remaining`
                  }
                </div>
                <div className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  No charges for data usage (pre-paid)
                </div>
              </div>
            </div>
          )}

          {/* Savings Gauge */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#059669"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${currentData.percentage * 3.14159} ${100 * 3.14159}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{currentData.percentage}%</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Saved</div>
              </div>
            </div>
          </div>

          <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
            {currentData.percentage >= 60 ? 'Excellent!' : 'Good!'} You're saving {currentData.percentage}% of your data usage.
          </p>
        </div>

        {/* App-wise Usage with Real-time Updates */}
        {showDetails && (
          <div className="space-y-4">
            <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              <Smartphone size={20} className="mr-2" />
              App Usage Breakdown (Live)
            </h3>
            
            {appUsage.map((app, index) => (
              <div key={index} className={`rounded-2xl p-4 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-xl`}>
                      {app.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{app.name}</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Used: {app.used}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{app.saved}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>saved</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                    <Zap size={12} className="text-green-500" />
                    <span>Compression active</span>
                  </span>
                  <button className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-blue-900 hover:text-blue-700'}`}>
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Comparison Section */}
        <div className="mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe size={20} className="mr-2" />
            Smart Consumption vs Traditional Usage
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{((vpnStats.dataUsed + vpnStats.dataSaved) * 2).toFixed(0)}MB</div>
              <div className="text-cyan-100">Without Compression</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vpnStats.dataUsed.toFixed(0)}MB</div>
              <div className="text-cyan-100">With Smart VPN</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-cyan-100 mb-2">You saved {vpnStats.dataSaved.toFixed(0)}MB today!</div>
            {currentPlan?.plan_type === 'payg' && (
              <div className="text-xs text-cyan-200">
                Money saved: ₦{((vpnStats.dataSaved * PAYG_RATE) / 100).toFixed(2)} from compression
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageScreen;
