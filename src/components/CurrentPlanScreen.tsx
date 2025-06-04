
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Wallet, Database, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { vpnService } from '../services/vpnService';
import { planService, type UserPlan } from '../services/planService';

interface CurrentPlanScreenProps {
  onBack: () => void;
  onTabChange: (tab: string) => void;
}

const CurrentPlanScreen = ({ onBack, onTabChange }: CurrentPlanScreenProps) => {
  const { wallet } = useAuth();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const plan = await planService.getCurrentPlan();
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanStatusColor = () => {
    if (!currentPlan) return 'from-purple-500 to-purple-600';
    if (currentPlan.plan_type === 'payg') return 'from-green-500 to-green-600';
    if (currentPlan.plan_type === 'data') return 'from-blue-500 to-blue-600';
    if (currentPlan.plan_type === 'free') return 'from-purple-500 to-purple-600';
    return 'from-purple-500 to-purple-600';
  };

  const formatDataAmount = (mb: number) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)}GB`;
    return `${mb.toFixed(0)}MB`;
  };

  const getUsagePercentage = () => {
    if (!currentPlan) return 0;
    if ((currentPlan.plan_type === 'data' || currentPlan.plan_type === 'free') && currentPlan.data_allocated > 0) {
      return Math.min((currentPlan.data_used / currentPlan.data_allocated) * 100, 100);
    }
    return 0;
  };

  const getPlanDisplayInfo = () => {
    if (!currentPlan) {
      // Default to free plan if no plan found
      return { name: 'Free Plan', remaining: '100MB', details: 'Daily allowance' };
    }
    
    switch (currentPlan.plan_type) {
      case 'free':
        const freeRemaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        return { 
          name: 'Free Plan', 
          remaining: formatDataAmount(freeRemaining), 
          details: 'Daily allowance'
        };
      case 'payg':
        return { 
          name: 'Pay-As-You-Go', 
          remaining: `₦${((wallet?.balance || 0) / 100).toFixed(2)}`, 
          details: 'Wallet balance'
        };
      case 'data':
        const dataRemaining = Math.max(0, currentPlan.data_allocated - currentPlan.data_used);
        return { 
          name: 'Data Plan', 
          remaining: formatDataAmount(dataRemaining), 
          details: 'Remaining data'
        };
      default:
        return { name: 'Free Plan', remaining: '100MB', details: 'Daily allowance' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  const planInfo = getPlanDisplayInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getPlanStatusColor()} px-6 pt-12 pb-8 rounded-b-3xl shadow-xl`}>
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Current Plan</h1>
            <p className="text-white/80">Your active plan details</p>
          </div>
        </div>

        {/* Plan Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">{planInfo.name}</h3>
                <p className="text-white/80">Active</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{planInfo.remaining}</div>
              <div className="text-white/80 text-sm">{planInfo.details}</div>
            </div>
          </div>

          {/* Usage Progress for Data/Free Plans */}
          {currentPlan && (currentPlan.plan_type === 'data' || currentPlan.plan_type === 'free') && currentPlan.data_allocated > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-white/80 text-sm mb-2">
                <span>Used: {formatDataAmount(currentPlan.data_used)}</span>
                <span>Total: {formatDataAmount(currentPlan.data_allocated)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Usage Stats */}
      <div className="px-6 mt-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            Today's Usage
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-900">{formatDataAmount(vpnStats.dataUsed)}</div>
              <div className="text-sm text-blue-600">Data Used</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{formatDataAmount(vpnStats.dataSaved)}</div>
              <div className="text-sm text-green-600">Data Saved</div>
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Database size={20} className="mr-2" />
            Plan Information
          </h3>
          
          <div className="space-y-4">
            {currentPlan?.plan_type === 'payg' && (
              <>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-green-700 font-medium">Rate</span>
                  <span className="text-green-900 font-bold">₦0.20 per MB</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-blue-700 font-medium">Wallet Balance</span>
                  <span className="text-blue-900 font-bold">₦{((wallet?.balance || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-yellow-700 text-sm">
                    You're charged ₦0.20 for every MB of data you use. Data is automatically compressed to save you money!
                  </p>
                </div>
              </>
            )}

            {currentPlan?.plan_type === 'data' && (
              <>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-blue-700 font-medium">Plan Size</span>
                  <span className="text-blue-900 font-bold">{formatDataAmount(currentPlan.data_allocated)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-green-700 font-medium">Remaining</span>
                  <span className="text-green-900 font-bold">{formatDataAmount(Math.max(0, currentPlan.data_allocated - currentPlan.data_used))}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Expires</span>
                  <span className="text-gray-900 font-bold">{currentPlan.expires_at ? new Date(currentPlan.expires_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </>
            )}

            {(!currentPlan || currentPlan.plan_type === 'free') && (
              <>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <span className="text-purple-700 font-medium">Daily Allowance</span>
                  <span className="text-purple-900 font-bold">{formatDataAmount(currentPlan?.data_allocated || 100)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-green-700 font-medium">Remaining Today</span>
                  <span className="text-green-900 font-bold">{formatDataAmount(Math.max(0, (currentPlan?.data_allocated || 100) - (currentPlan?.data_used || 0)))}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Next Reset</span>
                  <span className="text-gray-900 font-bold">{currentPlan?.daily_reset_at ? new Date(currentPlan.daily_reset_at).toLocaleDateString() : 'Tomorrow'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => onTabChange('plans')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              View All Plans
            </button>
            
            {(!currentPlan || currentPlan.plan_type === 'payg') && (
              <button 
                onClick={() => onTabChange('wallet')}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Top Up Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlanScreen;
