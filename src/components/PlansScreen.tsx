
import React, { useState } from 'react';
import { Shield, Clock, Zap, CheckCircle, Star } from 'lucide-react';

const PlansScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'subscription' | 'data'>('subscription');

  const subscriptionPlans = [
    {
      id: 'daily',
      name: 'Daily Plan',
      price: '₦200',
      duration: '1 Day',
      features: ['Unlimited compression', '24/7 support', 'All servers'],
      popular: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      price: '₦1,200',
      duration: '7 Days',
      features: ['Unlimited compression', '24/7 support', 'All servers', 'Priority connection'],
      popular: true,
      color: 'from-blue-600 to-purple-600',
      savings: '14%'
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '₦4,500',
      duration: '30 Days',
      features: ['Unlimited compression', '24/7 support', 'All servers', 'Priority connection', 'Extra bonuses'],
      popular: false,
      color: 'from-purple-600 to-pink-600',
      savings: '25%'
    }
  ];

  const dataPlans = [
    { id: '500mb', size: '500MB', price: '₦300', validity: '7 days' },
    { id: '1gb', size: '1GB', price: '₦550', validity: '14 days' },
    { id: '2gb', size: '2GB', price: '₦1,000', validity: '30 days' },
    { id: '5gb', size: '5GB', price: '₦2,200', validity: '30 days' },
    { id: '10gb', size: '10GB', price: '₦4,000', validity: '30 days' }
  ];

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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedTab('subscription')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'subscription'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Shield size={20} className="inline mr-2" />
              Subscriptions
            </button>
            <button
              onClick={() => setSelectedTab('data')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'data'
                  ? 'bg-blue-900 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Zap size={20} className="inline mr-2" />
              Buy Data
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      {selectedTab === 'subscription' && (
        <div className="px-6 mt-6 space-y-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-6 shadow-xl border border-blue-100 overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Star size={14} className="mr-1" />
                  Popular
                </div>
              )}
              
              {plan.savings && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Save {plan.savings}
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                <Clock size={32} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-blue-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-blue-900">{plan.price}</span>
                <span className="text-blue-600 ml-2">/ {plan.duration}</span>
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-blue-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r ${plan.color} text-white hover:shadow-xl transform hover:scale-105`}>
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Data Plans */}
      {selectedTab === 'data' && (
        <div className="px-6 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {dataPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">{plan.size}</h3>
                    <p className="text-blue-600">Valid for {plan.validity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">{plan.price}</div>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansScreen;
