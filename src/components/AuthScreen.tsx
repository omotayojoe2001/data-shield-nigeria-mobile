
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthScreenProps {
  onComplete: () => void;
}

const AuthScreen = ({ onComplete }: AuthScreenProps) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Invalid email or password');
        } else {
          onComplete();
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Full name is required');
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message || 'Failed to create account');
        } else {
          setMessage('Account created successfully! Please check your email to verify your account before signing in.');
          // Clear form
          setEmail('');
          setPassword('');
          setFullName('');
          // Switch to signin mode after a delay
          setTimeout(() => {
            setMode('signin');
            setMessage('');
          }, 3000);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message || 'Failed to send reset email');
        } else {
          setMessage('Password reset email sent!');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">🛡️</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GoodDeeds VPN</h1>
          <p className="text-blue-200">Secure. Fast. Affordable.</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          {mode !== 'signin' && (
            <button
              onClick={() => setMode('signin')}
              className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Sign In
            </button>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-blue-200">
              {mode === 'signin' && 'Sign in to your account'}
              {mode === 'signup' && 'Join thousands saving data'}
              {mode === 'forgot' && 'Enter your email to reset password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4">
              <p className="text-green-200 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:border-white/40 transition-colors"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="mt-6 space-y-4">
              <button
                onClick={() => setMode('forgot')}
                className="block w-full text-center text-blue-200 hover:text-white transition-colors"
              >
                Forgot your password?
              </button>
              
              <div className="text-center">
                <span className="text-blue-200">Don't have an account? </span>
                <button
                  onClick={() => setMode('signup')}
                  className="text-cyan-300 hover:text-white font-semibold transition-colors"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
