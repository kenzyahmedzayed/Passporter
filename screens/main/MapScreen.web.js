import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

export default function MapScreen() {
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Map & Navigation</Text>
      </View>

      <View style={styles.webFallback}>
        <Ionicons name="map-outline" size={64} color={theme.border} />
        <Text style={[styles.webFallbackTitle, { color: theme.text }]}>
          Maps are available on mobile
        </Text>
        <Text style={[styles.webFallbackText, { color: theme.subtext }]}>
          Open Passporter on iOS or Android to use live map navigation.
        </Text>
        <TouchableOpacity style={[styles.webFallbackButton, { backgroundColor: theme.accent }]}>
          <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
          <Text style={styles.webFallbackButtonText}>Mobile Feature</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 30,
  },
  webFallbackTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  webFallbackText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  webFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    marginTop: 6,
  },
  webFallbackButtonText: { color: '#fff', fontWeight: 'bold' },
});
