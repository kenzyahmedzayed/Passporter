import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

const POPULAR_CITIES = [
  'Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh',
  'Paris', 'London', 'New York', 'Tokyo', 'Dubai', 'Istanbul',
  'Rome', 'Barcelona', 'Amsterdam', 'Berlin', 'Madrid', 'Vienna',
  'Prague', 'Budapest', 'Lisbon', 'Athens', 'Santorini', 'Mykonos',
  'Sydney', 'Singapore', 'Bangkok', 'Bali', 'Phuket', 'Tokyo',
  'Seoul', 'Beijing', 'Shanghai', 'Mumbai', 'Delhi', 'Karachi',
  'Casablanca', 'Marrakech', 'Cape Town', 'Nairobi', 'Lagos',
  'Toronto', 'Vancouver', 'Los Angeles', 'Chicago', 'Miami',
  'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogota', 'Mexico City',
  'Moscow', 'Saint Petersburg', 'Oslo', 'Stockholm', 'Copenhagen',
  'Helsinki', 'Warsaw', 'Zurich', 'Geneva', 'Brussels',
  'Doha', 'Riyadh', 'Kuwait City', 'Muscat', 'Beirut', 'Amman',
];

export default function WeatherScreen({ navigation }) {
  const { theme } = useApp();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCityChange = (text) => {
    setCity(text);
    if (text.length >= 2) {
      const filtered = POPULAR_CITIES.filter(c =>
        c.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchWeather = async (cityName) => {
    const searchCity = cityName || city;
    if (!searchCity.trim()) return;
    setLoading(true);
    setError('');
    setWeather(null);
    setShowSuggestions(false);
    try {
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(searchCity.trim())}?format=j1`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      const current = data.current_condition[0];
      const area = data.nearest_area[0];
      setWeather({
        name: area.areaName[0].value,
        country: area.country[0].value,
        temp: parseInt(current.temp_C),
        feelsLike: parseInt(current.FeelsLikeC),
        humidity: parseInt(current.humidity),
        windSpeed: parseInt(current.windspeedKmph),
        description: current.weatherDesc[0].value,
        visibility: parseInt(current.visibility),
        forecast: data.weather,
      });
    } catch (err) {
      setError('City not found. Please check the name and try again.');
    }
    setLoading(false);
  };

  const getWeatherIcon = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('sunny') || d.includes('clear')) return 'sunny-outline';
    if (d.includes('cloud')) return 'cloudy-outline';
    if (d.includes('rain') || d.includes('drizzle')) return 'rainy-outline';
    if (d.includes('snow')) return 'snow-outline';
    if (d.includes('thunder')) return 'thunderstorm-outline';
    if (d.includes('fog') || d.includes('mist')) return 'cloud-outline';
    return 'partly-sunny-outline';
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Weather</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.searchWrapper}>
          <View style={[styles.searchRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={20} color={theme.subtext} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search city..."
              placeholderTextColor={theme.subtext}
              value={city}
              onChangeText={handleCityChange}
              onSubmitEditing={() => fetchWeather()}
              returnKeyType="search"
            />
            {city.length > 0 && (
              <TouchableOpacity onPress={() => { setCity(''); setShowSuggestions(false); setWeather(null); }}>
                <Ionicons name="close-circle" size={20} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>

          {showSuggestions && (
            <View style={[styles.suggestionsBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionItem, i < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                  onPress={() => { setCity(s); setShowSuggestions(false); fetchWeather(s); }}
                >
                  <Ionicons name="location-outline" size={16} color={theme.accent} />
                  <Text style={[styles.suggestionText, { color: theme.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.accent }]}
          onPress={() => fetchWeather()}
        >
          <Text style={styles.searchButtonText}>Get Weather</Text>
        </TouchableOpacity>

        {!weather && !loading && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Cities</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularRow}>
              {['Cairo', 'Dubai', 'Paris', 'London', 'Tokyo', 'New York', 'Istanbul', 'Rome'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.popularChip, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => { setCity(c); fetchWeather(c); }}
                >
                  <Text style={[styles.popularChipText, { color: theme.text }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {loading && <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 40 }} />}

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {weather && (
          <>
            <View style={[styles.weatherCard, { backgroundColor: theme.accent }]}>
              <Text style={styles.weatherCity}>{weather.name}</Text>
              <Text style={styles.weatherCountry}>{weather.country}</Text>
              <Ionicons name={getWeatherIcon(weather.description)} size={70} color="#fff" style={{ marginVertical: 10 }} />
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
              <Text style={styles.weatherFeels}>Feels like {weather.feelsLike}°C</Text>
            </View>

            <View style={styles.detailsRow}>
              {[
                { icon: 'water-outline', label: 'Humidity', value: `${weather.humidity}%` },
                { icon: 'speedometer-outline', label: 'Wind', value: `${weather.windSpeed} km/h` },
                { icon: 'eye-outline', label: 'Visibility', value: `${weather.visibility} km` },
              ].map((item, i) => (
                <View key={i} style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name={item.icon} size={24} color={theme.accent} />
                  <Text style={[styles.detailValue, { color: theme.text }]}>{item.value}</Text>
                  <Text style={[styles.detailLabel, { color: theme.subtext }]}>{item.label}</Text>
                </View>
              ))}
            </View>

            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3-Day Forecast</Text>
            {weather.forecast?.map((day, i) => (
              <View key={i} style={[styles.forecastRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.forecastDay, { color: theme.text }]}>{getDayName(day.date)}</Text>
                <Ionicons name={getWeatherIcon(day.hourly[0]?.weatherDesc[0]?.value || '')} size={22} color={theme.accent} />
                <Text style={[styles.forecastDesc, { color: theme.subtext }]}>
                  {day.hourly[0]?.weatherDesc[0]?.value || ''}
                </Text>
                <Text style={[styles.forecastTemp, { color: theme.text }]}>
                  {day.mintempC}° / {day.maxtempC}°
                </Text>
              </View>
            ))}
          </>
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
    paddingVertical: 10
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  container: {
    paddingHorizontal: 15
  },

  searchWrapper: {
    marginBottom: 10
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14
  },

  suggestionsBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 5
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10
  },

  suggestionText: {
    fontSize: 14
  },

  searchButton: {
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20
  },

  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  popularRow: {
    marginBottom: 20
  },

  popularChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8
  },

  popularChipText: {
    fontSize: 13,
    fontWeight: '500'
  },

  errorContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10
  },

  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center'
  },

  weatherCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 15,
    gap: 4
  },

  weatherCity: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold'
  },

  weatherCountry: {
    color: '#ffffffcc',
    fontSize: 16
  },

  weatherTemp: {
    color: '#fff',
    fontSize: 64,
    fontWeight: 'bold'
  },

  weatherDesc: {
    color: '#fff',
    fontSize: 18,
    textTransform: 'capitalize'
  },

  weatherFeels: {
    color: '#ffffffcc',
    fontSize: 14
  },

  detailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },

  detailCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1
  },

  detailValue: {
    fontSize: 15,
    fontWeight: 'bold'
  },

  detailLabel: {
    fontSize: 11
  },

  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10
  },

  forecastDay: {
    fontSize: 13,
    fontWeight: '600',
    width: 90
  },

  forecastDesc: {
    flex: 1,
    fontSize: 12
  },

  forecastTemp: {
    fontSize: 13,
    fontWeight: 'bold'
  },
});