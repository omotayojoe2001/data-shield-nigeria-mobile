import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, ShieldCheck, TrendingDown, BarChart3, User, Settings, Wallet, Gift, ChevronRight } from 'lucide-react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { vpnService } from '../services/vpnService';
import { planService } from '../services/planService';
import { bonusService } from '../services/bonusService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, profile, wallet } = useAuth();
  const { theme } = useTheme();
  const [vpnStats, setVpnStats] = useState(vpnService.getStats());
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [bonusInfo, setBonusInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const loadData = async () => {
    try {
      const [plan, bonus] = await Promise.all([
        planService.getCurrentPlan(),
        bonusService.getBonusInfo()
      ]);
      setCurrentPlan(plan);
      setBonusInfo(bonus);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    const handlePlanUpdate = () => loadData();
    const handleVpnUpdate = () => setVpnStats(vpnService.getStats());
    
    if (typeof window !== 'undefined') {
      window.addEventListener('plan-updated', handlePlanUpdate);
      window.addEventListener('vpn-data-usage', handleVpnUpdate);
      
      return () => {
        window.removeEventListener('plan-updated', handlePlanUpdate);
        window.removeEventListener('vpn-data-usage', handleVpnUpdate);
      };
    }
  }, []);

  const handleVpnToggle = async () => {
    setConnecting(true);
    try {
      if (vpnStats.isConnected) {
        await vpnService.disconnect();
      } else {
        const result = await vpnService.connect();
        if (!result.success) {
          console.error('VPN connection failed:', result.error);
        }
      }
      setVpnStats(vpnService.getStats());
    } catch (error) {
      console.error('VPN toggle error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDataUsage = (mb: number) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  const getStatusColor = () => {
    if (connecting) return '#f59e0b';
    return vpnStats.isConnected ? '#10b981' : '#ef4444';
  };

  const getStatusText = () => {
    if (connecting) return 'Connecting...';
    return vpnStats.isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={theme === 'dark' ? ['#1f2937', '#111827'] : ['#1e40af', '#2563eb']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
              </Text>
              <Text style={styles.subGreeting}>
                {vpnStats.isConnected ? 'Your connection is secure' : 'Tap to connect securely'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* VPN Status Card */}
        <View style={styles.vpnCard}>
          <View style={styles.vpnHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
            <Text style={styles.location}>{vpnStats.location}</Text>
          </View>

          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: getStatusColor() }]}
            onPress={handleVpnToggle}
            disabled={connecting}
          >
            <View style={styles.connectButtonContent}>
              {vpnStats.isConnected ? (
                <ShieldCheck size={32} color="#ffffff" />
              ) : (
                <Shield size={32} color="#ffffff" />
              )}
              <Text style={styles.connectButtonText}>
                {connecting ? 'Connecting...' : vpnStats.isConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </View>
          </TouchableOpacity>

          {vpnStats.isConnected && (
            <View style={styles.speedInfo}>
              <View style={styles.speedItem}>
                <TrendingDown size={16} color="#10b981" />
                <Text style={styles.speedText}>{vpnStats.downloadSpeed} Mbps</Text>
              </View>
              <View style={styles.speedItem}>
                <TrendingDown size={16} color="#3b82f6" style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.speedText}>{vpnStats.uploadSpeed} Mbps</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDataUsage(vpnStats.dataUsed)}</Text>
            <Text style={styles.statLabel}>Data Used</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDataUsage(vpnStats.dataSaved)}</Text>
            <Text style={styles.statLabel}>Data Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vpnService.getSavingsPercentage()}%</Text>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
        </View>

        {/* Current Plan */}
        {currentPlan && (
          <TouchableOpacity style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Current Plan</Text>
              <ChevronRight size={20} color="#6b7280" />
            </View>
            <Text style={styles.planType}>{currentPlan.plan_type?.toUpperCase()}</Text>
            {currentPlan.data_allocated > 0 && (
              <View style={styles.planProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentPlan.data_used / currentPlan.data_allocated) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.planUsage}>
                  {formatDataUsage(currentPlan.data_used)} / {formatDataUsage(currentPlan.data_allocated)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Wallet Balance */}
        <TouchableOpacity 
          style={styles.walletCard}
          onPress={() => navigation.navigate('Wallet' as never)}
        >
          <View style={styles.walletHeader}>
            <Wallet size={24} color="#10b981" />
            <Text style={styles.walletTitle}>Wallet Balance</Text>
          </View>
          <Text style={styles.walletBalance}>
            ₦{((wallet?.balance || 0) / 100).toFixed(2)}
          </Text>
        </TouchableOpacity>

        {/* Daily Bonus */}
        {bonusInfo?.canClaim && (
          <TouchableOpacity 
            style={styles.bonusCard}
            onPress={() => navigation.navigate('Plans' as never)}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.bonusGradient}
            >
              <View style={styles.bonusContent}>
                <Gift size={24} color="#ffffff" />
                <View style={styles.bonusText}>
                  <Text style={styles.bonusTitle}>Daily Bonus Available!</Text>
                  <Text style={styles.bonusSubtitle}>
                    Claim your 200MB bonus now
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Plans' as never)}
          >
            <BarChart3 size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Usage' as never)}
          >
            <BarChart3 size={24} color="#10b981" />
            <Text style={styles.actionText}>Usage</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <User size={24} color="#8b5cf6" />
            <Text style={styles.actionText}>Profile</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subGreeting: {
    fontSize: 16,
    color: '#bfdbfe',
    marginTop: 4,
  },
  vpnCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vpnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  connectButton: {
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonContent: {
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  speedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  speedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  planCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  planType: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  planProgress: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  planUsage: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  walletCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  bonusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bonusGradient: {
    padding: 20,
  },
  bonusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusText: {
    marginLeft: 12,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bonusSubtitle: {
    fontSize: 14,
    color: '#fef3c7',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default HomeScreen;
