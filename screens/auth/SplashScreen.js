import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkSession();
  }, []);

   const checkSession = async () => {
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        const googleName = user.user_metadata?.full_name ||
                          user.user_metadata?.name ||
                          user.email?.split('@')[0] || 'Traveler';
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingProfile || !existingProfile.full_name) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: googleName,
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Welcome');
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.subtitle}>Your travel companion</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
container: { 
  flex: 1, 
  backgroundColor: '#FFFFFF' 
},
  
content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
},
  
logo: {
    width: 400,
    height: 200,
    resizeMode: 'contain',
},
  
subtitle: {
    fontSize: 16,
    color: '#888',
    letterSpacing: 1,
},
});