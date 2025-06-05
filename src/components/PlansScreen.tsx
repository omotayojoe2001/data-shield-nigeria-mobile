
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Wallet, CheckCircle, ArrowRight, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { planService, type UserPlan } from '../services/planService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PlansScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'free' | 'data' | 'payg'>('free');
  const [loading, setLoading] = useState(false);
  const [selectedDataPlan, setSelectedDataPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const { user, wallet, refreshWallet } = useAuth();
  const { theme } = useTheme();

  const dataPlans = [
    { id: '1gb', size: '1GB', sizeInMB: 1000, price: 20000, displayPrice: '₦200', validity: '30 days' },
    { id: '2gb', size: '2GB', sizeInMB: 2000, price: 40000, displayPrice: '₦400', validity: '30 days' },
    { id: '5gb', size: '5GB', sizeInMB: 5000, price: 100000, displayPrice: '₦1,000', validity: '30 days' },
    { id: '10gb', size: '10GB', sizeInMB: 10000, price: 200000, displayPrice: '₦2,000', validity: '30 days' }
  ];

  useEffect(() => {
    if (user) {
      loadCurrentPlan();
    }
  }, [user]);

  useEffect(() => {
    // Listen for plan updates
    const handlePlanUpdate = () => {
      loadCurrentPlan();
    };

    window.addEventListener('plan-updated', handlePlanUpdate);
    return () => {
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

  const handlePlanSwitch = async (planType: 'free' | 'payg') => {
    if (!user) {
      toast.error('Please login to switch plans');
      return;
    }

    setLoading(true);
    try {
      const success = await planService.switchPlan(planType);
      if (success) {
        toast.success(`Successfully switched to ${planType === 'payg' ? 'Pay-As-You-Go' : 'Free Plan'}`);
        // Trigger real-time updates
        window.dispatchEvent(new CustomEvent('plan-updated'));
      } else {
        toast.error('Failed to switch plan');
      }
    } catch (error) {
      console.error('Error switching plan:', error);
      toast.error('Failed to switch plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToDataPlan = async () => {
    if (!user) {
      toast.error('Please login to switch to data plan');
      return;
    }

    setLoading(true);
    try {
      // Check if user has existing unused data from previous data plan
      const existingDataRemaining = currentPlan?.plan_type === 'data' 
        ? Math.max(0, currentPlan.data_allocated - currentPlan.data_used)
        : 0;

      // Switch to data plan, preserving existing data if any
      const success = await planService.switchPlan('data', existingDataRemaining);
      if (success) {
        const message = existingDataRemaining > 0 
          ? `Successfully switched to Data Plan with ${existingDataRemaining}MB preserved`
          : 'Successfully switched to Data Plan';
        toast.success(message);
        
        // Trigger real-time updates
        window.dispatchEvent(new CustomEvent('plan-updated'));
        await loadCurrentPlan();
      } else {
        toast.error('Failed to switch to data plan');
      }
    } catch (error) {
      console.error('Error switching to data plan:', error);
      toast.error('Failed to switch to data plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDataPlanPurchase = async (plan: typeof dataPlans[0]) => {
    if (!user || !wallet) {
      toast.error('Please login to purchase data');
      return;
    }

    // Check if user has sufficient balance
    if (wallet.balance < plan.price) {
      toast.error(`Insufficient balance. You need ₦${(plan.price / 100).toFixed(2)} but have ₦${(wallet.balance / 100).toFixed(2)}. Please top up your wallet.`);
      return;
    }

    setSelectedDataPlan(plan.id);
    setLoading(true);

    try {
      // Check session before making request
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Please login again to continue');
        return;
      }

      // Use the plan service to purchase data plan
      const result = await planService.purchaseDataPlan(plan.sizeInMB, plan.price);
      
      if (result.success) {
        await refreshWallet();
        toast.success(result.message);
        // Trigger real-time updates
        window.dispatchEvent(new CustomEvent('plan-updated'));
        window.dispatchEvent(new CustomEvent('wallet-updated'));
        await loadCurrentPlan();
      } else {
        toast.error(result.message);
      }
      
    } catch (error: any) {
      console.error('Error purchasing data plan:', error);
      toast.error('Failed to purchase data plan');
    } finally {
      setLoading(false);
      setSelectedDataPlan(null);
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <h1 className="text-white text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Save more data with our smart compression</p>
      </div>

      {/* Tab Selector */}
      <div className="px-6 mt-6">
        <div className={`rounded-2xl p-2 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedTab('free')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'free'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
              }`}
            >
              <Shield size={16} className="inline mr-2" />
              Free Plan
            </button>
            <button
              onClick={() => setSelectedTab('data')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'data'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
              }`}
            >
              <Zap size={16} className="inline mr-2" />
              Buy Data
            </button>
            <button
              onClick={() => setSelectedTab('payg')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'payg'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
              }`}
            >
              <Wallet size={16} className="inline mr-2" />
              Pay-As-You-Go
            </button>
          </div>
        </div>
      </div>

      {/* Free Plan */}
      {selectedTab === 'free' && (
        <div className="px-6 mt-6">
          <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Shield size={40} className="text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Free Plan</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>100MB daily allowance</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">100MB</div>
                <div className="text-lg text-purple-700 font-semibold">per day</div>
                <div className="text-sm text-purple-600 mt-2">Resets every 24 hours</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>100MB daily data allowance</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Data compression up to 70%</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Resets automatically every 24 hours</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>No wallet deductions</span>
              </div>
            </div>

            <button 
              onClick={() => handlePlanSwitch('free')}
              disabled={loading || currentPlan?.plan_type === 'free'}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {currentPlan?.plan_type === 'free' ? 'Current Plan' : loading ? 'Switching...' : 'Switch to Free Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Buy Data Plans */}
      {selectedTab === 'data' && (
        <div className="px-6 mt-6">
          {/* Current Data Plan Status */}
          {currentPlan && (
            <div className={`rounded-2xl p-4 shadow-lg border mb-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database size={20} className={`${currentPlan.plan_type === 'data' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                      {currentPlan.plan_type === 'data' ? 'Data Plan Active' : 'Switch to Data Plan'}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                      {currentPlan.plan_type === 'data' 
                        ? `${Math.max(0, currentPlan.data_allocated - currentPlan.data_used)}MB remaining`
                        : 'Preserve your data allocation across plan switches'
                      }
                    </p>
                  </div>
                </div>
                {currentPlan.plan_type !== 'data' && (
                  <button 
                    onClick={handleSwitchToDataPlan}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <span>{loading ? 'Switching...' : 'Switch'}</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {dataPlans.map((plan) => (
              <div key={plan.id} className={`rounded-2xl p-6 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{plan.size}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Valid for {plan.validity}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{plan.displayPrice}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDataPlanPurchase(plan)}
                  disabled={loading || selectedDataPlan === plan.id}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {selectedDataPlan === plan.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay-As-You-Go */}
      {selectedTab === 'payg' && (
        <div className="px-6 mt-6">
          <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Wallet size={40} className="text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Pay-As-You-Go</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Only pay for what you use</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">₦0.20</div>
                <div className="text-lg text-green-700 font-semibold">per MB</div>
                <div className="text-sm text-green-600 mt-2">₦200 per GB • No commitments</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Only pay for data you actually use</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>No monthly commitments or contracts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Automatic wallet deduction</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Up to 70% data savings with compression</span>
              </div>
            </div>

            <button 
              onClick={() => handlePlanSwitch('payg')}
              disabled={loading || currentPlan?.plan_type === 'payg'}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {currentPlan?.plan_type === 'payg' ? 'Current Plan' : loading ? 'Switching...' : 'Switch to Pay-As-You-Go'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansScreen;
