
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  wallet: Wallet | null;
  loading: boolean;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  refreshWallet: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchWallet = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const refreshWallet = async () => {
    if (user) {
      await fetchWallet(user.id);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Enhanced session restoration for payment redirects
  const restoreSessionAfterPayment = async () => {
    console.log('Checking for stored session after payment...');
    
    // Check both sessionStorage and localStorage for session data
    const sessionStorageSession = sessionStorage.getItem('pre_payment_session');
    const localStorageSession = localStorage.getItem('pre_payment_session');
    const storedSession = sessionStorageSession || localStorageSession;
    
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        console.log('Found stored session, attempting to restore for user:', sessionData.user_id);
        
        // Set the session in Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });
        
        if (error) {
          console.error('Error restoring session:', error);
          // Clean up invalid session data
          sessionStorage.removeItem('pre_payment_session');
          localStorage.removeItem('pre_payment_session');
          return false;
        }
        
        if (data.session) {
          console.log('Session restored successfully after payment');
          setSession(data.session);
          setUser(data.session.user);
          
          // Clean up stored session
          sessionStorage.removeItem('pre_payment_session');
          localStorage.removeItem('pre_payment_session');
          
          return true;
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        sessionStorage.removeItem('pre_payment_session');
        localStorage.removeItem('pre_payment_session');
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('Initializing auth state...');
        
        // First check if we're returning from a payment
        const urlParams = new URLSearchParams(window.location.search);
        const isPaymentReturn = urlParams.get('payment') === 'success';
        
        if (isPaymentReturn) {
          console.log('Detected payment return, attempting session restoration...');
          const wasRestored = await restoreSessionAfterPayment();
          
          if (wasRestored) {
            // Give some time for session to be properly set
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
        }
        
        console.log('Current session state:', session ? 'authenticated' : 'not authenticated');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Loading user data for:', session.user.email);
          await Promise.all([
            fetchProfile(session.user.id),
            fetchWallet(session.user.id)
          ]);
          
          // Check if this is first time login
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileData && !profileData.full_name) {
            setIsFirstTime(true);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to ensure data is ready
          setTimeout(async () => {
            await Promise.all([
              fetchProfile(session.user.id),
              fetchWallet(session.user.id)
            ]);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setWallet(null);
          setIsFirstTime(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Starting signup process for:', email);
      console.log('Window origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName 
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log('Signup response:', { data, error });
      console.log('User created:', data.user?.id);
      console.log('Session created:', !!data.session);
      console.log('Email confirmation sent at:', data.user?.confirmation_sent_at);
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      // Check if user was created but needs email confirmation
      if (data.user && !data.session) {
        console.log('User created successfully, email confirmation required');
        console.log('Confirmation sent at:', data.user.confirmation_sent_at);
        
        // Check if confirmation was actually sent
        if (data.user.confirmation_sent_at) {
          console.log('Email confirmation was sent successfully');
          return { error: null };
        } else {
          console.warn('User created but no confirmation email sent');
          return { 
            error: { 
              message: 'Account created but verification email was not sent. Please contact support.' 
            } 
          };
        }
      }
      
      // If session exists, user is automatically confirmed
      if (data.user && data.session) {
        console.log('User created and automatically signed in (email confirmation disabled)');
        return { error: null };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Signin response:', { data, error });
      
      if (error) {
        return { error };
      }
      
      // Don't force redirect - let the auth state change handle it
      return { error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      cleanupAuthState();
      sessionStorage.removeItem('pre_payment_session');
      sessionStorage.removeItem('paystack_payment_data');
      setUser(null);
      setSession(null);
      setProfile(null);
      setWallet(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);
      
      if (!error) {
        await fetchProfile(user.id);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    wallet,
    loading,
    isFirstTime,
    setIsFirstTime,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshWallet,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
