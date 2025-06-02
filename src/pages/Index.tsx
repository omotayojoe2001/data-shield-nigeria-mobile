
import React, { useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import OnboardingScreen from '../components/OnboardingScreen';
import AuthScreen from '../components/AuthScreen';
import HomeScreen from '../components/HomeScreen';
import AppNavigation from '../components/AppNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'auth' | 'home'>('splash');

  const handleSplashComplete = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('auth');
  };

  const handleAuthComplete = () => {
    setCurrentScreen('home');
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
      
      {currentScreen === 'home' && (
        <>
          <HomeScreen />
          <AppNavigation />
        </>
      )}
    </div>
  );
};

export default Index;
