import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const sampleFlights = [
  { id: '1', from: 'Cairo', to: 'Paris', date: 'Jun 15, 2025', price: '$450', duration: '5h 30m' },
  { id: '2', from: 'Cairo', to: 'Tokyo', date: 'Jul 1, 2025', price: '$780', duration: '12h 45m' },
  { id: '3', from: 'Cairo', to: 'Dubai', date: 'Jun 20, 2025', price: '$120', duration: '3h 15m' },
  { id: '4', from: 'Cairo', to: 'London', date: 'Aug 5, 2025', price: '$520', duration: '6h 20m' },
  { id: '5', from: 'Cairo', to: 'Istanbul', date: 'Jul 15, 2025', price: '$180', duration: '2h 45m' },
  { id: '6', from: 'Cairo', to: 'New York', date: 'Sep 1, 2025', price: '$950', duration: '13h 30m' },
  { id: '7', from: 'Cairo', to: 'Barcelona', date: 'Aug 20, 2025', price: '$480', duration: '5h 50m' },
  { id: '8', from: 'Cairo', to: 'Maldives', date: 'Oct 10, 2025', price: '$620', duration: '7h 15m' },
];

const sampleHotels = [
  { id: '1', name: 'Grand Paris Hotel', location: 'Paris, France', price: '$150/night', rating: 4.8, stars: 5 },
  { id: '2', name: 'Tokyo Palace Inn', location: 'Tokyo, Japan', price: '$200/night', rating: 4.9, stars: 5 },
  { id: '3', name: 'Dubai Luxury Resort', location: 'Dubai, UAE', price: '$300/night', rating: 4.7, stars: 5 },
  { id: '4', name: 'London Bridge Hotel', location: 'London, UK', price: '$180/night', rating: 4.6, stars: 4 },
  { id: '5', name: 'Istanbul Bosphorus', location: 'Istanbul, Turkey', price: '$120/night', rating: 4.7, stars: 4 },
  { id: '6', name: 'Barcelona Beach Resort', location: 'Barcelona, Spain', price: '$160/night', rating: 4.8, stars: 5 },
  { id: '7', name: 'Maldives Overwater Villa', location: 'Maldives', price: '$850/night', rating: 5.0, stars: 5 },
  { id: '8', name: 'Santorini Cave Hotel', location: 'Santorini, Greece', price: '$250/night', rating: 4.9, stars: 5 },
];

