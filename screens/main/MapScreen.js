import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Linking
} from 'react-native';
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
  const [tracking, setTracking] = useState(false);
  const { theme } = useApp();
  const watchRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    startLocationTracking();
    return () => {
      // Cleanup — stop watching when screen closes
      if (watchRef.current) {
        watchRef.current.remove();
      }
    };
  }, []);

  const startLocationTracking = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      // Get initial location fast
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc.coords);
      setLoading(false);

      // Get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode[0]) {
        setAddress(`${geocode[0].city || ''}, ${geocode[0].country || ''}`);
      }

      // Start live tracking
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (newLoc) => {
          setLocation(newLoc.coords);
          setTracking(true);
        }
      );
    } catch (err) {
      Alert.alert('Error', 'Could not get location.');
      setLoading(false);
    }
  };

  const openNativeNavigation = () => {
    if (!location) return;
    const lat = location.latitude;
    const lng = location.longitude;
    const appleMapsUrl = `maps://?q=My+Location&ll=${lat},${lng}&dirflg=d`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    Linking.canOpenURL(appleMapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(appleMapsUrl);
      } else {
        Linking.openURL(googleMapsUrl);
      }
    });
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Map & Navigation
        </Text>
        <View style={styles.headerButtons}>
          {tracking && (
            <View style={styles.trackingBadge}>
              <View style={styles.trackingDot} />
              <Text style={styles.trackingText}>Live</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Ionicons name="layers-outline" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Getting your location...
          </Text>
        </View>
      ) : location ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsBuildings={true}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description={address}
            >
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner} />
              </View>
            </Marker>

            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={100}
              fillColor="rgba(45, 107, 196, 0.15)"
              strokeColor="rgba(45, 107, 196, 0.4)"
              strokeWidth={1}
            />
          </MapView>

          {/* Center button */}
          <TouchableOpacity
            style={[styles.centerButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={centerOnUser}
          >
            <Ionicons name="locate-outline" size={22} color={theme.accent} />
          </TouchableOpacity>

          {/* Location info card */}
          <View style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="location" size={20} color={theme.accent} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationAddress, { color: theme.text }]}>
                {address || 'Location found'}
              </Text>
              <Text style={[styles.locationCoords, { color: theme.subtext }]}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
            <TouchableOpacity onPress={startLocationTracking}>
              <Ionicons name="refresh-outline" size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>

          {/* Navigation buttons */}
          <View style={styles.navButtonsRow}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: theme.accent }]}
              onPress={openNativeNavigation}
            >
              <Ionicons name="navigate-outline" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Start Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButtonOutline, { borderColor: theme.accent, backgroundColor: theme.card }]}
              onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
            >
              <Ionicons name="layers-outline" size={20} color={theme.accent} />
              <Text style={[styles.navButtonOutlineText, { color: theme.accent }]}>
                {mapType === 'standard' ? 'Satellite' : 'Standard'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={60} color={theme.border} />
          <Text style={[styles.errorText, { color: theme.subtext }]}>
            Could not get location
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={startLocationTracking}
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
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27ae60',
  },
  trackingText: { color: '#27ae60', fontSize: 12, fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  loadingText: { fontSize: 16 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 107, 196, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2D6BC4',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D6BC4',
  },
  centerButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationCard: {
    position: 'absolute',
    bottom: 100,
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
  locationCoords: { fontSize: 11, marginTop: 2 },
  navButtonsRow: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  navButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  navButtonOutlineText: { fontWeight: 'bold', fontSize: 15 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  errorText: { fontSize: 16 },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },
});