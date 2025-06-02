
import React, { useState } from 'react';
import { ChevronRight, Shield, Zap, Coins } from 'lucide-react';

const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const screens = [
    {
      icon: Zap,
      title: "Save Your Data Smarter",
      description: "Our advanced compression technology helps your data last 3x longer while maintaining blazing fast speeds.",
      image: "🚀"
    },
    {
      icon: Shield,
      title: "Buy or Subscribe to Data Access",
      description: "Choose flexible plans that work for you. Daily, weekly, monthly subscriptions or pay-as-you-go data bundles.",
      image: "💎"
    },
    {
      icon: Coins,
      title: "Get More for Less",
      description: "Smart compression technology reduces your data consumption by up to 70% without compromising quality.",
      image: "💰"
    }
  ];

  const currentScreen = screens[currentStep];
  const Icon = currentScreen.icon;

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button 
          onClick={handleSkip}
          className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Icon and Image */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-4 shadow-xl">
            <span className="text-6xl">{currentScreen.image}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon size={28} className="text-white" />
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-6 max-w-sm leading-tight">
          {currentScreen.title}
        </h1>
        
        <p className="text-lg text-blue-600 text-center max-w-md leading-relaxed mb-12">
          {currentScreen.description}
        </p>

        {/* Progress indicators */}
        <div className="flex space-x-3 mb-12">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-blue-900 w-8' 
                  : index < currentStep 
                    ? 'bg-blue-400' 
                    : 'bg-blue-200'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-blue-800 transition-all duration-300 flex items-center space-x-3 group"
        >
          <span>{currentStep === screens.length - 1 ? 'Get Started' : 'Next'}</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
