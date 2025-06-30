
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const PlansScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#ffffff' : '#1f2937' }]}>
          Plans & Pricing
        </Text>
        <Text style={[styles.subtitle, { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
          Choose the perfect plan for your needs
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PlansScreen;
