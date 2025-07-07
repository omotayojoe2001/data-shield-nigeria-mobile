import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Mock Authentication Context
const AuthContext = React.createContext({
  user: null,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  loading: false,
});

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ email, id: '1' });
      setLoading(false);
    }, 1000);
  };

  const signUp = async (email, password) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ email, id: '1' });
      setLoading(false);
    }, 1000);
  };

  const signOut = () => {
    setUser(null);
  };

  return { user, signIn, signUp, signOut, loading };
};

// Home Screen
const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🎉 GoodDeeds VPN</Text>
        <Text style={styles.subtitle}>Secure, Fast & Reliable</Text>
      </View>
      
      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={40} color="#16a34a" />
          <Text style={styles.featureTitle}>Secure Connection</Text>
          <Text style={styles.featureText}>Military-grade encryption</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="flash" size={40} color="#2563eb" />
          <Text style={styles.featureTitle}>Lightning Fast</Text>
          <Text style={styles.featureText}>High-speed servers worldwide</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="globe" size={40} color="#dc2626" />
          <Text style={styles.featureTitle}>Global Access</Text>
          <Text style={styles.featureText}>Access content anywhere</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.getStartedButton}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// Auth Screen
const AuthScreen = () => {
  const { signIn, signUp, loading } = React.useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (isLogin) {
      signIn(email, password);
    } else {
      signUp(email, password);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.authButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Dashboard Screen
const DashboardScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [dataUsed, setDataUsed] = useState(245);
  const [dataLimit] = useState(1000);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Ionicons name="notifications-outline" size={24} color="#6b7280" />
        </View>
        
        <View style={styles.connectionCard}>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#16a34a' : '#dc2626' }]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.connectButton, { backgroundColor: isConnected ? '#dc2626' : '#16a34a' }]}
            onPress={() => setIsConnected(!isConnected)}
          >
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Data Usage</Text>
          <Text style={styles.statsValue}>{dataUsed} MB / {dataLimit} MB</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${(dataUsed/dataLimit) * 100}%` }]} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Wallet Screen
const WalletScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.walletContainer}>
      <Ionicons name="wallet" size={64} color="#16a34a" />
      <Text style={styles.title}>Wallet Balance</Text>
      <Text style={styles.balance}>₦250.00</Text>
      <Text style={styles.balanceSubtitle}>Available for VPN usage</Text>
      
      <TouchableOpacity style={styles.button}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.buttonText}>Top Up Wallet</Text>
      </TouchableOpacity>
      
      <View style={styles.quickAmounts}>
        {[100, 500, 1000, 2000].map((amount) => (
          <TouchableOpacity key={amount} style={styles.amountButton}>
            <Text style={styles.amountText}>₦{amount}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </SafeAreaView>
);

// Profile Screen
const ProfileScreen = () => {
  const { user, signOut } = React.useContext(AuthContext);
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle" size={100} color="#2563eb" />
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        
        <View style={styles.profileOptions}>
          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="person" size={24} color="#6b7280" />
            <Text style={styles.profileOptionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="notifications" size={24} color="#6b7280" />
            <Text style={styles.profileOptionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="help-circle" size={24} color="#6b7280" />
            <Text style={styles.profileOptionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileOption} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="#dc2626" />
            <Text style={[styles.profileOptionText, { color: '#dc2626' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Dashboard Tab Navigator
const DashboardTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main Navigator
const MainNavigator = () => {
  const { user } = React.useContext(AuthContext);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={DashboardTabs} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  const auth = useAuth();
  
  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={auth}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  features: {
    marginVertical: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    color: '#2563eb',
    textAlign: 'center',
    fontSize: 14,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  connectionCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  connectButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  walletContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  balance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#16a34a',
    marginVertical: 16,
  },
  balanceSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  amountButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  amountText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
  },
  profileOptions: {
    width: '100%',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
  },
});