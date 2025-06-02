
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '../components/SplashScreen';
import OnboardingScreen from '../components/OnboardingScreen';
import AuthScreen from '../components/AuthScreen';
import HomeScreen from '../components/HomeScreen';
import PlansScreen from '../components/PlansScreen';
import UsageScreen from '../components/UsageScreen';
import WalletScreen from '../components/WalletScreen';
import ReferralScreen from '../components/ReferralScreen';
import SettingsScreen from '../components/SettingsScreen';
import SupportScreen from '../components/SupportScreen';
import AppNavigation from '../components/AppNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'auth' | 'main'>('splash');
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useAuth();

  const handleSplashComplete = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('auth');
  };

  const handleAuthComplete = () => {
    setCurrentScreen('main');
  };

  // Show splash screen first
  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show onboarding if not completed auth flow
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user || currentScreen === 'auth') {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  // Show main app for authenticated users
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'plans':
        return <PlansScreen />;
      case 'usage':
        return <UsageScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'referral':
        return <ReferralScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'support':
        return <SupportScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderMainContent()}
      <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
