
import React, { useState } from 'react';
import { Shield, Clock, Zap, CheckCircle, Star, Wallet, ArrowLeft } from 'lucide-react';
import { PAYG_RATE } from '../services/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { planService } from '../services/planService';
import { toast } from 'sonner';

const PlansScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'free' | 'data' | 'payg'>('free');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const dataPlans = [
    { id: '1gb', size: '1GB', sizeInMB: 1000, price: 20000, displayPrice: '₦200', validity: '30 days' },
    { id: '2gb', size: '2GB', sizeInMB: 2000, price: 40000, displayPrice: '₦400', validity: '30 days' },
    { id: '5gb', size: '5GB', sizeInMB: 5000, price: 100000, displayPrice: '₦1,000', validity: '30 days' },
    { id: '10gb', size: '10GB', sizeInMB: 10000, price: 200000, displayPrice: '₦2,000', validity: '30 days' }
  ];

  const handlePlanSwitch = async (planType: 'free' | 'payg' | 'data', dataAmount?: number) => {
    if (!user) {
      toast.error('Please login to switch plans');
      return;
    }

    setLoading(true);
    try {
      const success = await planService.switchPlan(planType, dataAmount);
      if (success) {
        toast.success(`Successfully switched to ${planType === 'payg' ? 'Pay-As-You-Go' : planType === 'data' ? 'Data Plan' : 'Free Plan'}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <h1 className="text-white text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-blue-200">Save more data with our smart compression</p>
      </div>

      {/* Tab Selector */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-blue-100">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedTab('free')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'free'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
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
                  : 'text-blue-600 hover:bg-blue-50'
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
                  : 'text-blue-600 hover:bg-blue-50'
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
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Shield size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Free Plan</h3>
              <p className="text-blue-600">100MB daily allowance</p>
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
                <span className="text-blue-700">100MB daily data allowance</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">Data compression up to 70%</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">Resets automatically every 24 hours</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">No wallet deductions</span>
              </div>
            </div>

            <button 
              onClick={() => handlePlanSwitch('free')}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Switching...' : 'Switch to Free Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Buy Data Plans */}
      {selectedTab === 'data' && (
        <div className="px-6 mt-6">
          <div className="space-y-4">
            {dataPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">{plan.size}</h3>
                    <p className="text-blue-600">Valid for {plan.validity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">{plan.displayPrice}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePlanSwitch('data', plan.sizeInMB)}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay-As-You-Go */}
      {selectedTab === 'payg' && (
        <div className="px-6 mt-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Wallet size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Pay-As-You-Go</h3>
              <p className="text-blue-600">Only pay for what you use</p>
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
                <span className="text-blue-700">Only pay for data you actually use</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">No monthly commitments or contracts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">Automatic wallet deduction</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-blue-700">Up to 70% data savings with compression</span>
              </div>
            </div>

            <button 
              onClick={() => handlePlanSwitch('payg')}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Switching...' : 'Switch to Pay-As-You-Go'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansScreen;
