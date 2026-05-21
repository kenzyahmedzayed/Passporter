import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const sampleFlights = [
  { id: '1', airline: 'EgyptAir', from: 'CAI', duration: '5h 30m', price: '$450', departure: '08:00', arrival: '13:30' },
  { id: '2', airline: 'Emirates', from: 'CAI', duration: '6h 15m', price: '$380', departure: '14:00', arrival: '20:15' },
  { id: '3', airline: 'Turkish Airlines', from: 'CAI', duration: '7h 45m', price: '$320', departure: '22:00', arrival: '05:45' },
];

const sampleHotels = [
  { id: '1', name: 'Luxury Grand Hotel', stars: 5, price: '$250/night', rating: 4.9, amenities: ['Pool', 'Spa', 'WiFi', 'Gym'] },
  { id: '2', name: 'City Center Boutique', stars: 4, price: '$120/night', rating: 4.7, amenities: ['WiFi', 'Breakfast', 'Bar'] },
  { id: '3', name: 'Budget Traveler Inn', stars: 3, price: '$65/night', rating: 4.3, amenities: ['WiFi', 'Parking'] },
];

export default function DestinationDetailsScreen({ navigation, route }) {
  const { destination } = route.params;
  const { theme, user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFlight, setBookingFlight] = useState(null);
  const [bookingHotel, setBookingHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [flightSearch, setFlightSearch] = useState({ from: 'CAI', date: '', passengers: '1' });
  const [hotelSearch, setHotelSearch] = useState({ checkIn: '', checkOut: '', guests: '1' });
  const [flightResults, setFlightResults] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [searchingHotels, setSearchingHotels] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('destination_id', destination.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setReviews(data || []);
  };

  const bookFlight = async (flight) => {
    Alert.alert(
      'Confirm Flight',
      `${flight.airline}\n${flight.from} to ${destination.name}\n${flight.departure} - ${flight.arrival}\n${flight.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmFlightBooking(flight) },
      ]
    );
  };

  const confirmFlightBooking = async (flight) => {
    setBookingFlight(flight.id);
    try {
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        destination_id: destination.id,
        type: 'flight',
        details: `${flight.airline}: CAI → ${destination.name} | ${flight.departure} - ${flight.arrival} | ${flight.price}`,
        date: new Date().toISOString(),
        status: 'confirmed',
      }]);
      if (!error) {
        Alert.alert(
          'Flight Booked! ✈️',
          `Your ${flight.airline} flight to ${destination.name} has been confirmed!\n\nDeparture: ${flight.departure}\nPrice: ${flight.price}`,
          [{ text: 'Great!' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setBookingFlight(null);
  };

  const bookHotel = async (hotel) => {
    Alert.alert(
      'Confirm Hotel',
      `${hotel.name}\n${destination.name}\n${hotel.price}\n${hotel.stars} stars`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmHotelBooking(hotel) },
      ]
    );
  };

  const confirmHotelBooking = async (hotel) => {
    setBookingHotel(hotel.id);
    try {
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        destination_id: destination.id,
        type: 'hotel',
        details: `${hotel.name} in ${destination.name} | ${hotel.price} | ${hotel.stars} stars`,
        date: new Date().toISOString(),
        status: 'confirmed',
      }]);
      if (!error) {
        Alert.alert(
          'Hotel Booked! 🏨',
          `${hotel.name} in ${destination.name} has been confirmed!\n\nPrice: ${hotel.price}\nRating: ${hotel.rating}⭐`,
          [{ text: 'Great!' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setBookingHotel(null);
  };

  const searchFlights = async () => {
    setSearchingFlights(true);
    setFlightResults([]);
    await new Promise(resolve => setTimeout(resolve, 900));
    setFlightResults(sampleFlights.map(flight => ({
      ...flight,
      from: flightSearch.from.trim().toUpperCase() || flight.from,
    })));
    setSearchingFlights(false);
  };

  const searchHotels = async () => {
    setSearchingHotels(true);
    setHotelResults([]);
    await new Promise(resolve => setTimeout(resolve, 900));
    setHotelResults(sampleHotels);
    setSearchingHotels(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView>
        <View style={styles.heroContainer}>
          <Image source={{ uri: destination.image_url }} style={styles.heroImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{destination.name}</Text>
            <View style={styles.heroLocation}>
              <Ionicons name="location" size={14} color="#fff" />
              <Text style={styles.heroCountry}>{destination.country}</Text>
            </View>
            <View style={styles.heroRating}>
              <Ionicons name="star" size={14} color="#F4A261" />
              <Text style={styles.heroRatingText}>{destination.rating}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.tabRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {['overview', 'flights', 'hotels', 'reviews'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.accent : theme.subtext }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>

          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
              <Text style={[styles.description, { color: theme.subtext }]}>
                {destination.description}
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Highlights</Text>
              {[
                { icon: '🌍', text: `Located in ${destination.country}` },
                { icon: '⭐', text: `Rated ${destination.rating}/5 by travelers` },
                { icon: '📸', text: 'Popular photography destination' },
                { icon: '🍽️', text: 'World-class dining experiences' },
                { icon: '🏨', text: 'Wide range of accommodation options' },
              ].map((item, i) => (
                <View key={i} style={[styles.highlightItem, { borderBottomColor: theme.border }]}>
                  <Text style={styles.highlightIcon}>{item.icon}</Text>
                  <Text style={[styles.highlightText, { color: theme.text }]}>{item.text}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.planTripButton, { backgroundColor: theme.accent }]}
onPress={() => navigation.navigate('TripPlanner', { destination })}
              >
                <Ionicons name="map-outline" size={20} color="#fff" />
                <Text style={styles.planTripText}>Plan a Trip Here</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'flights' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Search Flights to {destination.name}
              </Text>
              <View style={[styles.searchPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={flightSearch.from}
                  onChangeText={(from) => setFlightSearch(prev => ({ ...prev, from }))}
                  placeholder="From airport"
                  placeholderTextColor={theme.subtext}
                />
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={flightSearch.date}
                  onChangeText={(date) => setFlightSearch(prev => ({ ...prev, date }))}
                  placeholder="Departure date"
                  placeholderTextColor={theme.subtext}
                />
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={flightSearch.passengers}
                  onChangeText={(passengers) => setFlightSearch(prev => ({ ...prev, passengers }))}
                  placeholder="Passengers"
                  placeholderTextColor={theme.subtext}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.accent }]} onPress={searchFlights}>
                  {searchingFlights ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>Search Flights</Text>}
                </TouchableOpacity>
              </View>
              {flightResults.map((flight) => (
                <View key={flight.id} style={[styles.flightCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.flightHeader}>
                    <View style={styles.flightAirline}>
                      <Ionicons name="airplane-outline" size={20} color={theme.accent} />
                      <Text style={[styles.airlineName, { color: theme.text }]}>{flight.airline}</Text>
                    </View>
                    <Text style={[styles.flightPrice, { color: theme.accent }]}>{flight.price}</Text>
                  </View>

                  <View style={styles.flightRoute}>
                    <View style={styles.flightEndpoint}>
                      <Text style={[styles.flightCode, { color: theme.text }]}>{flight.from}</Text>
                      <Text style={[styles.flightTime, { color: theme.subtext }]}>{flight.departure}</Text>
                    </View>
                    <View style={styles.flightMiddle}>
                      <Text style={[styles.flightDuration, { color: theme.subtext }]}>{flight.duration}</Text>
                      <View style={[styles.flightLine, { backgroundColor: theme.border }]} />
                      <Ionicons name="airplane" size={16} color={theme.accent} />
                    </View>
                    <View style={styles.flightEndpoint}>
                      <Text style={[styles.flightCode, { color: theme.text }]}>
                        {destination.name.substring(0, 3).toUpperCase()}
                      </Text>
                      <Text style={[styles.flightTime, { color: theme.subtext }]}>{flight.arrival}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={() => bookFlight(flight)}
                    disabled={bookingFlight === flight.id}
                  >
                    {bookingFlight === flight.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.bookButtonText}>Book Flight</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'hotels' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Search Hotels in {destination.name}
              </Text>
              <View style={[styles.searchPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={hotelSearch.checkIn}
                  onChangeText={(checkIn) => setHotelSearch(prev => ({ ...prev, checkIn }))}
                  placeholder="Check-in date"
                  placeholderTextColor={theme.subtext}
                />
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={hotelSearch.checkOut}
                  onChangeText={(checkOut) => setHotelSearch(prev => ({ ...prev, checkOut }))}
                  placeholder="Check-out date"
                  placeholderTextColor={theme.subtext}
                />
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  value={hotelSearch.guests}
                  onChangeText={(guests) => setHotelSearch(prev => ({ ...prev, guests }))}
                  placeholder="Guests"
                  placeholderTextColor={theme.subtext}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.accent }]} onPress={searchHotels}>
                  {searchingHotels ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>Search Hotels</Text>}
                </TouchableOpacity>
              </View>
              {hotelResults.map((hotel) => (
                <View key={hotel.id} style={[styles.hotelCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.hotelHeader}>
                    <View>
                      <Text style={[styles.hotelName, { color: theme.text }]}>{hotel.name}</Text>
                      <View style={styles.starsRow}>
                        {Array(hotel.stars).fill(0).map((_, i) => (
                          <Ionicons key={i} name="star" size={12} color="#F4A261" />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.hotelPrice, { color: theme.accent }]}>{hotel.price}</Text>
                  </View>

                  <View style={styles.hotelRating}>
                    <Ionicons name="star" size={14} color="#F4A261" />
                    <Text style={[styles.hotelRatingText, { color: theme.text }]}>{hotel.rating}</Text>
                    <Text style={[styles.hotelRatingCount, { color: theme.subtext }]}>Guest Rating</Text>
                  </View>

                  <View style={styles.amenitiesRow}>
                    {hotel.amenities.map((amenity, i) => (
                      <View key={i} style={[styles.amenityChip, { backgroundColor: theme.accent + '20', borderColor: theme.accent }]}>
                        <Text style={[styles.amenityText, { color: theme.accent }]}>{amenity}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={() => bookHotel(hotel)}
                    disabled={bookingHotel === hotel.id}
                  >
                    {bookingHotel === hotel.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="bed-outline" size={18} color="#fff" />
                        <Text style={styles.bookButtonText}>Book Hotel</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.tabContent}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Traveler Reviews</Text>
                <TouchableOpacity
                  style={[styles.addReviewButton, { backgroundColor: theme.accent }]}
                  onPress={() => navigation.navigate('Reviews')}
                >
                  <Text style={styles.addReviewText}>Write Review</Text>
                </TouchableOpacity>
              </View>

              {reviews.length === 0 ? (
                <View style={styles.noReviews}>
                  <Text style={styles.noReviewsEmoji}>⭐</Text>
                  <Text style={[styles.noReviewsText, { color: theme.subtext }]}>
                    No reviews yet — be the first!
                  </Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.reviewHeader}>
                      <View style={[styles.reviewAvatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.reviewAvatarText}>T</Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={[styles.reviewerName, { color: theme.text }]}>Traveler</Text>
                        <View style={styles.reviewStars}>
                          {Array(review.rating).fill(0).map((_, i) => (
                            <Ionicons key={i} name="star" size={12} color="#F4A261" />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.reviewDate, { color: theme.subtext }]}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.reviewText, { color: theme.subtext }]}>{review.comment}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  heroContainer: { position: 'relative', height: 280 },
  heroImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 5,
  },
  heroName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroCountry: { color: '#ffffffcc', fontSize: 14 },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroRatingText: { color: '#fff', fontWeight: 'bold' },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  content: { paddingHorizontal: 15 },
  tabContent: { paddingTop: 15, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  description: { fontSize: 14, lineHeight: 22 },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  highlightIcon: { fontSize: 20 },
  highlightText: { fontSize: 14 },
  planTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  planTripText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  searchPanel: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  searchInput: { borderWidth: 1, borderRadius: 10, padding: 11, fontSize: 14 },
  searchButton: { alignItems: 'center', padding: 13, borderRadius: 24 },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  flightCard: {
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    gap: 12,
  },
  flightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flightAirline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  airlineName: { fontSize: 15, fontWeight: 'bold' },
  flightPrice: { fontSize: 18, fontWeight: 'bold' },
  flightRoute: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flightEndpoint: { alignItems: 'center', gap: 4 },
  flightCode: { fontSize: 20, fontWeight: 'bold' },
  flightTime: { fontSize: 12 },
  flightMiddle: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 10 },
  flightDuration: { fontSize: 11 },
  flightLine: { width: '80%', height: 1 },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 25,
  },
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  hotelCard: { borderRadius: 12, padding: 15, borderWidth: 1, gap: 10 },
  hotelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hotelName: { fontSize: 16, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 3 },
  hotelPrice: { fontSize: 16, fontWeight: 'bold' },
  hotelRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hotelRatingText: { fontSize: 14, fontWeight: 'bold' },
  hotelRatingCount: { fontSize: 12 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
  },
  amenityText: { fontSize: 11, fontWeight: '500' },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addReviewButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addReviewText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  noReviews: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  noReviewsEmoji: { fontSize: 40 },
  noReviewsText: { fontSize: 14 },
  reviewCard: { borderRadius: 12, padding: 15, borderWidth: 1, gap: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: '#fff', fontWeight: 'bold' },
  reviewMeta: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: 'bold' },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 11 },
  reviewText: { fontSize: 13, lineHeight: 20 },
});
