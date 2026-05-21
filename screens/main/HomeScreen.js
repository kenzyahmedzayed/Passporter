import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const quickActions = [
  { id: '1', title: 'weather', icon: 'partly-sunny-outline', screen: 'Weather', color: '#4A90D9' },
  { id: '2', title: 'currency', icon: 'cash-outline', screen: 'Currency', color: '#27ae60' },
  { id: '3', title: 'sos', icon: 'alert-circle-outline', screen: 'SOS', color: '#e74c3c' },
  { id: '4', title: 'journey', icon: 'map-outline', screen: 'Itinerary', color: '#1A3C6E' },
];

const sidebarItems = [
  { id: '1', title: 'journal', icon: 'book-outline', screen: 'Journal' },
  { id: '2', title: 'photos', icon: 'camera-outline', screen: 'PhotoAlbum' },
  { id: '3', title: 'Boarding Pass', icon: 'barcode-outline', screen: 'BoardingPass' },
  { id: '4', title: 'Document Vault', icon: 'document-outline', screen: 'DocumentVault' },
  { id: '5', title: 'Reviews', icon: 'star-outline', screen: 'Reviews' },
  { id: '6', title: 'AR Finder', icon: 'eye-outline', screen: 'ARFinder' },
  { id: '7', title: 'Offline Maps', icon: 'download-outline', screen: 'OfflineMaps' },
  { id: '8', title: 'Share Trip', icon: 'share-outline', screen: 'ShareItinerary' },
  { id: '9', title: 'Battery Mode', icon: 'battery-half-outline', screen: 'BatteryMode' },
];

const exploreCategories = [
  { id: 'all', title: 'allDestinations', icon: '🌍' },
  { id: 'beach', title: 'beach', icon: '🏖️' },
  { id: 'mountains', title: 'mountains', icon: '🏔️' },
  { id: 'cities', title: 'cities', icon: '🏙️' },
  { id: 'culture', title: 'culture', icon: '🏛️' },
  { id: 'nature', title: 'nature', icon: '🌿' },
];

const destinationCategories = {
  beach: ['Maldives', 'Bora Bora', 'Phuket', 'Santorini', 'Cancun', 'Bali'],
  mountains: ['Swiss Alps', 'Machu Picchu', 'Banff', 'Patagonia', 'Himalayas'],
  cities: ['New York', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'Barcelona', 'Istanbul', 'London'],
  culture: ['Rome', 'Kyoto', 'Athens', 'Cairo', 'Prague', 'Marrakech'],
  nature: ['New Zealand', 'Iceland', 'Amazon', 'Serengeti', 'Cape Town', 'Amalfi Coast'],
};

