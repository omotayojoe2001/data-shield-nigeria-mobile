
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, TrendingDown } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  return (
    <LinearGradient
      colors={['#1e3a8a', '#1e40af', '#2563eb']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <Text style={styles.title}>Welcome to GoodDeeds VPN</Text>
          <Text style={styles.subtitle}>
            Save up to 70% on your data usage with our smart compression technology
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <Shield size={24} color="#10b981" />
              <Text style={styles.featureText}>Secure & Private</Text>
            </View>
            <View style={styles.feature}>
              <Zap size={24} color="#f59e0b" />
              <Text style={styles.featureText}>Fast Connection</Text>
            </View>
            <View style={styles.feature}>
              <TrendingDown size={24} color="#3b82f6" />
              <Text style={styles.featureText}>Data Savings</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
            <Text style={styles.continueText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
