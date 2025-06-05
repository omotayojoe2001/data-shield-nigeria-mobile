
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: string;
  onComplete?: () => void;
}

const CountdownTimer = ({ targetTime, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Available now!');
        if (onComplete) {
          onComplete();
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  return (
    <div className="text-sm font-mono text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full inline-block">
      Next bonus: {timeLeft}
    </div>
  );
};

export default CountdownTimer;
