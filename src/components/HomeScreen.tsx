
import React, { useState } from 'react';
import { Power, MapPin, Gauge, Download, Upload, Shield, TrendingDown } from 'lucide-react';

const HomeScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(!isConnected);
      setIsConnecting(false);
    }, 2000);
  };

  const stats = {
    savedToday: "115MB",
    savedWeek: "1.2GB", 
    savedMonth: "4.8GB",
    downloadSpeed: "12.5",
    uploadSpeed: "8.3",
    serverLocation: "Lagos, Nigeria"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Good morning!</h1>
            <p className="text-blue-200">Ready to save some data?</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-white font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <MapPin size={16} />
              <span className="text-sm">{stats.serverLocation}</span>
            </div>
          </div>

          {/* Connection Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
              isConnecting 
                ? 'bg-yellow-500 text-white cursor-not-allowed' 
                : isConnected 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
            } shadow-lg`}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Power size={20} />
                <span>{isConnected ? 'Disconnect' : 'Connect VPN'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mt-6">
        {/* Speed Test */}
        {isConnected && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <Gauge size={20} />
              <span>Connection Speed</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Download size={16} className="text-green-500" />
                  <span className="text-sm text-blue-600">Download</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{stats.downloadSpeed}</div>
                <div className="text-sm text-blue-500">Mbps</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Upload size={16} className="text-blue-500" />
                  <span className="text-sm text-blue-600">Upload</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{stats.uploadSpeed}</div>
                <div className="text-sm text-blue-500">Mbps</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Saved Today */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingDown size={20} />
              <span>Data Saved Today</span>
            </h3>
            <div className="text-3xl">💾</div>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.savedToday}</div>
          <p className="text-cyan-100">You're saving 68% on data usage!</p>
        </div>

        {/* Weekly & Monthly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
            <h4 className="text-blue-600 font-medium mb-2">This Week</h4>
            <div className="text-2xl font-bold text-blue-900">{stats.savedWeek}</div>
            <div className="text-sm text-green-600">+23% vs last week</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
            <h4 className="text-blue-600 font-medium mb-2">This Month</h4>
            <div className="text-2xl font-bold text-blue-900">{stats.savedMonth}</div>
            <div className="text-sm text-green-600">+15% vs last month</div>
          </div>
        </div>

        {/* Data Saving Gauge */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-6">Data Efficiency</h3>
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
                strokeDasharray={`${68 * 3.14159} ${100 * 3.14159}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">68%</div>
                <div className="text-xs text-blue-600">Saved</div>
              </div>
            </div>
          </div>
          <p className="text-center text-blue-600">
            Excellent! You're maximizing your data efficiency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
