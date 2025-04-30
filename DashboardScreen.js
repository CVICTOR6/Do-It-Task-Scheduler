import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen({ navigation }) {
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [categoryStats, setCategoryStats] = useState({});
  const [priorityStats, setPriorityStats] = useState({});
  const [frequencyStats, setFrequencyStats] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [tasks, setTasks] = useState([]);

  const spinAnim = new Animated.Value(0);

  useEffect(() => {
    loadStats();
    getUser();
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const getUser = async () => {
    const email = await AsyncStorage.getItem('loggedInUser');
    setUserEmail(email || 'User');
  };

  const loadStats = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    const parsed = stored ? JSON.parse(stored) : [];
    setTasks(parsed);
    setTaskCount(parsed.length);
    setCompletedCount(parsed.filter(t => t.status === 'Completed').length);
    setPendingCount(parsed.filter(t => t.status === 'Pending').length);

    const cat = {},
      pri = {},
      freq = {};
    parsed.forEach(task => {
      cat[task.category] = (cat[task.category] || 0) + 1;
      pri[task.priority] = (pri[task.priority] || 0) + 1;
      freq[task.frequency] = (freq[task.frequency] || 0) + 1;
    });
    setCategoryStats(cat);
    setPriorityStats(pri);
    setFrequencyStats(freq);
  };

  const handleClearTasks = () => {
    Alert.alert('Clear All Tasks', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('tasks');
          loadStats();
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('loggedInUser');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const renderStatsBlock = (title, statsObj, icon) => {
    const statsArray = Object.entries(statsObj);
    const total = statsArray.reduce((sum, [, value]) => sum + value, 0);

    const colorMap =
      title === 'Category'
        ? {
            Professional: '#1A3C5E',
            Educational: '#40C4FF',
            Leisure: '#B2DFDB',
            default: '#E0F7FA',
          }
        : title === 'Priority'
        ? {
            High: '#1A3C5E',
            Medium: '#40C4FF',
            Low: '#B2DFDB',
            default: '#E0F7FA',
          }
        : {
            Daily: '#2E7D32',
            Weekly: '#81C784',
            Monthly: '#A5D6A7',
            default: '#E8F5E9',
          };

    return (
      <View style={styles.blockBox}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>{title}</Text>
          <Ionicons name={icon} size={20} color="#2E7D32" />
        </View>
        {statsArray.length > 0 ? (
          <View style={styles.donutContainer}>
            <View style={styles.donutChartWrapper}>
              {statsArray.slice(0, 4).map(([key, value], index) => (
                <AnimatedCircularProgress
                  key={key}
                  size={150 - index * 20}
                  width={10}
                  fill={(value / total) * 100}
                  tintColor={colorMap[key] || colorMap.default}
                  backgroundColor="rgba(200, 200, 255, 0.1)"
                  style={styles.donutRing}
                >
                  {() => <Text style={styles.donutCenterText}>{index === 0 ? total : ''}</Text>}
                </AnimatedCircularProgress>
              ))}
            </View>
            <View style={styles.donutLabels}>
              {statsArray.slice(0, 4).map(([key, value]) => (
                <View key={key} style={styles.labelRow}>
                  <View style={[styles.labelColor, { backgroundColor: colorMap[key] || colorMap.default }]} />
                  <Text style={styles.labelText}>{`${key}: ${value}`}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.greetingContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={36} color="#2E7D32" />
          </View>
        </TouchableOpacity>
        <View style={styles.greetingText}>
          <Text style={styles.greeting}>Hello, {userEmail.split('@')[0]} 👋</Text>
          <Text style={styles.subtext}>Your productivity summary</Text>
        </View>
      </LinearGradient>

      <View style={styles.analyticsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('TaskListScreen', { filter: 'All' })}>
          <AnimatedCircularProgress size={80} width={8} fill={taskCount ? 100 : 0} tintColor="#40C4FF" backgroundColor="#E0F7FA">
            {() => <Text style={styles.statNumber}>{taskCount}</Text>}
          </AnimatedCircularProgress>
          <Text style={styles.statLabel}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('TaskListScreen', { filter: 'Pending' })}>
          <AnimatedCircularProgress size={80} width={8} fill={(pendingCount / taskCount) * 100 || 0} tintColor="#B2DFDB" backgroundColor="#E0F7FA">
            {() => <Text style={styles.statNumber}>{pendingCount}</Text>}
          </AnimatedCircularProgress>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('TaskListScreen', { filter: 'Completed' })}>
          <AnimatedCircularProgress size={80} width={8} fill={(completedCount / taskCount) * 100 || 0} tintColor="#2E7D32" backgroundColor="#E8F5E9">
            {() => <Text style={styles.statNumber}>{completedCount}</Text>}
          </AnimatedCircularProgress>
          <Text style={styles.statLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      {renderStatsBlock('Category', categoryStats, 'book-outline')}
      {renderStatsBlock('Priority', priorityStats, 'alert-circle-outline')}
      {renderStatsBlock('Frequency', frequencyStats, 'repeat-outline')}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearTasks}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('CreateTask')}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexGrow: 1,
    backgroundColor: '#FFFFFF', // Changed to white
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#1A3C5E',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A3C5E',
  },
  subtext: {
    fontSize: 14,
    color: '#757575',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statCard: {
    alignItems: 'center',
    width: '30%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 15,
    borderColor: '#1A3C5E',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A3C5E',
  },
  statLabel: {
    fontSize: 14,
    color: '#1A3C5E',
    marginTop: 6,
    fontWeight: '500',
  },
  blockBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderColor: '#1A3C5E',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blockTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1A3C5E',
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutChartWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutRing: {
    position: 'absolute',
  },
  donutCenterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A3C5E',
  },
  donutLabels: {
    flex: 1,
    marginLeft: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  labelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A3C5E',
  },
  noDataText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#1A3C5E',
    padding: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#757575',
    padding: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});