export default function BookingScreen({ navigation }) {
  const [activeType, setActiveType] = useState('flight');
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useApp();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyBookings(data || []);
    }
    setLoading(false);
  };

  const handleBook = async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('bookings').insert([{
      user_id: user.id,
      type: activeType,
      details: activeType === 'flight'
        ? `${item.from} → ${item.to} | ${item.date} | ${item.duration} | ${item.price}`
        : `${item.name} | ${item.location} | ${item.price}`,
      date: new Date().toISOString(),
      status: 'confirmed',
    }]);
    if (!error) {
      Alert.alert(
        activeType === 'flight' ? 'Flight Booked! ✈️' : 'Hotel Booked! 🏨',
        `Your ${activeType} has been confirmed successfully!`
      );
      fetchMyBookings();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bookings</Text>
        <TouchableOpacity onPress={fetchMyBookings}>
          <Ionicons name="refresh-outline" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.typeRow}>
          {[
            { title: 'Flights', icon: 'airplane-outline', type: 'flight' },
            { title: 'Hotels', icon: 'bed-outline', type: 'hotel' },
          ].map((t) => (
            <TouchableOpacity
              key={t.type}
              style={[
                styles.typeButton,
                { borderColor: theme.accent },
                activeType === t.type && { backgroundColor: theme.accent }
              ]}
              onPress={() => setActiveType(t.type)}
            >
              <Ionicons name={t.icon} size={20} color={activeType === t.type ? '#fff' : theme.accent} />
              <Text style={[styles.typeText, { color: activeType === t.type ? '#fff' : theme.accent }]}>
                {t.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Available {activeType === 'flight' ? 'Flights' : 'Hotels'}
        </Text>

        {activeType === 'flight' ? (
          sampleFlights.map((flight) => (
            <View key={flight.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.flightAirlineRow}>
                  <Ionicons name="airplane-outline" size={20} color={theme.accent} />
                  <Text style={[styles.cardPrice, { color: theme.accent }]}>{flight.price}</Text>
                </View>
                <Text style={[styles.cardDetail, { color: theme.subtext }]}>{flight.duration}</Text>
              </View>
              <View style={styles.flightRoute}>
                <View style={styles.flightEndpoint}>
                  <Text style={[styles.flightCity, { color: theme.text }]}>{flight.from}</Text>
                  <Text style={[styles.flightLabel, { color: theme.subtext }]}>From</Text>
                </View>
                <View style={styles.flightMiddle}>
                  <View style={[styles.flightLine, { backgroundColor: theme.border }]} />
                  <Ionicons name="airplane" size={16} color={theme.accent} />
                  <View style={[styles.flightLine, { backgroundColor: theme.border }]} />
                </View>
                <View style={styles.flightEndpoint}>
                  <Text style={[styles.flightCity, { color: theme.text }]}>{flight.to}</Text>
                  <Text style={[styles.flightLabel, { color: theme.subtext }]}>To</Text>
                </View>
              </View>
              <Text style={[styles.cardDetail, { color: theme.subtext }]}>📅 {flight.date}</Text>
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: theme.primary }]}
                onPress={() => handleBook(flight)}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.bookButtonText}>Book Flight</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          sampleHotels.map((hotel) => (
            <View key={hotel.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.hotelName, { color: theme.text }]}>{hotel.name}</Text>
                <Text style={[styles.cardPrice, { color: theme.accent }]}>{hotel.price}</Text>
              </View>
              <View style={styles.starsRow}>
                {Array(hotel.stars).fill(0).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#F4A261" />
                ))}
              </View>
              <Text style={[styles.cardDetail, { color: theme.subtext }]}>📍 {hotel.location}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F4A261" />
                <Text style={[styles.ratingText, { color: theme.text }]}>{hotel.rating}</Text>
                <Text style={[styles.cardDetail, { color: theme.subtext }]}>Guest Rating</Text>
              </View>
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: theme.primary }]}
                onPress={() => handleBook(hotel)}
              >
                <Ionicons name="bed-outline" size={16} color="#fff" />
                <Text style={styles.bookButtonText}>Book Hotel</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Bookings</Text>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : myBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={40} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No bookings yet</Text>
          </View>
        ) : (
          myBookings.map((booking) => (
            <View key={booking.id} style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons
                name={booking.type === 'flight' ? 'airplane-outline' : 'bed-outline'}
                size={20}
                color={theme.accent}
              />
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingDetails, { color: theme.text }]}>{booking.details}</Text>
                <View style={[styles.statusBadge,
                  { backgroundColor: booking.status === 'confirmed' ? '#e8f5e9' : '#fff3e0' }
                ]}>
                  <Text style={[styles.statusText,
                    { color: booking.status === 'confirmed' ? '#27ae60' : '#E07B39' }
                  ]}>
                    ✓ {booking.status}
                  </Text>
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
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  container: { paddingHorizontal: 15 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  typeText: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 5 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, gap: 8, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flightAirlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardPrice: { fontSize: 18, fontWeight: 'bold' },
  flightRoute: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  flightEndpoint: { alignItems: 'center', gap: 4 },
  flightCity: { fontSize: 20, fontWeight: 'bold' },
  flightLabel: { fontSize: 11 },
  flightMiddle: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  flightLine: { flex: 1, height: 1 },
  hotelName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  starsRow: { flexDirection: 'row', gap: 2 },
  cardDetail: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, fontWeight: 'bold' },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 25, marginTop: 5 },
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 14 },
  bookingCard: { flexDirection: 'row', borderRadius: 12, padding: 15, marginBottom: 10, gap: 12, alignItems: 'center', borderWidth: 1 },
  bookingInfo: { flex: 1, gap: 6 },
  bookingDetails: { fontSize: 14, fontWeight: '500' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
});