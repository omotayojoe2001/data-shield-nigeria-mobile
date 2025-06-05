
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Wallet, Clock, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { planService, type UserPlan } from '../services/planService';
import CountdownTimer from './CountdownTimer';

interface CurrentPlanScreenProps {
  onTabChange: (tab: string) => void;
}

const CurrentPlanScreen = ({ onTabChange }: CurrentPlanScreenProps) => {
  const { user, wallet } = useAuth();
  const { theme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [planHistory, setPlanHistory] = useState<any[]>([]);

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

    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdate);
    };
  }, []);

  const loadPlanData = async () => {
    setLoading(true);
    try {
      const [plan, history] = await Promise.all([
        planService.getCurrentPlan(),
        planService.getPlanHistory()
      ]);
      setCurrentPlan(plan);
      setPlanHistory(history);
    } catch (error) {
      console.error('Error loading plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free': return <Shield size={32} className="text-purple-600" />;
      case 'data': return <Zap size={32} className="text-blue-600" />;
      case 'payg': return <Wallet size={32} className="text-green-600" />;
      default: return <Shield size={32} className="text-gray-600" />;
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Free Plan';
      case 'data': return 'Data Plan';
      case 'payg': return 'Pay-As-You-Go';
      default: return 'Unknown Plan';
    }
  };

  const getPlanDetails = () => {
    if (!currentPlan) return { usage: 'No data', remaining: 'No data', expiry: 'No expiry' };

    const usedData = currentPlan.data_used || 0;
    const allocatedData = currentPlan.data_allocated || 0;
    const remainingData = Math.max(0, allocatedData - usedData);

    switch (currentPlan.plan_type) {
      case 'free':
        const resetTime = currentPlan.daily_reset_at ? new Date(currentPlan.daily_reset_at) : new Date();
        const hoursLeft = Math.max(0, Math.ceil((resetTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)));
        return {
          usage: `${usedData}MB of ${allocatedData}MB used`,
          remaining: `${remainingData}MB remaining`,
          expiry: `Resets in ${hoursLeft} hours`
        };
      case 'data':
        const expiryDate = currentPlan.expires_at ? new Date(currentPlan.expires_at) : null;
        const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
        const remainingDisplay = remainingData >= 1000 ? `${(remainingData / 1000).toFixed(1)}GB` : `${remainingData}MB`;
        const allocatedDisplay = allocatedData >= 1000 ? `${(allocatedData / 1000).toFixed(1)}GB` : `${allocatedData}MB`;
        return {
          usage: `${(usedData / 1000).toFixed(2)}GB of ${allocatedDisplay} used`,
          remaining: `${remainingDisplay} remaining`,
          expiry: `Expires in ${daysLeft} days`
        };
      case 'payg':
        return {
          usage: `${(usedData / 1000).toFixed(2)}GB used this month`,
          remaining: `₦${((wallet?.balance || 0) / 100).toFixed(2)} balance`,
          expiry: 'No expiry (pay per use)'
        };
      default:
        return { usage: 'No data', remaining: 'No data', expiry: 'No expiry' };
    }
  };

  const planDetails = getPlanDetails();

  if (loading) {
    return (
      <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
        <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
          <h1 className="text-white text-3xl font-bold">Current Plan</h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Loading your plan details...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => onTabChange('home')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Current Plan</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Manage your subscription</p>
          </div>
        </div>

        {/* Plan Overview Card */}
        {currentPlan && (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {getPlanIcon(currentPlan.plan_type)}
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">{getPlanName(currentPlan.plan_type)}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>
                  Active since {new Date(currentPlan.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Usage</p>
                <p className="text-white font-semibold">{planDetails.usage}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Remaining</p>
                <p className="text-white font-semibold">{planDetails.remaining}</p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Expiry</p>
                <p className="text-white font-semibold">{planDetails.expiry}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Details */}
      <div className="px-6 mt-6">
        {currentPlan && (
          <>
            {/* Usage Progress */}
            <div className={`rounded-3xl p-6 shadow-xl border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                <TrendingUp size={20} className="mr-2" />
                Usage Overview
              </h3>

              {currentPlan.plan_type !== 'payg' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Data Used</span>
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                      {currentPlan.data_used || 0}MB / {currentPlan.data_allocated || 0}MB
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-3 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((currentPlan.data_used || 0) / (currentPlan.data_allocated || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                    {currentPlan.plan_type === 'payg' 
                      ? `₦${((wallet?.balance || 0) / 100).toFixed(2)}`
                      : `${Math.max(0, (currentPlan.data_allocated || 0) - (currentPlan.data_used || 0))}MB`
                    }
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                    {currentPlan.plan_type === 'payg' ? 'Wallet Balance' : 'Remaining'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold text-green-600`}>
                    {currentPlan.plan_type === 'payg' ? '₦0.20/MB' : '70%'}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                    {currentPlan.plan_type === 'payg' ? 'Rate' : 'Data Saved'}
                  </div>
                </div>
              </div>

              {/* Countdown Timer for Free Plan */}
              {currentPlan.plan_type === 'free' && currentPlan.daily_reset_at && (
                <div className="mt-4 text-center">
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Plan resets in:</p>
                  <CountdownTimer 
                    targetTime={currentPlan.daily_reset_at}
                    onComplete={loadPlanData}
                  />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`rounded-3xl p-6 shadow-xl border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onTabChange('plans')}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Shield size={24} className="mb-2" />
                  <span className="font-semibold">Change Plan</span>
                </button>
                
                <button 
                  onClick={() => onTabChange('wallet')}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Wallet size={24} className="mb-2" />
                  <span className="font-semibold">Top Up</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Plan History */}
        {planHistory.length > 0 && (
          <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              <Calendar size={20} className="mr-2" />
              Plan History
            </h3>
            
            <div className="space-y-3">
              {planHistory.slice(0, 5).map((history, index) => (
                <div key={index} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                        {history.from_plan ? `${getPlanName(history.from_plan)} → ` : ''}
                        {getPlanName(history.to_plan)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                        {history.notes || 'Plan change'}
                      </p>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
                      {new Date(history.switch_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentPlanScreen;
