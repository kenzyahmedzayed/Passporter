import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useApp } from '../../context/AppContext';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [mapType, setMapType] = useState('standard');
  const { theme, destinations } = useApp();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    setLocation(loc.coords);
    const geocode = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    if (geocode[0]) {
      setAddress(`${geocode[0].city || ''}, ${geocode[0].country || ''}`);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Map & Navigation</Text>
        <TouchableOpacity
          style={[styles.mapTypeButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Ionicons name="layers-outline" size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Getting your location...</Text>
        </View>
      ) : location ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description={address}
              pinColor="#1A3C6E"
            />

            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={100}
              fillColor="rgba(26, 60, 110, 0.1)"
              strokeColor="rgba(26, 60, 110, 0.3)"
              strokeWidth={1}
            />
          </MapView>

          <View style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="location" size={20} color={theme.accent} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationAddress, { color: theme.text }]}>
                {address || 'Location found'}
              </Text>
              <Text style={[styles.locationCoords, { color: theme.subtext }]}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
            <TouchableOpacity onPress={getLocation}>
              <Ionicons name="refresh-outline" size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={60} color={theme.border} />
          <Text style={[styles.errorText, { color: theme.subtext }]}>Could not get location</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={getLocation}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
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
  mapTypeButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15 },
  loadingText: { fontSize: 16 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  locationCard: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationInfo: { flex: 1 },
  locationAddress: { fontSize: 15, fontWeight: '600' },
  locationCoords: { fontSize: 12, marginTop: 2 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15 },
  errorText: { fontSize: 16 },
  retryButton: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: '#fff', fontWeight: 'bold' },
});