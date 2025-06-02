
import React, { useState } from 'react';
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

  const handleSplashComplete = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('auth');
  };

  const handleAuthComplete = () => {
    setCurrentScreen('main');
  };

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
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      
      {currentScreen === 'auth' && (
        <AuthScreen onComplete={handleAuthComplete} />
      )}
      
      {currentScreen === 'main' && (
        <>
          {renderMainContent()}
          <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
};

export default Index;
