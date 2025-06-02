
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowLeft } from 'lucide-react';

const AuthScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, directly complete auth
    if (authMode === 'otp') {
      onComplete();
    } else if (authMode === 'signup') {
      setAuthMode('otp');
    } else {
      onComplete();
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-blue-900 font-medium mb-2">Email or Phone</label>
        <div className="relative">
          <Mail size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type="text"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter email or phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-blue-900 font-medium mb-2">Password</label>
        <div className="relative">
          <Lock size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-blue-400 hover:text-blue-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-400" />
          <span className="text-sm text-blue-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => setAuthMode('forgot')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-900 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-blue-800 transition-all duration-300"
      >
        Sign In
      </button>

      <div className="text-center">
        <span className="text-blue-600">Don't have an account? </span>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className="text-blue-900 font-semibold hover:underline"
        >
          Sign Up
        </button>
      </div>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-blue-900 font-medium mb-2">Full Name</label>
        <div className="relative">
          <User size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-blue-900 font-medium mb-2">Email</label>
        <div className="relative">
          <Mail size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-blue-900 font-medium mb-2">Phone Number</label>
        <div className="relative">
          <Phone size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-blue-900 font-medium mb-2">Password</label>
        <div className="relative">
          <Lock size={20} className="absolute left-4 top-4 text-blue-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-blue-400 hover:text-blue-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-900 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-blue-800 transition-all duration-300"
      >
        Create Account
      </button>

      <div className="text-center">
        <span className="text-blue-600">Already have an account? </span>
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className="text-blue-900 font-semibold hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );

  const renderOtpForm = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Phone size={32} className="text-blue-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-blue-900 mb-2">Verify Your Number</h3>
      <p className="text-blue-600 mb-8">
        We've sent a 6-digit code to {formData.phone || formData.email}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-3">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-bold bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
              onChange={(e) => {
                const value = e.target.value;
                if (value && i < 5) {
                  const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                  nextInput?.focus();
                }
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:bg-blue-800 transition-all duration-300"
        >
          Verify & Continue
        </button>

        <button
          type="button"
          className="w-full text-blue-600 hover:text-blue-800 font-medium"
        >
          Resend Code (00:30)
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        {authMode !== 'login' && (
          <button
            onClick={() => {
              if (authMode === 'otp') setAuthMode('signup');
              else setAuthMode('login');
            }}
            className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-blue-600" />
          </button>
        )}
        <div className="flex-1" />
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pb-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">GD</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-900">
              {authMode === 'login' ? 'Welcome Back' : 
               authMode === 'signup' ? 'Create Account' : 
               authMode === 'otp' ? 'Verification' : 'Reset Password'}
            </h1>
            <p className="text-blue-600 mt-2">
              {authMode === 'login' ? 'Sign in to continue saving data' : 
               authMode === 'signup' ? 'Join thousands saving data daily' : 
               authMode === 'otp' ? 'Almost there!' : 'We\'ll help you reset it'}
            </p>
          </div>

          {/* Forms */}
          {authMode === 'login' && renderLoginForm()}
          {authMode === 'signup' && renderSignupForm()}
          {authMode === 'otp' && renderOtpForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
