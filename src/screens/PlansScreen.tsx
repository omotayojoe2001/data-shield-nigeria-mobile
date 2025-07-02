import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ArrowLeft, Check, Zap, Shield, Wifi } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const PlansScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('paygo');

  const plans = [
    {
      id: 'paygo',
      name: 'Pay As You Go',
      price: '₦1',
      period: 'per MB',
      description: 'Perfect for light users',
      features: [
        'Pay only for what you use',
        'No monthly commitment',
        'Up to 70% data savings',
        'Secure encryption',
      ],
      color: '#2563eb',
      popular: false,
    },
    {
      id: 'buy_gb',
      name: 'Data Bundles',
      price: '₦500',
      period: 'per GB',
      description: 'Best value for regular users',
      features: [
        '1GB of compressed data',
        'Valid for 30 days',
        'Better rates than PAYG',
        'Priority support',
      ],
      color: '#16a34a',
      popular: true,
    },
    {
      id: 'unlimited',
      name: 'Unlimited Pro',
      price: '₦2,500',
      period: 'per month',
      description: 'For heavy users',
      features: [
        'Unlimited data usage',
        'Premium speeds',
        'Multiple device support',
        '24/7 support',
      ],
      color: '#7c3aed',
      popular: false,
    },
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    Alert.alert(
      'Select Plan',
      `You selected ${plan.name}. This will redirect to payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Payment integration coming soon!',
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#6b7280" size={24} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              Select the Perfect Plan for You
            </Text>
            <Text style={styles.heroSubtitle}>
              All plans include data compression, security, and privacy protection
            </Text>
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  { borderColor: plan.color }
                ]}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.planPrice}>
                    <Text style={[styles.priceAmount, { color: plan.color }]}>
                      {plan.price}
                    </Text>
                    <Text style={styles.pricePeriod}>{plan.period}</Text>
                  </View>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check color={plan.color} size={16} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { backgroundColor: plan.color },
                    selectedPlan === plan.id && styles.selectedButton
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                >
                  <Text style={styles.selectButtonText}>
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Features Comparison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Why Choose GoodDeeds VPN?</Text>
            <View style={styles.comparisonFeatures}>
              <View style={styles.comparisonFeature}>
                <Shield color="#2563eb" size={24} />
                <Text style={styles.comparisonFeatureTitle}>Military-Grade Security</Text>
                <Text style={styles.comparisonFeatureText}>
                  Your data is protected with AES-256 encryption
                </Text>
              </View>

              <View style={styles.comparisonFeature}>
                <Zap color="#16a34a" size={24} />
                <Text style={styles.comparisonFeatureTitle}>Smart Compression</Text>
                <Text style={styles.comparisonFeatureText}>
                  Save up to 70% on your data usage automatically
                </Text>
              </View>

              <View style={styles.comparisonFeature}>
                <Wifi color="#7c3aed" size={24} />
                <Text style={styles.comparisonFeatureTitle}>Fast Servers</Text>
                <Text style={styles.comparisonFeatureText}>
                  Optimized servers across Nigeria for best performance
                </Text>
              </View>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I change my plan later?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can upgrade or downgrade your plan at any time from your dashboard.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How does data compression work?</Text>
              <Text style={styles.faqAnswer}>
                Our servers compress your data before sending it to your device, reducing the amount of data you consume.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is there a free trial?</Text>
              <Text style={styles.faqAnswer}>
                Yes, all new users get 50MB free to test our service.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
  plansContainer: {
    gap: 20,
    marginBottom: 40,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedPlan: {
    borderWidth: 2,
    backgroundColor: '#fafafa',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  planFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedButton: {
    opacity: 0.8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonSection: {
    marginBottom: 40,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 32,
  },
  comparisonFeatures: {
    gap: 24,
  },
  comparisonFeature: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  comparisonFeatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  comparisonFeatureText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  faqSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default PlansScreen;