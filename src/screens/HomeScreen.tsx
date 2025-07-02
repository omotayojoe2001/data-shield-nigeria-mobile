import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Shield, Zap, DollarSign, Users, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <View style={styles.headerLeft}>
            <Shield color="#2563eb" size={32} />
            <Text style={[styles.logo, isDark && styles.darkText]}>GoodDeeds VPN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.button, styles.ghostButton]}
              onPress={toggleTheme}
            >
              <Text style={styles.buttonText}>{theme === 'light' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={[styles.buttonText, styles.primaryText]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, isDark && styles.darkText]}>
            Secure. Fast. Affordable.
          </Text>
          <Text style={[styles.heroSubtitle, isDark && styles.darkSubtitle]}>
            Nigeria's first data-saving VPN service. Save up to 70% on your data usage while staying secure online.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.primaryButtonText}>Start Free Trial</Text>
              <ArrowRight color="#ffffff" size={16} style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, isDark && styles.darkText]}>
            Why Choose GoodDeeds VPN?
          </Text>
          <View style={styles.featuresGrid}>
            <View style={[styles.featureCard, isDark && styles.darkCard]}>
              <Shield color="#2563eb" size={32} />
              <Text style={[styles.featureTitle, isDark && styles.darkText]}>Secure & Private</Text>
              <Text style={[styles.featureDescription, isDark && styles.darkSubtitle]}>
                Military-grade encryption keeps your data safe and your browsing private.
              </Text>
            </View>

            <View style={[styles.featureCard, isDark && styles.darkCard]}>
              <Zap color="#16a34a" size={32} />
              <Text style={[styles.featureTitle, isDark && styles.darkText]}>Data Compression</Text>
              <Text style={[styles.featureDescription, isDark && styles.darkSubtitle]}>
                Save up to 70% on data usage with our advanced compression technology.
              </Text>
            </View>

            <View style={[styles.featureCard, isDark && styles.darkCard]}>
              <DollarSign color="#ca8a04" size={32} />
              <Text style={[styles.featureTitle, isDark && styles.darkText]}>Affordable Plans</Text>
              <Text style={[styles.featureDescription, isDark && styles.darkSubtitle]}>
                Pay-as-you-go or monthly plans starting from just ₦50 per month.
              </Text>
            </View>

            <View style={[styles.featureCard, isDark && styles.darkCard]}>
              <Users color="#7c3aed" size={32} />
              <Text style={[styles.featureTitle, isDark && styles.darkText]}>Referral Program</Text>
              <Text style={[styles.featureDescription, isDark && styles.darkSubtitle]}>
                Earn money by referring friends. Get 2% commission on all purchases.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 GoodDeeds Data VPN. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkHeader: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#374151',
  },
  primaryText: {
    color: '#2563eb',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
    lineHeight: 28,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  features: {
    paddingHorizontal: 20,
    paddingVertical: 64,
  },
  featuresTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
    color: '#111827',
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#111827',
  },
  featureDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#111827',
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#d1d5db',
  },
});

export default HomeScreen;