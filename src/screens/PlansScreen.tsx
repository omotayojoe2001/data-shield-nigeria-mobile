
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { planService } from '../services/planService';
import { bonusService } from '../services/bonusService';

interface PlansScreenProps {
  onTabChange: (tab: string) => void;
}

const PlansScreen = ({ onTabChange }: PlansScreenProps) => {
  const { theme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [bonusInfo, setBonusInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [plan, bonus] = await Promise.all([
        planService.getCurrentPlan(),
        bonusService.getBonusInfo()
      ]);
      setCurrentPlan(plan);
      setBonusInfo(bonus);
    } catch (error) {
      console.error('Error loading plans data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimBonus = async () => {
    if (!bonusInfo?.canClaim) return;
    
    setLoading(true);
    try {
      const result = await bonusService.claimDailyBonus();
      if (result.success) {
        Alert.alert('Success', result.message);
        await loadData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to claim bonus');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateWelcomeBonus = async () => {
    setLoading(true);
    try {
      const result = await planService.activateWelcomeBonus();
      if (result.success) {
        Alert.alert('Success', result.message);
        await loadData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to activate welcome bonus');
    } finally {
      setLoading(false);
    }
  };

  const formatDataUsage = (mb: number) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={theme === 'dark' ? ['#1f2937', '#111827'] : ['#1e40af', '#2563eb']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Data Plans</Text>
          <Text style={styles.headerSubtitle}>Choose the perfect plan for your needs</Text>
        </LinearGradient>

        {/* Current Plan */}
        {currentPlan && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Current Plan</Text>
              <TouchableOpacity onPress={() => onTabChange('current-plan')}>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.currentPlanType}>{currentPlan.plan_type?.toUpperCase()}</Text>
            {currentPlan.data_allocated > 0 && (
              <View style={styles.planProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((currentPlan.data_used / currentPlan.data_allocated) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.planUsage}>
                  {formatDataUsage(currentPlan.data_used)} / {formatDataUsage(currentPlan.data_allocated)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Daily Bonus */}
        {bonusInfo && (
          <View style={styles.bonusSection}>
            <Text style={styles.sectionTitle}>Daily Bonus</Text>
            {bonusInfo.canClaim ? (
              <TouchableOpacity 
                style={styles.bonusCard}
                onPress={handleClaimBonus}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.bonusGradient}
                >
                  <View style={styles.bonusContent}>
                    <Ionicons name="gift" size={32} color="#ffffff" />
                    <View style={styles.bonusText}>
                      <Text style={styles.bonusTitle}>Claim 200MB Bonus!</Text>
                      <Text style={styles.bonusSubtitle}>
                        Day {bonusInfo.daysClaimed + 1} of 7
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.bonusCard}>
                <View style={styles.bonusDisabled}>
                  <Ionicons name="gift" size={32} color="#9ca3af" />
                  <View style={styles.bonusText}>
                    <Text style={styles.bonusDisabledTitle}>
                      {bonusInfo.daysClaimed >= 7 ? 'Bonus Complete' : 'Bonus Claimed'}
                    </Text>
                    <Text style={styles.bonusDisabledSubtitle}>
                      {bonusInfo.daysClaimed >= 7 ? 'All 7 days claimed' : 'Come back tomorrow'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Available Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          
          {/* Free Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Welcome Bonus</Text>
              <Text style={styles.planPrice}>FREE</Text>
            </View>
            <Text style={styles.planDescription}>
              Get 200MB daily for 7 days as a new user
            </Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>200MB per day</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>7 days validity</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>Daily bonus claims</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.planButton}
              onPress={handleActivateWelcomeBonus}
              disabled={loading}
            >
              <Text style={styles.planButtonText}>Activate Now</Text>
            </TouchableOpacity>
          </View>

          {/* Pay as You Go */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Pay as You Go</Text>
              <Text style={styles.planPrice}>₦0.20/MB</Text>
            </View>
            <Text style={styles.planDescription}>
              Pay only for what you use with no expiry
            </Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>No expiry date</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>Pay per usage</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>Full control</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.planButton}
              onPress={() => onTabChange('wallet')}
            >
              <Text style={styles.planButtonText}>Top Up Wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Data Plans */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Buy Data</Text>
              <Text style={styles.planPrice}>From ₦50</Text>
            </View>
            <Text style={styles.planDescription}>
              Purchase data bundles at discounted rates
            </Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>30 days validity</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>Better rates</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.planFeatureText}>Bulk savings</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.planButton}
              onPress={() => Alert.alert('Coming Soon', 'Data bundle purchase will be available soon!')}
            >
              <Text style={styles.planButtonText}>View Bundles</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  currentPlanCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  currentPlanType: {
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
  bonusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  bonusCard: {
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
  bonusDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  bonusText: {
    marginLeft: 16,
    flex: 1,
  },
  bonusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bonusSubtitle: {
    fontSize: 14,
    color: '#fef3c7',
    marginTop: 2,
  },
  bonusDisabledTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  bonusDisabledSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  plansSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlansScreen;
