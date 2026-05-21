import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

export default function ThemedScreen({ children, style }) {
  const { theme } = useApp();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});