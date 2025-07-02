import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { ArrowLeft, Plus, CreditCard, DollarSign } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const WalletScreen = () => {
  const navigation = useNavigation();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleTopUp = async (amount) => {
    Alert.alert(
      'Top Up Wallet',
      `Add ₦${amount} to your wallet?`,
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

  const handleCustomTopUp = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount < 50) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount (minimum ₦50)',
      });
      return;
    }
    handleTopUp(amount);
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
        </View>

        <View style={styles.content}>
          {/* Current Balance */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <DollarSign color="#16a34a" size={24} />
              <Text style={styles.cardTitle}>Wallet Balance</Text>
            </View>
            <View style={styles.balanceContent}>
              <Text style={styles.balance}>₦250.00</Text>
              <Text style={styles.balanceSubtitle}>Available for VPN usage</Text>
            </View>
          </View>

          {/* Top Up Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Plus color="#2563eb" size={24} />
              <Text style={styles.cardTitle}>Add Funds</Text>
            </View>
            <Text style={styles.cardSubtitle}>Top up your wallet with Naira</Text>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && styles.selectedAmountButton
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount(amount.toString());
                  }}
                >
                  <Text style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.selectedAmountButtonText
                  ]}>
                    ₦{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.customAmountSection}>
              <Text style={styles.label}>Custom Amount</Text>
              <TextInput
                style={styles.input}
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setSelectedAmount(null);
                }}
                placeholder="Enter amount (min. ₦50)"
                keyboardType="numeric"
              />
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={styles.payButton}
              onPress={handleCustomTopUp}
            >
              <CreditCard color="#ffffff" size={20} />
              <Text style={styles.payButtonText}>Pay with Paystack</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transaction History</Text>
            <Text style={styles.cardSubtitle}>Your recent wallet transactions</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          </View>

          {/* Usage Tips */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Usage Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tip}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Pay-as-you-go: ₦1 per MB used
                </Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Data compression saves up to 70%
                </Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Minimum top-up amount is ₦50
                </Text>
              </View>
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
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 8,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  amountButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedAmountButton: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  amountButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedAmountButtonText: {
    color: '#2563eb',
  },
  customAmountSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  payButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
    marginTop: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default WalletScreen;