
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Smartphone, Globe, Settings, Eye, EyeOff } from 'lucide-react';
import { vpnService } from '../services/vpnService';
import { billingService, PAYG_RATE } from '../services/billingService';

const UsageScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [showDetails, setShowDetails] = useState(true);
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const appUsage = vpnService.getAppUsage();

  const periodData = {
    day: { 
      total: `${(vpnStats.dataUsed + vpnStats.dataSaved).toFixed(0)}MB`, 
      saved: `${vpnStats.dataSaved.toFixed(0)}MB`, 
      percentage: vpnStats.dataUsed > 0 ? Math.round((vpnStats.dataSaved / (vpnStats.dataUsed + vpnStats.dataSaved)) * 100) : 68 
    },
    week: { 
      total: `${((vpnStats.dataUsed + vpnStats.dataSaved) * 7 / 1000).toFixed(1)}GB`, 
      saved: `${(vpnStats.dataSaved * 7 / 1000).toFixed(1)}GB`, 
      percentage: vpnStats.dataUsed > 0 ? Math.round((vpnStats.dataSaved / (vpnStats.dataUsed + vpnStats.dataSaved)) * 100) : 68 
    },
    month: { 
      total: `${((vpnStats.dataUsed + vpnStats.dataSaved) * 30 / 1000).toFixed(1)}GB`, 
      saved: `${(vpnStats.dataSaved * 30 / 1000).toFixed(1)}GB`, 
      percentage: vpnStats.dataUsed > 0 ? Math.round((vpnStats.dataSaved / (vpnStats.dataUsed + vpnStats.dataSaved)) * 100) : 68 
    }
  };

  const currentData = periodData[selectedPeriod];
  const totalCostToday = billingService.calculateDataCost(vpnStats.dataUsed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Data Usage</h1>
            <p className="text-blue-200">Track your savings in real-time</p>
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

      {/* Summary Stats */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <TrendingDown size={20} className="mr-2" />
              Data Savings Summary
            </h3>
            <div className="text-3xl">📊</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{currentData.total}</div>
              <div className="text-sm text-blue-600">Total Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentData.saved}</div>
              <div className="text-sm text-blue-600">Data Saved</div>
            </div>
          </div>

          {/* Pay-As-You-Go Info */}
          {selectedPeriod === 'day' && (
            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">₦{(totalCostToday / 100).toFixed(2)}</div>
                <div className="text-sm text-blue-600">Spent today (Pay-As-You-Go)</div>
                <div className="text-xs text-blue-500 mt-1">₦{(PAYG_RATE / 100).toFixed(2)} per MB • ₦200 per GB</div>
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
                <div className="text-2xl font-bold text-blue-900">{currentData.percentage}%</div>
                <div className="text-xs text-blue-600">Saved</div>
              </div>
            </div>
          </div>

          <p className="text-center text-blue-600">
            {currentData.percentage >= 60 ? 'Excellent!' : 'Good!'} You're saving {currentData.percentage}% of your data usage.
          </p>
        </div>

        {/* App-wise Usage */}
        {showDetails && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center">
              <Smartphone size={20} className="mr-2" />
              App Usage Breakdown
            </h3>
            
            {appUsage.map((app, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-xl`}>
                      {app.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">{app.name}</h4>
                      <p className="text-sm text-blue-600">Used: {app.used}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{app.saved}</div>
                    <div className="text-xs text-blue-600">saved</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600">Compression active</span>
                  <button className="text-blue-900 hover:text-blue-700">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Toggle */}
        <div className="mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe size={20} className="mr-2" />
            Without vs With VPN
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{((vpnStats.dataUsed + vpnStats.dataSaved) * 2).toFixed(0)}MB</div>
              <div className="text-cyan-100">Without VPN</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vpnStats.dataUsed.toFixed(0)}MB</div>
              <div className="text-cyan-100">With VPN</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-cyan-100">You saved {vpnStats.dataSaved.toFixed(0)}MB today!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageScreen;
