import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { useApp } from '../../context/AppContext';

export default function BatteryModeScreen({ navigation }) {
  const { lowBatteryMode, darkMode, dispatch, theme, t } = useApp();
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [batteryState, setBatteryState] = useState(null);
  const [autoLowBattery, setAutoLowBattery] = useState(true);

  useEffect(() => {
    getBatteryInfo();
    const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
      if (batteryLevel < 0.2 && autoLowBattery) {
        dispatch({ type: 'SET_LOW_BATTERY_MODE', payload: true });
      }
    });
    return () => subscription.remove();
  }, [autoLowBattery]);

  const getBatteryInfo = async () => {
    const level = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();
    setBatteryLevel(level);
    setBatteryState(state);
  };

  const getBatteryColor = () => {
    if (batteryLevel > 0.5) return '#27ae60';
    if (batteryLevel > 0.2) return '#E07B39';
    return '#e74c3c';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Battery Mode</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={[styles.batteryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="battery-half-outline" size={60} color={getBatteryColor()} />
          <Text style={[styles.batteryPercent, { color: getBatteryColor() }]}>
            {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : '...'}
          </Text>
          <Text style={[styles.batteryState, { color: theme.subtext }]}>
            {batteryState === Battery.BatteryState.CHARGING ? 'Charging' :
             batteryState === Battery.BatteryState.FULL ? 'Full' : 'Unplugged'}
          </Text>
          {batteryLevel !== null && batteryLevel < 0.2 && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning-outline" size={16} color="#e74c3c" />
              <Text style={styles.warningText}>Low Battery!</Text>
            </View>
          )}
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <Ionicons name="moon-outline" size={22} color={theme.accent} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Low Battery Mode</Text>
              <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>
                Switches whole app to minimal dark UI
              </Text>
            </View>
            <Switch
              value={lowBatteryMode}
              onValueChange={(val) => dispatch({ type: 'SET_LOW_BATTERY_MODE', payload: val })}
              trackColor={{ false: '#ddd', true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <Ionicons name="contrast-outline" size={22} color={theme.accent} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>{t.darkMode}</Text>
              <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(val) => dispatch({ type: 'SET_DARK_MODE', payload: val })}
              trackColor={{ false: '#ddd', true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {lowBatteryMode && (
          <View style={[styles.activeBanner, { backgroundColor: theme.card }]}>
            <Ionicons name="moon" size={20} color={theme.accent} />
            <Text style={[styles.activeBannerText, { color: theme.text }]}>
              Low Battery Mode Active — App UI simplified
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.accent }]}
          onPress={getBatteryInfo}
        >
          <Ionicons name="refresh-outline" size={18} color="#fff" />
          <Text style={styles.refreshText}>Refresh Battery Info</Text>
        </TouchableOpacity>
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

container: { 
  paddingHorizontal: 15,
  gap: 15 
},

batteryCard: {
  borderRadius: 20,
  padding: 30,
  alignItems: 'center',
  gap: 8,
  borderWidth: 1,
},

batteryPercent: { 
  fontSize: 48, 
  fontWeight: 'bold' 
},

batteryState: { 
  fontSize: 16 
},

warningBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#fff0f0',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

warningText: { 
  color: '#e74c3c', 
  fontWeight: 'bold' 
},

settingCard: { 
  borderRadius: 12, 
  padding: 15, 
  borderWidth: 1 
},
  
settingRow: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 12 
},

settingText: {
  flex: 1
},

settingTitle: {
  fontSize: 15, 
  fontWeight: '600' 
},

settingSubtitle: { 
  fontSize: 12, 
  marginTop: 2
},

activeBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  padding: 15,
  borderRadius: 12,
},
  
activeBannerText: { 
  flex: 1, 
  fontSize: 13
},
  
refreshButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: 14,
  borderRadius: 25,
},
  
refreshText: { 
  color: '#fff', 
  fontWeight: 'bold' 
},
});