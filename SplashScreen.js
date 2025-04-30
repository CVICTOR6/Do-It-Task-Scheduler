import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // or 'Signup' if you're testing that
    }, 3500); // stay 3.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.Image
        animation="zoomIn" // try "fadeIn", "zoomIn", "pulse"
        duration={1500}
        source={require('../assets/Logo.png')} // update path if needed
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
