import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

export default function ProfileScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState({ name: 'Hello', email: '' }); // <-- initialized email

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const email = await AsyncStorage.getItem('loggedInUser');
      if (email) {
        setUser(prev => ({ ...prev, email }));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);

  const clearData = async () => {
    Alert.alert('Clear All App Data?', 'This will reset everything!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.replace('Splash');
          } catch (error) {
            console.error('Failed to clear AsyncStorage:', error);
          }
        },
      },
    ]);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      navigation.replace('Login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="pencil-outline" size={22} color="#1A3C5E" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="key-outline" size={22} color="#1A3C5E" />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="moon-outline" size={22} color="#1A3C5E" />
          <Text style={styles.optionText}>Dark Mode</Text>
          <Switch style={styles.switch} value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color="#1A3C5E" />
          <Text style={styles.optionText}>Notifications</Text>
          <Switch
            style={styles.switch}
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.optionText}>{`App Version: ${Constants.expoConfig?.version || '1.0.0'}`}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Privacy Policy')}>
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Contact Support')}>
          <Text style={styles.optionText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.clearBtn} onPress={clearData}>
          <Text style={styles.clearText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFFFFF' },
  profileCard: { alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1A3C5E' },
  email: { fontSize: 14, color: '#757575', marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#1A3C5E',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#1A3C5E',
    flex: 1,
  },
  switch: { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  statText: { fontSize: 14, fontWeight: '600', color: '#1A3C5E' },
  badge: {
    backgroundColor: '#E0F7FA',
    padding: 8,
    marginTop: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3C5E',
  },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#1A3C5E' },
  clearBtn: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  clearText: { color: '#D32F2F', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});
