
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: string;
  onComplete: () => void;
  prefix?: string;
}

const CountdownTimer = ({ targetTime, onComplete, prefix = "Next bonus in" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      } else {
        setTimeLeft('');
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  if (!timeLeft) return null;

  return (
    <div className="text-blue-200 text-sm">
      {prefix} {timeLeft}
    </div>
  );
};

export default CountdownTimer;
