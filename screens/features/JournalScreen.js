import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const popularLocations = [
  'Paris, France', 'Tokyo, Japan', 'New York, USA', 'Bali, Indonesia',
  'Cairo, Egypt', 'Dubai, UAE', 'London, UK', 'Rome, Italy',
  'Barcelona, Spain', 'Istanbul, Turkey', 'Amsterdam, Netherlands',
  'Luxor, Egypt', 'Santorini, Greece', 'Maldives', 'Kyoto, Japan',
  'New Zealand', 'Morocco', 'Cape Town, South Africa', 'Phuket, Thailand',
];

export default function JournalScreen({ navigation }) {
  const { theme, user } = useApp();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [adding, setAdding] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const handleLocationChange = (text) => {
    setLocation(text);
    if (text.length >= 2) {
      const filtered = popularLocations.filter(l =>
        l.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow location access.');
        setGettingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo[0]) {
        const city = geo[0].city || geo[0].district || '';
        const country = geo[0].country || '';
        setLocation(city && country ? `${city}, ${country}` : country || city);
        setShowSuggestions(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not get location. Please type it manually.');
    }
    setGettingLocation(false);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setSelectedImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) {
      setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const addEntry = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Fields', 'Please add a title and content.');
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from('journal_entries').insert([{
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        location: location.trim(),
        image_url: selectedImages[0] || null,
        images: selectedImages.length > 0 ? selectedImages.join(',') : null,
      }]);
      if (error) throw error;
      setTitle('');
      setContent('');
      setLocation('');
      setSelectedImages([]);
      setShowForm(false);
      fetchEntries();
      Alert.alert('Saved! 📔', 'Your journal entry has been saved!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setAdding(false);
  };

  const getImages = (entry) => {
    if (entry.images && entry.images.trim() !== '') {
      const urls = entry.images.split(',').map(u => u.trim()).filter(u => u.length > 0);
      if (urls.length > 0) return urls;
    }
    if (entry.image_url) return [entry.image_url];
    return [];
  };

  const deleteEntry = async (id) => {
    Alert.alert('Delete', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('journal_entries').delete().eq('id', id);
          fetchEntries();
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Journal</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close-outline' : 'add-outline'} size={28} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {showForm && (
            <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.formTitle, { color: theme.text }]}>✍️ New Entry</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                placeholder="Entry title..."
                placeholderTextColor={theme.subtext}
                value={title}
                onChangeText={setTitle}
              />

              <View>
                <View style={[styles.locationRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Ionicons name="location-outline" size={16} color={theme.accent} />
                  <TextInput
                    style={[styles.locationInput, { color: theme.text }]}
                    placeholder="Add location..."
                    placeholderTextColor={theme.subtext}
                    value={location}
                    onChangeText={handleLocationChange}
                  />
                  <TouchableOpacity onPress={getCurrentLocation} disabled={gettingLocation}>
                    {gettingLocation
                      ? <ActivityIndicator size="small" color={theme.accent} />
                      : <Ionicons name="navigate-outline" size={18} color={theme.accent} />
                    }
                  </TouchableOpacity>
                </View>

                {showSuggestions && (
                  <View style={[styles.suggestionsBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {suggestions.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.suggestionItem, i < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                        onPress={() => { setLocation(s); setShowSuggestions(false); }}
                      >
                        <Ionicons name="location-outline" size={14} color={theme.accent} />
                        <Text style={[styles.suggestionText, { color: theme.text }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TextInput
                style={[styles.contentInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                placeholder="Write about your experience..."
                placeholderTextColor={theme.subtext}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                onFocus={() => {
                  setShowSuggestions(false);
                  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
                }}
              />

              <Text style={[styles.photoLabel, { color: theme.text }]}>
                📸 Photos ({selectedImages.length}/5)
              </Text>

              {selectedImages.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.previewContainer}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close-circle" size={22} color="#e74c3c" />
                      </TouchableOpacity>
                      {index === 0 && (
                        <View style={[styles.mainBadge, { backgroundColor: theme.accent }]}>
                          <Text style={styles.mainBadgeText}>Main</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}

              {selectedImages.length < 5 && (
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={[styles.photoBtn, { backgroundColor: theme.accent }]} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={18} color="#fff" />
                    <Text style={styles.photoBtnText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.photoBtn, { backgroundColor: theme.primary }]} onPress={pickImages}>
                    <Ionicons name="images-outline" size={18} color="#fff" />
                    <Text style={styles.photoBtnText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.accent }]}
                onPress={addEntry}
                disabled={adding}
              >
                {adding
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveButtonText}>Save Entry</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 40 }} />
          ) : entries.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No entries yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.subtext }]}>Tap + to write your first entry!</Text>
            </View>
          ) : (
            entries.map((entry) => {
              const imgs = getImages(entry);
              return (
                <View key={entry.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

                  {imgs.length === 1 && (
                    <Image
                      source={{ uri: imgs[0] }}
                      style={styles.cardImageSingle}
                      resizeMode="cover"
                    />
                  )}

                  {imgs.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.cardImagesRow}
                    >
                      {imgs.map((url, i) => (
                        <Image
                          key={i}
                          source={{ uri: url }}
                          style={styles.cardImageMultiple}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.cardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{entry.title}</Text>
                      <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                        <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                    {entry.location ? (
                      <View style={styles.locationTag}>
                        <Ionicons name="location-outline" size={12} color={theme.accent} />
                        <Text style={[styles.locationTagText, { color: theme.accent }]}>{entry.location}</Text>
                      </View>
                    ) : null}
                    {imgs.length > 1 && (
                      <Text style={[styles.photoCount, { color: theme.subtext }]}>📸 {imgs.length} photos</Text>
                    )}
                    <Text style={[styles.cardContent, { color: theme.subtext }]} numberOfLines={3}>
                      {entry.content}
                    </Text>
                    <Text style={[styles.cardDate, { color: theme.subtext }]}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  paddingVertical: 10 
},

headerTitle: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

container: { 
  flex: 1, 
  paddingHorizontal: 15 
},

form: { 
  borderRadius: 16, 
  padding: 16, 
  marginBottom: 20, 
  gap: 12, 
  borderWidth: 1 
},

formTitle: { 
  fontSize: 18, 
  fontWeight: 'bold' 
},

input: { 
  borderWidth: 1, 
  borderRadius: 10, 
  padding: 12, 
  fontSize: 15, 
  fontWeight: '600' 
},

locationRow: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  borderRadius: 10, 
  borderWidth: 1, 
  paddingHorizontal: 12, 
  gap: 8 
},

locationInput: { 
  flex: 1, 
  paddingVertical: 10, 
  fontSize: 13 
},

suggestionsBox: { 
  borderRadius: 10, 
  borderWidth: 1, 
  marginTop: 4, 
  overflow: 'hidden', 
  elevation: 5 
},

suggestionItem: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  padding: 10, 
  gap: 8 
},

suggestionText: { 
  fontSize: 13 
},

contentInput: { 
  borderWidth: 1, 
  borderRadius: 10, 
  padding: 12, 
  fontSize: 14, 
  minHeight: 120 
},

photoLabel: { 
  fontSize: 14, 
  fontWeight: '600' 
},

previewContainer: { 
  position: 'relative', 
  marginRight: 8 
},

previewImage: { 
  width: 90, 
  height: 90, 
  borderRadius: 10 
},

removeBtn: { 
  position: 'absolute', 
  top: -6, 
  right: -6, 
  backgroundColor: '#fff', 
  borderRadius: 11 
},

mainBadge: { 
  position: 'absolute', 
  bottom: 5, 
  left: 5, 
  paddingHorizontal: 6, 
  paddingVertical: 2, 
  borderRadius: 8 
},

mainBadgeText: { 
  color: '#fff', 
  fontSize: 9, 
  fontWeight: 'bold' 
},

photoButtons: { 
  flexDirection: 'row', 
  gap: 10 
},

photoBtn: { 
  flex: 1, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: 6, 
  padding: 10, 
  borderRadius: 10 
},

photoBtnText: { 
  color: '#fff', 
  fontWeight: '600', 
  fontSize: 13 
},

saveButton: { 
  padding: 14, 
  borderRadius: 25, 
  alignItems: 'center', 
  marginTop: 5 
},

saveButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 15 
},

empty: { 
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

card: { 
  borderRadius: 12, 
  marginBottom: 12, 
  borderWidth: 1, 
  overflow: 'hidden' 
},

cardImageSingle: { 
  width: '100%', 
  height: 200 
},

cardImagesRow: { 
  padding: 8 
},

cardImageMultiple: { 
  width: 160, 
  height: 120, 
  borderRadius: 10, 
  marginRight: 8 
},

cardBody: { 
  padding: 15, 
  gap: 6 
},

cardTitleRow: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
},

cardTitle: { 
  fontSize: 16, 
  fontWeight: 'bold', 
  flex: 1 
},

locationTag: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 4 
},

locationTagText: { 
  fontSize: 12 
},

photoCount: { 
  fontSize: 12 
},

cardContent: { 
  fontSize: 13, 
  lineHeight: 20 
},

cardDate: { 
  fontSize: 11 
},
});