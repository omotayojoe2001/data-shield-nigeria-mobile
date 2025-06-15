
import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { bonusService } from '../services/bonusService';
import { toast } from 'sonner';

interface DailyBonusSectionProps {
  compact?: boolean;
}

const DailyBonusSection = ({ compact = false }: DailyBonusSectionProps) => {
  const [claiming, setClaiming] = useState(false);
  const [bonusStatus, setBonusStatus] = useState<any>(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      loadBonusStatus();
    }
  }, [user]);

  useEffect(() => {
    // Listen for bonus updates
    const handleBonusUpdate = () => {
      loadBonusStatus();
    };

    window.addEventListener('bonus-updated', handleBonusUpdate);
    return () => {
      window.removeEventListener('bonus-updated', handleBonusUpdate);
    };
  }, []);

  const loadBonusStatus = async () => {
    try {
      const status = await bonusService.getBonusClaimStatus();
      const remaining = await bonusService.getRemainingBonusDays();
      setBonusStatus(status);
      setRemainingDays(remaining);
    } catch (error) {
      console.error('Error loading bonus status:', error);
    }
  };

  const handleClaimBonus = async () => {
    if (claiming || !user) return;

    setClaiming(true);
    try {
      const result = await bonusService.claimDailyBonus();
      if (result.success) {
        toast.success(result.message);
        await loadBonusStatus();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast.error('Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  const canClaim = bonusStatus && bonusStatus.is_eligible && bonusStatus.days_claimed < 7 && 
                  new Date() >= new Date(bonusStatus.next_claim_at);

  const isEligible = bonusStatus && bonusStatus.is_eligible && bonusStatus.days_claimed < 7;

  if (!bonusStatus || !isEligible) {
    return null; // Don't show anything if user is not eligible
  }

  if (compact) {
    return (
      <div className={`rounded-2xl p-4 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>Free 200MB</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-purple-600'}`}>
                {remainingDays} days left
              </p>
            </div>
          </div>
          <button
            onClick={handleClaimBonus}
            disabled={!canClaim || claiming}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              canClaim
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claiming ? 'Claiming...' : canClaim ? 'Claim' : 'Claimed'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'}`}>
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Database size={40} className="text-white" />
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>Free 200MB Daily</h3>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-purple-600'}`}>For new users - 7 days only</p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600">200MB</div>
            <div className="text-sm text-purple-700">Per Day</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600">{remainingDays}</div>
            <div className="text-sm text-pink-700">Days Left</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <Calendar size={20} className="text-purple-500" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
            Day {bonusStatus.days_claimed + 1} of 7
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Gift size={20} className="text-pink-500" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
            Claim once per day
          </span>
        </div>
      </div>

      <button
        onClick={handleClaimBonus}
        disabled={!canClaim || claiming}
        className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
          canClaim
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {claiming ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Claiming...</span>
          </div>
        ) : canClaim ? (
          'Claim 200MB Now'
        ) : (
          bonusStatus.days_claimed >= 7 ? 'All Bonuses Claimed' : 'Already Claimed Today'
        )}
      </button>

      {bonusStatus.days_claimed >= 7 && (
        <div className={`mt-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-purple-600'}`}>
          <p className="text-sm">You've used all your free bonuses! Upgrade to continue enjoying our service.</p>
        </div>
      )}
    </div>
  );
};

export default DailyBonusSection;
