
import React, { useState } from 'react';
import { TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { Camera, Upload } from 'lucide-react-native'; // Ensure native version
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message'; // Use react-native-toast-message
import * as ImagePicker from 'expo-image-picker';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledActivityIndicator = styled(ActivityIndicator);

interface ProfilePhotoUploadProps {
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
}

const ProfilePhotoUpload = ({ currentImageUrl, onUploadComplete }: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    if (!user) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      await handleFileUpload(asset);
    }
  };

  const handleFileUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;
    setUploading(true);
    try {
      const uri = asset.uri;
      // Expo's ImagePicker might return a file path without an extension on some platforms,
      // or Supabase might need a specific name format.
      // We try to get the extension from the URI or default to jpg.
      const fileExt = asset.fileName?.split('.').pop() || uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/profile.${fileExt}`;

      // To upload to Supabase from a local URI, we need to fetch the blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, { upsert: true, contentType: blob.type }); // Specify content type

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      Toast.show({ type: 'success', text1: 'Profile photo updated successfully!' });
    } catch (error: any) {
      console.error('Upload error:', error);
      Toast.show({ type: 'error', text1: 'Failed to upload photo', text2: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <StyledView className="relative">
      <StyledView className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
        {currentImageUrl ? (
          <StyledImage
            source={{ uri: currentImageUrl }}
            className="w-full h-full"
            resizeMode="cover" // equivalent to object-cover
          />
        ) : (
          <Camera size={32} className="text-blue-600" />
        )}
      </StyledView>
      
      <StyledTouchableOpacity
        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center active:bg-blue-700"
        onPress={pickImage}
        disabled={uploading}
      >
        <Upload size={16} className="text-white" />
      </StyledTouchableOpacity>
      
      {uploading && (
        <StyledView className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <StyledActivityIndicator size="large" color="#ffffff" />
        </StyledView>
      )}
    </StyledView>
  );
};

export default ProfilePhotoUpload;
