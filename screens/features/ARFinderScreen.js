import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useApp } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

const NEARBY_POIS = [
  { id: '1', name: 'Nearest Restaurant', type: 'restaurant', distance: '0.2 km', icon: '🍽️', color: '#E07B39' },
  { id: '2', name: 'Historic Site', type: 'landmark', distance: '0.5 km', icon: '🏛️', color: '#9b59b6' },
  { id: '3', name: 'Hotel Nearby', type: 'hotel', distance: '0.8 km', icon: '🏨', color: '#1A3C6E' },
  { id: '4', name: 'Coffee Shop', type: 'cafe', distance: '0.1 km', icon: '☕', color: '#27ae60' },
  { id: '5', name: 'Tourist Attraction', type: 'attraction', distance: '1.2 km', icon: '📸', color: '#4A90D9' },
];

const ALEXANDRIA_POIS = [
  { id: 'alex-1', name: 'Bibliotheca Alexandrina', type: 'landmark', latitude: 31.2089, longitude: 29.9092, icon: 'ًںڈ›ï¸ڈ', color: '#9b59b6' },
  { id: 'alex-2', name: 'Citadel of Qaitbay', type: 'historic site', latitude: 31.2139, longitude: 29.8856, icon: 'ًںڈ°', color: '#2D6BC4' },
  { id: 'alex-3', name: 'Stanley Bridge', type: 'attraction', latitude: 31.2383, longitude: 29.9603, icon: 'ًںŒ‰', color: '#27ae60' },
  { id: 'alex-4', name: 'Montaza Palace', type: 'park', latitude: 31.2885, longitude: 30.0158, icon: 'ًںŒ؟', color: '#27ae60' },
  { id: 'alex-5', name: 'Alexandria National Museum', type: 'museum', latitude: 31.2001, longitude: 29.9139, icon: 'ًںڈ›ï¸ڈ', color: '#E07B39' },
];

const toRadians = (degrees) => degrees * Math.PI / 180;

const getDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function ARFinderScreen({ navigation }) {
  const { theme } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [arActive, setArActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [visiblePOIs, setVisiblePOIs] = useState([]);
  const [nearbyPOIs, setNearbyPOIs] = useState([]);


  useEffect(() => {
    getLocation();
    const subscription = Accelerometer.addListener(data => {
      setAccelerometerData(data);
      updateVisiblePOIs(data);
    });
    Accelerometer.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (arActive || nearbyPOIs.length > 0) {
      updateVisiblePOIs(accelerometerData);
    }
  }, [nearbyPOIs, arActive]);

  const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    setNearbyPOIs(generateLocalPOIs(loc.coords));
  }
};

  const updateVisiblePOIs = (data) => {
    const source = nearbyPOIs.length > 0 ? nearbyPOIs : NEARBY_POIS;
    const visible = source.slice(0, 3);
    setVisiblePOIs(visible);
  };

  const startAR = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera access is needed for AR Finder.');
        return;
      }
    }
    setArActive(true);
    updateVisiblePOIs(accelerometerData);
  };
