import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
];

export default function CurrencyScreen({ navigation }) {
  const { theme } = useApp();
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EGP');
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectingFrom, setSelectingFrom] = useState(false);
  const [selectingTo, setSelectingTo] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const data = await response.json();
      setRates(data.rates);
      setLastUpdated(new Date().toLocaleDateString());
    } catch (err) {
      setRates({
        USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5,
        EGP: 48.9, AED: 3.67, SAR: 3.75, TRY: 32.1,
        INR: 83.1, CNY: 7.24, CAD: 1.36, AUD: 1.53,
        CHF: 0.89, SGD: 1.34, MYR: 4.72,
      });
      setLastUpdated('Offline rates');
    }
    setLoading(false);
  };

  const convert = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return '0';
    const amountNum = parseFloat(amount) || 0;
    const inUSD = amountNum / rates[fromCurrency];
    const result = inUSD * rates[toCurrency];
    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyInfo = (code) => CURRENCIES.find(c => c.code === code) || { flag: '🌍', name: code };

  if (selectingFrom || selectingTo) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectingFrom(false); setSelectingTo(false); }}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Select {selectingFrom ? 'From' : 'To'} Currency
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView>
          {CURRENCIES.map((cur) => (
            <TouchableOpacity
              key={cur.code}
              style={[styles.currencyListItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                if (selectingFrom) setFromCurrency(cur.code);
                else setToCurrency(cur.code);
                setSelectingFrom(false);
                setSelectingTo(false);
              }}
            >
              <Text style={styles.currencyFlag}>{cur.flag}</Text>
              <View style={styles.currencyListInfo}>
                <Text style={[styles.currencyListCode, { color: theme.text }]}>{cur.code}</Text>
                <Text style={[styles.currencyListName, { color: theme.subtext }]}>{cur.name}</Text>
              </View>
              {(selectingFrom ? fromCurrency : toCurrency) === cur.code && (
                <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Currency Converter</Text>
        <TouchableOpacity onPress={fetchRates}>
          <Ionicons name="refresh-outline" size={22} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={[styles.updatedText, { color: theme.subtext }]}>
              Last updated: {lastUpdated}
            </Text>

            <View style={[styles.amountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.amountLabel, { color: theme.subtext }]}>Amount</Text>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={theme.subtext}
              />
            </View>

            <TouchableOpacity
              style={[styles.currencyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setSelectingFrom(true)}
            >
              <Text style={styles.currencyCardFlag}>{getCurrencyInfo(fromCurrency).flag}</Text>
              <View style={styles.currencyCardInfo}>
                <Text style={[styles.currencyCardCode, { color: theme.text }]}>{fromCurrency}</Text>
                <Text style={[styles.currencyCardName, { color: theme.subtext }]}>
                  {getCurrencyInfo(fromCurrency).name}
                </Text>
              </View>
              <Text style={[styles.currencyCardAmount, { color: theme.accent }]}>
                {parseFloat(amount) || 0}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: theme.accent }]}
              onPress={swapCurrencies}
            >
              <Ionicons name="swap-vertical-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.currencyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setSelectingTo(true)}
            >
              <Text style={styles.currencyCardFlag}>{getCurrencyInfo(toCurrency).flag}</Text>
              <View style={styles.currencyCardInfo}>
                <Text style={[styles.currencyCardCode, { color: theme.text }]}>{toCurrency}</Text>
                <Text style={[styles.currencyCardName, { color: theme.subtext }]}>
                  {getCurrencyInfo(toCurrency).name}
                </Text>
              </View>
              <Text style={[styles.currencyCardAmount, { color: '#27ae60' }]}>
                {convert()}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.subtext} />
            </TouchableOpacity>

            <View style={[styles.resultCard, { backgroundColor: theme.accent }]}>
              <Text style={styles.resultText}>
                {parseFloat(amount) || 0} {fromCurrency} =
              </Text>
              <Text style={styles.resultAmount}>{convert()} {toCurrency}</Text>
              <Text style={styles.resultRate}>
                1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>All Exchange Rates</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.subtext }]}>
              Based on 1 {fromCurrency}
            </Text>
            {CURRENCIES.filter(c => c.code !== fromCurrency).map((cur) => (
              <View key={cur.code} style={[styles.rateRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.rateFlag}>{cur.flag}</Text>
                <Text style={[styles.rateCode, { color: theme.text }]}>{cur.code}</Text>
                <Text style={[styles.rateName, { color: theme.subtext }]}>{cur.name}</Text>
                <Text style={[styles.rateValue, { color: theme.accent }]}>
                  {rates[cur.code] ? (rates[cur.code] / rates[fromCurrency]).toFixed(3) : 'N/A'}
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

updatedText: { 
  fontSize: 12, 
  textAlign: 'center', 
  marginBottom: 15 
},

amountCard: { 
  borderRadius: 12, 
  padding: 15, 
  borderWidth: 1, 
  marginBottom: 12 
},

amountLabel: { 
  fontSize: 12, 
  marginBottom: 5 
},

amountInput: { 
  fontSize: 28, 
  fontWeight: 'bold' 
},

currencyCard: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  borderRadius: 12, 
  padding: 15, 
  borderWidth: 1, 
  marginBottom: 8, 
  gap: 10 
},
  
currencyCardFlag: { 
  fontSize: 28 
},
  
currencyCardInfo: { 
  flex: 1 
},

currencyCardCode: { 
  fontSize: 16, 
  fontWeight: 'bold' 
},

currencyCardName: { 
  fontSize: 12 
},

currencyCardAmount: { 
  fontSize: 18, 
  fontWeight: 'bold' 
},

swapButton: { 
  width: 44, 
  height: 44, 
  borderRadius: 22, 
  alignItems: 'center', 
  justifyContent: 'center', 
  alignSelf: 'center', 
  marginVertical: 4 
},

resultCard: { 
  borderRadius: 16, 
  padding: 20, 
  alignItems: 'center', 
  marginVertical: 15, 
  gap: 5 
},

resultText: { 
  color: '#fff', 
  fontSize: 16 
},

resultAmount: { 
  color: '#fff', 
  fontSize: 32, 
  fontWeight: 'bold' 
},

resultRate: { 
  color: '#ffffff99', 
  fontSize: 12 
},

sectionTitle: { 
  fontSize: 18, 
  fontWeight: 'bold', 
  marginBottom: 4
},

sectionSubtitle: { 
  fontSize: 12, 
  marginBottom: 10 
},

rateRow: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  borderRadius: 10, 
  padding: 12, 
  marginBottom: 6, 
  borderWidth: 1, 
  gap: 8 
},

rateFlag: { 
  fontSize: 20
},

rateCode: { 
  fontSize: 14, 
  fontWeight: 'bold', 
  width: 45 
},

rateName: { 
  flex: 1, 
  fontSize: 12
},

rateValue: { 
  fontSize: 14, 
  fontWeight: 'bold' 
},

currencyListItem: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  padding: 15, 
  borderBottomWidth: 1, 
  gap: 12 
},

currencyFlag: { 
  fontSize: 28 
},

currencyListInfo: { 
  flex: 1 
},

currencyListCode: { 
  fontSize: 15, 
  fontWeight: 'bold' 
},

currencyListName: { 
  fontSize: 12 
},
});