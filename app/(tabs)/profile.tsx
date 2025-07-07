import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Settings, HelpCircle, LogOut, Moon, Sun, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Toast.show({
                type: 'success',
                text1: 'Signed out successfully',
              });
              router.replace('/');
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error signing out',
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: <Settings color={isDark ? "#d1d5db" : "#6b7280"} size={20} />,
      title: 'Account Settings',
      subtitle: 'Manage your account preferences',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Account settings will be available soon',
        });
      },
    },
    {
      icon: <Shield color={isDark ? "#d1d5db" : "#6b7280"} size={20} />,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Privacy settings will be available soon',
        });
      },
    },
    {
      icon: theme === 'dark' ? 
        <Sun color={isDark ? "#d1d5db" : "#6b7280"} size={20} /> : 
        <Moon color={isDark ? "#d1d5db" : "#6b7280"} size={20} />,
      title: 'Theme',
      subtitle: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
      onPress: toggleTheme,
    },
    {
      icon: <HelpCircle color={isDark ? "#d1d5db" : "#6b7280"} size={20} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Help & support will be available soon',
        });
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Profile</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            Manage your account and preferences
          </Text>
        </View>

        {/* User Info Card */}
        <View style={[styles.userCard, isDark && styles.darkCard]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, isDark && styles.darkAvatar]}>
              <User color={isDark ? "#111827" : "#ffffff"} size={32} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, isDark && styles.darkText]}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={[styles.userEmail, isDark && styles.darkSubtitle]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, isDark && styles.darkCard]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemTitle, isDark && styles.darkText]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, isDark && styles.darkSubtitle]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={[styles.signOutButton, isDark && styles.darkSignOutButton]}
            onPress={handleSignOut}
          >
            <LogOut color="#dc2626" size={20} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, isDark && styles.darkSubtitle]}>
            GoodDeeds VPN v1.0.0
          </Text>
          <Text style={[styles.appInfoText, isDark && styles.darkSubtitle]}>
            © 2024 GoodDeeds. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  userCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  darkAvatar: {
    backgroundColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSignOutButton: {
    backgroundColor: '#1f2937',
    borderColor: '#7f1d1d',
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#d1d5db',
  },
});