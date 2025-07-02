
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ WORKING!</Text>
      <Text style={styles.subtitle}>GoodDeeds VPN Mobile</Text>
      <Text style={styles.info}>React Native - SDK 53</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: '#bfdbfe',
  },
});

export default App;
