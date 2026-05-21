import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as Notifications from 'expo-notifications';
import { useApp } from '../../context/AppContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ItineraryScreen({ navigation }) {
  const { theme } = useApp();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchJourneys(); }, []);

  const fetchJourneys = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('journey')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setJourneys(data || []);
    }
    setLoading(false);
  };

  const addJourney = async () => {
    if (!destination || !startDate || !endDate) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('journey').insert([{
      user_id: user.id,
      destination,
      start_date: startDate,
      end_date: endDate,
    }]);
    setAdding(false);
    if (!error) {
      setDestination('');
      setStartDate('');
      setEndDate('');
      setShowForm(false);
      fetchJourneys();
    }
  };

  const deleteJourney = async (id) => {
    Alert.alert('Delete Journey', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('journey').delete().eq('id', id);
          fetchJourneys();
        },
      },
    ]);
  };

  const scheduleReminder = async (journey) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow notifications.');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✈️ Trip Reminder!',
          body: `Your trip to ${journey.destination} starts on ${journey.start_date}!`,
          sound: true,
        },
        trigger: {
          type: 'timeInterval',
          seconds: 5,
          repeats: false,
        },
      });
      Alert.alert('Reminder Set! 🔔', `You will be reminded about your trip to ${journey.destination} in 5 seconds!`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Journeys</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons
            name={showForm ? 'close-outline' : 'add-outline'}
            size={28}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {showForm && (
          <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>✈️ Plan New Journey</Text>

            <Text style={[styles.label, { color: theme.subtext }]}>Destination</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Ionicons name="location-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Paris, France"
                placeholderTextColor={theme.subtext}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={[styles.label, { color: theme.subtext }]}>Start Date</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Jun 15, 2025"
                placeholderTextColor={theme.subtext}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            <Text style={[styles.label, { color: theme.subtext }]}>End Date</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Jun 22, 2025"
                placeholderTextColor={theme.subtext}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.accent }]}
              onPress={addJourney}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Create Journey</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 30 }} />
        ) : journeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No journeys yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.subtext }]}>
              Tap + to plan your first journey!
            </Text>
          </View>
        ) : (
          journeys.map((journey) => (
            <View key={journey.id} style={[styles.journeyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.journeyHeader}>
                <View style={[styles.journeyIconBox, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="airplane-outline" size={24} color={theme.accent} />
                </View>
                <View style={styles.journeyInfo}>
                  <Text style={[styles.journeyDestination, { color: theme.text }]}>
                    {journey.destination}
                  </Text>
                  <Text style={[styles.journeyDates, { color: theme.subtext }]}>
                    📅 {journey.start_date} → {journey.end_date}
                  </Text>
                </View>
                <View style={styles.journeyActions}>
                  <TouchableOpacity
                    style={[styles.reminderButton, { backgroundColor: theme.accent + '20' }]}
                    onPress={() => scheduleReminder(journey)}
                  >
                    <Ionicons name="notifications-outline" size={18} color={theme.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteJourney(journey.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
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

form: {
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  gap: 8,
  borderWidth: 1,
},

formTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 5 
},

label: { 
  fontSize: 13, 
  fontWeight: '600', 
  marginTop: 5 
},

inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 10,
  borderWidth: 1,
  paddingHorizontal: 12,
  gap: 8,
},

input: { 
  flex: 1, 
  paddingVertical: 12, 
  fontSize: 14 
},

addButton: {
  padding: 14,
  borderRadius: 25,
  alignItems: 'center',
  marginTop: 10,
},

addButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 15 
},

emptyContainer: { 
  alignItems: 'center', 
  paddingTop: 60, 
  gap: 10 
},

emptyText: { 
  fontSize: 18, 
  fontWeight: 'bold' 
},

emptySubtext: { 
  fontSize: 14 
},

journeyCard: {
  borderRadius: 12,
  padding: 15,
  marginBottom: 10,
  borderWidth: 1,
},

journeyHeader: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 12 
},

journeyIconBox: {
  width: 45,
  height: 45,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

journeyInfo: { 
  flex: 1 
},

journeyDestination: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},

journeyDates: { 
  fontSize: 13, 
  marginTop: 2 
},

journeyActions: { 
  flexDirection: 'row', 
  gap: 10, 
  alignItems: 'center' 
},

reminderButton: {
  padding: 8,
  borderRadius: 10,
},

deleteButton: { 
  padding: 4 
},
});