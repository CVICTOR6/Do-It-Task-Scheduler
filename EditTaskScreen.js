import React, { useEffect, useState } from 'react';
import { scheduleTaskNotification } from '../utils/notifications';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function EditTaskScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params;

  const [task, setTask] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = ['Educational', 'Leisure', 'Professional'];
  const priorities = ['High', 'Medium', 'Low'];
  const frequencies = ['Daily', 'Weekly', 'Monthly'];

  const priorityColorMap = {
    High: '#1A3C5E',    // Dark blue
    Medium: '#40C4FF',  // Light blue
    Low: '#B2DFDB',     // Light cyan
  };
  
  const categoryColorMap = {
    Educational: '#40C4FF',  // Light blue
    Leisure: '#B2DFDB',     // Light cyan
    Professional: '#1A3C5E', // Dark blue
  };
  
  const frequencyColorMap = {
    Daily: '#2E7D32',    // Green
    Weekly: '#81C784',   // Light green
    Monthly: '#A5D6A7',  // Lighter green
  };
  

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Educational':
        return <Ionicons name="book-outline" size={16} color="#fff" style={styles.icon} />;
      case 'Leisure':
        return <Ionicons name="game-controller-outline" size={16} color="#fff" style={styles.icon} />;
      case 'Professional':
        return <Ionicons name="briefcase-outline" size={16} color="#fff" style={styles.icon} />;
      default:
        return null;
    }
  };

  const getFrequencyIcon = (freq) => {
    switch (freq) {
      case 'Daily':
        return <MaterialIcons name="today" size={16} color="#fff" style={styles.icon} />;
      case 'Weekly':
        return <FontAwesome5 name="calendar-week" size={14} color="#fff" style={styles.icon} />;
      case 'Monthly':
        return <MaterialIcons name="date-range" size={16} color="#fff" style={styles.icon} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadTask = async () => {
      const stored = await AsyncStorage.getItem('tasks');
      const parsed = stored ? JSON.parse(stored) : [];
      const found = parsed.find(t => t.id === taskId);
      if (!found) {
        Alert.alert('Task not found');
        return;
      }
      setTask(found);
      setDate(new Date(found.date));
      setTime(new Date(`1970-01-01T${found.time}`));
    };
    loadTask();
  }, []);

  const handleSave = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    const parsed = stored ? JSON.parse(stored) : [];

    const updatedTask = {
      ...task,
      date: date.toDateString(),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = parsed.map(t => (t.id === task.id ? updatedTask : t));

    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
    await scheduleTaskNotification(updatedTask);

    Toast.show({ type: 'success', text1: 'Task updated!' });
    navigation.goBack();
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const current = selectedTime || time;
    setShowTimePicker(false);
    setTime(current);
  };

  if (!task) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Task</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={task.title}
        onChangeText={text => setTask({ ...task, title: text })}
        style={styles.input}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={task.description}
        onChangeText={text => setTask({ ...task, description: text })}
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipGroup}>
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setTask({ ...task, category: c })}
            style={[styles.chip, task.category === c && { backgroundColor: categoryColorMap[c] }]}
          >
            <Text style={[styles.chipText, task.category === c && { color: '#fff' }]}> 
              {task.category === c && getCategoryIcon(c)} {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipGroup}>
        {priorities.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setTask({ ...task, priority: p })}
            style={[styles.chip, task.priority === p && { backgroundColor: priorityColorMap[p] }]}
          >
            <Text style={[styles.chipText, task.priority === p && { color: '#fff' }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.chipGroup}>
        {frequencies.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setTask({ ...task, frequency: f })}
            style={[styles.chip, task.frequency === f && { backgroundColor: frequencyColorMap[f] }]}
          >
            <Text style={[styles.chipText, task.frequency === f && { color: '#fff' }]}> 
              {task.frequency === f && getFrequencyIcon(f)} {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
      )}

      <Text style={styles.label}>Time</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
        <Text style={styles.dateText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" display="default" onChange={onChangeTime} />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, flexGrow: 1, backgroundColor: '#FFFFFF' }, // White background
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1A3C5E' }, // Dark blue
  label: { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#1A3C5E' }, // Dark blue
  input: {
    backgroundColor: '#E0F7FA', // Light cyan
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#E0F7FA', // Light cyan
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  chipText: {
    color: '#1A3C5E', // Dark blue
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginRight: 6 },
  dateInput: {
    backgroundColor: '#E0F7FA', // Light cyan
    padding: 14,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  dateText: { fontSize: 16, color: '#1A3C5E' }, // Dark blue
  saveButton: {
    backgroundColor: '#2E7D32', // Green
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});