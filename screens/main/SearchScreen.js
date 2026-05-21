import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function SearchScreen({ navigation }) {
  const { theme } = useApp();
  const [searchText, setSearchText] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchAllDestinations();
  }, []);

  useEffect(() => {
    if (searchText.length >= 1) {
      getAutocompleteSuggestions(searchText);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchText]);

  const fetchAllDestinations = async () => {
    setProfileLoading(true);
    const { data } = await supabase
      .from('destinations')
      .select('*')
      .order('rating', { ascending: false });
    setDestinations(data || []);
    setProfileLoading(false);
  };

  const getAutocompleteSuggestions = async (text) => {
    setSearching(true);
    const { data } = await supabase
      .from('destinations')
      .select('id, name, country')
      .or(`name.ilike.${text}%,country.ilike.${text}%`)
      .limit(5);
    setSuggestions(data || []);
    setSearching(false);
  };

  const handleSelectSuggestion = (dest) => {
    setSearchText(dest.name);
    setShowSuggestions(false);
    navigation.navigate('DestinationDetails', { destination: dest });
  };

  const getFilteredDestinations = () => {
    if (!searchText.trim()) return destinations;
    return destinations.filter(d =>
      d.name.toLowerCase().includes(searchText.toLowerCase()) ||
      d.country.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={20} color={theme.subtext} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search destinations, countries..."
            placeholderTextColor={theme.subtext}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchText('');
              setShowSuggestions(false);
            }}>
              <Ionicons name="close-circle" size={20} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>

        
        {showSuggestions && (
          <View style={[styles.suggestionsBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {searching ? (
              <View style={styles.suggestingLoader}>
                <ActivityIndicator color={theme.accent} size="small" />
                <Text style={[styles.suggestingText, { color: theme.subtext }]}>Searching...</Text>
              </View>
            ) : suggestions.length === 0 ? (
              <View style={styles.noSuggestions}>
                <Text style={[styles.noSuggestionsText, { color: theme.subtext }]}>
                  No destinations found for "{searchText}"
                </Text>
              </View>
            ) : (
              suggestions.map((dest, index) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[
                    styles.suggestionItem,
                    index < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
                  ]}
                  onPress={() => handleSelectSuggestion(dest)}>

                  <Ionicons name="location-outline" size={16} color={theme.accent} />
                  <View style={styles.suggestionText}>
                    <Text style={[styles.suggestionName, { color: theme.text }]}>{dest.name}</Text>
                    <Text style={[styles.suggestionCountry, { color: theme.subtext }]}>{dest.country}</Text>
                  </View>
                  <Ionicons name="arrow-forward-outline" size={14} color={theme.subtext} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      <Text style={[styles.resultsText, { color: theme.subtext }]}>
        {filteredDestinations.length} destinations found
      </Text>

      {profileLoading ? (
        <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setShowSuggestions(false)}>
            
          {filteredDestinations.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={50} color={theme.border} />
              <Text style={[styles.noResultsText, { color: theme.subtext }]}>
                No destinations found
              </Text>
            </View>
          ) : (
            filteredDestinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={[styles.destinationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('DestinationDetails', { destination: dest })}
              >
                <Image source={{ uri: dest.image_url }} style={styles.destinationImage} />
                <View style={styles.destinationInfo}>
                  <Text style={[styles.destinationName, { color: theme.text }]}>{dest.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={theme.accent} />
                    <Text style={[styles.destinationCountry, { color: theme.accent }]}>
                      {dest.country}
                    </Text>
                  </View>
                  <Text style={[styles.destinationDesc, { color: theme.subtext }]} numberOfLines={2}>
                    {dest.description}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#F4A261" />
                    <Text style={[styles.ratingText, { color: theme.text }]}>{dest.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
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
  searchWrapper: { paddingHorizontal: 15, marginTop: 10, zIndex: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  suggestionsBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestingLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 15,
  },
  suggestingText: { fontSize: 13 },
  noSuggestions: { padding: 15 },
  noSuggestionsText: { fontSize: 13 },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: 14, fontWeight: '600' },
  suggestionCountry: { fontSize: 12, marginTop: 1 },
  resultsText: { fontSize: 13, paddingHorizontal: 15, marginTop: 10, marginBottom: 5 },
  container: { paddingHorizontal: 15 },
  noResults: { alignItems: 'center', paddingTop: 50, gap: 10 },
  noResultsText: { fontSize: 16 },
  destinationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  destinationImage: { width: 110, height: 110 },
  destinationInfo: { flex: 1, padding: 12, gap: 4 },
  destinationName: { fontSize: 16, fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  destinationCountry: { fontSize: 12 },
  destinationDesc: { fontSize: 12, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: 'bold' },
});