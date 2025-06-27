
import React, { useState, useEffect } from 'react';
import { Users, Gift, Copy, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  totalEarnings: number;
}

const ReferralSection = () => {
  const { theme } = useTheme();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [submittingReferral, setSubmittingReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const response = await apiService.getReferralStats();
      if (response.success && response.data) {
        setReferralStats(response.data);
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralCode = async () => {
    if (!referralStats?.referralCode) return;

    try {
      await navigator.clipboard.writeText(referralStats.referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleSubmitReferral = async () => {
    if (!referralInput.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setSubmittingReferral(true);
    try {
      const response = await apiService.processReferral(referralInput.trim());
      
      if (response.success) {
        toast.success(`Referral successful! You earned ₦${(response.data?.reward || 0) / 100} bonus!`);
        setReferralInput('');
        // Refresh stats and wallet
        await loadReferralStats();
        window.dispatchEvent(new CustomEvent('wallet-updated'));
      } else {
        toast.error(response.error || 'Invalid referral code');
      }
    } catch (error) {
      console.error('Error processing referral:', error);
      toast.error('Failed to process referral code');
    } finally {
      setSubmittingReferral(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Referral Code */}
      <div className={`rounded-2xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              Your Referral Code
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
              Share and earn rewards
            </p>
          </div>
        </div>

        {referralStats && (
          <>
            <div className={`p-4 rounded-xl border-2 border-dashed mb-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-blue-300 bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                  {referralStats.referralCode}
                </span>
                <button
                  onClick={handleCopyReferralCode}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : theme === 'dark' 
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                  {referralStats.referralCount}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                  Referrals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₦{(referralStats.totalEarnings / 100).toFixed(2)}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                  Total Earned
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enter Referral Code */}
      <div className={`rounded-2xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
              Enter Referral Code
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
              Got a code from a friend? Enter it here
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code (e.g. GD12345678)"
            className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                : 'bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-500'
            } focus:outline-none`}
          />
          
          <button
            onClick={handleSubmitReferral}
            disabled={!referralInput.trim() || submittingReferral}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingReferral ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Submit Referral Code'
            )}
          </button>
        </div>

        <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
            💡 <strong>Tip:</strong> You and your friend both earn bonus credits when they use your referral code!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
