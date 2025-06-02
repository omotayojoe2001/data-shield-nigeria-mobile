
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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  refreshWallet: () => Promise<void>;
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

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchWallet(session.user.id)
          ]);
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
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await Promise.all([
              fetchProfile(session.user.id),
              fetchWallet(session.user.id)
            ]);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setWallet(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      cleanupAuthState();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        window.location.href = '/';
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
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
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
