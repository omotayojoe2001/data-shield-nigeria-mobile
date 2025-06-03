
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vpnService } from '../services/vpnService';
import { Power, ShieldCheck, BarChart3 } from 'lucide-react';

interface HomeScreenProps {
  onTabChange: (tab: string) => void;
}

const HomeScreen = ({ onTabChange }: HomeScreenProps) => {
  const { user, profile, wallet } = useAuth();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(vpnService.getCurrentPlan());

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
      setCurrentPlan(vpnService.getCurrentPlan());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVPNToggle = async () => {
    setLoading(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
      } else {
        await vpnService.connect();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Hello, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-blue-200">Ready to save on data today?</p>
          </div>
          <div className="text-right">
            <div className="text-white text-sm">Wallet Balance</div>
            <div className="text-white text-xl font-bold">₦{((wallet?.balance || 0) / 100).toFixed(2)}</div>
          </div>
        </div>

        {/* VPN Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${vpnStats.isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <div>
                <h3 className="text-white text-lg font-semibold">
                  {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className="text-blue-200 text-sm">
                  {vpnStats.isConnected ? `${vpnStats.location} • ${vpnStats.speed}` : 'Tap to connect and start saving'}
                </p>
              </div>
            </div>
            <button
              onClick={handleVPNToggle}
              disabled={loading}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                vpnStats.isConnected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Connecting...' : (vpnStats.isConnected ? 'Disconnect' : 'Connect')}
            </button>
          </div>

          {/* Data Usage Today */}
          {vpnStats.isConnected && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-white text-lg font-bold">{vpnStats.dataUsed.toFixed(0)}MB</div>
                <div className="text-blue-200 text-sm">Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 text-lg font-bold">{vpnStats.dataSaved.toFixed(0)}MB</div>
                <div className="text-blue-200 text-sm">Saved Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">
                {currentPlan.type === 'payg' ? 'Pay-As-You-Go Active' :
                 currentPlan.type === 'data' ? 'Data Plan Active' :
                 currentPlan.type === 'subscription' ? 'Subscription Active' :
                 'No Active Plan'}
              </div>
              <div className="text-blue-200 text-sm">
                {currentPlan.type === 'payg' ? `₦${((wallet?.balance || 0) / 100).toFixed(2)} balance` :
                 currentPlan.type === 'data' ? `${Math.max(0, currentPlan.totalMB - currentPlan.usedMB).toFixed(0)}MB remaining` :
                 currentPlan.type === 'subscription' ? `${Math.max(0, currentPlan.totalMB - currentPlan.usedMB).toFixed(0)}MB remaining` :
                 'Choose a plan to start'}
              </div>
            </div>
            <button 
              onClick={() => onTabChange('current-plan')}
              className="px-4 py-2 bg-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-all duration-300"
            >
              View Plan
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Daily Bonus</h3>
              <p className="text-blue-600 text-sm">Claim your daily data bonus!</p>
            </div>
            <div className="text-3xl">🎁</div>
          </div>
          
          <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Claim Bonus
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => onTabChange('plans')}
            className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-blue-600 text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-blue-900">Buy Data</h4>
            <p className="text-blue-600 text-sm">Plans & subscriptions</p>
          </button>
          
          <button 
            onClick={() => onTabChange('usage')}
            className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-green-600 text-3xl mb-2">📈</div>
            <h4 className="font-semibold text-blue-900">View Usage</h4>
            <p className="text-blue-600 text-sm">Track your savings</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onTabChange('referral')}
            className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-red-600 text-3xl mb-2">🛡️</div>
            <h4 className="font-semibold text-blue-900">Refer a Friend</h4>
            <p className="text-blue-600 text-sm">Earn rewards</p>
          </button>
          
          <button 
            onClick={() => onTabChange('settings')}
            className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-purple-600 text-3xl mb-2">⚙️</div>
            <h4 className="font-semibold text-blue-900">Settings</h4>
            <p className="text-blue-600 text-sm">App preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
