import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const STEPS = [
  { id: 1, title: 'Destination & Dates', icon: '📍' },
  { id: 2, title: 'Travel Style', icon: '🎯' },
  { id: 3, title: 'Daily Activities', icon: '📅' },
  { id: 4, title: 'Budget', icon: '💰' },
  { id: 5, title: 'Review & Save', icon: '✅' },
];

const travelStyles = [
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'relaxation', label: 'Relaxation', icon: '🏖️' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'foodie', label: 'Foodie', icon: '🍜' },
  { id: 'luxury', label: 'Luxury', icon: '✨' },
  { id: 'budget', label: 'Budget', icon: '💵' },
];

export default function TripPlannerScreen({ navigation, route }) {
  const { theme, user } = useApp();
  const destinationName = route?.params?.destination?.name || '';
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [destination, setDestination] = useState(destinationName);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('1');

  const [selectedStyles, setSelectedStyles] = useState([]);

  const [activities, setActivities] = useState([
    { day: 1, morning: '', afternoon: '', evening: '' }
  ]);

  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [includeFlights, setIncludeFlights] = useState(true);
  const [includeHotels, setIncludeHotels] = useState(true);

  const toggleStyle = (id) => {
    if (selectedStyles.includes(id)) {
      setSelectedStyles(selectedStyles.filter(s => s !== id));
    } else {
      setSelectedStyles([...selectedStyles, id]);
    }
  };

  const addDay = () => {
    setActivities([...activities, {
      day: activities.length + 1,
      morning: '', afternoon: '', evening: ''
    }]);
  };

  const updateActivity = (dayIndex, period, value) => {
    const updated = [...activities];
    updated[dayIndex][period] = value;
    setActivities(updated);
  };

  const savePlan = async () => {
    if (!destination || !startDate || !endDate) {
      Alert.alert('Missing Info', 'Please fill in destination and dates.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('journey').insert([{
        user_id: user.id,
        destination,
        start_date: startDate,
        end_date: endDate,
      }]);
      if (!error) {
        Alert.alert(
          'Trip Planned! 🎉',
          `Your trip to ${destination} has been saved successfully!`,
          [{
            text: 'View My Trips',
            onPress: () => navigation.navigate('ItineraryScreen')
          }, {
            text: 'Done',
            onPress: () => navigation.goBack()
          }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setSaving(false);
  };

  const canProceed = () => {
    if (currentStep === 1) return destination && startDate && endDate;
    if (currentStep === 2) return selectedStyles.length > 0;
    return true;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (currentStep === 1) navigation.goBack();
          else setCurrentStep(currentStep - 1);
        }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Plan Your Trip</Text>
        <Text style={[styles.stepCounter, { color: theme.subtext }]}>
          {currentStep}/{STEPS.length}
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View style={[
          styles.progressFill,
          { backgroundColor: theme.accent, width: `${(currentStep / STEPS.length) * 100}%` }
        ]} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsRow}>
        {STEPS.map((step) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              { backgroundColor: currentStep >= step.id ? theme.accent : theme.border }
            ]}>
              {currentStep > step.id ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={styles.stepEmoji}>{step.icon}</Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              { color: currentStep >= step.id ? theme.accent : theme.subtext }
            ]}>
              {step.title}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              📍 Where are you going?
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.subtext }]}>
              Tell us about your destination and travel dates
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Destination</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="location-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Paris, France"
                placeholderTextColor={theme.subtext}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Jun 15, 2024"
                placeholderTextColor={theme.subtext}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>End Date</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. Jun 22, 2024"
                placeholderTextColor={theme.subtext}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Number of Travelers</Text>
            <View style={styles.travelersRow}>
              {['1', '2', '3', '4', '5+'].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.travelerChip,
                    { borderColor: theme.accent },
                    travelers === num && { backgroundColor: theme.accent }
                  ]}
                  onPress={() => setTravelers(num)}
                >
                  <Text style={[
                    styles.travelerChipText,
                    { color: travelers === num ? '#fff' : theme.accent }
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              🎯 What's your travel style?
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.subtext }]}>
              Select all that apply — we'll personalize your trip
            </Text>
            <View style={styles.stylesGrid}>
              {travelStyles.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    selectedStyles.includes(style.id) && {
                      backgroundColor: theme.accent + '20',
                      borderColor: theme.accent
                    }
                  ]}
                  onPress={() => toggleStyle(style.id)}
                >
                  <Text style={styles.styleIcon}>{style.icon}</Text>
                  <Text style={[
                    styles.styleLabel,
                    { color: selectedStyles.includes(style.id) ? theme.accent : theme.text }
                  ]}>
                    {style.label}
                  </Text>
                  {selectedStyles.includes(style.id) && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              📅 Plan Your Days
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.subtext }]}>
              Add activities for each day of your trip
            </Text>

            {activities.map((day, index) => (
              <View key={index} style={[styles.dayCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.dayTitle, { color: theme.accent }]}>Day {day.day}</Text>

                {['morning', 'afternoon', 'evening'].map((period) => (
                  <View key={period}>
                    <Text style={[styles.periodLabel, { color: theme.subtext }]}>
                      {period === 'morning' ? '🌅 Morning' :
                       period === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening'}
                    </Text>
                    <TextInput
                      style={[styles.activityInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                      placeholder={`What are you doing ${period}?`}
                      placeholderTextColor={theme.subtext}
                      value={day[period]}
                      onChangeText={(val) => updateActivity(index, period, val)}
                    />
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addDayButton, { borderColor: theme.accent }]}
              onPress={addDay}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.accent} />
              <Text style={[styles.addDayText, { color: theme.accent }]}>Add Another Day</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              💰 Set Your Budget
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.subtext }]}>
              How much are you planning to spend?
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Total Budget</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="cash-outline" size={18} color={theme.accent} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="e.g. 2000"
                placeholderTextColor={theme.subtext}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Currency</Text>
            <View style={styles.currencyRow}>
              {['USD', 'EUR', 'EGP', 'GBP'].map((cur) => (
                <TouchableOpacity
                  key={cur}
                  style={[
                    styles.currencyChip,
                    { borderColor: theme.accent },
                    currency === cur && { backgroundColor: theme.accent }
                  ]}
                  onPress={() => setCurrency(cur)}
                >
                  <Text style={[
                    styles.currencyChipText,
                    { color: currency === cur ? '#fff' : theme.accent }
                  ]}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Include in Budget</Text>
            <View style={styles.includeRow}>
              <TouchableOpacity
                style={[styles.includeChip, { borderColor: theme.accent },
                  includeFlights && { backgroundColor: theme.accent }]}
                onPress={() => setIncludeFlights(!includeFlights)}
              >
                <Ionicons name="airplane-outline" size={16} color={includeFlights ? '#fff' : theme.accent} />
                <Text style={[styles.includeText, { color: includeFlights ? '#fff' : theme.accent }]}>
                  Flights
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.includeChip, { borderColor: theme.accent },
                  includeHotels && { backgroundColor: theme.accent }]}
                onPress={() => setIncludeHotels(!includeHotels)}
              >
                <Ionicons name="bed-outline" size={16} color={includeHotels ? '#fff' : theme.accent} />
                <Text style={[styles.includeText, { color: includeHotels ? '#fff' : theme.accent }]}>
                  Hotels
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              ✅ Review Your Trip
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.subtext }]}>
              Everything looks good? Save your trip plan!
            </Text>

            <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {[
                { label: '📍 Destination', value: destination },
                { label: '📅 Dates', value: `${startDate} → ${endDate}` },
                { label: '👥 Travelers', value: travelers },
                { label: '🎯 Style', value: selectedStyles.join(', ') || 'Not set' },
                { label: '💰 Budget', value: budget ? `${budget} ${currency}` : 'Not set' },
                { label: '📆 Days Planned', value: `${activities.length} days` },
              ].map((item, i) => (
                <View key={i} style={[styles.reviewRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.reviewLabel, { color: theme.subtext }]}>{item.label}</Text>
                  <Text style={[styles.reviewValue, { color: theme.text }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.accent }]}
              onPress={savePlan}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Trip Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        {currentStep < STEPS.length ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: canProceed() ? theme.accent : theme.border }
            ]}
            onPress={() => canProceed() && setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>
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
  
stepCounter: { 
    fontSize: 14, 
    fontWeight: '600' 
},
  
progressBar: { 
    height: 4, 
    marginHorizontal: 15, 
    borderRadius: 2 
},
  
progressFill: { 
    height: '100%', 
    borderRadius: 2 
},
  
stepsRow: { 
    paddingHorizontal: 15, 
    paddingVertical: 12 
},
  
stepItem: { 
    alignItems: 'center', 
    marginRight: 20, 
    width: 80 
},
  
stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
},
  
stepEmoji: { 
    fontSize: 16 
},
  
stepLabel: { 
    fontSize: 10, 
    textAlign: 'center', 
    fontWeight: '500' 
},
  
content: { 
    flex: 1, 
    paddingHorizontal: 15 
},
  
stepContent: { 
    gap: 12, 
    paddingTop: 5 
},
  
stepTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
},
  
