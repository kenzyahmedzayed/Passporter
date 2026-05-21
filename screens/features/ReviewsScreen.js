import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function ReviewsScreen({ navigation }) {
  const { theme } = useApp();
  const [reviews, setReviews] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchDestinations();

    const channel = supabase
      .channel('reviews_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        () => { fetchReviews(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchReviews = async () => {
    setProfileLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, destinations(name)')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setProfileLoading(false);
  };

  const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('id, name');
    setDestinations(data || []);
  };

  const addReview = async () => {
    if (!selectedDest || !comment) {
      Alert.alert('Missing Fields', 'Please select a destination and write a comment.');
      return;
    }
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('reviews').insert([{
      user_id: user.id,
      destination_id: selectedDest.id,
      rating,
      comment,
    }]);
    setAdding(false);
    if (!error) {
      setComment('');
      setRating(5);
      setSelectedDest(null);
      setShowForm(false);
      fetchReviews();
      Alert.alert('Review Posted! ⭐', 'Thank you for your review!');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Reviews</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close-outline' : 'add-outline'} size={28} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {showForm && (
          <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Write a Review</Text>

            <Text style={[styles.label, { color: theme.subtext }]}>Select Destination</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {destinations.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[
                    styles.destChip,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    selectedDest?.id === dest.id && { backgroundColor: theme.accent, borderColor: theme.accent }
                  ]}
                  onPress={() => setSelectedDest(dest)}
                >
                  <Text style={[
                    styles.destChipText,
                    { color: theme.subtext },
                    selectedDest?.id === dest.id && { color: '#fff', fontWeight: 'bold' }
                  ]}>
                    {dest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.subtext }]}>Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F4A261"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.subtext }]}>Comment</Text>
            <TextInput
              style={[styles.commentInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
              placeholder="Share your experience..."
              placeholderTextColor={theme.subtext}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.accent }]}
              onPress={addReview}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post Review</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {profileLoading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 30 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No reviews yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.subtext }]}>Be the first to review a destination!</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewDest, { color: theme.text }]}>{review.destinations?.name || 'Unknown'}</Text>
                <View style={styles.starsSmallRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#F4A261"
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: theme.subtext }]}>{review.comment}</Text>
              <Text style={[styles.reviewDate, { color: theme.subtext }]}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
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
  
form: {
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  gap: 10,
  borderWidth: 1,
},

formTitle: { 
  fontSize: 18, 
  fontWeight: 'bold' 
},
  
label: { 
  fontSize: 13, 
  fontWeight: '600', 
  marginTop: 5 
},
  
destChip: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,  
  marginRight: 8,
},
  
destChipText: { 
  fontSize: 13 
},
  
starsRow: { 
  flexDirection: 'row', 
  gap: 8 
},
  
commentInput: {
  borderRadius: 10,
  borderWidth: 1,
  padding: 12,
  fontSize: 14,
  minHeight: 100,
},
  
submitButton: {
  padding: 14,
  borderRadius: 25,
  alignItems: 'center',
},
  
submitButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 15 
},
  
emptyContainer: { 
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
  
reviewCard: {
  borderRadius: 12,
  padding: 15,
  marginBottom: 10,
  gap: 8,
  borderWidth: 1,
},
  
reviewHeader: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
},
  
reviewDest: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},
  
starsSmallRow: { 
  flexDirection: 'row', 
  gap: 2 
},
  
reviewComment: { 
  fontSize: 13, 
  lineHeight: 20 
},
  
reviewDate: { 
  fontSize: 11 
},
});
