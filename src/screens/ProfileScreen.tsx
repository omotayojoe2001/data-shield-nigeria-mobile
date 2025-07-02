import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { ArrowLeft, User, Shield, Bell, Edit, Check, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
  });

  const handleSave = () => {
    // Here you would normally save to database
    setEditing(false);
    Toast.show({
      type: 'success',
      text1: 'Profile updated successfully!',
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setProfile({
      fullName: '',
      phone: '',
    });
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available soon. You can reset your password from the login screen.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#6b7280" size={24} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? (
              <Check color="#16a34a" size={24} />
            ) : (
              <Edit color="#6b7280" size={24} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Profile Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User color="#2563eb" size={24} />
              <Text style={styles.cardTitle}>Profile Information</Text>
              {editing && (
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <X color="#ef4444" size={20} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.cardSubtitle}>Manage your account details</Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={user?.email || ''}
                  editable={false}
                />
                <Text style={styles.inputHelp}>Email cannot be changed</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, !editing && styles.disabledInput]}
                  value={profile.fullName}
                  onChangeText={(text) => setProfile({...profile, fullName: text})}
                  placeholder="Enter your full name"
                  editable={editing}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.input, !editing && styles.disabledInput]}
                  value={profile.phone}
                  onChangeText={(text) => setProfile({...profile, phone: text})}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={editing}
                />
              </View>
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield color="#ef4444" size={24} />
              <Text style={styles.cardTitle}>Security Settings</Text>
            </View>
            <Text style={styles.cardSubtitle}>Manage your account security</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.actionButtonText}>Change Password</Text>
              <ArrowLeft 
                color="#6b7280" 
                size={16} 
                style={styles.actionButtonIcon} 
              />
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Bell color="#f59e0b" size={24} />
              <Text style={styles.cardTitle}>Notifications</Text>
            </View>
            <Text style={styles.cardSubtitle}>Manage your notification preferences</Text>

            <View style={styles.notificationSettings}>
              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>VPN Status Updates</Text>
                  <Text style={styles.notificationDescription}>
                    Get notified when VPN connects or disconnects
                  </Text>
                </View>
                <View style={styles.switch}>
                  <Text style={styles.switchText}>Coming Soon</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>Data Usage Alerts</Text>
                  <Text style={styles.notificationDescription}>
                    Alerts when you reach data usage limits
                  </Text>
                </View>
                <View style={styles.switch}>
                  <Text style={styles.switchText}>Coming Soon</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>Wallet Balance</Text>
                  <Text style={styles.notificationDescription}>
                    Notifications for low wallet balance
                  </Text>
                </View>
                <View style={styles.switch}>
                  <Text style={styles.switchText}>Coming Soon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Information</Text>
            <View style={styles.appInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build</Text>
                <Text style={styles.infoValue}>2024.01.01</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111827',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  cancelButton: {
    padding: 4,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  inputHelp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  actionButtonIcon: {
    transform: [{ rotate: '180deg' }],
  },
  notificationSettings: {
    gap: 20,
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  switch: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  switchText: {
    fontSize: 12,
    color: '#6b7280',
  },
  appInfo: {
    gap: 12,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#374151',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ProfileScreen;