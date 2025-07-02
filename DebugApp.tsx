import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const DebugApp = () => {
  console.log('DebugApp rendering...');
  
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>🎉 GoodDeeds VPN</Text>
        <Text style={styles.subtitle}>React Native App Working!</Text>
        <Text style={styles.debug}>Debug Mode - App Loaded Successfully</Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Test Button</Text>
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>✅ App bundled successfully</Text>
          <Text style={styles.infoText}>✅ Screen is rendering</Text>
          <Text style={styles.infoText}>✅ SDK 53 compatible</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  debug: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#16a34a',
    textAlign: 'center',
  },
});

export default DebugApp;