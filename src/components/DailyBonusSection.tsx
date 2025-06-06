
import React, { useState, useEffect } from 'react';
import { planService, type DailyBonusClaim } from '../services/planService';
import CountdownTimer from './CountdownTimer';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

interface DailyBonusSectionProps {
  compact?: boolean;
}

const DailyBonusSection = ({ compact = false }: DailyBonusSectionProps) => {
  const { theme } = useTheme();
  const [bonusStatus, setBonusStatus] = useState<DailyBonusClaim | null>(null);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [canClaimBonus, setCanClaimBonus] = useState(false);

  useEffect(() => {
    loadBonusStatus();
  }, []);

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
      const bonus = await planService.getBonusClaimStatus();
      setBonusStatus(bonus);
      
      if (bonus) {
        const now = new Date();
        const nextClaimTime = new Date(bonus.next_claim_at);
        setCanClaimBonus(now >= nextClaimTime);
      }
    } catch (error) {
      console.error('Error loading bonus status:', error);
    }
  };

  const handleClaimBonus = async () => {
    if (bonusLoading || !canClaimBonus) return;
    
    setBonusLoading(true);
    try {
      const result = await planService.claimDailyBonus();
      if (result.success) {
        toast.success(result.message);
        await loadBonusStatus();
        // Trigger wallet update
        window.dispatchEvent(new CustomEvent('wallet-updated'));
        window.dispatchEvent(new CustomEvent('bonus-updated'));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast.error('Failed to claim bonus');
    } finally {
      setBonusLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎁</span>
            <div>
              <h4 className="font-semibold">Daily Bonus</h4>
              <p className="text-xs">Claim ₦50!</p>
            </div>
          </div>
          <div className="text-center">
            {bonusStatus && !canClaimBonus && (
              <div className="mb-2">
                <CountdownTimer 
                  targetTime={bonusStatus.next_claim_at}
                  onComplete={loadBonusStatus}
                  label="Next"
                />
              </div>
            )}
            <button 
              onClick={handleClaimBonus}
              disabled={bonusLoading || !canClaimBonus}
              className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
            >
              {bonusLoading ? 'Claiming...' : (canClaimBonus ? 'Claim' : 'Claimed')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Daily Bonus</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>Claim your daily ₦50 bonus!</p>
          {bonusStatus && !canClaimBonus && (
            <div className="mt-2">
              <CountdownTimer 
                targetTime={bonusStatus.next_claim_at}
                onComplete={loadBonusStatus}
              />
            </div>
          )}
        </div>
        <div className="text-3xl">🎁</div>
      </div>
      
      <button 
        onClick={handleClaimBonus}
        disabled={!canClaimBonus || bonusLoading}
        className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {bonusLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
            <span>Claiming...</span>
          </div>
        ) : (
          canClaimBonus ? 'Claim ₦50 Bonus' : 'Bonus Claimed'
        )}
      </button>
    </div>
  );
};

export default DailyBonusSection;
