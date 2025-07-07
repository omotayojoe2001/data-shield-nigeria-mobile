import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function UsageScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const usageData = [
    { day: 'Mon', used: 120, saved: 80 },
    { day: 'Tue', used: 95, saved: 65 },
    { day: 'Wed', used: 140, saved: 95 },
    { day: 'Thu', used: 110, saved: 75 },
    { day: 'Fri', used: 160, saved: 110 },
    { day: 'Sat', used: 200, saved: 140 },
    { day: 'Sun', used: 180, saved: 125 },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Data Usage</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            Track your data consumption and savings
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, isDark && styles.darkCard]}>
            <TrendingUp color="#16a34a" size={24} />
            <Text style={[styles.summaryValue, isDark && styles.darkText]}>
              690 MB
            </Text>
            <Text style={[styles.summaryLabel, isDark && styles.darkSubtitle]}>
              Total Saved
            </Text>
          </View>

          <View style={[styles.summaryCard, isDark && styles.darkCard]}>
            <TrendingDown color="#dc2626" size={24} />
            <Text style={[styles.summaryValue, isDark && styles.darkText]}>
              1.2 GB
            </Text>
            <Text style={[styles.summaryLabel, isDark && styles.darkSubtitle]}>
              Total Used
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.chartCard, isDark && styles.darkCard]}>
          <View style={styles.chartHeader}>
            <BarChart3 color="#2563eb" size={24} />
            <Text style={[styles.chartTitle, isDark && styles.darkText]}>
              Weekly Usage
            </Text>
          </View>
          
          <View style={styles.chart}>
            {usageData.map((item, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      styles.usedBar,
                      { height: (item.used / 200) * 100 }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.bar, 
                      styles.savedBar,
                      { height: (item.saved / 200) * 100 }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, isDark && styles.darkSubtitle]}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.usedColor]} />
              <Text style={[styles.legendText, isDark && styles.darkText]}>
                Data Used
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.savedColor]} />
              <Text style={[styles.legendText, isDark && styles.darkText]}>
                Data Saved
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={[styles.monthlyCard, isDark && styles.darkCard]}>
          <View style={styles.monthlyHeader}>
            <Calendar color="#7c3aed" size={24} />
            <Text style={[styles.monthlyTitle, isDark && styles.darkText]}>
              This Month
            </Text>
          </View>
          
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyValue, isDark && styles.darkText]}>
                3.2 GB
              </Text>
              <Text style={[styles.monthlyLabel, isDark && styles.darkSubtitle]}>
                Total Data Used
              </Text>
            </View>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyValue, isDark && styles.darkText]}>
                2.1 GB
              </Text>
              <Text style={[styles.monthlyLabel, isDark && styles.darkSubtitle]}>
                Total Data Saved
              </Text>
            </View>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyValue, isDark && styles.darkText]}>
                65%
              </Text>
              <Text style={[styles.monthlyLabel, isDark && styles.darkSubtitle]}>
                Compression Rate
              </Text>
            </View>
          </View>
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
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 8,
    gap: 2,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  usedBar: {
    backgroundColor: '#dc2626',
  },
  savedBar: {
    backgroundColor: '#16a34a',
  },
  dayLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  usedColor: {
    backgroundColor: '#dc2626',
  },
  savedColor: {
    backgroundColor: '#16a34a',
  },
  legendText: {
    fontSize: 14,
    color: '#111827',
  },
  monthlyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStat: {
    alignItems: 'center',
    flex: 1,
  },
  monthlyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#d1d5db',
  },
});