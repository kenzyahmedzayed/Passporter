import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
import { useApp } from '../../context/AppContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', flag: '🇪🇬', nativeName: 'العربية' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export default function LanguageScreen({ navigation }) {
  const { language, dispatch, theme, t } = useApp();
  const [deviceLocale, setDeviceLocale] = useState('');

  useEffect(() => {
    const locale = Localization.getLocales()[0];
    setDeviceLocale(locale.languageCode || 'en');
  }, []);

  const selectLanguage = (code) => {
    dispatch({ type: 'SET_LANGUAGE', payload: code });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.language}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.deviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="phone-portrait-outline" size={20} color={theme.accent} />
          <Text style={[styles.deviceText, { color: theme.subtext }]}>
            Device Language: <Text style={{ color: theme.accent, fontWeight: 'bold' }}>
              {deviceLocale.toUpperCase()}
            </Text>
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Language</Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              { backgroundColor: theme.card, borderColor: theme.border },
              language === lang.code && { borderColor: theme.accent, backgroundColor: theme.accent + '15' }
            ]}
            onPress={() => selectLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <View style={styles.langInfo}>
              <Text style={[styles.langName, { color: theme.text },
                language === lang.code && { color: theme.accent }
              ]}>
                {lang.name}
              </Text>
              <Text style={[styles.nativeName, { color: theme.subtext }]}>
                {lang.nativeName}
              </Text>
            </View>
            {language === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
            )}
          </TouchableOpacity>
        ))}
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

deviceCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  padding: 12,
  borderRadius: 10,
  marginBottom: 20,
  borderWidth: 1,
},

deviceText: { 
  fontSize: 14 
},

sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 12 
},

languageItem: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 12,
  padding: 15,
  marginBottom: 8,
  gap: 12,
  borderWidth: 1,
},

flag: { 
  fontSize: 28 
},

langInfo: { 
  flex: 1 
},

langName: { 
  fontSize: 15, 
  fontWeight: '600' 
},

nativeName: { 
  fontSize: 13, 
  marginTop: 2 
},
});