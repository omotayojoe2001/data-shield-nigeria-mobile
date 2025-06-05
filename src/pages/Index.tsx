
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import AuthScreen from '@/components/AuthScreen';
import AppNavigation from '@/components/AppNavigation';
import HomeScreen from '@/components/HomeScreen';
import PlansScreen from '@/components/PlansScreen';
import UsageScreen from '@/components/UsageScreen';
import WalletScreen from '@/components/WalletScreen';
import ReferralScreen from '@/components/ReferralScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SupportScreen from '@/components/SupportScreen';
import SettingsScreen from '@/components/SettingsScreen';
import CurrentPlanScreen from '@/components/CurrentPlanScreen';

const Index = () => {
  const { user, profile, loading, isFirstTime, setIsFirstTime } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onComplete={() => {}} />;
  }

  if (isFirstTime && profile) {
    return <OnboardingScreen onComplete={() => setIsFirstTime(false)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onTabChange={setActiveTab} />;
      case 'plans':
        return <PlansScreen />;
      case 'usage':
        return <UsageScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'referral':
        return <ReferralScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'support':
        return <SupportScreen />;
      case 'settings':
        return <SettingsScreen onTabChange={setActiveTab} />;
      case 'current-plan':
        return <CurrentPlanScreen onTabChange={setActiveTab} />;
      default:
        return <HomeScreen onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderScreen()}
      <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
