
import React, { useState } from 'react';
import { Settings, User, Lock, Globe, Bell, Palette, HelpCircle, Shield, LogOut } from 'lucide-react';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Settings', subtitle: 'Name, email, phone', action: () => {} },
        { icon: Lock, label: 'Change Password', subtitle: 'Update your password', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', subtitle: 'Manage your privacy', action: () => {} }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          subtitle: 'Push notifications',
          toggle: true,
          value: notifications,
          onChange: setNotifications
        },
        { 
          icon: Palette, 
          label: 'Dark Mode', 
          subtitle: 'Switch app theme',
          toggle: true,
          value: darkMode,
          onChange: setDarkMode
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
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'FAQ & Help', subtitle: 'Common questions', action: () => {} },
        { icon: Shield, label: 'Terms & Privacy', subtitle: 'Legal information', action: () => {} }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Settings</h1>
            <p className="text-blue-200">Customize your experience</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Settings size={24} className="text-white" />
          </div>
        </div>

        {/* Profile Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">John Doe</h3>
              <p className="text-blue-200">john.doe@email.com</p>
              <p className="text-cyan-300 text-sm">Premium Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="px-6 mt-6 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <h3 className="text-lg font-bold text-blue-900">{group.title}</h3>
            </div>
            
            <div className="p-2">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <item.icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">{item.label}</h4>
                      <p className="text-sm text-blue-600">{item.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {item.toggle && (
                      <button
                        onClick={() => item.onChange && item.onChange(!item.value)}
                        className={`w-12 h-6 rounded-full transition-all duration-300 ${
                          item.value ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                          item.value ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    )}
                    
                    {item.dropdown && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange && item.onChange(e.target.value)}
                        className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-blue-900 font-medium"
                      >
                        {item.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {!item.toggle && !item.dropdown && (
                      <button
                        onClick={item.action}
                        className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all duration-300"
                      >
                        <span className="text-blue-600">›</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-blue-50 rounded-xl cursor-pointer">
                <span className="font-semibold text-blue-900">Why is VPN slower sometimes?</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 text-blue-700">
                VPN can be slower due to encryption and server distance. Our smart compression technology minimizes this impact while maximizing data savings.
              </div>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-blue-50 rounded-xl cursor-pointer">
                <span className="font-semibold text-blue-900">Why do I need MTN data?</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 text-blue-700">
                Our service optimizes your existing data connection. You need an active data plan to connect to our compression servers.
              </div>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-blue-50 rounded-xl cursor-pointer">
                <span className="font-semibold text-blue-900">How much data can I save?</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 text-blue-700">
                Users typically save 60-70% of their data usage with our smart compression technology, depending on usage patterns.
              </div>
            </details>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-200">
          <button className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
