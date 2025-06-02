
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-8 w-24 h-24 bg-blue-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="text-center z-10 px-8">
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
            <Zap size={48} className="text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-cyan-400/30 rounded-3xl blur-xl animate-ping"></div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 font-['Poppins']">
          GoodDeeds
          <span className="text-cyan-300 block text-3xl mt-2">Data</span>
        </h1>
        
        <p className="text-blue-100 text-lg mb-12 max-w-xs mx-auto leading-relaxed">
          Smart data optimization for Nigerians
        </p>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>

        <p className="text-blue-200 text-sm mt-6 animate-pulse">
          Initializing secure connection...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
