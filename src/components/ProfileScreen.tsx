
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'; // Added ScrollView, TouchableOpacity, Image
import { Camera, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react-native'; // Changed to -native
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import Toast from 'react-native-toast-message'; // Changed from sonner
import { ExtendedProfile } from '@/types/extended-profile';
import { styled } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';

// Import our refactored UI components
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);


const ProfileScreen = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { theme } = useTheme(); // Assuming theme provides 'dark' or 'light'
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null); // For image picker result

  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
      setImageUri(profile.profile_image_url || null);
    }
  }, [profile]);

  const handleProfileUpdate = async () => { // Removed e: React.FormEvent
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      Toast.show({ type: 'success', text1: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Toast.show({ type: 'error', text1: 'Failed to update profile', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => { // Removed e: React.FormEvent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.show({ type: 'error', text1: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      // Note: Verifying currentPassword before updating is a good practice,
      // but Supabase's updateUser doesn't do it directly.
      // This would typically involve a separate check or a custom Supabase function.
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      Toast.show({ type: 'success', text1: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      Toast.show({ type: 'error', text1: 'Failed to update password', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const pickImageAndUpload = async () => {
    if (!user) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploading(true);
      try {
        const uri = asset.uri;
        const fileExt = asset.fileName?.split('.').pop() || uri.split('.').pop() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Unique name
        const filePath = `${user.id}/${fileName}`; // Path in storage bucket

        const response = await fetch(uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, blob, { upsert: true, contentType: blob.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_image_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        await refreshProfile(); // This should update the profile context, and thus imageUri via useEffect
        Toast.show({ type: 'success', text1: 'Profile picture updated' });
      } catch (error: any) {
        console.error('Error uploading image:', error);
        Toast.show({ type: 'error', text1: 'Failed to upload image', text2: error.message });
      } finally {
        setUploading(false);
      }
    }
  };


  const getDisplayName = () => {
    const extendedProfile = profile as ExtendedProfile;
    return extendedProfile?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const currentImageToDisplay = imageUri || (profile as ExtendedProfile)?.profile_image_url;


  return (
    <StyledScrollView
      className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}
      contentContainerClassName="px-6 pt-0" // Adjusted padding for ScrollView
    >
      {/* Header */}
      <StyledView className={`px-0 pt-12 pb-8 rounded-b-3xl shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900 to-blue-800'} mb-6`}>
        <StyledText className="text-white text-3xl font-bold mb-2 text-center">My Profile</StyledText>
        <StyledText className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-blue-200'}`}>Manage your account settings</StyledText>
      </StyledView>

      <StyledView className="space-y-6">
        {/* Profile Picture Section */}
        <StyledView className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <StyledText className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Profile Picture</StyledText>
          
          <StyledView className="flex-col items-center space-y-4">
            <StyledView className="relative">
              <StyledView className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {currentImageToDisplay ? (
                  <StyledImage
                    source={{ uri: currentImageToDisplay }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </StyledView>
              
              <StyledTouchableOpacity
                onPress={pickImageAndUpload}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center active:bg-blue-700"
              >
                <Camera size={16} className="text-white" />
              </StyledTouchableOpacity>
            </StyledView>
            
            <StyledView className="text-center items-center">
              <StyledText className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                {getDisplayName()}
              </StyledText>
              <StyledText className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                {user?.email}
              </StyledText>
              {uploading && (
                <StyledText className="text-sm text-blue-600 mt-2">Uploading...</StyledText>
              )}
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Profile Information */}
        <StyledView className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <StyledText className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Personal Information</StyledText>
          
          <StyledView className="space-y-4">
            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Full Name
              </Label>
              <StyledView className="relative">
                <User size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}
                  placeholder="Enter your full name"
                />
              </StyledView>
            </StyledView>

            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Phone Number
              </Label>
              <StyledView className="relative">
                <Phone size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}
                  placeholder="Enter your phone number"
                />
              </StyledView>
            </StyledView>

            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Email Address
              </Label>
              <StyledView className="relative">
                <Mail size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  value={user?.email || ''}
                  editable={false} // Make email non-editable
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gray-600 border-gray-500 text-gray-300' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </StyledView>
            </StyledView>

            <Button
              onPress={handleProfileUpdate}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-50"
              textClassName="text-white font-semibold"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </StyledView>
        </StyledView>

        {/* Change Password */}
        <StyledView className={`rounded-3xl p-6 shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
          <StyledText className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Change Password</StyledText>
          
          <StyledView className="space-y-4">
            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Current Password (Optional)
              </Label>
              <StyledView className="relative">
                <Lock size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  secureTextEntry={!showPassword.current}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}
                  placeholder="Enter current password (if changing)"
                />
                <StyledTouchableOpacity
                  onPress={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className={`absolute right-3 top-3.5 p-1 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}
                >
                  {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                New Password
              </Label>
              <StyledView className="relative">
                <Lock size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  secureTextEntry={!showPassword.new}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}
                  placeholder="Enter new password"
                />
                 <StyledTouchableOpacity
                  onPress={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className={`absolute right-3 top-3.5 p-1 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}
                >
                  {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            <StyledView>
              <Label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                Confirm New Password
              </Label>
              <StyledView className="relative">
                <Lock size={20} className={`absolute left-3 top-3.5 z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`} />
                <Input
                  secureTextEntry={!showPassword.confirm}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}
                  placeholder="Confirm new password"
                />
                 <StyledTouchableOpacity
                  onPress={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className={`absolute right-3 top-3.5 p-1 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-500'}`}
                >
                  {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            <Button
              onPress={handlePasswordChange}
              disabled={loading}
              variant="destructive" // Example: use destructive for password change
              className="w-full py-3 disabled:opacity-50"
              textClassName="text-white font-semibold"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
};

export default ProfileScreen;
