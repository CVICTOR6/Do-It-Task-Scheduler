import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('users');
      const users = stored ? JSON.parse(stored) : [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        await AsyncStorage.setItem('loggedInUser', email);
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Invalid credentials');
      }
    } catch (error) {
      console.log('❌ Login error:', error);
      Alert.alert('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        placeholder="Enter Your Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Enter Your Password"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.linkText}>Forgotten your password?</Text>
      </TouchableOpacity>

      <Text style={styles.signInText}>Or sign in with</Text>

      <View style={styles.socials}>
        <Image source={require('../assets/apple.png')} style={styles.socialIcon} />
        <Image source={require('../assets/google.png')} style={styles.socialIcon} />
        <Image source={require('../assets/facebook.png')} style={styles.socialIcon} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.createAccount}>Create an Account</Text>
        </Text>
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
    marginBottom: 30,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA', // Light cyan
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1A3C5E', // Dark blue border
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#212121',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    textAlign: 'center',
    color: '#757575', // Neutral gray
    marginBottom: 25,
  },
  signInText: {
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
  signupText: {
    textAlign: 'center',
    color: '#333',
  },
  createAccount: {
    color: '#1A3C5E', // Dark blue
    fontWeight: 'bold',
  },
});