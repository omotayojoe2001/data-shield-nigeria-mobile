
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { User, Shield, Bell, Lock, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen = () => {
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme === 'dark' ? '#ffffff' : '#1f2937' }]}>
            Profile
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
            Manage your account settings
          </Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {profile?.full_name || 'User'}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email}
          </Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
          >
            <View style={styles.optionLeft}>
              <User size={24} color="#3b82f6" />
              <Text style={styles.optionText}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => Alert.alert('Coming Soon', 'Security settings will be available soon!')}
          >
            <View style={styles.optionLeft}>
              <Shield size={24} color="#10b981" />
              <Text style={styles.optionText}>Security</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
          >
            <View style={styles.optionLeft}>
              <Bell size={24} color="#f59e0b" />
              <Text style={styles.optionText}>Notifications</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
          >
            <View style={styles.optionLeft}>
              <Lock size={24} color="#8b5cf6" />
              <Text style={styles.optionText}>Privacy</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, styles.signOutOption]}
            onPress={handleSignOut}
          >
            <View style={styles.optionLeft}>
              <LogOut size={24} color="#ef4444" />
              <Text style={[styles.optionText, styles.signOutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  signOutOption: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ef4444',
  },
});

export default ProfileScreen;
