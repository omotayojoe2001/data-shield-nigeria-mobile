
import React, { useState } from 'react';
import { Wallet, CreditCard, History, Gift, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WalletScreen = () => {
  const [selectedTopUp, setSelectedTopUp] = useState<number | null>(null);
  
  const topUpAmounts = [500, 1000, 2000, 5000, 10000];
  
  const transactions = [
    { id: 1, type: 'topup', amount: 2000, date: '2024-01-15', description: 'Card Top-up', status: 'completed' },
    { id: 2, type: 'purchase', amount: -500, date: '2024-01-14', description: 'Weekly Plan', status: 'completed' },
    { id: 3, type: 'bonus', amount: 200, date: '2024-01-13', description: 'Referral Bonus', status: 'completed' },
    { id: 4, type: 'purchase', amount: -1000, date: '2024-01-12', description: '2GB Data Plan', status: 'completed' },
    { id: 5, type: 'topup', amount: 5000, date: '2024-01-10', description: 'Bank Transfer', status: 'completed' }
  ];

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
            <h2 className="text-4xl font-bold text-white mb-4">₦3,750</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200">This Month</p>
                <p className="text-white font-semibold">₦8,200 spent</p>
              </div>
              <div>
                <p className="text-blue-200">Saved</p>
                <p className="text-green-300 font-semibold">₦2,100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300">
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

          <div className="space-y-3">
            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
              Pay with Card
            </button>
            <button className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
              Bank Transfer
            </button>
            <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
              USSD Payment
            </button>
          </div>
        </div>

        {/* Smart Reminders */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">⚠️ Reminder</h3>
              <p className="text-sm">Your subscription expires in 2 days</p>
            </div>
            <button className="bg-white/20 px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
              Renew
            </button>
          </div>
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
            <button className="bg-white/20 px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
              Claim
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
            {transactions.slice(0, 5).map((transaction) => (
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
                    <p className="text-sm text-blue-600">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all duration-300">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletScreen;
