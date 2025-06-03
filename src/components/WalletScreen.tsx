
import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, History, Gift, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WalletScreen = () => {
  const { user, wallet, refreshWallet } = useAuth();
  const [selectedTopUp, setSelectedTopUp] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({ spent: 0, saved: 0 });
  
  const topUpAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (user) {
      fetchTransactions();
      calculateMonthlyStats();
    }
  }, [user]);

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
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          amount: amount,
          email: user.email,
          type: 'topup'
        }
      });

      if (error) throw error;

      // Redirect to Paystack
      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    setBonusLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-daily-bonus');

      if (error) throw error;

      toast.success(data.message);
      await refreshWallet();
      await fetchTransactions();
    } catch (error: any) {
      console.error('Bonus claim error:', error);
      toast.error(error.message || 'Failed to claim bonus');
    } finally {
      setBonusLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
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
        return <ArrowUpRight size={16} className="text-red-600" />;
      default:
        return <ArrowUpRight size={16} className="text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
        return 'bg-green-100';
      case 'bonus':
        return 'bg-purple-100';
      case 'usage':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => setShowHistory(false)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ArrowDownLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">Transaction History</h1>
              <p className="text-blue-200">All your transactions</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">{transaction.description}</h4>
                        <p className="text-sm text-blue-600">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
                    </div>
                  </div>
                  <div className="text-xs text-blue-500 uppercase tracking-wide">
                    {transaction.type === 'usage' ? 'Data Usage' : 
                     transaction.type === 'topup' ? 'Wallet Top-up' :
                     transaction.type === 'bonus' ? 'Daily Bonus' : 'Transaction'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-blue-600 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">My Wallet</h1>
            <p className="text-blue-200">Manage your balance and payments</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="text-center">
            <p className="text-blue-200 mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              {wallet ? formatAmount(wallet.balance) : '₦0'}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200">This Month</p>
                <p className="text-white font-semibold">{formatAmount(monthlyStats.spent)} spent</p>
              </div>
              <div>
                <p className="text-blue-200">Saved</p>
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
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift size={24} />
              <div>
                <h3 className="text-lg font-semibold">Daily Bonus</h3>
                <p className="text-sm">Claim your ₦50 bonus!</p>
              </div>
            </div>
            <button 
              onClick={handleClaimBonus}
              disabled={bonusLoading}
              className="bg-white/20 px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
            >
              {bonusLoading ? 'Claiming...' : 'Claim'}
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center">
              <History size={20} className="mr-2" />
              Recent Transactions
            </h3>
            <button 
              onClick={() => setShowHistory(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 5).length > 0 ? (
              transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">{transaction.description}</p>
                      <p className="text-sm text-blue-600">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-blue-600 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletScreen;