const recommendations = [
  { id: '1', name: 'Paris', country: 'France', reason: 'Perfect for couples', rating: 4.8, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', tag: '💑 Romantic' },
  { id: '2', name: 'Bali', country: 'Indonesia', reason: 'Great for relaxation', rating: 4.9, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', tag: '🧘 Wellness' },
  { id: '3', name: 'Tokyo', country: 'Japan', reason: 'Amazing food & culture', rating: 4.9, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', tag: '🍜 Foodie' },
  { id: '4', name: 'Dubai', country: 'UAE', reason: 'Luxury experience', rating: 4.6, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', tag: '✨ Luxury' },
];

export default function HomeScreen({ navigation }) {
  const { profile, destinations, fetchDestinations, loading, t, theme, darkMode, dispatch } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const userName = profile?.full_name?.split(' ')[0] || 'Traveler';
  const avatarUri = profile?.avatar_url;

  useEffect(() => {
    fetchDestinations();
  }, []);

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -width * 0.75,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidebarOpen(false));
  };

  const navigateFromSidebar = (screen) => {
    closeSidebar();
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const getFilteredDestinations = () => {
    if (activeCategory === 'all') return destinations;
    const categoryNames = destinationCategories[activeCategory] || [];
    return destinations.filter(d =>
      categoryNames.some(name => d.name.toLowerCase().includes(name.toLowerCase()))
    );
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>

      {sidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSidebar}
        />
      )}

      <Animated.View style={[
        styles.sidebar,
        { backgroundColor: theme.card, transform: [{ translateX: sidebarAnim }] }
      ]}>
        <SafeAreaView>
          <View style={styles.sidebarHeader}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.sidebarAvatarImage} />
            ) : (
              <View style={[styles.sidebarAvatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.sidebarAvatarText}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'T'}
                </Text>
              </View>
            )}
            <View>
              <Text style={[styles.sidebarName, { color: theme.text }]}>
                {profile?.full_name || 'Traveler'}
              </Text>
              <Text style={[styles.sidebarEmail, { color: theme.subtext }]}>
                Passporter
              </Text>
            </View>
          </View>

          <View style={[styles.sidebarDivider, { backgroundColor: theme.border }]} />

          {sidebarItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.sidebarItem}
              onPress={() => navigateFromSidebar(item.screen)}
            >
              <Ionicons name={item.icon} size={22} color={theme.accent} />
              <Text style={[styles.sidebarItemText, { color: theme.text }]}>
                {t[item.title] || item.title}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.sidebarDivider, { backgroundColor: theme.border }]} />

          <View style={styles.sidebarItem}>
            <Ionicons name="moon-outline" size={22} color={theme.accent} />
            <Text style={[styles.sidebarItemText, { color: theme.text }]}>{t.darkMode}</Text>
            <Switch
              value={darkMode}
              onValueChange={(val) => dispatch({ type: 'SET_DARK_MODE', payload: val })}
              trackColor={{ false: '#ddd', true: theme.accent }}
              thumbColor="#fff"
              style={{ marginLeft: 'auto' }}
            />
          </View>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => navigateFromSidebar('Language')}
          >
            <Ionicons name="language-outline" size={22} color={theme.accent} />
            <Text style={[styles.sidebarItemText, { color: theme.text }]}>{t.language}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={openSidebar}>
            <Ionicons name="menu-outline" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: theme.subtext }]}>
              {t.hello}, {userName} 👋
            </Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{t.whereTo}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarSmallImage} />
            ) : (
              <View style={[styles.avatarSmall, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarSmallText}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'T'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={20} color={theme.subtext} />
          <Text style={[styles.searchText, { color: theme.subtext }]}>
            {t.search} destinations...
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.quickActions}</Text>
        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>
                {t[action.title] || action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.recommendations}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recRow}>
          {recommendations.map((rec) => (
  <TouchableOpacity
    key={rec.id}
    style={styles.recCard}
    onPress={() => navigation.navigate('TripPlanner', {
      destination: { name: rec.name, country: rec.country }
    })}
  >
    <Image source={{ uri: rec.image }} style={styles.recImage} />
    <View style={styles.recOverlay}>
      <View style={styles.recTag}>
        <Text style={styles.recTagText}>{rec.tag}</Text>
      </View>
      <Text style={styles.recName}>{rec.name}</Text>
      <Text style={styles.recCountry}>{rec.country}</Text>
      <View style={styles.recRating}>
        <Ionicons name="star" size={12} color="#F4A261" />
        <Text style={styles.recRatingText}>{rec.rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.explore}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {exploreCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                { borderColor: theme.accent },
                activeCategory === cat.id && { backgroundColor: theme.accent },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[
                styles.categoryText,
                { color: activeCategory === cat.id ? '#fff' : theme.accent }
              ]}>
                {t[cat.title] || cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.subtext }]}>
              Loading destinations...
            </Text>
          </View>
        ) : filteredDestinations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No destinations in this category yet
            </Text>
          </View>
        ) : (
          filteredDestinations.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.destinationCard}
              onPress={() => navigation.navigate('Search', { destination: dest })}
            >
              <Image source={{ uri: dest.image_url }} style={styles.destinationImage} />
              <View style={styles.destinationOverlay}>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationCountry}>
                    📍 {dest.country}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F4A261" />
                  <Text style={styles.ratingText}>{dest.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: width * 0.75,
    zIndex: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    paddingBottom: 15,
  },
  sidebarAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatarImage: { width: 50, height: 50, borderRadius: 25 },
  sidebarAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sidebarName: { fontSize: 16, fontWeight: 'bold' },
  sidebarEmail: { fontSize: 12 },
  sidebarDivider: { height: 1, marginVertical: 10 },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  sidebarItemText: { fontSize: 15, fontWeight: '500' },
  container: { flex: 1, paddingHorizontal: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerCenter: { flex: 1, paddingHorizontal: 10 },
  greeting: { fontSize: 13 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallImage: { width: 38, height: 38, borderRadius: 19 },
  avatarSmallText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchText: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 5 },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  recRow: { marginBottom: 20 },
  recCard: {
    width: 200,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  recImage: { width: '100%', height: '100%' },
  recOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 3,
  },
  recTag: {
    backgroundColor: '#1A3C6E',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  recTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  recName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  recCountry: { color: '#ffffffcc', fontSize: 12 },
  recRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recRatingText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  categoriesRow: { marginBottom: 15 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginRight: 8,
  },
  categoryEmoji: { fontSize: 16 },
  categoryText: { fontSize: 13, fontWeight: '500' },
  loadingContainer: { alignItems: 'center', paddingVertical: 30 },
  loadingText: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14 },
  destinationCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 15, height: 200 },
  destinationImage: { width: '100%', height: '100%' },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationInfo: { gap: 3 },
  destinationName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  destinationCountry: { fontSize: 12, color: '#ffffffcc' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00000040',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
});
