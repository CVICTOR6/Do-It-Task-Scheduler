import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable';

export default function TaskListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { filter } = route.params || { filter: 'All' };

  const [tasks, setTasks] = useState([]);
  const [backupTask, setBackupTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categoryMeta = {
    Educational: { color: '#40C4FF', icon: 'book-outline' },
    Leisure: { color: '#B2DFDB', icon: 'game-controller-outline' },
    Professional: { color: '#1A3C5E', icon: 'briefcase-outline' },
  };

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('tasks');
      const parsed = stored ? JSON.parse(stored) : [];
      const list = filter === 'All' ? parsed : parsed.filter(t => t.status === filter);
      setTasks(list);
    };
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const saveTasks = async (updated) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
    const list = filter === 'All' ? updated : updated.filter(t => t.status === filter);
    setTasks(list);
  };

  const deleteTask = async (taskToDelete) => {
    const stored = await AsyncStorage.getItem('tasks');
    const parsed = stored ? JSON.parse(stored) : [];
    const updated = parsed.filter(t => t.id !== taskToDelete.id);
    setBackupTask(taskToDelete);
    await saveTasks(updated);
    Toast.show({ type: 'info', text1: 'Task deleted', text2: 'Tap to undo ↓' });
  };

  const undoDelete = async () => {
    if (!backupTask) return;
    const stored = await AsyncStorage.getItem('tasks');
    const parsed = stored ? JSON.parse(stored) : [];
    const updated = [...parsed, backupTask];
    await saveTasks(updated);
    setBackupTask(null);
    Toast.show({ type: 'success', text1: 'Task restored' });
  };

  const toggleComplete = async (id) => {
    const stored = await AsyncStorage.getItem('tasks');
    const parsed = stored ? JSON.parse(stored) : [];
    const updated = parsed.map(t =>
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    );
    await saveTasks(updated);
    Toast.show({ type: 'success', text1: 'Task status updated' });
  };

  const filteredTasks = tasks
    .filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(t => {
      if (categoryFilter === 'All') return true;
      if (categoryFilter === 'Today') {
        const today = new Date().toDateString();
        return t.date === today;
      }
      if (categoryFilter === 'This Week') {
        const now = new Date();
        const taskDate = new Date(t.date);
        const diffDays = (taskDate - now) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (categoryFilter === 'This Month') {
        const now = new Date();
        const taskDate = new Date(t.date);
        return (
          taskDate.getMonth() === now.getMonth() &&
          taskDate.getFullYear() === now.getFullYear()
        );
      }
      return t.category === categoryFilter;
    });

  const renderItem = ({ item }) => {
    const statusColor = item.status === 'Completed' ? '#2E7D32' : '#B2DFDB';
    return (
      <Animatable.View animation="fadeInUp" duration={400}>
        <View style={[styles.card, { borderLeftColor: statusColor }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: categoryMeta[item.category]?.color || '#999' }]} />
              <View>
                <Text style={styles.taskTitle}>{item.title || 'Untitled Task'}</Text>
                <Text style={styles.taskDescription} numberOfLines={2} ellipsizeMode="tail">
                  {item.description || 'No description'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('EditTask', { taskId: item.id })}>
                <Ionicons name="create-outline" size={20} color="#1A3C5E" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Ionicons
                  name={item.status === 'Completed' ? 'refresh-outline' : 'checkmark-done-outline'}
                  size={20}
                  color={statusColor}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item)}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.metaRow}>
            {`${item.category || 'Uncategorized'}   ⭐ ${item.priority || '-'}   🔁 ${item.frequency || '-'}`}
          </Text>
          <Text style={styles.metaRow}>
            {`📅 ${item.date || 'No date'}   🕒 ${item.time || 'No time'}`}
          </Text>
        </View>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{filter} Tasks</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.categoryTabs}>
        {["All", "Today", "This Week", "This Month", "Educational", "Leisure", "Professional"].map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategoryFilter(cat)}
            style={[styles.tab, categoryFilter === cat && { backgroundColor: '#1A3C5E' }]}
          >
            <Text style={[styles.tabText, categoryFilter === cat && styles.activeTabText]}>
              {String(cat || '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredTasks.length === 0 ? (
        <Text style={styles.noData}>
          {`You have no ${(filter || 'All').toLowerCase()} tasks here.
Tap + to start adding one!`}
        </Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
      {backupTask && (
        <TouchableOpacity style={styles.undoBanner} onPress={undoDelete}>
          <Text style={styles.undoText}>Undo Delete</Text>
        </TouchableOpacity>
      )}
      {filter === 'All' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      <Toast />
    </View>
  );
}

// Styles remain unchanged



const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, flex: 1, backgroundColor: '#FFFFFF' }, // White background
  heading: { fontSize: 22, fontWeight: 'bold', color: '#1A3C5E', marginBottom: 10 }, // Dark blue
  searchInput: {
    backgroundColor: '#E0F7FA', // Light cyan
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  categoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    backgroundColor: '#E0F7FA', // Light cyan
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  tabText: { fontSize: 13, color: '#1A3C5E' }, // Dark blue
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftColor: '#B2DFDB', // Light cyan as default (overridden by statusColor)
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3C5E', // Dark blue
  },
  taskDescription: {
    fontSize: 14,
    color: '#757575', // Neutral gray
    marginTop: 2,
    maxWidth: 200,
  },
  actions: { flexDirection: 'row', gap: 10 },
  metaRow: { fontSize: 15, color: '#1A3C5E', marginTop: 6 }, // Dark blue
  noData: {
    textAlign: 'center',
    color: '#757575', // Neutral gray
    marginTop: 50,
    fontSize: 16,
    lineHeight: 22,
  },
  undoBanner: {
    backgroundColor: '#1A3C5E', // Dark blue
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  undoText: { color: '#fff', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2E7D32', // Green
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});