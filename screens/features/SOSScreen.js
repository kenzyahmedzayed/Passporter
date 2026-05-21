import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

const emergencyNumbers = [
  { country: 'Egypt', police: '122', ambulance: '123', fire: '180' },
  { country: 'USA', police: '911', ambulance: '911', fire: '911' },
  { country: 'UK', police: '999', ambulance: '999', fire: '999' },
  { country: 'UAE', police: '999', ambulance: '998', fire: '997' },
  { country: 'France', police: '17', ambulance: '15', fire: '18' },
  { country: 'Japan', police: '110', ambulance: '119', fire: '119' },
];

export default function SOSScreen({ navigation }) {
  const { theme } = useApp();

  const callNumber = (number) => {
    Alert.alert(
      'Call Emergency Services',
      `Are you sure you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${number}`),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Emergency SOS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => callNumber('112')}
          >
            <Ionicons name="alert-circle" size={50} color="#fff" />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>Call Emergency (112)</Text>
          </TouchableOpacity>
          <Text style={[styles.sosNote, { color: theme.subtext }]}>
            112 is the international emergency number that works in most countries
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Numbers by Country</Text>
        {emergencyNumbers.map((item, index) => (
          <View key={index} style={[styles.countryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.countryName, { color: theme.text }]}>{item.country}</Text>
            <View style={styles.numbersRow}>
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={() => callNumber(item.police)}
              >
                <Ionicons name="shield-outline" size={16} color="#1A3C6E" />
                <Text style={[styles.numberLabel, { color: theme.subtext }]}>Police</Text>
                <Text style={[styles.numberValue, { color: theme.text }]}>{item.police}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={() => callNumber(item.ambulance)}
              >
                <Ionicons name="medkit-outline" size={16} color="#e74c3c" />
                <Text style={[styles.numberLabel, { color: theme.subtext }]}>Ambulance</Text>
                <Text style={[styles.numberValue, { color: theme.text }]}>{item.ambulance}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.numberButton, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={() => callNumber(item.fire)}
              >
                <Ionicons name="flame-outline" size={16} color="#E07B39" />
                <Text style={[styles.numberLabel, { color: theme.subtext }]}>Fire</Text>
                <Text style={[styles.numberValue, { color: theme.text }]}>{item.fire}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

safeArea: { 
  flex: 1 
},

header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 15,
  paddingVertical: 10,
},

headerTitle: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

container: { 
  paddingHorizontal: 15 
},

sosContainer: {
  alignItems: 'center', 
  paddingVertical: 25, 
  gap: 15 
},

sosButton: {
  backgroundColor: '#e74c3c',
  width: 160,
  height: 160,
  borderRadius: 80,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  shadowColor: '#e74c3c',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 10,
  elevation: 8,
  },

sosText: { 
  fontSize: 32, 
  fontWeight: 'bold', 
  color: '#fff' 
},

sosSubtext: { 
  fontSize: 11, 
  color: '#ffffff99' 
},

sosNote: { 
  fontSize: 13, 
  textAlign: 'center', 
  paddingHorizontal: 20 
},

sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 12
},

countryCard: {
  borderRadius: 12,
  padding: 15,
  marginBottom: 10,
  gap: 12,
  borderWidth: 1,
},

countryName: {
  fontSize: 16, 
  fontWeight: 'bold' 
},

numbersRow: { 
  flexDirection: 'row', 
  gap: 8
},

numberButton: {
  flex: 1,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  gap: 4,
  borderWidth: 1,
},

numberLabel: { 
  fontSize: 11 
},

numberValue: { 
  fontSize: 15, 
  fontWeight: 'bold' 
},
});
