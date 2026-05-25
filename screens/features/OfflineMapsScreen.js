import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import { useApp } from '../../context/AppContext';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const OFFLINE_MAPS_DIR = FileSystem.documentDirectory + 'offline_maps/';

const availableMaps = [
  { id: '1', name: 'Cairo, Egypt', size: '31 MB', region: 'africa', icon: '🏛️' },
  { id: '2', name: 'Alexandria, Egypt', size: '22 MB', region: 'africa', icon: '🌊' },
  { id: '3', name: 'Paris, France', size: '45 MB', region: 'europe', icon: '🗼' },
  { id: '4', name: 'Tokyo, Japan', size: '62 MB', region: 'asia', icon: '🗾' },
  { id: '5', name: 'New York, USA', size: '38 MB', region: 'americas', icon: '🗽' },
  { id: '6', name: 'Bali, Indonesia', size: '28 MB', region: 'asia', icon: '🌴' },
  { id: '7', name: 'Dubai, UAE', size: '25 MB', region: 'middle_east', icon: '🏙️' },
  { id: '8', name: 'London, UK', size: '42 MB', region: 'europe', icon: '🎡' },
  { id: '9', name: 'Istanbul, Turkey', size: '35 MB', region: 'europe', icon: '🕌' },
  { id: '10', name: 'Barcelona, Spain', size: '30 MB', region: 'europe', icon: '🏖️' },
];


