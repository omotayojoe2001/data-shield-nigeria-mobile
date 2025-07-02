
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple Home Screen
const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>🛡️ GoodDeeds VPN</Text>
      <Text style={styles.subtitle}>Secure. Fast. Affordable.</Text>
      
      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🔒 Secure & Private</Text>
          <Text style={styles.featureText}>Military-grade encryption</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>⚡ Data Compression</Text>
          <Text style={styles.featureText}>Save up to 70% on data usage</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// Auth Screen
const AuthScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.authContainer}>
      <Text style={styles.title}>Welcome Back</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.outlineButton]}>
        <Text style={[styles.buttonText, styles.outlineButtonText]}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// Dashboard Screen
const DashboardScreen = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.vpnCard}>
        <Text style={styles.vpnStatus}>🔴 Disconnected</Text>
        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.buttonText}>Connect VPN</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>150MB</Text>
          <Text style={styles.statLabel}>Used</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>45MB</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);

// Wallet Screen
const WalletScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.walletContainer}>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.balance}>₦250.00</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Top Up</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// Profile Screen
const ProfileScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.profileContainer}>
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.outlineButton]}>
        <Text style={[styles.buttonText, styles.outlineButtonText]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// Tab Navigator
const DashboardTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App
const App = () => (
  <NavigationContainer>
    <StatusBar style="auto" />
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={DashboardTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#6b7280', marginBottom: 32, textAlign: 'center' },
  features: { width: '100%', marginBottom: 32 },
  featureCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  featureTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  featureText: { fontSize: 14, color: '#6b7280' },
  button: { backgroundColor: '#2563eb', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2563eb' },
  outlineButtonText: { color: '#2563eb' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  vpnCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  vpnStatus: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  connectButton: { backgroundColor: '#16a34a', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8 },
  statsRow: { flexDirection: 'row', gap: 16, width: '100%' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6b7280' },
  walletContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  balance: { fontSize: 48, fontWeight: 'bold', color: '#16a34a', marginBottom: 32 },
  profileContainer: { flex: 1, justifyContent: 'center', padding: 20 },
});

export default App;
