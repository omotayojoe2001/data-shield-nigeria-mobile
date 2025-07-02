
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const signIn = (email, password) => {
    // Simple demo sign in
    setUser({ email });
  };
  
  const signOut = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Home Screen
const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Ionicons name="shield-checkmark" size={64} color="#2563eb" />
      <Text style={styles.title}>GoodDeeds VPN</Text>
      <Text style={styles.subtitle}>Secure. Fast. Affordable.</Text>
      
      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Ionicons name="lock-closed" size={32} color="#2563eb" />
          <Text style={styles.featureTitle}>Secure & Private</Text>
          <Text style={styles.featureText}>Military-grade encryption keeps your data safe</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Ionicons name="flash" size={32} color="#16a34a" />
          <Text style={styles.featureTitle}>Data Compression</Text>
          <Text style={styles.featureText}>Save up to 70% on your data usage</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Ionicons name="cash" size={32} color="#ca8a04" />
          <Text style={styles.featureTitle}>Affordable Plans</Text>
          <Text style={styles.featureText}>Pay-as-you-go starting from ₦50/month</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth')}>
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

// Auth Screen
const AuthScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = () => {
    if (email && password) {
      signIn(email, password);
      Alert.alert('Success', `${isSignUp ? 'Account created' : 'Signed in'} successfully!`);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Ionicons name="shield-checkmark" size={64} color="#2563eb" />
        <Text style={styles.title}>Welcome to GoodDeeds VPN</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create a new account' : 'Sign in to your account'}
        </Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, !isSignUp && styles.activeTab]}
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, isSignUp && styles.activeTab]}
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Dashboard Screen
const DashboardScreen = () => {
  const { user } = useAuth();
  const [vpnConnected, setVpnConnected] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color="#2563eb" />
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        <View style={styles.vpnCard}>
          <Ionicons 
            name={vpnConnected ? "shield-checkmark" : "shield-outline"} 
            size={48} 
            color={vpnConnected ? "#16a34a" : "#ef4444"} 
          />
          <Text style={[styles.vpnStatus, vpnConnected ? styles.connected : styles.disconnected]}>
            {vpnConnected ? 'Connected' : 'Disconnected'}
          </Text>
          {vpnConnected && <Text style={styles.vpnLocation}>Nigeria - Lagos</Text>}
          
          <TouchableOpacity 
            style={[styles.vpnButton, vpnConnected ? styles.disconnectButton : styles.connectButton]}
            onPress={() => setVpnConnected(!vpnConnected)}
          >
            <Ionicons name="power" size={20} color="white" />
            <Text style={styles.buttonText}>
              {vpnConnected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color="#2563eb" />
            <Text style={styles.statTitle}>Data Usage</Text>
            <Text style={styles.statValue}>125 MB</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-down" size={24} color="#16a34a" />
            <Text style={styles.statTitle}>Data Saved</Text>
            <Text style={styles.statValue}>87 MB</Text>
            <Text style={styles.statLabel}>Saved (41%)</Text>
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
  const { user, signOut } = useAuth();
  
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
          
          <TouchableOpacity style={[styles.profileOption, styles.signOutOption]} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="#ef4444" />
            <Text style={[styles.profileOptionText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Tab Navigator
const DashboardTabs = () => (
  <Tab.Navigator 
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#6b7280',
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="shield-checkmark" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Wallet" 
      component={WalletScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="wallet" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App
const AppNavigator = () => {
  const { user } = useAuth();
  
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};

const App = () => (
  <AuthProvider>
    <StatusBar style="auto" />
    <AppNavigator />
  </AuthProvider>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#6b7280', marginBottom: 32, textAlign: 'center' },
  features: { width: '100%', marginBottom: 32 },
  featureCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  featureTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  featureText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  button: { backgroundColor: '#2563eb', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backText: { marginLeft: 8, color: '#6b7280', fontSize: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#ffffff' },
  tabText: { fontSize: 16, color: '#6b7280' },
  activeTabText: { color: '#111827', fontWeight: '600' },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  userEmail: { fontSize: 14, color: '#6b7280' },
  vpnCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%' },
  vpnStatus: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  connected: { color: '#16a34a' },
  disconnected: { color: '#ef4444' },
  vpnLocation: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  vpnButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, gap: 8 },
  connectButton: { backgroundColor: '#16a34a' },
  disconnectButton: { backgroundColor: '#ef4444' },
  statsRow: { flexDirection: 'row', gap: 16, width: '100%' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statTitle: { fontSize: 14, color: '#6b7280', marginTop: 8, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  walletContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  balance: { fontSize: 48, fontWeight: 'bold', color: '#16a34a', marginBottom: 8 },
  balanceSubtitle: { fontSize: 16, color: '#6b7280', marginBottom: 32 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  amountButton: { backgroundColor: '#f3f4f6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db' },
  amountText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  profileContainer: { flex: 1, alignItems: 'center', padding: 20 },
  profileEmail: { fontSize: 18, color: '#6b7280', marginBottom: 32 },
  profileOptions: { width: '100%' },
  profileOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  profileOptionText: { flex: 1, fontSize: 16, color: '#374151', marginLeft: 12 },
  signOutOption: { borderColor: '#fecaca', borderWidth: 1 },
  signOutText: { color: '#ef4444' },
});

export default App;
