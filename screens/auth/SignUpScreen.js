import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
      return;
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
      });
      if (data.session) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert(
          'Account Created! 🎉',
          'Please check your email to verify your account.',
          [{ text: 'Log In', onPress: () => navigation.navigate('Login') }]
        );
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const redirectUri = makeRedirectUri({ scheme: 'passporter' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success') {
          await supabase.auth.exchangeCodeForSession(result.url);
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }
    } catch (err) {
      Alert.alert('Google Sign Up Failed', err.message);
    }
    setGoogleLoading(false);
  };

  return (
    <KeyboardWrapper>
      <View style={styles.container}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A3C6E" />
        </TouchableOpacity>

        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your travel journey today</Text>

        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButton, googleLoading && styles.disabledButton]}
          onPress={handleGoogleSignUp}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#1A3C6E" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardWrapper>
  );
}

const styles = StyleSheet.create({
  
container: { 
  paddingHorizontal: 25, 
  paddingTop: 20, 
  paddingBottom: 40 
},
  
backButton: { 
  marginBottom: 20 
},
  
logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
},
  
title: { 
  fontSize: 28, 
  fontWeight: 'bold', 
  color: '#1A1A2E', 
  textAlign: 'center' 
},
  
subtitle: { 
  fontSize: 14, 
  color: '#6B7280', 
  textAlign: 'center', 
  marginBottom: 30 
},
  
label: { 
  fontSize: 14, 
  fontWeight: '600', 
  color: '#1A1A2E', 
  marginBottom: 8, 
  marginTop: 12 
},
  
inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 15,
    gap: 10,
},
  
input: { 
  flex: 1, 
  paddingVertical: 14, 
  fontSize: 14, 
  color: '#1A1A2E'
},
  
signupButton: {
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 12,
},
  
disabledButton: { 
  opacity: 0.7 
},
  
signupText: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: 'bold' 
},
  
googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 30,
    marginBottom: 20,
  },
  
googleIcon: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  color: '#1A3C6E' 
},
  
googleText: { 
  fontSize: 15, 
  fontWeight: '600', 
  color: '#1A1A2E' 
},
  
loginRow: { 
  flexDirection: 'row', 
  justifyContent: 'center' 
},
  
loginText: { 
  color: '#6B7280', 
  fontSize: 13 
},
  
loginLink: { 
  color: '#1A3C6E', 
  fontSize: 13, 
  fontWeight: 'bold' 
},
});