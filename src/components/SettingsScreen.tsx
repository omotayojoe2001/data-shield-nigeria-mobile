
import React, { useState } from 'react';
import { Settings, Lock, Globe, Bell, Palette, HelpCircle, Shield, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsScreenProps {
  onTabChange?: (tab: string) => void;
}

const SettingsScreen = ({ onTabChange }: SettingsScreenProps) => {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const settingsGroups = [
    {
      title: 'Account & Security',
      items: [
        { 
          icon: Lock, 
          label: 'Change Password', 
          subtitle: 'Update your password', 
          action: () => onTabChange && onTabChange('profile')
        },
        { icon: Shield, label: 'Privacy & Security', subtitle: 'Manage your privacy', action: () => {} }
      ]
    },
    {
      title: 'App Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Push Notifications', 
          subtitle: 'Data usage alerts & bonuses',
          toggle: true,
          value: notifications,
          onChange: setNotifications
        },
        { 
          icon: theme === 'dark' ? Sun : Moon, 
          label: 'Theme', 
          subtitle: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          toggle: true,
          value: theme === 'dark',
          onChange: toggleTheme
        },
        { 
          icon: Globe, 
          label: 'Language', 
          subtitle: language,
          dropdown: true,
          options: ['English', 'Yoruba', 'Hausa', 'Igbo'],
          value: language,
          onChange: setLanguage
        }
      ]
    },
    {
      title: 'Help & Support',
      items: [
        { icon: HelpCircle, label: 'FAQ & Help', subtitle: 'Common questions', action: () => {} },
        { icon: Shield, label: 'Terms & Privacy', subtitle: 'Legal information', action: () => {} }
      ]
    }
  ];

  return (
    <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header - Mobile Optimized */}
      <div className={`px-4 pt-8 pb-6 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Settings</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Customize your GoodDeeds Data experience</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Settings Groups - Mobile Optimized */}
      <div className="px-4 mt-4 space-y-4">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
              <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{group.title}</h3>
            </div>
            
            <div className="p-2">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-100'}`}>
                      <item.icon size={16} className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{item.label}</h4>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>{item.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {item.toggle && (
                      <button
                        onClick={() => item.onChange && item.onChange(!item.value)}
                        className={`w-10 h-5 rounded-full transition-all duration-300 ${
                          item.value ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                          item.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    )}
                    
                    {item.dropdown && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange && item.onChange(e.target.value)}
                        className={`border rounded-lg px-2 py-1 text-sm font-medium ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-blue-50 border-blue-200 text-blue-900'}`}
                      >
                        {item.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {!item.toggle && !item.dropdown && (
                      <button
                        onClick={item.action}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-100 hover:bg-blue-200'}`}
                      >
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>›</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FAQ Section - Mobile Optimized */}
        <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            <details className="group">
              <summary className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Why is VPN slower sometimes?</span>
                <span className={`group-open:rotate-180 transition-transform text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>▼</span>
              </summary>
              <div className={`p-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                VPN can be slower due to encryption and server distance. Our smart compression technology minimizes this impact while maximizing data savings.
              </div>
            </details>
            
            <details className="group">
              <summary className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Why do I need MTN data?</span>
                <span className={`group-open:rotate-180 transition-transform text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>▼</span>
              </summary>
              <div className={`p-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Our service optimizes your existing data connection. You need an active data plan to connect to our compression servers.
              </div>
            </details>
            
            <details className="group">
              <summary className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>How much data can I save?</span>
                <span className={`group-open:rotate-180 transition-transform text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>▼</span>
              </summary>
              <div className={`p-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Users typically save 60-70% of their data usage with our smart compression technology, depending on usage patterns.
              </div>
            </details>
          </div>
        </div>

        {/* About Section */}
        <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>GoodDeeds Data</h3>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
              Your trusted data compression and savings platform
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
              Version 1.0.0 • Made with ❤️ in Nigeria
            </p>
          </div>
        </div>

        {/* Logout Button - Mobile Optimized */}
        <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-red-400' : 'bg-white border-red-200'}`}>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
