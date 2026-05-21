import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function ShareItineraryScreen({ navigation }) {
  const { theme } = useApp();
  const [journeys, setJourneys] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    setProfileLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('journey')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setJourneys(data || []);
    }
    setProfileLoading(false);
  };

  const generatePDF = async (journey) => {
    setGenerating(true);
    setSelectedJourney(journey);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #2D2D2D;
                background: #FFF8F3;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #E07B39;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo { font-size: 48px; }
              .app-name {
                font-size: 32px;
                font-weight: bold;
                color: #E07B39;
              }
              .tagline { color: #888; font-size: 14px; }
              .title {
                font-size: 28px;
                font-weight: bold;
                color: #2D2D2D;
                margin: 20px 0;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
              }
              .info-card {
                background: white;
                border-radius: 10px;
                padding: 15px;
                border: 1px solid #e0e0e0;
              }
              .info-label {
                font-size: 12px;
                color: #888;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 18px;
                font-weight: bold;
                color: #E07B39;
              }
              .section {
                background: white;
                border-radius: 10px;
                padding: 20px;
                margin: 15px 0;
                border: 1px solid #e0e0e0;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #E07B39;
                margin-bottom: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                color: #888;
                font-size: 12px;
                border-top: 1px solid #e0e0e0;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">✈️</div>
              <div class="app-name">Passporter</div>
              <div class="tagline">Your travel companion</div>
            </div>

            <div class="title">Trip Itinerary</div>

            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Destination</div>
                <div class="info-value">${journey.destination}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Start Date</div>
                <div class="info-value">${journey.start_date}</div>
              </div>
              <div class="info-card">
                <div class="info-label">End Date</div>
                <div class="info-value">${journey.end_date}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Status</div>
                <div class="info-value">Confirmed</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📋 Trip Checklist</div>
              <ul>
                <li>✅ Book flights</li>
                <li>✅ Reserve hotel</li>
                <li>⬜ Pack luggage</li>
                <li>⬜ Check visa requirements</li>
                <li>⬜ Get travel insurance</li>
                <li>⬜ Exchange currency</li>
                <li>⬜ Download offline maps</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">💡 Travel Tips for ${journey.destination}</div>
              <p>• Research local customs and etiquette before arrival</p>
              <p>• Keep copies of important documents</p>
              <p>• Download offline maps for navigation</p>
              <p>• Notify your bank of international travel</p>
              <p>• Keep emergency numbers saved on your phone</p>
            </div>

            <div class="footer">
              Generated by Passporter — Your Travel Companion<br>
              Generated on ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      setGenerating(false);
      setSelectedJourney(null);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${journey.destination} Itinerary`,
        });
      } else {
        Alert.alert('PDF Created!', 'Your itinerary has been saved as a PDF.');
      }
    } catch (err) {
      setGenerating(false);
      setSelectedJourney(null);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Share Itinerary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="document-text-outline" size={24} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.subtext }]}>
            Select a journey to export as PDF and share with friends or family
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Journeys</Text>

        {profileLoading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 30 }} />
        ) : journeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No journeys to share yet</Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.accent }]}
              onPress={() => navigation.navigate('Itinerary')}
            >
              <Text style={styles.createButtonText}>Create a Journey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          journeys.map((journey) => (
            <View key={journey.id} style={[styles.journeyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.journeyInfo}>
                <Ionicons name="airplane-outline" size={24} color={theme.accent} />
                <View style={styles.journeyText}>
                  <Text style={[styles.journeyDestination, { color: theme.text }]}>{journey.destination}</Text>
                  <Text style={[styles.journeyDates, { color: theme.subtext }]}>
                    {journey.start_date} → {journey.end_date}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: theme.accent }]}
                onPress={() => generatePDF(journey)}
                disabled={generating}
              >
                {generating && selectedJourney?.id === journey.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={16} color="#fff" />
                    <Text style={styles.shareButtonText}>Export PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        {generating && (
          <View style={styles.generatingContainer}>
            <ActivityIndicator color={theme.accent} size="large" />
            <Text style={[styles.generatingText, { color: theme.subtext }]}>Generating PDF...</Text>
          </View>
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

infoCard: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  borderRadius: 12,
  padding: 15,
  marginBottom: 20,
  borderWidth: 1,
},

infoText: { 
  flex: 1, 
  fontSize: 13, 
  lineHeight: 20 
},
  
sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold',
  marginBottom: 12 
},
  
emptyContainer: { 
  alignItems: 'center', 
  paddingTop: 40, 
  gap: 15 
},
  
emptyText: { 
  fontSize: 16 
},
  
createButton: {
  paddingHorizontal: 25,
  paddingVertical: 12,
  borderRadius: 25,
},
  
createButtonText: { 
  color: '#fff', 
  fontWeight: 'bold' 
},
  
journeyCard: {
  borderRadius: 12,
  padding: 15,
  marginBottom: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
},
  
journeyInfo: {
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 12, 
  flex: 1 
},
  
journeyText: { 
  flex: 1 
},
  
journeyDestination: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},
  
journeyDates: { 
  fontSize: 12, 
  marginTop: 2 
},
  
shareButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
},
  
shareButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 13 
},
  
generatingContainer: { 
  alignItems: 'center', 
  paddingVertical: 20, 
  gap: 10 
},
  
generatingText: { 
  fontSize: 14 
},
});
