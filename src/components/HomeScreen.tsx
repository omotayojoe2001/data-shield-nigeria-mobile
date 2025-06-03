
import React, { useState, useEffect } from 'react';
import { Shield, Wifi, Battery, Signal, Clock, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { vpnService, VPNStats } from '@/services/vpnService';
import { billingService } from '@/services/billingService';
import { toast } from 'sonner';

const HomeScreen = () => {
  const { user, wallet } = useAuth();
  const [vpnStats, setVpnStats] = useState<VPNStats>(vpnService.getStats());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Start Pay-As-You-Go billing monitoring
    billingService.startPayAsYouGoBilling();

    // Listen for low balance notifications
    const handleLowBalance = () => {
      toast.warning('Low wallet balance! Please top up to continue using VPN.');
    };
    window.addEventListener('low-wallet-balance', handleLowBalance);

    // Update stats every second
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => {
      billingService.stopPayAsYouGoBilling();
      window.removeEventListener('low-wallet-balance', handleLowBalance);
      clearInterval(interval);
    };
  }, []);

  const handleVPNToggle = async () => {
    if (!wallet || wallet.balance < 20) { // Need at least ₦0.20 for 1MB
      toast.error('Insufficient wallet balance. Please top up to use VPN.');
      return;
    }

    setConnecting(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
        toast.success('VPN Disconnected');
      } else {
        await vpnService.connect();
        toast.success('VPN Connected Successfully!');
      }
    } catch (error) {
      toast.error('Failed to toggle VPN connection');
    } finally {
      setConnecting(false);
    }
  };

  const formatBalance = (balance: number) => {
    return `₦${(balance / 100).toLocaleString()}`;
  };

  const formatDataUsage = (mb: number) => {
    if (mb < 1024) {
      return `${mb.toFixed(1)}MB`;
    }
    return `${(mb / 1024).toFixed(2)}GB`;
  };

  const savingsPercentage = vpnService.getSavingsPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header with user info */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Hello, {user?.email?.split('@')[0] || 'User'}!</h1>
            <p className="text-blue-200">Welcome to GoodDeeds Data</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 mb-1">Wallet Balance</p>
              <h2 className="text-2xl font-bold text-white">
                {wallet ? formatBalance(wallet.balance) : '₦0.00'}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-blue-200 mb-1">Pay-As-You-Go Rate</p>
              <p className="text-cyan-300 font-semibold">₦0.20/MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* VPN Connection Status */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${
              vpnStats.isConnected 
                ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}>
              <Shield size={48} className="text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
            </h3>
            
            <p className="text-blue-600 mb-4">
              {vpnStats.isConnected 
                ? `Connected since ${vpnStats.connectedSince?.toLocaleTimeString()}`
                : 'Tap to connect and start saving data'
              }
            </p>

            <button
              onClick={handleVPNToggle}
              disabled={connecting}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                vpnStats.isConnected
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl'
              } disabled:opacity-50 disabled:transform-none`}
            >
              {connecting ? 'Connecting...' : (vpnStats.isConnected ? 'Disconnect VPN' : 'Connect VPN')}
            </button>
          </div>
        </div>

        {/* Data Usage Stats */}
        {vpnStats.isConnected && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Data Used</p>
                  <p className="font-bold text-blue-900">{formatDataUsage(vpnStats.dataUsed)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Data Saved</p>
                  <p className="font-bold text-green-600">{formatDataUsage(vpnStats.dataSaved)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Savings Percentage */}
        {vpnStats.dataUsed > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{savingsPercentage}%</div>
              <p className="text-green-700 font-semibold">Data Savings Today</p>
              <p className="text-sm text-green-600 mt-2">
                You've saved {formatDataUsage(vpnStats.dataSaved)} compared to normal usage
              </p>
            </div>
          </div>
        )}

        {/* Connection Details */}
        {vpnStats.isConnected && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Connection Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Signal size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Download</p>
                  <p className="font-semibold text-blue-900">{vpnStats.downloadSpeed.toFixed(1)} Mbps</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Upload</p>
                  <p className="font-semibold text-blue-900">{vpnStats.uploadSpeed.toFixed(1)} Mbps</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Wifi size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Server</p>
                  <p className="font-semibold text-blue-900">Nigeria</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Ping</p>
                  <p className="font-semibold text-blue-900">45ms</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Zap size={24} className="mx-auto mb-2" />
            <span className="block font-semibold">Buy Data</span>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <TrendingUp size={24} className="mx-auto mb-2" />
            <span className="block font-semibold">View Usage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
