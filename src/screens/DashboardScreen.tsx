import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Shield, Zap, Wallet, Settings, LogOut, Power } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { vpnService } from '../services/vpnService';
import Toast from 'react-native-toast-message';

const DashboardScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVpnStats(vpnService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleVPNToggle = async () => {
    setConnecting(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
        Toast.show({
          type: 'info',
          text1: 'VPN Disconnected',
        });
      } else {
        const result = await vpnService.connect();
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'VPN Connected',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: result.error || 'Failed to connect',
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Connection failed',
      });
    } finally {
      setConnecting(false);
    }
  };

  const formatData = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Shield color="#2563eb" size={32} />
            <Text style={styles.logo}>GoodDeeds VPN</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Settings color="#6b7280" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
              <LogOut color="#6b7280" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* VPN Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield 
                color={vpnStats.isConnected ? '#16a34a' : '#ef4444'} 
                size={24} 
              />
              <Text style={styles.cardTitle}>VPN Status</Text>
            </View>
            <View style={styles.vpnStatusContent}>
              <Text style={[
                styles.vpnStatus,
                vpnStats.isConnected ? styles.connected : styles.disconnected
              ]}>
                {vpnStats.isConnected ? 'Connected' : 'Disconnected'}
              </Text>
              {vpnStats.isConnected && (
                <Text style={styles.vpnLocation}>{vpnStats.location}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.vpnButton,
                  vpnStats.isConnected ? styles.disconnectButton : styles.connectButton,
                  connecting && styles.disabledButton
                ]}
                onPress={handleVPNToggle}
                disabled={connecting}
              >
                <Power color="#ffffff" size={20} />
                <Text style={styles.vpnButtonText}>
                  {connecting ? 'Connecting...' : (vpnStats.isConnected ? 'Disconnect' : 'Connect')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Data Usage */}
            <View style={styles.statsCard}>
              <View style={styles.cardHeader}>
                <Zap color="#2563eb" size={20} />
                <Text style={styles.cardTitle}>Data Usage</Text>
              </View>
              <View style={styles.statsContent}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Used: {formatData(vpnStats.dataUsed)}</Text>
                  <Text style={styles.statLabel}>Saved: {formatData(vpnStats.dataSaved)}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '30%' }]} />
                </View>
                <Text style={styles.statInfo}>
                  {vpnService.getSavingsPercentage()}% data saved
                </Text>
              </View>
            </View>

            {/* Wallet Balance */}
            <View style={styles.statsCard}>
              <View style={styles.cardHeader}>
                <Wallet color="#16a34a" size={20} />
                <Text style={styles.cardTitle}>Wallet</Text>
              </View>
              <View style={styles.walletContent}>
                <Text style={styles.walletBalance}>₦250.00</Text>
                <TouchableOpacity
                  style={styles.topUpButton}
                  onPress={() => navigation.navigate('Wallet')}
                >
                  <Text style={styles.topUpButtonText}>Top Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Speed Test */}
          {vpnStats.isConnected && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Connection Speed</Text>
              <View style={styles.speedContent}>
                <View style={styles.speedItem}>
                  <Text style={styles.speedLabel}>Download</Text>
                  <Text style={styles.speedValue}>{vpnStats.downloadSpeed} Mbps</Text>
                </View>
                <View style={styles.speedItem}>
                  <Text style={styles.speedLabel}>Upload</Text>
                  <Text style={styles.speedValue}>{vpnStats.uploadSpeed} Mbps</Text>
                </View>
              </View>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  iconButton: {
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111827',
  },
  vpnStatusContent: {
    alignItems: 'center',
    gap: 12,
  },
  vpnStatus: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  connected: {
    color: '#16a34a',
  },
  disconnected: {
    color: '#ef4444',
  },
  vpnLocation: {
    fontSize: 16,
    color: '#6b7280',
  },
  vpnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#16a34a',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    opacity: 0.6,
  },
  vpnButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContent: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  statInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  walletContent: {
    alignItems: 'center',
    gap: 12,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  topUpButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topUpButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  speedContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  speedItem: {
    alignItems: 'center',
    gap: 8,
  },
  speedLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  speedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default DashboardScreen;