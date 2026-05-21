import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.subtitle}>
          Explore the world, plan your trips, and create unforgettable memories.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

container: {
  flex: 1,
  backgroundColor: '#fff',
  justifyContent: 'space-between',
  paddingHorizontal: 25,
  paddingVertical: 40,
},
  
content: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
},
  
logo: {
  width: 400,
  height: 220,
  resizeMode: 'contain',
},
  
subtitle: {
  fontSize: 15,
  color: '#888',
  textAlign: 'center',
  lineHeight: 24,
  paddingHorizontal: 20,
},
  
buttons: { 
  gap: 12 
},
  
loginButton: {
  backgroundColor: '#1A3C6E',
  padding: 16,
  borderRadius: 30,
  alignItems: 'center',
},

loginText: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: 'bold'
},
  
signupButton: {
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 30, 
  alignItems: 'center',
  borderWidth: 2,  
  borderColor: '#1A3C6E',
},
  
signupText: { 
  color: '#1A3C6E', 
  fontSize: 16, 
  fontWeight: 'bold' 
},
});