const generateLocalPOIs = (coords) => {
  const localPOIs = ALEXANDRIA_POIS.map((poi) => ({
    ...poi,
    distance: `${getDistanceKm(coords, poi).toFixed(1)} km`,
  })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  if (localPOIs.length > 0) return localPOIs;

  const types = [
    { type: 'Restaurant', icon: '🍽️', color: '#E07B39' },
    { type: 'Café', icon: '☕', color: '#27ae60' },
    { type: 'Historic Site', icon: '🏛️', color: '#9b59b6' },
    { type: 'Hotel', icon: '🏨', color: '#1A3C6E' },
    { type: 'Shopping', icon: '🛍️', color: '#e74c3c' },
    { type: 'Park', icon: '🌿', color: '#27ae60' },
  ];
  
  return types.map((t, i) => ({
    id: String(i + 1),
    name: `Nearby ${t.type}`,
    type: t.type.toLowerCase(),
    distance: 'Nearby',
    icon: t.icon,
    color: t.color,
  }));
};
  const getPOIPosition = (index) => {
    const positions = [
      { top: height * 0.2, left: width * 0.1 },
      { top: height * 0.35, left: width * 0.5 },
      { top: height * 0.25, left: width * 0.7 },
      { top: height * 0.45, left: width * 0.2 },
      { top: height * 0.15, left: width * 0.4 },
    ];
    return positions[index % positions.length];
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          setArActive(false);
          navigation.goBack();
        }}>
          <Ionicons name="chevron-back" size={24} color={arActive ? '#fff' : theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: arActive ? '#fff' : theme.text }]}>AR Finder</Text>
        {arActive ? (
          <TouchableOpacity onPress={() => setArActive(false)}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {arActive ? (
        <View style={styles.arContainer}>
          <CameraView style={styles.camera}>
            {visiblePOIs.map((poi, index) => {
              const pos = getPOIPosition(index);
              return (
                <View
                  key={poi.id}
                  style={[styles.poiLabel, { top: pos.top, left: pos.left }]}
                >
                  <View style={[styles.poiBubble, { borderColor: poi.color }]}>
                    <Text style={styles.poiEmoji}>{poi.icon}</Text>
                    <View style={styles.poiInfo}>
                      <Text style={styles.poiName}>{poi.name}</Text>
                      <Text style={styles.poiDistance}>{poi.distance}</Text>
                    </View>
                  </View>
                  <View style={[styles.poiLine, { backgroundColor: poi.color }]} />
                </View>
              );
            })}

            <View style={styles.compass}>
              <Ionicons name="compass-outline" size={30} color="#fff" />
              <Text style={styles.compassText}>
                {Math.round(Math.abs(accelerometerData.x * 90))}°
              </Text>
            </View>

            {location && (
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={14} color="#E07B39" />
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
                </Text>
              </View>
            )}
          </CameraView>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>🔍 AR Point of Interest Finder</Text>
            <Text style={[styles.infoText, { color: theme.subtext }]}>
              Point your camera at the world around you to discover nearby landmarks,
              restaurants, museums and attractions with live AR overlays.
            </Text>
          </View>

          <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.accent }]} onPress={startAR}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start AR View</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Places</Text>
          {(nearbyPOIs.length > 0 ? nearbyPOIs : NEARBY_POIS).map((poi) => (
            <View key={poi.id} style={[styles.poiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.poiIconBox, { backgroundColor: poi.color + '20' }]}>
                <Text style={styles.poiIconText}>{poi.icon}</Text>
              </View>
              <View style={styles.poiCardInfo}>
                <Text style={[styles.poiCardName, { color: theme.text }]}>{poi.name}</Text>
                <Text style={[styles.poiCardType, { color: theme.subtext }]}>{poi.type}</Text>
              </View>
              <View style={styles.poiDistanceBadge}>
                <Ionicons name="navigate-outline" size={14} color={theme.accent} />
                <Text style={[styles.poiDistanceText, { color: theme.accent }]}>{poi.distance}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
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
  zIndex: 10,
},
  
headerTitle: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},
  
whiteText: { 
  color: '#fff' 
},
  
stopText: { 
  color: '#e74c3c', 
  fontWeight: 'bold', 
  fontSize: 15 
},
  
arContainer: { 
  flex: 1 
},
  
camera: { 
  flex: 1 
},
  
poiLabel: {
  position: 'absolute',
  alignItems: 'center',
},
  
poiBubble: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.75)',
  borderRadius: 12,
  padding: 8,
  gap: 6,
  borderWidth: 1.5,
  minWidth: 130,
},
  
poiEmoji: { 
  fontSize: 20
 },

poiInfo: { 
  gap: 2 
},
  
poiName: {
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 12 
},
  
poiDistance: { 
  color: '#E07B39', 
  fontSize: 10 
},
  
poiLine: { 
  width: 2, 
  height: 20 
},
  
compass: {
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: 30,
  padding: 10,
  alignItems: 'center',
},
  
compassText: { 
  color: '#fff', 
  fontSize: 10, 
  marginTop: 2 
},
  
locationBadge: {
  position: 'absolute',
  bottom: 20,
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingHorizontal: 12,
  paddingVertical: 6,    
  borderRadius: 20,
},
  
locationText: { 
  color: '#fff',
  fontSize: 12 
},
  
container: { 
  paddingHorizontal: 15 
},
  
infoCard: {
  borderRadius: 16,
  padding: 20,
  marginVertical: 15,
  gap: 10,
  borderWidth: 1,
},
  
infoTitle: {
  fontSize: 18, 
  fontWeight: 'bold' 
},
  
infoText: { 
  fontSize: 14, 
  lineHeight: 22 
},

startButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: 16,
  borderRadius: 30,
  marginBottom: 25,
},
  
startButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 16 
},
  
sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 12 
},
  
poiCard: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 12,
  padding: 15,
  marginBottom: 10,
  gap: 12,
  borderWidth: 1,
},
  
poiIconBox: { 
  width: 45, 
  height: 45, 
  borderRadius: 12, 
  alignItems: 'center', 
  justifyContent: 'center' 
},
  
poiIconText: { 
  fontSize: 22 
},
  
poiCardInfo: { 
  flex: 1
},
  
poiCardName: { 
  fontSize: 15, 
  fontWeight: 'bold' 
},
  
poiCardType: { 
  fontSize: 12, 
  textTransform: 'capitalize', 
  marginTop: 2 
},
  
poiDistanceBadge: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 4
},
  
poiDistanceText: { 
  fontSize: 13, 
  fontWeight: 'bold' 
},
});