stepSubtitle: { 
    fontSize: 14, 
    lineHeight: 20 
},
  
label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 5 
},

inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 10,
},
  
input: { 
    flex: 1, 
    paddingVertical: 13, 
    fontSize: 14 
},
  
travelersRow: { 
    flexDirection: 'row', 
    gap: 8 
},
  
travelerChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
},
  
travelerChipText: { 
    fontSize: 15, 
    fontWeight: 'bold' 
},
  
stylesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
},
  
styleCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
},

styleIcon: { 
    fontSize: 22 
},

styleLabel: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '500' 
},

dayCard: { 
    borderRadius: 12, 
    padding: 15, 
    borderWidth: 1, 
    gap: 8 
},

dayTitle: { 
    fontSize: 16, 
    fontWeight: 'bold' 
},

periodLabel: { 
    fontSize: 12, 
    marginBottom: 4 
},

activityInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 5,
},

addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
},

addDayText: { 
    fontSize: 14, 
    fontWeight: '600' 
},

currencyRow: { 
    flexDirection: 'row', 
    gap: 8 
},

currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5, 
},

currencyChipText: { 
    fontSize: 13, 
    fontWeight: 'bold' 
},

includeRow: { 
    flexDirection: 'row', 
    gap: 10 
},

includeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
},

includeText: { 
    fontSize: 13, 
    fontWeight: '600' 
},

reviewCard: { 
    borderRadius: 12, 
    padding: 15, 
    borderWidth: 1, 
    gap: 5 
},

reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
},
reviewLabel: { 
    fontSize: 13 
},

reviewValue: { 
    fontSize: 13, 
    fontWeight: '600', 
    flex: 1, 
    textAlign: 'right',
},

saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 30,
    marginTop: 10,
},

saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
},

bottomBar: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
},

nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 30,
},
  
nextButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
},
});