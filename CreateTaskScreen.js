import React, { useState } from 'react';
import { scheduleTaskNotification } from '../utils/notifications';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function CreateTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Educational');
  const [priority, setPriority] = useState('Medium');
  const [frequency, setFrequency] = useState('Daily');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [enableNotification, setEnableNotification] = useState(true); // ✅ Notification toggle

  const categories = ['Educational', 'Leisure', 'Professional'];
  const priorities = ['High', 'Medium', 'Low'];
  const frequencies = ['Daily', 'Weekly', 'Monthly'];

  const priorityColorMap = {
    High: '#1A3C5E',
    Medium: '#40C4FF',
    Low: '#B2DFDB',
  };

  const categoryColorMap = {
    Educational: '#40C4FF',
    Leisure: '#B2DFDB',
    Professional: '#1A3C5E',
  };

  const frequencyColorMap = {
    Daily: '#2E7D32',
    Weekly: '#81C784',
    Monthly: '#A5D6A7',
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

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const selected = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(selected);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Enter a title!');
      return;
    }

    const task = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description,
      category,
      priority,
      frequency,
      date: date.toDateString(),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
    };

    try {
      const existing = await AsyncStorage.getItem('tasks');
      const tasks = existing ? JSON.parse(existing) : [];
      const updated = [...tasks, task];
      await AsyncStorage.setItem('tasks', JSON.stringify(updated));

      if (enableNotification) {
        await scheduleTaskNotification(task); // ✅ Only schedule if enabled
      }

      navigation.navigate('Dashboard');
    } catch (error) {
      console.log('❌ Error saving task:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Task</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Enter task details"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipGroup}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && { backgroundColor: categoryColorMap[cat] }]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && { color: '#fff', flexDirection: 'row', alignItems: 'center' }]}>
              {category === cat && getCategoryIcon(cat)} {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipGroup}>
        {priorities.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, priority === p && { backgroundColor: priorityColorMap[p] }]}
            onPress={() => setPriority(p)}
          >
            <Text style={[styles.chipText, priority === p && { color: '#fff' }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.chipGroup}>
        {frequencies.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, frequency === f && { backgroundColor: frequencyColorMap[f] }]}
            onPress={() => setFrequency(f)}
          >
            <Text style={[styles.chipText, frequency === f && { color: '#fff', flexDirection: 'row', alignItems: 'center' }]}>
              {frequency === f && getFrequencyIcon(f)} {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Due Date</Text>
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

      {/* 🔔 Notification Toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Switch
          value={enableNotification}
          onValueChange={setEnableNotification}
          thumbColor={enableNotification ? '#2E7D32' : '#ccc'}
          trackColor={{ false: '#ccc', true: '#A5D6A7' }}
        />
        <Text style={{ marginLeft: 10, color: '#1A3C5E', fontWeight: '500' }}>
          Enable Reminder Notification
        </Text>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Create Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, backgroundColor: '#FFFFFF', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1A3C5E' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#1A3C5E' },
  input: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#1A3C5E',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A3C5E',
  },
  chipText: {
    color: '#1A3C5E',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  dateInput: {
    backgroundColor: '#E0F7FA',
    padding: 14,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1A3C5E',
  },
  dateText: { fontSize: 16, color: '#1A3C5E' },
  createButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
