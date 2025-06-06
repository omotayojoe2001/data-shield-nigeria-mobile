
import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, History, Gift, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import DailyBonusSection from './DailyBonusSection';
import { toast } from 'sonner';

interface WalletScreenProps {
  onTabChange: (tab: string) => void;
}

const WalletScreen = ({ onTabChange }: WalletScreenProps) => {
  const { user, wallet, refreshWallet } = useAuth();
  const { theme } = useTheme();
  const [selectedTopUp, setSelectedTopUp] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({ spent: 0, saved: 0 });
  
  const topUpAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (user) {
      fetchTransactions();
      calculateMonthlyStats();
    }
  }, [user]);

  useEffect(() => {
    // Listen for wallet updates
    const handleWalletUpdate = () => {
      refreshWallet();
      fetchTransactions();
    };

    window.addEventListener('wallet-updated', handleWalletUpdate);
    window.addEventListener('bonus-updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
      window.removeEventListener('bonus-updated', handleWalletUpdate);
    };
  }, [refreshWallet]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const calculateMonthlyStats = async () => {
    if (!user) return;
    
    try {
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('created_at', firstDay.toISOString());

      if (!error && data) {
        const spent = data
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Calculate estimated savings (assume 70% compression)
        const saved = Math.round(spent * 0.7);
        
        setMonthlyStats({ spent, saved });
      }
    } catch (error) {
      console.error('Error calculating monthly stats:', error);
    }
  };

  const handleTopUp = async (amount: number) => {
    if (!user || !selectedTopUp) return;
    
    setLoading(true);
    try {
      // Check session before making payment
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Please login again to continue');
        return;
      }

      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          amount: amount * 100, // Convert to kobo
          email: user.email,
          type: 'topup',
          callback_url: `${window.location.origin}?payment=success&amount=${amount}`
        }
      });

      if (error) throw error;

      // Open Paystack in new tab and handle success via URL params
      if (data.authorization_url) {
        const newWindow = window.open(data.authorization_url, '_blank');
        
        // Listen for payment completion
        const checkPayment = setInterval(() => {
          if (newWindow?.closed) {
            clearInterval(checkPayment);
            // Refresh wallet and check for success params
            setTimeout(() => {
              refreshWallet();
              fetchTransactions();
            }, 1000);
          }
        }, 1000);
        
        toast.success('Payment window opened. Complete payment in the new tab.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₦${(Math.abs(amount) / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft size={16} className="text-green-600" />;
      case 'bonus':
        return <Gift size={16} className="text-purple-600" />;
      case 'usage':
      case 'data_purchase':
        return <ArrowUpRight size={16} className="text-red-600" />;
      default:
        return <ArrowUpRight size={16} className="text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
        return theme === 'dark' ? 'bg-green-900' : 'bg-green-100';
      case 'bonus':
        return theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100';
      case 'usage':
      case 'data_purchase':
        return theme === 'dark' ? 'bg-red-900' : 'bg-red-100';
      default:
        return theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100';
    }
  };

  if (showHistory) {
    return (
      <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
        <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => setShowHistory(false)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ArrowDownLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">Transaction History</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>All your transactions</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className={`rounded-2xl p-4 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{transaction.description}</h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                    </div>
                  </div>
                  <div className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
                    {transaction.type === 'usage' ? 'Data Usage' : 
                     transaction.type === 'topup' ? 'Wallet Top-up' :
                     transaction.type === 'data_purchase' ? 'Data Purchase' :
                     transaction.type === 'bonus' ? 'Daily Bonus' : 'Transaction'}
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">My Wallet</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Manage your balance and payments</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="text-center">
            <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Available Balance</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              {wallet ? formatAmount(wallet.balance) : '₦0'}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>This Month</p>
                <p className="text-white font-semibold">{formatAmount(monthlyStats.spent)} spent</p>
              </div>
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Saved</p>
                <p className="text-green-300 font-semibold">{formatAmount(monthlyStats.saved)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setSelectedTopUp(1000)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300"
          >
            <Plus size={20} />
            <span className="font-semibold">Top Up</span>
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300"
          >
            <History size={20} />
            <span className="font-semibold">History</span>
          </button>
        </div>

        {/* Top Up Options */}
        <div className={`rounded-3xl p-6 shadow-xl border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
            <CreditCard size={20} className="mr-2" />
            Quick Top-Up
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {topUpAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedTopUp(amount)}
                className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-300 ${
                  selectedTopUp === amount
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                      : 'border-blue-200 text-blue-700 hover:border-blue-400'
                }`}
              >
                ₦{amount.toLocaleString()}
              </button>
            ))}
          </div>

          <button 
            onClick={() => selectedTopUp && handleTopUp(selectedTopUp)}
            disabled={!selectedTopUp || loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay with Paystack'}
          </button>
        </div>

        {/* Daily Bonus */}
        <div className="mb-6">
          <DailyBonusSection compact />
        </div>

        {/* Recent Transactions */}
        <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              <History size={20} className="mr-2" />
              Recent Transactions
            </h3>
            <button 
              onClick={() => setShowHistory(true)}
              className={`font-semibold ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 5).length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{transaction.description}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletScreen;
