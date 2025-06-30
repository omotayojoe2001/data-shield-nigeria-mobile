
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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

  const handleSubmit = async () => {
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
          setMessage('Account created successfully! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          setFullName('');
          setTimeout(() => {
            setMode('signin');
            setMessage('Please sign in after verifying your email address.');
          }, 5000);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message || 'Failed to send reset email');
        } else {
          setMessage('Password reset email sent! Please check your inbox.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#1e40af', '#2563eb']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🛡️</Text>
              </View>
              <Text style={styles.title}>GoodDeeds VPN</Text>
              <Text style={styles.subtitle}>Secure. Fast. Affordable.</Text>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              {mode !== 'signin' && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setMode('signin')}
                >
                  <Ionicons name="arrow-back" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.backText}>Back to Sign In</Text>
                </TouchableOpacity>
              )}

              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {mode === 'signin' && 'Sign in to your account'}
                  {mode === 'signup' && 'Join thousands saving data'}
                  {mode === 'forgot' && 'Enter your email to reset password'}
                </Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {message ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{message}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                {mode === 'signup' && (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={20} color="#bfdbfe" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Full Name"
                      placeholderTextColor="#bfdbfe"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color="#bfdbfe" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor="#bfdbfe"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {mode !== 'forgot' && (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#bfdbfe" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, styles.passwordInput]}
                      placeholder="Password"
                      placeholderTextColor="#bfdbfe"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#bfdbfe"
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitText}>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Email'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {mode === 'signin' && (
                <View style={styles.linksContainer}>
                  <TouchableOpacity onPress={() => setMode('forgot')}>
                    <Text style={styles.linkText}>Forgot your password?</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => setMode('signup')}>
                      <Text style={styles.signupLink}>Sign up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#86efac',
    fontSize: 14,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  submitButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 24,
    gap: 16,
  },
  linkText: {
    color: '#bfdbfe',
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#bfdbfe',
  },
  signupLink: {
    color: '#67e8f9',
    fontWeight: '600',
  },
});

export default AuthScreen;
