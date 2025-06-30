import React, { useState, useEffect } from 'react';
import { Gift, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { bonusService } from '@/services/bonusService';
import { vpnService } from '@/services/vpnService';
import { Alert } from 'react-native';

interface DailyBonusSectionProps {
  compact?: boolean;
}

const DailyBonusSection = ({ compact = false }: DailyBonusSectionProps) => {
  const { theme } = useTheme();
  const [bonusInfo, setBonusInfo] = useState({
    daysRemaining: 0,
    daysClaimed: 0,
    canClaim: false,
    nextClaimTime: undefined as Date | undefined
  });
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    loadBonusInfo();
  }, []);

  useEffect(() => {
    // Listen for bonus updates using VPN service event system
    const handleBonusUpdate = () => {
      loadBonusInfo();
    };

    vpnService.on('bonus-updated', handleBonusUpdate);
    vpnService.on('plan-updated', handleBonusUpdate);

    return () => {
      vpnService.off('bonus-updated', handleBonusUpdate);
      vpnService.off('plan-updated', handleBonusUpdate);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (bonusInfo.nextClaimTime && !bonusInfo.canClaim) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const targetTime = bonusInfo.nextClaimTime!.getTime();
        const difference = targetTime - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown('Available now!');
          loadBonusInfo(); // Refresh bonus info when countdown reaches zero
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bonusInfo.nextClaimTime, bonusInfo.canClaim]);

  const loadBonusInfo = async () => {
    try {
      const info = await bonusService.getBonusInfo();
      setBonusInfo({
        daysRemaining: info.daysRemaining,
        daysClaimed: info.daysClaimed,
        canClaim: info.canClaim,
        nextClaimTime: info.nextClaimTime
      });
    } catch (error) {
      console.error('Error loading bonus info:', error);
    }
  };

  const handleClaim = async () => {
    if (claiming || !bonusInfo.canClaim) return;

    setClaiming(true);
    try {
      const result = await bonusService.claimDailyBonus();
      if (result.success) {
        Alert.alert('Success!', result.message);
        await loadBonusInfo();
        // Trigger plan updates using VPN service event system
        vpnService.emit('plan-updated');
        vpnService.emit('bonus-updated');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      Alert.alert('Error', 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  // Don't show if bonus period is over
  if (bonusInfo.daysRemaining === 0 && bonusInfo.daysClaimed >= 7) {
    return null;
  }

  if (compact) {
    return (
      <div className={`rounded-xl p-3 shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gift size={16} className="text-white" />
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                Daily Bonus
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                {bonusInfo.daysRemaining > 0 ? `${bonusInfo.daysRemaining} days left` : 'Completed'}
              </p>
            </div>
          </div>
          
          {bonusInfo.canClaim ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : 'Claim 200MB'}
            </button>
          ) : (
            <div className="text-center">
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
                {bonusInfo.daysRemaining > 0 ? (
                  <>Next in {countdown}</>
                ) : (
                  'Bonus Complete'
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Gift size={20} className="text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
            7-Day Welcome Bonus
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
            Claim 200MB free data daily for new users
          </p>
        </div>
      </div>

      {/* Progress indicator - Mobile Optimized */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
            Progress: Day {bonusInfo.daysClaimed}/7
          </span>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
            {bonusInfo.daysRemaining} days remaining
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'}`}>
          <div 
            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${(bonusInfo.daysClaimed / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Claim button or status - Mobile Optimized */}
      <div className="text-center">
        {bonusInfo.canClaim ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Claiming...</span>
              </div>
            ) : (
              <>🎁 Claim Today's 200MB</>
            )}
          </button>
        ) : bonusInfo.daysRemaining > 0 ? (
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} flex items-center justify-center space-x-2`}>
            <Clock size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
            <span className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
              Next bonus available in {countdown}
            </span>
          </div>
        ) : (
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} flex items-center justify-center space-x-2`}>
            <CheckCircle size={16} className="text-green-600" />
            <span className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
              7-day bonus period completed! 🎉
            </span>
          </div>
        )}
      </div>

      {/* Info text */}
      <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}>
        * Only available for new users during their first 7 days
      </p>
    </div>
  );
};

export default DailyBonusSection;
