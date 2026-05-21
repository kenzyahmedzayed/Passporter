import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';

export default function BoardingPassScreen({ navigation }) {
  const { theme } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [boardingInfo, setBoardingInfo] = useState(null);

  const parseBarcode = (data) => {
    return {
      raw: data,
      flightNumber: 'MS ' + Math.floor(Math.random() * 9000 + 1000),
      passenger: 'John Doe',
      from: 'CAI - Cairo',
      to: 'CDG - Paris',
      date: 'Jun 15, 2024',
      seat: Math.floor(Math.random() * 30 + 1) + ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      gate: 'B' + Math.floor(Math.random() * 20 + 1),
      boarding: '10:30',
      departure: '11:45',
    };
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanning(false);
    setBoardingInfo(parseBarcode(data));
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera access is needed to scan boarding passes.');
        return;
      }
    }
    setScanned(false);
    setBoardingInfo(null);
    setScanning(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          setScanning(false);
          navigation.goBack();
        }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Boarding Pass Scanner</Text>
        <View style={{ width: 24 }} />
      </View>

      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417', 'code128', 'code39'] }}
          />
          <View style={styles.scanOverlay}>
            <View style={[styles.scanFrame, { borderColor: theme.accent }]} />
            <Text style={styles.scanText}>Point camera at boarding pass barcode</Text>
          </View>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.accent }]}
            onPress={() => setScanning(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {!boardingInfo ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="barcode-outline" size={80} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Scan Your Boarding Pass</Text>
              <Text style={[styles.emptySubtext, { color: theme.subtext }]}>
                Point your camera at the barcode on your boarding pass to auto-fill your flight details
              </Text>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: theme.accent }]}
                onPress={startScanning}
              >
                <Ionicons name="scan-outline" size={22} color="#fff" />
                <Text style={styles.scanButtonText}>Start Scanning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.boardingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.boardingHeader}>
                <Ionicons name="airplane" size={30} color={theme.accent} />
                <Text style={[styles.boardingTitle, { color: theme.text }]}>Boarding Pass</Text>
                <Text style={[styles.flightNumber, { color: theme.subtext }]}>{boardingInfo.flightNumber}</Text>
              </View>

              <View style={styles.routeRow}>
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeCode, { color: theme.text }]}>CAI</Text>
                  <Text style={[styles.routeCity, { color: theme.subtext }]}>Cairo</Text>
                </View>
                <View style={styles.routeArrow}>
                  <Ionicons name="airplane-outline" size={24} color={theme.accent} />
                </View>
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeCode, { color: theme.text }]}>CDG</Text>
                  <Text style={[styles.routeCity, { color: theme.subtext }]}>Paris</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.detailsGrid}>
                {[
                  { label: 'Passenger', value: boardingInfo.passenger },
                  { label: 'Date', value: boardingInfo.date },
                  { label: 'Seat', value: boardingInfo.seat },
                  { label: 'Gate', value: boardingInfo.gate },
                  { label: 'Boarding', value: boardingInfo.boarding },
                  { label: 'Departure', value: boardingInfo.departure },
                ].map((item, i) => (
                  <View key={i} style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.subtext }]}>{item.label}</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.rescanButton, { borderColor: theme.accent }]}
                onPress={startScanning}
              >
                <Ionicons name="scan-outline" size={18} color={theme.accent} />
                <Text style={[styles.rescanText, { color: theme.accent }]}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          )}
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
},

headerTitle: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

cameraContainer: { 
  flex: 1, 
  position: 'relative' 
},

camera: { 
  flex: 1
},

scanOverlay: {
  position: 'absolute',
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
},

scanFrame: {
  width: 250,
  height: 150,
  borderWidth: 3,
  borderRadius: 12,
  backgroundColor: 'transparent',
},

scanText: {
  color: '#fff',
  fontSize: 14,
  textAlign: 'center',
  backgroundColor: '#00000080',
  padding: 10,
  borderRadius: 8,
},

cancelButton: {
  position: 'absolute',
  bottom: 40,
  alignSelf: 'center',
  paddingHorizontal: 30,
  paddingVertical: 12,
  borderRadius: 25,
},

cancelButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 16 
},

container: { 
  paddingHorizontal: 15 
},

emptyContainer: { 
  alignItems: 'center', 
  paddingTop: 40, 
  gap: 15, 
  paddingHorizontal: 20 
},

emptyTitle: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

emptySubtext: { 
  fontSize: 14, 
  textAlign: 'center', 
  lineHeight: 22 
},

scanButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingHorizontal: 30,
  paddingVertical: 14,
  borderRadius: 30,
  marginTop: 10,
},

scanButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 16 
},

boardingCard: {
  borderRadius: 20,
  padding: 20,
  marginTop: 10,
  borderWidth: 1,
  gap: 15,
},

boardingHeader: { 
  alignItems: 'center', 
  gap: 5 
},

boardingTitle: { 
  fontSize: 18, 
  fontWeight: 'bold' 
},

flightNumber: { 
  fontSize: 14 
},

routeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 10,
},

routeInfo: { 
  alignItems: 'center', 
  gap: 4 
},

routeCode: { 
  fontSize: 28, 
  fontWeight: 'bold' 
},

routeCity: { 
  fontSize: 12 
},

routeArrow: { 
  alignItems: 'center' 
},

divider: { 
  height: 1 
},

detailsGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  gap: 15 
},

detailItem: { 
  width: '45%', 
  gap: 3 
},

detailLabel: { 
  fontSize: 12 
},

detailValue: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},

rescanButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: 12,
  borderRadius: 25,
  borderWidth: 1,
},
  
rescanText: { 
  fontWeight: 'bold', 
  fontSize: 14 
},
});
