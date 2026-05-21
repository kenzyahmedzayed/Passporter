import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, FlatList, Dimensions, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export default function PhotoAlbumScreen({ navigation }) {
  const { theme, user } = useApp();
  const insets = useSafeAreaInsets();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [taking, setTaking] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(null);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const albumMap = {};
    (data || []).forEach(entry => {
      const key = entry.title || entry.location || 'My Trip';
      if (!albumMap[key]) {
        albumMap[key] = {
          id: key,
          title: key,
          photos: [],
          entryIds: [],
          date: entry.created_at,
        };
      }
      const imgs = getImages(entry);
      if (!albumMap[key].entryIds.includes(entry.id)) {
        albumMap[key].entryIds.push(entry.id);
      }
      albumMap[key].photos.push(...imgs);
    });

    setAlbums(Object.values(albumMap).filter(a => a.photos.length > 0));
    setLoading(false);
  };

  const getImages = (entry) => {
    let urls = [];
    if (entry.images) {
      urls = entry.images.split(',').map(u => u.trim()).filter(u => u.length > 0);
    } else if (entry.image_url) {
      urls = [entry.image_url];
    }
    return urls.map((url, index) => ({
      id: `${entry.id}-${index}`,
      url,
      entryId: entry.id,
      entryTitle: entry.title,
      entryImages: urls,
    }));
  };

  const openAlbum = (album) => {
    setSelectedAlbum(album);
    setAlbumTitle(album.title);
    setEditingTitle(false);
    setShowAlbumModal(true);
  };

  const updateAlbumTitle = async () => {
    const nextTitle = albumTitle.trim();
    if (!selectedAlbum || !nextTitle) return;
    setUpdatingTitle(true);
    const { error } = await supabase
      .from('journal_entries')
      .update({ title: nextTitle })
      .in('id', selectedAlbum.entryIds || []);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      const updatedAlbum = { ...selectedAlbum, title: nextTitle, id: nextTitle };
      setSelectedAlbum(updatedAlbum);
      setAlbums(prev => prev.map(album => (
        album.id === selectedAlbum.id ? updatedAlbum : album
      )));
      setEditingTitle(false);
    }
    setUpdatingTitle(false);
  };

  const deletePhoto = (photo) => {
    Alert.alert('Delete Photo', 'Remove this picture from the album?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingPhoto(photo.id);
          const remaining = photo.entryImages.filter(url => url !== photo.url);
          const { error } = await supabase
            .from('journal_entries')
            .update({
              image_url: remaining[0] || null,
              images: remaining.length > 0 ? remaining.join(',') : null,
            })
            .eq('id', photo.entryId);

          if (error) {
            Alert.alert('Error', error.message);
          } else {
            const nextPhotos = (selectedAlbum?.photos || []).filter(item => item.id !== photo.id);
            if (nextPhotos.length === 0) {
              setShowAlbumModal(false);
              setSelectedAlbum(null);
            } else {
              setSelectedAlbum(prev => prev ? { ...prev, photos: nextPhotos } : prev);
            }
            await fetchAlbums();
          }
          setDeletingPhoto(null);
        },
      },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    setTaking(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      await supabase.from('journal_entries').insert([{
        user_id: user.id,
        title: 'Travel Photo',
        content: 'Photo taken on ' + new Date().toLocaleDateString(),
        location: '',
        image_url: uri,
        images: uri,
      }]);
      fetchAlbums();
      Alert.alert('Photo Saved! 📸', 'Added to your photo album!');
    }
    setTaking(false);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const uris = result.assets.map(a => a.uri);
      await supabase.from('journal_entries').insert([{
        user_id: user.id,
        title: 'Travel Photo',
        content: 'Photo from gallery',
        location: '',
        image_url: uris[0],
        images: uris.join(','),
      }]);
      fetchAlbums();
      Alert.alert('Photos Saved! 📸', `${uris.length} photo(s) added!`);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Photo Album</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.accent }]}
            onPress={takePhoto}
            disabled={taking}
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.primary }]}
            onPress={pickPhoto}
          >
            <Ionicons name="images-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 40 }} />
      ) : albums.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={60} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No photos yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.subtext }]}>
            Take a photo or upload from gallery
          </Text>
          <View style={styles.emptyButtons}>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.accent }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={pickPhoto}
            >
              <Ionicons name="images-outline" size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {albums.length} Album{albums.length > 1 ? 's' : ''}
          </Text>
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={[styles.albumCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => openAlbum(album)}
            >
              <Image
                source={{ uri: album.photos[0].url }}
                style={styles.albumCover}
                resizeMode="cover"
              />
              {album.photos.length > 1 && (
                <View style={styles.albumGrid}>
                  {album.photos.slice(1, 4).map((photo, i) => (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.url }}
                      style={styles.albumGridPhoto}
                      resizeMode="cover"
                    />
                  ))}
                  {album.photos.length > 4 && (
                    <View style={[styles.morePhotos, { backgroundColor: theme.primary }]}>
                      <Text style={styles.morePhotosText}>+{album.photos.length - 4}</Text>
                    </View>
                  )}
                </View>
              )}
              <View style={styles.albumInfo}>
                <Text style={[styles.albumTitle, { color: theme.text }]}>{album.title}</Text>
                <Text style={[styles.albumCount, { color: theme.subtext }]}>
                  {album.photos.length} photo{album.photos.length > 1 ? 's' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      <Modal
        visible={showAlbumModal}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setShowAlbumModal(false)}
      >
        <View
          style={[
            styles.modalRoot,
            {
              backgroundColor: theme.bg,
              paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
            },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity style={styles.modalBackButton} onPress={() => setShowAlbumModal(false)}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
              <Text style={[styles.modalBackText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
            {editingTitle ? (
              <View style={styles.titleEditor}>
                <TextInput
                  style={[styles.titleInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                  value={albumTitle}
                  onChangeText={setAlbumTitle}
                  placeholder="Album title"
                  placeholderTextColor={theme.subtext}
                />
                <TouchableOpacity
                  style={[styles.titleSaveButton, { backgroundColor: theme.accent }]}
                  onPress={updateAlbumTitle}
                  disabled={updatingTitle}
                >
                  {updatingTitle ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.modalTitleButton} onPress={() => setEditingTitle(true)}>
                <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                  {selectedAlbum?.title}
                </Text>
                <Ionicons name="create-outline" size={17} color={theme.accent} />
              </TouchableOpacity>
            )}
            <Text style={[styles.photoCountText, { color: theme.subtext }]}>
              {selectedAlbum?.photos?.length || 0} photos
            </Text>
          </View>
          <FlatList
            data={selectedAlbum?.photos || []}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <View style={styles.gridPhotoWrap}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deletePhotoButton}
                  onPress={() => deletePhoto(item)}
                  disabled={deletingPhoto === item.id}
                >
                  {deletingPhoto === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
safeArea: { 
  flex: 1 
},
  
modalRoot: { 
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
  fontWeight: 'bold', 
  flex: 1, 
  textAlign: 'center' 
},
  
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingVertical: 12,
  borderBottomWidth: 1,
},
  
modalBackButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
  minWidth: 86,
  minHeight: 44,
  paddingRight: 10,
},

modalBackText: { 
  fontSize: 15, 
  fontWeight: '600' 
},

modalTitle: { 
  flex: 1, 
  fontSize: 18, 
  fontWeight: 'bold', 
  textAlign: 'center' 
},

modalTitleButton: { 
  flex: 1, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: 6 
},
  
titleEditor: { 
  flex: 1, 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 8 
},
  
titleInput: { 
  flex: 1, 
  borderWidth: 1, 
  borderRadius: 10, 
  paddingHorizontal: 10, 
  paddingVertical: 8, 
  fontSize: 15 
},
  
titleSaveButton: { 
  width: 36, 
  height: 36, 
  borderRadius: 18, 
  alignItems: 'center', 
  justifyContent: 'center' 
},
  
headerButtons: { 
  flexDirection: 'row', 
  gap: 8 
},
  
headerBtn: { 
  width: 36,
  height: 36, 
  borderRadius: 18, 
  alignItems: 'center', 
  justifyContent: 'center' 
},
  
photoCountText: { 
  fontSize: 13 
},
  
container: { 
  paddingHorizontal: 15 
},
  
sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 15, 
  marginTop: 5 
},
  
albumCard: { 
  borderRadius: 16, 
  marginBottom: 15, 
  borderWidth: 1, 
  overflow: 'hidden' 
},
  
albumCover: { 
  width: '100%', 
  height: 200 
},
  
albumGrid: { 
  flexDirection: 'row', 
  gap: 2, 
  padding: 2 
},
  
albumGridPhoto: { 
  flex: 1, 
  height: 80 
},
  
morePhotos: {
  position: 'absolute',
  right: 2,
  bottom: 2,
  width: 80,
  height: 80,
  alignItems: 'center',
  justifyContent: 'center',
},
  
morePhotosText: { 
  color: '#fff', 
  fontSize: 18, 
  fontWeight: 'bold' 
},

albumInfo: { 
  padding: 12, 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
},

albumTitle: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},

albumCount: { 
  fontSize: 13 
},

emptyContainer: { 
  flex: 1, 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: 12, 
  paddingHorizontal: 30 
},
  
emptyText: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

emptySubtext: { 
  fontSize: 14, 
  textAlign: 'center' 
},

emptyButtons: { 
  flexDirection: 'row', 
  gap: 12, 
  marginTop: 10 
},

emptyBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 25,
},

emptyBtnText: { 
  color: '#fff', 
  fontWeight: 'bold' 
},

gridContainer: { 
  padding: 8, 
  gap: 8 
},

gridPhotoWrap: { 
  position: 'relative', 
  margin: 4 
},

gridImage: {
  width: (width - 32) / 2,
  height: (width - 32) / 2,
  borderRadius: 8,
},

deletePhotoButton: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: 'rgba(231, 76, 60, 0.9)',
  alignItems: 'center',
  justifyContent: 'center',
},
});
