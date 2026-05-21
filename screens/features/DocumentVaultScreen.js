import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const docTypes = [
  { id: '1', title: 'Passport', icon: 'card-outline', color: '#1A3C6E' },
  { id: '2', title: 'Visa', icon: 'document-text-outline', color: '#27ae60' },
  { id: '3', title: 'Insurance', icon: 'shield-checkmark-outline', color: '#9b59b6' },
  { id: '4', title: 'Ticket', icon: 'airplane-outline', color: '#E07B39' },
  { id: '5', title: 'Hotel', icon: 'bed-outline', color: '#e74c3c' },
  { id: '6', title: 'Other', icon: 'folder-outline', color: '#888' },
];

export default function DocumentVaultScreen({ navigation }) {
  const { theme } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('Passport');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.storage
        .from('travel-docs')
        .list(user.id);
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        await uploadDocument(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const uploadDocument = async (doc) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${user.id}/${selectedType}_${Date.now()}_${doc.name}`;
      const response = await fetch(doc.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const { error } = await supabase.storage
        .from('travel-docs')
        .upload(fileName, arrayBuffer, { contentType: doc.mimeType });
      if (error) throw error;
      Alert.alert('Success! 📄', 'Document uploaded successfully!');
      fetchDocuments();
    } catch (err) {
      Alert.alert('Upload Failed', err.message);
    }
    setUploading(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Document Vault</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.secureNote, { backgroundColor: '#e8f5e9' }]}>
          <Ionicons name="lock-closed" size={16} color="#27ae60" />
          <Text style={styles.secureText}>Your documents are securely stored</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Document Type</Text>
        <View style={styles.typesGrid}>
          {docTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedType === type.title && { backgroundColor: type.color, borderColor: type.color }
              ]}
              onPress={() => setSelectedType(type.title)}
            >
              <Ionicons
                name={type.icon}
                size={24}
                color={selectedType === type.title ? '#fff' : type.color}
              />
              <Text style={[
                styles.typeTitle,
                { color: theme.subtext },
                selectedType === type.title && { color: '#fff' }
              ]}>
                {type.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: theme.accent }]}
          onPress={pickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload {selectedType}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Documents</Text>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={50} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No documents uploaded yet</Text>
          </View>
        ) : (
          documents.map((doc, index) => (
            <View key={index} style={[styles.docCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="document-outline" size={24} color={theme.accent} />
              <Text style={[styles.docName, { color: theme.text }]} numberOfLines={1}>{doc.name}</Text>
              <Text style={[styles.docSize, { color: theme.subtext }]}>{(doc.metadata?.size / 1024).toFixed(1)} KB</Text>
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

secureNote: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
},
  
secureText: { 
  fontSize: 13, 
  color: '#27ae60', 
  fontWeight: '500' 
},

sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 12 
},

typesGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  gap: 10, 
  marginBottom: 20
},

typeCard: {
  width: '30%',
  borderRadius: 12,
  padding: 12,
  alignItems: 'center',
  gap: 6,
  borderWidth: 1,
},

typeTitle: { 
  fontSize: 12, 
  fontWeight: '500' 
},

uploadButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: 16,
  borderRadius: 30,
  marginBottom: 20,
},

uploadButtonText: { 
  color: '#fff', 
  fontWeight: 'bold', 
  fontSize: 15 
},

emptyContainer: { 
  alignItems: 'center', 
  paddingVertical: 30, 
  gap: 10 
},

emptyText: { 
  fontSize: 14 
},

docCard: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 12,
  padding: 15,
  marginBottom: 8,
  gap: 12,
  borderWidth: 1,
},

docName: { 
  flex: 1, 
  fontSize: 14, 
  fontWeight: '500' 
},
  
docSize: { fontSize: 12 },
});
