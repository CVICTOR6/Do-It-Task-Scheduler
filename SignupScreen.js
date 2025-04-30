import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];

      const exists = users.find(u => u.email === email);
      if (exists) {
        Alert.alert('Email already in use');
        return;
      }

      const newUser = { firstName, lastName, email, password };
      users.push(newUser);

      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert('Success', 'Account created!', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (err) {
      console.log('Signup error:', err);
      Alert.alert('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} placeholder="Enter First Name" />

      <Text style={styles.label}>Last Name</Text>
      <TextInput value={lastName} onChangeText={setLastName} style={styles.input} placeholder="Enter Last Name" />

      <Text style={styles.label}>Email Address</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Enter Email" keyboardType="email-address" />

      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder="Enter Password" secureTextEntry />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} placeholder="Confirm Password" secureTextEntry />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or sign up with</Text>

      <View style={styles.socials}>
        <Image source={require('../assets/apple.png')} style={styles.socialIcon} />
        <Image source={require('../assets/google.png')} style={styles.socialIcon} />
        <Image source={require('../assets/facebook.png')} style={styles.socialIcon} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log In</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // White background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1A3C5E', // Dark blue
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1A3C5E', // Dark blue
  },
  input: {
    backgroundColor: '#E0F7FA', // Light cyan
    borderRadius: 25,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  signupButton: {
    backgroundColor: '#2E7D32', // Green
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    color: '#757575', // Neutral gray
  },
  socials: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
  loginText: {
    textAlign: 'center',
    color: '#333',
  },
  loginLink: {
    color: '#1A3C5E', // Dark blue
    fontWeight: 'bold',
  },
});