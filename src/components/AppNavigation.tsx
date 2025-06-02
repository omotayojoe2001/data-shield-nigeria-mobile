
import React from 'react';
import { Home, Shield, BarChart3, Wallet, Users, Settings, MessageCircle } from 'lucide-react';

const AppNavigation = () => {
  const [activeTab, setActiveTab] = React.useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plans', label: 'Plans', icon: Shield },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'referral', label: 'Referral', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-blue-100 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-900 text-white shadow-lg scale-105' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppNavigation;
