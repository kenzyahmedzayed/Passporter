import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const photoGridSize = (width - 46) / 3;
const recentPhotoSize = (width - 76) / 3;

export default function ProfileScreen({ navigation }) {
  const appContext = useApp();
  const profile = appContext?.profile;
  const user = appContext?.user;
  const tr = appContext?.t;
  const theme = appContext?.theme;
  const dispatch = appContext?.dispatch;
  const logout = appContext?.logout;

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripPhotos, setTripPhotos] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
  if (profile) {
    setFullName(profile.full_name || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatar_url || null); 
  }
}, [profile]);

  useFocusEffect(
    useCallback(() => {
      fetchTripsAndPhotos();
    }, [user?.id])
  );

  const getEntryImages = (entry) => {
    if (Array.isArray(entry.images)) {
      const urls = entry.images.map(url => String(url).trim()).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    if (typeof entry.images === 'string' && entry.images.trim() !== '') {
      const urls = entry.images.split(',').map(url => url.trim()).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    return entry.image_url ? [entry.image_url] : [];
  };

  const fetchTripsAndPhotos = async () => {
  if (!user) {
    setTrips([]);
    setTripPhotos([]);
    setProfileLoading(false);
    return;
  }
  setProfileLoading(true);
  try {
    const { data: journeyData } = await supabase
      .from('journey')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: photoData } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTrips(journeyData || []);
    const allPhotos = (photoData || []).reduce((photos, entry) => {
      getEntryImages(entry).forEach((url, index) => photos.push({
        id: `${entry.id}-${index}`,
        image_url: url,
        title: entry.title,
        location: entry.location,
        created_at: entry.created_at,
      }));
      return photos;
    }, []);
    setTripPhotos(allPhotos);
  } catch (err) {
    console.log('Error:', err);
  }
  setProfileLoading(false);
};

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio })
      .eq('id', user.id);
    if (!error) {
      dispatch({ type: 'SET_PROFILE', payload: { ...profile, full_name: fullName, bio } });
      Alert.alert('Success!', 'Profile updated!');
      setEditing(false);
    } else {
      Alert.alert('Error', error.message);
    }
    setSaving(false);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
  if (!user) return;
  setUploadingAvatar(true);
  try {
    await supabase.from('profiles')
      .update({ avatar_url: uri })
      .eq('id', user.id);
    setAvatarUrl(uri);
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, avatar_url: uri } });
    Alert.alert('Success!', 'Profile picture updated!');
  } catch (err) {
    Alert.alert('Error', err.message);
  }
  setUploadingAvatar(false);
};

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      },
    ]);
  };

  if (!theme) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1A3C6E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {tr?.profile || 'Profile'}
        </Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Ionicons
            name={editing ? 'close-outline' : 'create-outline'}
            size={24}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity onPress={editing ? pickAvatar : null} style={styles.avatarContainer}>
{avatarUrl ? (
  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
) : profile?.avatar_url ? (
  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
) : (
  <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
    <Text style={styles.avatarText}>
      {profile?.full_name?.[0]?.toUpperCase() || 'T'}
    </Text>
  </View>
)}
            {editing && (
              <View style={[styles.editAvatarBadge, { backgroundColor: theme.accent }]}>
                <Ionicons name="camera-outline" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {editing ? (
            <View style={styles.editForm}>
              <TextInput
                style={[styles.editInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor={theme.subtext}
              />
              <TextInput
                style={[styles.editInput, styles.bioInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Bio"
                placeholderTextColor={theme.subtext}
                multiline
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.accent }]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {profile?.full_name || 'Traveler'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.subtext }]}>
                {user?.email || ''}
              </Text>
              {profile?.bio ? (
                <Text style={[styles.profileBio, { color: theme.subtext }]}>{profile.bio}</Text>
              ) : null}
            </>
          )}

          <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>{trips.length}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Trips</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>{tripPhotos.length}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Photos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {new Set(trips.map(trip => trip.destination)).size}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Places</Text>
            </View>
          </View>
        </View>

        <View style={[styles.tabRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {['overview', 'trips', 'photos'].map((tab) => (
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

        {profileLoading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 30 }} />
        ) : (
          <>
            {activeTab === 'overview' && (
              <View style={styles.tabContent}>
                {trips.length === 0 && tripPhotos.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>✈️</Text>
                    <Text style={[styles.emptyText, { color: theme.subtext }]}>No trips or photos yet!</Text>
                    <TouchableOpacity
                      style={[styles.planButton, { backgroundColor: theme.accent }]}
                      onPress={() => navigation.navigate('Itinerary')}
                    >
                      <Text style={styles.planButtonText}>Plan a Trip</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  trips.slice(0, 3).map((trip) => (
                    <View key={trip.id} style={[styles.tripOverviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.tripOverviewHeader}>
                        <View style={[styles.tripIconBox, { backgroundColor: theme.primary + '20' }]}>
                          <Ionicons name="airplane-outline" size={22} color={theme.accent} />
                        </View>
                        <View style={styles.tripOverviewInfo}>
                          <Text style={[styles.tripOverviewDest, { color: theme.text }]}>{trip.destination}</Text>
                          <Text style={[styles.tripOverviewDates, { color: theme.subtext }]}>
                            {trip.start_date} → {trip.end_date}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
                {tripPhotos.length > 0 && (
                  <View style={[styles.overviewSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.overviewSectionHeader}>
                      <Text style={[styles.overviewSectionTitle, { color: theme.text }]}>Recent Photos</Text>
                      <TouchableOpacity onPress={() => setActiveTab('photos')}>
                        <Text style={[styles.overviewLink, { color: theme.accent }]}>View all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.recentPhotosGrid}>
                      {tripPhotos.slice(0, 6).map((photo) => (
                        <Image key={photo.id} source={{ uri: photo.image_url }} style={styles.recentPhoto} resizeMode="cover" />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'trips' && (
              <View style={styles.tabContent}>
                {trips.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🗺️</Text>
                    <Text style={[styles.emptyText, { color: theme.subtext }]}>No trips yet</Text>
                  </View>
                ) : (
                  trips.map((trip) => (
                    <View key={trip.id} style={[styles.tripCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Ionicons name="airplane-outline" size={22} color={theme.accent} />
                      <View style={styles.tripInfo}>
                        <Text style={[styles.tripDest, { color: theme.text }]}>{trip.destination}</Text>
                        <Text style={[styles.tripDates, { color: theme.subtext }]}>{trip.start_date} → {trip.end_date}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'photos' && (
              <View style={styles.tabContent}>
                {tripPhotos.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📷</Text>
                    <Text style={[styles.emptyText, { color: theme.subtext }]}>No photos yet</Text>
                  </View>
                ) : (
                  <View style={styles.photosGrid}>
                    {tripPhotos.map((photo) => (
                      <Image key={photo.id} source={{ uri: photo.image_url }} style={styles.gridPhoto} resizeMode="cover" />
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#fff0f0', borderColor: '#ffcccc' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>{tr?.logout || 'Logout'}</Text>
        </TouchableOpacity>

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
  profileCard: { borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, marginBottom: 15, borderWidth: 1 },
  avatarContainer: { position: 'relative', marginBottom: 5 },
  avatarCircle: { width: 85, height: 85, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 85, height: 85, borderRadius: 42 },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 22, fontWeight: 'bold' },
  profileEmail: { fontSize: 14 },
  profileBio: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  editForm: { width: '100%', gap: 10 },
  editInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, width: '100%' },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { padding: 14, borderRadius: 25, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginTop: 10, paddingTop: 15, borderTopWidth: 1 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 30 },
  tabRow: { flexDirection: 'row', borderRadius: 12, marginBottom: 15, borderWidth: 1, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabContent: { gap: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15 },
  planButton: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, marginTop: 5 },
  planButtonText: { color: '#fff', fontWeight: 'bold' },
  overviewSection: { borderRadius: 12, padding: 15, gap: 12, borderWidth: 1 },
  overviewSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overviewSectionTitle: { fontSize: 16, fontWeight: 'bold' },
  overviewLink: { fontSize: 13, fontWeight: '600' },
  recentPhotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentPhoto: { width: recentPhotoSize, height: recentPhotoSize, borderRadius: 10 },
  tripOverviewCard: { borderRadius: 12, padding: 15, gap: 12, borderWidth: 1 },
  tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripIconBox: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tripOverviewInfo: { flex: 1 },
  tripOverviewDest: { fontSize: 16, fontWeight: 'bold' },
  tripOverviewDates: { fontSize: 12, marginTop: 2 },
  tripPhotoRow: { marginTop: 5 },
  tripPhoto: { width: 100, height: 80, borderRadius: 8, marginRight: 8 },
  tripCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 15, gap: 12, borderWidth: 1 },
  tripInfo: { flex: 1 },
  tripDest: { fontSize: 15, fontWeight: 'bold' },
  tripDates: { fontSize: 12, marginTop: 2 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridPhoto: { width: photoGridSize, height: photoGridSize, borderRadius: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 12, borderWidth: 1, marginTop: 20 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 15 },
});