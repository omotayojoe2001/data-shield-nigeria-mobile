
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
  
  const topUpAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (user) {
      fetchTransactions();
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
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
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
    return new Date(dateString).toLocaleDateString('en-NG');
  };

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
                <p className="text-white font-semibold">₦0 spent</p>
              </div>
              <div>
                <p className="text-blue-200">Saved</p>
                <p className="text-green-300 font-semibold">₦0</p>
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
          <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300">
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

        {/* Transaction History */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <History size={20} className="mr-2" />
            Recent Transactions
          </h3>
          
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'topup' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'topup' ? <ArrowDownLeft size={16} /> :
                       transaction.type === 'bonus' ? <Gift size={16} /> :
                       <ArrowUpRight size={16} />}
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
