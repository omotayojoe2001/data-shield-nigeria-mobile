import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../integrations/supabase/client';
import Toast from 'react-native-toast-message';
import { styled } from 'nativewind';

// Import refactored UI components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardContent } from '../components/ui/card'; // Assuming CardFooter, CardTitle, CardDescription might not be directly needed here or can be Text

const StyledSafeAreaView = styled(SafeAreaView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      Toast.show({
        type: 'success',
        text1: 'Check your email for verification link!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
      });
      // navigation.navigate('Main'); // Or wherever you navigate after sign in
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-5"
      >
        <StyledTouchableOpacity
          className="flex-row items-center mb-5 absolute top-5 left-5 pt-3" // Positioned for typical back button
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#6b7280" size={24} />
          <StyledText className="ml-2 text-gray-500 text-base">
            Back
          </StyledText>
        </StyledTouchableOpacity>

        <Card className="bg-white rounded-xl p-6 shadow-lg">
          <CardHeader className="items-center mb-8 pt-0">
            <Shield color="#2563eb" size={48} className="mb-4" />
            <StyledText className="text-2xl font-bold text-gray-900 mb-1">
              Welcome
            </StyledText>
            <StyledText className="text-base text-gray-500 text-center">
              {isSignUp ? 'Create a new account' : 'Sign in to your account'}
            </StyledText>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            <StyledView className="flex-row bg-gray-200 rounded-lg p-1">
              <Button
                variant={!isSignUp ? 'default' : 'ghost'}
                onPress={() => setIsSignUp(false)}
                className="flex-1"
                textClassName={!isSignUp ? "text-white" : "text-gray-600"}
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? 'default' : 'ghost'}
                onPress={() => setIsSignUp(true)}
                className="flex-1"
                textClassName={isSignUp ? "text-white" : "text-gray-600"}
              >
                Sign Up
              </Button>
            </StyledView>

            <StyledView className="space-y-2">
              <Label className="text-base font-semibold text-gray-800">
                Email
              </Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white" // Ensure input background is distinct if card bg is similar
              />
            </StyledView>

            <StyledView className="space-y-2">
              <Label className="text-base font-semibold text-gray-800">
                Password
              </Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                className="bg-white"
              />
            </StyledView>

            <Button
              onPress={handleSubmit}
              disabled={loading}
              className={`py-3 ${loading ? "opacity-60" : ""}`}
            >
              {loading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </CardContent>
        </Card>
      </StyledKeyboardAvoidingView>
      <Toast />
    </StyledSafeAreaView>
  );
};

export default AuthScreen;