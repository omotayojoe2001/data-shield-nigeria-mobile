
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import TabNavigator from './TabNavigator';

const MainNavigator = () => {
  const { user, profile, loading, isFirstTime, setIsFirstTime } = useAuth();
  const { theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={[styles.loadingText, { color: theme === 'dark' ? '#ffffff' : '#374151' }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onComplete={() => setIsFirstTime(false)} />;
  }

  if (isFirstTime && profile) {
    return <OnboardingScreen onComplete={() => setIsFirstTime(false)} />;
  }

  return <TabNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MainNavigator;
