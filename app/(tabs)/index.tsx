import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Shield, Wifi, WifiOff, Zap, Clock, MapPin } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const [dataSaved, setDataSaved] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setConnectionTime(prev => prev + 1);
        setDataUsed(prev => prev + Math.random() * 0.1);
        setDataSaved(prev => prev + Math.random() * 0.3);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = () => {
    if (Platform.OS !== 'web') {
      // Only use haptics on mobile
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available
      }
    }

    setIsConnected(!isConnected);
    if (!isConnected) {
      Toast.show({
        type: 'success',
        text1: 'VPN Connected',
        text2: 'Your connection is now secure',
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'VPN Disconnected',
        text2: 'Connection ended',
      });
      setConnectionTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, isDark && styles.darkText]}>
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            Your VPN status
          </Text>
        </View>

        {/* Connection Status */}
        <View style={[styles.statusCard, isDark && styles.darkCard]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]}>
              {isConnected ? (
                <Wifi color="#ffffff" size={24} />
              ) : (
                <WifiOff color="#ffffff" size={24} />
              )}
            </View>
            <View style={styles.statusText}>
              <Text style={[styles.statusTitle, isDark && styles.darkText]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
              <Text style={[styles.statusSubtitle, isDark && styles.darkSubtitle]}>
                {isConnected ? 'Nigeria - Lagos' : 'Tap to connect'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.connectButton, isConnected ? styles.disconnectButton : styles.connectButtonActive]}
            onPress={handleConnect}
          >
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, isDark && styles.darkCard]}>
            <Clock color="#2563eb" size={24} />
            <Text style={[styles.statValue, isDark && styles.darkText]}>
              {formatTime(connectionTime)}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.darkSubtitle]}>
              Session Time
            </Text>
          </View>

          <View style={[styles.statCard, isDark && styles.darkCard]}>
            <Zap color="#16a34a" size={24} />
            <Text style={[styles.statValue, isDark && styles.darkText]}>
              {dataSaved.toFixed(1)} MB
            </Text>
            <Text style={[styles.statLabel, isDark && styles.darkSubtitle]}>
              Data Saved
            </Text>
          </View>

          <View style={[styles.statCard, isDark && styles.darkCard]}>
            <Shield color="#dc2626" size={24} />
            <Text style={[styles.statValue, isDark && styles.darkText]}>
              {dataUsed.toFixed(1)} MB
            </Text>
            <Text style={[styles.statLabel, isDark && styles.darkSubtitle]}>
              Data Used
            </Text>
          </View>

          <View style={[styles.statCard, isDark && styles.darkCard]}>
            <MapPin color="#7c3aed" size={24} />
            <Text style={[styles.statValue, isDark && styles.darkText]}>
              Lagos
            </Text>
            <Text style={[styles.statLabel, isDark && styles.darkSubtitle]}>
              Server Location
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Quick Actions
          </Text>
          
          <TouchableOpacity style={[styles.actionCard, isDark && styles.darkCard]}>
            <Shield color="#2563eb" size={20} />
            <Text style={[styles.actionText, isDark && styles.darkText]}>
              Change Server Location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, isDark && styles.darkCard]}>
            <Zap color="#16a34a" size={20} />
            <Text style={[styles.actionText, isDark && styles.darkText]}>
              Enable Data Compression
            </Text>
          </TouchableOpacity>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  connected: {
    backgroundColor: '#16a34a',
  },
  disconnected: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  connectButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectButtonActive: {
    backgroundColor: '#2563eb',
  },
  disconnectButton: {
    backgroundColor: '#dc2626',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#d1d5db',
  },
});