// Add this component above OfflineMapsScreen
function MapViewComponent({ openedMap, theme }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // City coordinates for each map
  const cityCoordinates = {
    '1': { latitude: 30.0444, longitude: 31.2357, name: 'Cairo' },      // Cairo
    '2': { latitude: 31.2001, longitude: 29.9187, name: 'Alexandria' }, // Alexandria
    '3': { latitude: 48.8566, longitude: 2.3522, name: 'Paris' },       // Paris
    '4': { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo' },     // Tokyo
    '5': { latitude: 40.7128, longitude: -74.0060, name: 'New York' },  // New York
    '6': { latitude: -8.3405, longitude: 115.0920, name: 'Bali' },      // Bali
    '7': { latitude: 25.2048, longitude: 55.2708, name: 'Dubai' },      // Dubai
    '8': { latitude: 51.5074, longitude: -0.1278, name: 'London' },     // London
    '9': { latitude: 41.0082, longitude: 28.9784, name: 'Istanbul' },   // Istanbul
    '10': { latitude: 41.3851, longitude: 2.1734, name: 'Barcelona' },  // Barcelona
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        setUserLocation(loc.coords);
      }
    } catch (err) {
      console.log('Location error:', err);
    }
    setMapReady(true);
  };

  if (!openedMap) return null;

  const cityCoord = cityCoordinates[openedMap.id] || cityCoordinates['1'];

  return (
    <View style={{ flex: 1 }}>
      {mapReady ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: cityCoord.latitude,
            longitude: cityCoord.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsBuildings={true}
          showsTraffic={false}
        >
          {/* City center marker */}
          <Marker
            coordinate={{
              latitude: cityCoord.latitude,
              longitude: cityCoord.longitude,
            }}
            title={cityCoord.name}
            description={`Offline map: ${openedMap.name}`}
            pinColor="#1A3C6E"
          />

          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="You are here"
              pinColor="#2D6BC4"
            />
          )}
        </MapView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15 }}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={{ color: theme.subtext, fontSize: 14 }}>Loading map...</Text>
        </View>
      )}

      {/* Bottom info card */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 15,
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <Text style={{ fontSize: 24 }}>{openedMap.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>
            {openedMap.name}
          </Text>
          <Text style={{ color: '#27ae60', fontSize: 12, marginTop: 2 }}>
            ✅ Cached offline • {openedMap.size}
          </Text>
        </View>
        {userLocation && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="location" size={18} color={theme.accent} />
            <Text style={{ color: theme.subtext, fontSize: 10 }}>GPS Active</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function OfflineMapsScreen({ navigation }) {
  const { theme } = useApp();
  const [downloadedMaps, setDownloadedMaps] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [networkState, setNetworkState] = useState(null);
  const [progress, setProgress] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [openedMap, setOpenedMap] = useState(null);

  useEffect(() => {
    checkNetwork();
    loadDownloadedMaps();
    ensureDirectory();
  }, []);

  const ensureDirectory = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(OFFLINE_MAPS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(OFFLINE_MAPS_DIR, { intermediates: true });
      }
    } catch (err) {
      console.log('Dir error:', err);
    }
  };

  const checkNetwork = async () => {
    const state = await Network.getNetworkStateAsync();
    setNetworkState(state);
  };

  const loadDownloadedMaps = async () => {
    try {
      await ensureDirectory();
      const files = await FileSystem.readDirectoryAsync(OFFLINE_MAPS_DIR);
      setDownloadedMaps(files);
    } catch (err) {
      setDownloadedMaps([]);
    }
  };

  const downloadMap = async (map) => {
    if (!networkState?.isConnected) {
      Alert.alert('No Connection', 'Please connect to the internet to download maps.');
      return;
    }
    setDownloading(map.id);
    setProgress(0);
    try {
      const fileName = `${map.region}_${map.id}.mapdata`;
      const filePath = OFFLINE_MAPS_DIR + fileName;
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify({
        id: map.id, name: map.name, region: map.region,
        downloadedAt: new Date().toISOString(), size: map.size,
      }));
      await loadDownloadedMaps();
      Alert.alert('Downloaded! 🗺️', `${map.name} is now available offline.`);
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
    setDownloading(null);
    setProgress(0);
  };

  const deleteMap = async (map) => {
    Alert.alert('Delete Map', `Delete ${map.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const fileName = `${map.region}_${map.id}.mapdata`;
            await FileSystem.deleteAsync(OFFLINE_MAPS_DIR + fileName);
            await loadDownloadedMaps();
          } catch (err) { console.error(err); }
        },
      },
    ]);
  };

  const isDownloaded = (map) => downloadedMaps.includes(`${map.region}_${map.id}.mapdata`);

  const openMap = (map) => {
    if (!isDownloaded(map)) {
      Alert.alert('Not Downloaded', 'Download this map first to open it offline.');
      return;
    }
    setOpenedMap(map);
  };

  const filteredMaps = availableMaps.filter(m =>
    m.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Offline Maps</Text>
        <TouchableOpacity onPress={checkNetwork}>
          <Ionicons name="refresh-outline" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.networkCard, networkState?.isConnected ? styles.onlineCard : styles.offlineCard]}>
          <Ionicons name="wifi-outline" size={20} color={networkState?.isConnected ? '#27ae60' : '#e74c3c'} />
          <Text style={[styles.networkText, { color: networkState?.isConnected ? '#27ae60' : '#e74c3c' }]}>
            {networkState?.isConnected ? `Online — ${networkState.type || 'Connected'}` : 'Offline — Using cached maps'}
          </Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.subtext} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search cities..."
            placeholderTextColor={theme.subtext}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {downloadedMaps.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Downloaded ({availableMaps.filter(m => isDownloaded(m)).length})
            </Text>
            {availableMaps.filter(m => isDownloaded(m)).map((map) => (
              <TouchableOpacity key={map.id} style={[styles.mapCard, styles.downloadedMapCard]} onPress={() => openMap(map)}>
                <Text style={styles.mapIcon}>{map.icon}</Text>
                <View style={styles.mapInfo}>
                  <Text style={[styles.mapName, { color: theme.text }]}>{map.name}</Text>
                  <View style={styles.mapStatusRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                    <Text style={styles.downloadedText}>Downloaded • {map.size}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.openButton, { backgroundColor: theme.accent }]} onPress={() => openMap(map)}>
                  <Text style={styles.openButtonText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMap(map)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Maps</Text>
        {filteredMaps.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={[styles.noResultsText, { color: theme.subtext }]}>No maps found</Text>
          </View>
        ) : (
          filteredMaps.map((map) => (
            <View key={map.id} style={[styles.mapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.mapIcon}>{map.icon}</Text>
              <View style={styles.mapInfo}>
                <Text style={[styles.mapName, { color: theme.text }]}>{map.name}</Text>
                <Text style={[styles.mapSize, { color: theme.subtext }]}>{map.size}</Text>
              </View>
              {downloading === map.id ? (
                <View style={styles.downloadingContainer}>
                  <ActivityIndicator color={theme.accent} size="small" />
                  <Text style={[styles.progressText, { color: theme.accent }]}>{progress}%</Text>
                </View>
              ) : isDownloaded(map) ? (
                <TouchableOpacity style={styles.downloadedBadge} onPress={() => openMap(map)}>
                  <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                  <Text style={styles.downloadedBadgeText}>Ready</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.downloadButton, { backgroundColor: theme.accent }]}
                  onPress={() => downloadMap(map)}
                  disabled={!!downloading}
                >
                  <Ionicons name="download-outline" size={16} color="#fff" />
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal
  visible={!!openedMap}
  animationType="slide"
  presentationStyle="fullScreen"
  onRequestClose={() => setOpenedMap(null)}
>
  <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
    <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={() => setOpenedMap(null)}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        {openedMap?.name}
      </Text>
      <View style={{ width: 24 }} />
    </View>

    {/* Real Map */}
    <MapViewComponent openedMap={openedMap} theme={theme} />
  </SafeAreaView>
</Modal>
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
    paddingVertical: 50 
},

headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
},
  
container: { 
    paddingHorizontal: 15 
},
  
networkCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 15 
},
  
onlineCard: { 
    backgroundColor: '#e8f5e9' 
},
  
offlineCard: { 
    backgroundColor: '#fff0f0' 
},
  
networkText: { 
    fontSize: 14, 
    fontWeight: '500' 
},
  
searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 12, 
    gap: 8, 
    marginBottom: 15 
},
  
searchInput: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 14 
},
  
sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    marginTop: 5 
},
  
mapCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    gap: 12, 
    borderWidth: 1 
},
  
downloadedMapCard: { 
    borderColor: '#27ae60', 
    backgroundColor: '#f0fff4' 
},
  
mapIcon: { 
    fontSize: 30 
},
  
mapInfo: { 
    flex: 1 
},
  
mapName: { 
    fontSize: 15, 
    fontWeight: 'bold' 
},
  
mapSize: { 
    fontSize: 12, 
    marginTop: 2 
},
  
mapStatusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 2 
},
  
downloadedText: { 
    fontSize: 12, 
    color: '#27ae60' 
},
  
downloadingContainer: { 
    alignItems: 'center', 
    gap: 4 
},
  
progressText: { 
    fontSize: 11, 
    fontWeight: 'bold' 
},
  
downloadedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
},
  
downloadedBadgeText: { 
    fontSize: 13, 
    color: '#27ae60', 
    fontWeight: 'bold' 
},
  
openButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 18 
},
  
openButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 12 
},
  
downloadButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20 
},

downloadButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 12 
},

noResults: { 
    alignItems: 'center', 
    paddingVertical: 20 
},

noResultsText: { 
    fontSize: 14 
},
  
offlinePreview: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 30, 
    gap: 12 
},
  
offlinePreviewIcon: { 
    fontSize: 64 
},
  
offlinePreviewTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
},
  
offlinePreviewText: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 21 
},
  
offlinePreviewCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    padding: 15, 
    marginTop: 8 
},
  
offlinePreviewCardText: { 
    flex: 1, 
    fontSize: 13, 
    lineHeight: 19 
},
});
