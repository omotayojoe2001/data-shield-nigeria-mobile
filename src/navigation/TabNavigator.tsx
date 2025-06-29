
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import PlansScreen from '../screens/PlansScreen';
import UsageScreen from '../screens/UsageScreen';
import WalletScreen from '../screens/WalletScreen';
import ReferralScreen from '../screens/ReferralScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SupportScreen from '../screens/SupportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CurrentPlanScreen from '../screens/CurrentPlanScreen';

const TabNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { theme } = useTheme();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onTabChange={setActiveTab} />;
      case 'plans':
        return <PlansScreen onTabChange={setActiveTab} />;
      case 'usage':
        return <UsageScreen />;
      case 'wallet':
        return <WalletScreen onTabChange={setActiveTab} />;
      case 'referral':
        return <ReferralScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'support':
        return <SupportScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'current-plan':
        return <CurrentPlanScreen onTabChange={setActiveTab} />;
      default:
        return <HomeScreen onTabChange={setActiveTab} />;
    }
  };

  const TabButton = ({ id, icon, label, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={() => onPress(id)}
    >
      <Ionicons
        name={icon}
        size={24}
        color={isActive ? '#3b82f6' : theme === 'dark' ? '#9ca3af' : '#6b7280'}
      />
      <Text style={[
        styles.tabLabel,
        { color: isActive ? '#3b82f6' : theme === 'dark' ? '#9ca3af' : '#6b7280' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }]}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      <View style={[styles.tabBar, { backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }]}>
        <TabButton
          id="home"
          icon="home"
          label="Home"
          isActive={activeTab === 'home'}
          onPress={setActiveTab}
        />
        <TabButton
          id="plans"
          icon="list"
          label="Plans"
          isActive={activeTab === 'plans'}
          onPress={setActiveTab}
        />
        <TabButton
          id="usage"
          icon="analytics"
          label="Usage"
          isActive={activeTab === 'usage'}
          onPress={setActiveTab}
        />
        <TabButton
          id="wallet"
          icon="wallet"
          label="Wallet"
          isActive={activeTab === 'wallet'}
          onPress={setActiveTab}
        />
        <TabButton
          id="profile"
          icon="person"
          label="Profile"
          isActive={activeTab === 'profile'}
          onPress={setActiveTab}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default TabNavigator;
