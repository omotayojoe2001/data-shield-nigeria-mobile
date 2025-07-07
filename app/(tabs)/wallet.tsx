import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Wallet, Plus, CreditCard, History, Gift } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

export default function WalletScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [balance] = useState(2500); // ₦25.00 in kobo
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  const transactions = [
    { id: 1, type: 'topup', amount: 1000, description: 'Wallet Top-up', date: '2024-01-15' },
    { id: 2, type: 'usage', amount: -50, description: 'VPN Usage', date: '2024-01-14' },
    { id: 3, type: 'bonus', amount: 100, description: 'Daily Bonus', date: '2024-01-13' },
    { id: 4, type: 'usage', amount: -75, description: 'VPN Usage', date: '2024-01-12' },
  ];

  const handleTopUp = () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 1) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter an amount of at least ₦1',
      });
      return;
    }

    // Simulate payment processing
    Toast.show({
      type: 'success',
      text1: 'Payment Initiated',
      text2: 'Redirecting to payment gateway...',
    });
    
    setShowTopUpModal(false);
    setTopUpAmount('');
  };

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toFixed(2)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <Plus color="#16a34a" size={20} />;
      case 'bonus':
        return <Gift color="#7c3aed" size={20} />;
      default:
        return <CreditCard color="#dc2626" size={20} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Wallet</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            Manage your account balance
          </Text>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, isDark && styles.darkCard]}>
          <View style={styles.balanceHeader}>
            <Wallet color="#2563eb" size={32} />
            <Text style={[styles.balanceLabel, isDark && styles.darkSubtitle]}>
              Current Balance
            </Text>
          </View>
          <Text style={[styles.balanceAmount, isDark && styles.darkText]}>
            {formatCurrency(balance)}
          </Text>
          
          <TouchableOpacity
            style={styles.topUpButton}
            onPress={() => setShowTopUpModal(true)}
          >
            <Plus color="#ffffff" size={20} />
            <Text style={styles.topUpButtonText}>Top Up Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, isDark && styles.darkCard]}>
              <Gift color="#7c3aed" size={24} />
              <Text style={[styles.actionText, isDark && styles.darkText]}>
                Daily Bonus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, isDark && styles.darkCard]}>
              <CreditCard color="#16a34a" size={24} />
              <Text style={[styles.actionText, isDark && styles.darkText]}>
                Auto Top-up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <History color="#6b7280" size={20} />
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              Recent Transactions
            </Text>
          </View>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, isDark && styles.darkCard]}>
              <View style={styles.transactionLeft}>
                {getTransactionIcon(transaction.type)}
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionDescription, isDark && styles.darkText]}>
                    {transaction.description}
                  </Text>
                  <Text style={[styles.transactionDate, isDark && styles.darkSubtitle]}>
                    {transaction.date}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount
              ]}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              Top Up Wallet
            </Text>
            
            <View style={styles.amountInput}>
              <Text style={[styles.inputLabel, isDark && styles.darkText]}>
                Amount (₦)
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                placeholder="Enter amount"
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.quickAmounts}>
              {[500, 1000, 2000, 5000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountButton, isDark && styles.darkQuickAmount]}
                  onPress={() => setTopUpAmount((amount / 100).toString())}
                >
                  <Text style={[styles.quickAmountText, isDark && styles.darkText]}>
                    ₦{amount / 100}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTopUpModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTopUp}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  topUpButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#16a34a',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  amountInput: {
    marginBottom: 20,
  },
  inputLabel: {
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
    color: '#111827',
  },
  darkInput: {
    borderColor: '#374151',
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickAmountButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  darkQuickAmount: {
    backgroundColor: '#374151',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#d1d5db',
  },
});