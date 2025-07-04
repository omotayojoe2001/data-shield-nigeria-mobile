import React, { useState, useEffect } from 'react';
import { Shield, Zap, Wallet, CheckCircle, ArrowRight, Database, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { planService, type UserPlan } from '../services/planService';
import { bonusService } from '../services/bonusService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlansScreenProps {
  onTabChange: (tab: string) => void;
}

const PlansScreen = ({ onTabChange }: PlansScreenProps) => {
  const [selectedTab, setSelectedTab] = useState<'welcome' | 'data' | 'payg'>('welcome');
  const [loading, setLoading] = useState(false);
  const [selectedDataPlan, setSelectedDataPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [bonusInfo, setBonusInfo] = useState({
    daysRemaining: 0,
    daysClaimed: 0,
    canClaim: false,
    nextClaimTime: undefined as Date | undefined
  });
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
      loadBonusInfo();
    }
  }, [user]);

  useEffect(() => {
    // Listen for plan updates
    const handlePlanUpdate = () => {
      loadCurrentPlan();
      loadBonusInfo();
    };

    window.addEventListener('plan-updated', handlePlanUpdate);
    window.addEventListener('bonus-updated', handlePlanUpdate);
    return () => {
      window.removeEventListener('plan-updated', handlePlanUpdate);
      window.removeEventListener('bonus-updated', handlePlanUpdate);
    };
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const plan = await planService.getCurrentPlan();
      setCurrentPlan(plan);
      console.log('Current plan loaded in PlansScreen:', plan);
      
      // Set default tab based on current plan or eligibility
      if (!plan) {
        const bonusStatus = await bonusService.getBonusClaimStatus();
        if (bonusStatus && bonusStatus.is_eligible && bonusStatus.days_claimed < 7) {
          setSelectedTab('welcome');
        } else {
          setSelectedTab('data');
        }
      } else {
        // Set tab based on current plan type
        if (plan.plan_type === 'welcome_bonus') {
          setSelectedTab('welcome');
        } else if (plan.plan_type === 'payg') {
          setSelectedTab('payg');
        } else {
          setSelectedTab('data');
        }
      }
    } catch (error) {
      console.error('Error loading current plan:', error);
    }
  };

  const loadBonusInfo = async () => {
    try {
      const info = await bonusService.getBonusInfo();
      setBonusInfo({
        daysRemaining: info.daysRemaining,
        daysClaimed: info.daysClaimed,
        canClaim: info.canClaim,
        nextClaimTime: info.nextClaimTime
      });
    } catch (error) {
      console.error('Error loading bonus info:', error);
    }
  };

  const handleActivateWelcomeBonus = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const result = await planService.activateWelcomeBonus();
      if (result.success) {
        toast.success(result.message);
        await loadCurrentPlan();
        onTabChange('home');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error activating welcome bonus:', error);
      toast.error('Failed to activate welcome bonus');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSwitch = async (planType: 'payg' | 'data') => {
    if (!user) {
      toast.error('Please login to switch plans');
      return;
    }

    // Check if already on this plan type
    if (currentPlan && currentPlan.plan_type === planType) {
      toast.info(`You are already on the ${planType === 'payg' ? 'Pay-As-You-Go' : 'Data Plan'} plan`);
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const success = await planService.switchPlan(planType);
      if (success) {
        toast.success(`Successfully switched to ${planType === 'payg' ? 'Pay-As-You-Go' : 'Data Plan'}`);
        window.dispatchEvent(new CustomEvent('plan-updated'));
        await loadCurrentPlan();
        // Don't navigate away, let user see the change
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

    if (loading || selectedDataPlan === plan.id) return;

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

  // Check if user is eligible for welcome bonus
  const isWelcomeBonusEligible = bonusInfo.daysClaimed < 7; // Allow activation anytime within 7 days
  const showWelcomeTab = isWelcomeBonusEligible;

  return (
    <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header - Mobile Optimized */}
      <div className={`px-4 pt-12 pb-6 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <h1 className="text-white text-2xl font-bold mb-2">Choose Your Plan</h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Save more data with GoodDeeds Data compression</p>
        
        {/* Current Plan Indicator */}
        {currentPlan && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-white text-sm">
              Current Plan: <span className="font-semibold">
                {currentPlan.plan_type === 'welcome_bonus' ? 'Welcome Bonus' :
                 currentPlan.plan_type === 'payg' ? 'Pay-As-You-Go' :
                 currentPlan.plan_type === 'data' ? 'Data Plan' : currentPlan.plan_type}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Selector - Mobile Optimized */}
      <div className="px-4 mt-4">
        <div className={`rounded-2xl p-1 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className={`grid ${showWelcomeTab ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
            {showWelcomeTab && (
              <button
                onClick={() => setSelectedTab('welcome')}
                className={`py-2 px-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                  selectedTab === 'welcome'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
                }`}
              >
                <Gift size={14} className="inline mr-1" />
                Welcome
              </button>
            )}
            <button
              onClick={() => setSelectedTab('data')}
              className={`py-2 px-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                selectedTab === 'data'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
              }`}
            >
              <Zap size={14} className="inline mr-1" />
              Buy Data
            </button>
            <button
              onClick={() => setSelectedTab('payg')}
              className={`py-2 px-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                selectedTab === 'payg'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`
              }`}
            >
              <Wallet size={14} className="inline mr-1" />
              Pay-As-You-Go
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Bonus - Mobile Optimized */}
      {selectedTab === 'welcome' && showWelcomeTab && (
        <div className="px-4 mt-4">
          <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Gift size={32} className="text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>7-Day Welcome Bonus</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Get 200MB free data daily for 7 days</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">200MB</div>
                <div className="text-sm text-purple-700 font-semibold">daily for 7 days</div>
                <div className="text-xs text-purple-600 mt-1">Total: 1.4GB free data</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>200MB free data every day</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Data compression up to 70%</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>7 days to try GoodDeeds Data for free</span>
              </div>
            </div>

            <button 
              onClick={handleActivateWelcomeBonus}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Activating...' : 
               currentPlan?.plan_type === 'welcome_bonus' ? 'Welcome Bonus Active' : 
               'Activate Welcome Bonus'}
            </button>

            <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-purple-500'}`}>
              * Switch to welcome bonus anytime within your first 7 days
            </p>
          </div>
        </div>
      )}

      {/* Buy Data Plans - Mobile Optimized */}
      {selectedTab === 'data' && (
        <div className="px-4 mt-4">
          <div className="space-y-3">
            {dataPlans.map((plan) => (
              <div key={plan.id} className={`rounded-xl p-4 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{plan.size}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Valid for {plan.validity}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{plan.displayPrice}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>₦{(plan.price / plan.sizeInMB).toFixed(2)}/MB</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDataPlanPurchase(plan)}
                  disabled={loading || selectedDataPlan === plan.id}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {selectedDataPlan === plan.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay-As-You-Go - Mobile Optimized */}
      {selectedTab === 'payg' && (
        <div className="px-4 mt-4">
          <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet size={32} className="text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Pay-As-You-Go</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Only pay for what you use</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">₦0.20</div>
                <div className="text-sm text-green-700 font-semibold">per MB</div>
                <div className="text-xs text-green-600 mt-1">₦200 per GB • No commitments</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Only pay for data you actually use</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>No monthly commitments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Automatic wallet deduction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>Up to 70% data savings</span>
              </div>
            </div>

            <button 
              onClick={() => handlePlanSwitch('payg')}
              disabled={loading || currentPlan?.plan_type === 'payg'}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {currentPlan?.plan_type === 'payg' ? 'Current Plan ✓' : loading ? 'Switching...' : 'Switch to Pay-As-You-Go'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansScreen;
