import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

export const translations = {
    en: {
        home: 'Home', search: 'Search', map: 'Map',
        bookings: 'Bookings', profile: 'Profile',
        whereTo: 'Where to next?', hello: 'Hello',
        quickActions: 'Quick Actions', explore: 'Explore',
        weather: 'Weather', currency: 'Currency',
        sos: 'SOS', journey: 'Journey',
        recommendations: 'Recommended For You',
        journal: 'Journal', photos: 'Photos',
        settings: 'Settings', logout: 'Logout',
        darkMode: 'Dark Mode', language: 'Language',
        editProfile: 'Edit Profile', myTrips: 'My Trips',
        allDestinations: 'All', beach: 'Beach',
        mountains: 'Mountains', cities: 'Cities',
        culture: 'Culture', nature: 'Nature',
    },

    ar: {
        home: 'الرئيسية', search: 'بحث', map: 'خريطة',
        bookings: 'الحجوزات', profile: 'الملف',
        whereTo: 'إلى أين؟', hello: 'مرحباً',
        quickActions: 'إجراءات سريعة', explore: 'استكشف',
        weather: 'طقس', currency: 'عملة',
        sos: 'طوارئ', journey: 'رحلة',
        recommendations: 'موصى به لك',
        journal: 'مذكرة', photos: 'صور',
        settings: 'إعدادات', logout: 'خروج',
        darkMode: 'الوضع الداكن', language: 'اللغة',
        editProfile: 'تعديل الملف', myTrips: 'رحلاتي',
        allDestinations: 'الكل', beach: 'شاطئ',
        mountains: 'جبال', cities: 'مدن',
        culture: 'ثقافة', nature: 'طبيعة',
    },

    fr: {
        home: 'Accueil', search: 'Rechercher', map: 'Carte',
        bookings: 'Réservations', profile: 'Profil',
        whereTo: 'Où aller?', hello: 'Bonjour',
        quickActions: 'Actions rapides', explore: 'Explorer',
        weather: 'Météo', currency: 'Devise',
        sos: 'SOS', journey: 'Voyage',
        recommendations: 'Recommandé pour vous',
        journal: 'Journal', photos: 'Photos',
        settings: 'Paramètres', logout: 'Déconnexion',
        darkMode: 'Mode sombre', language: 'Langue',
        editProfile: 'Modifier profil', myTrips: 'Mes voyages',
        allDestinations: 'Tous', beach: 'Plage',
        mountains: 'Montagnes', cities: 'Villes',
        culture: 'Culture', nature: 'Nature',
    },

    es: {
        home: 'Inicio', search: 'Buscar', map: 'Mapa',
        bookings: 'Reservas', profile: 'Perfil',
        whereTo: '¿A dónde ir?', hello: 'Hola',
        quickActions: 'Acciones rápidas', explore: 'Explorar',
        weather: 'Clima', currency: 'Moneda',
        sos: 'SOS', journey: 'Viaje',
        recommendations: 'Recomendado para ti',
        journal: 'Diario', photos: 'Fotos',
        settings: 'Ajustes', logout: 'Salir',
        darkMode: 'Modo oscuro', language: 'Idioma',
        editProfile: 'Editar perfil', myTrips: 'Mis viajes',
        allDestinations: 'Todo', beach: 'Playa',
        mountains: 'Montañas', cities: 'Ciudades',
        culture: 'Cultura', nature: 'Naturaleza',
    },
};

export const getTheme = (darkMode, lowBatteryMode) => {
    if (lowBatteryMode) {
        return {
            bg: '#0a0a0a',
            card: '#111111',
            text: '#ffffff',
            subtext: '#888888',
            primary: '#333333',
            accent: '#555555',
            border: '#222222',
            tabBar: '#111111',
        };
    }
    if (darkMode) {
        return {
            bg: '#0F172A',
            card: '#1E293B',
            text: '#F1F5F9',
            subtext: '#94A3B8',
            primary: '#1A3C6E',
            accent: '#2D6BC4',
            border: '#334155',
            tabBar: '#1A3C6E',
        };
    }
    return {
        bg: '#FFFFFF',
        card: '#F8F9FA',
        text: '#1A1A2E',
        subtext: '#6B7280',
        primary: '#1A3C6E',
        accent: '#2D6BC4',
        border: '#E5E7EB',
        tabBar: '#1A3C6E',
    };
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [language, setLanguage] = useState('en');
    const [darkMode, setDarkMode] = useState(false);
    const [lowBatteryMode, setLowBatteryMode] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        AsyncStorage.getItem('darkMode').then(val => {
            if (val === 'true') setDarkMode(true);
        });
    }, []);

    useEffect(() => {
    AsyncStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);
        const fetchProfile = async (userId) => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                if (data) setProfile(data);
            } catch (err) {
                console.log('Profile fetch error:', err);
            }
        };

        const fetchDestinations = async () => {
        setLoading(true);
        try {
        const { data } = await supabase
            .from('destinations')
            .select('*')
            .order('rating', { ascending: false });
        if (data) setDestinations(data);
        } catch (err) {
        console.log('Destinations fetch error:', err);
        }
        setLoading(false);
    };

        const logout = async () => {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        };

        const dispatch = ({ type, payload }) => {
            switch (type) {
                case 'SET_USER': setUser(payload); break;
                case 'SET_PROFILE': setProfile(payload); break;
                case 'SET_LANGUAGE': setLanguage(payload); break;
                case 'SET_DARK_MODE': setDarkMode(payload); break;
                case 'SET_LOW_BATTERY_MODE': setLowBatteryMode(payload); break;
                case 'LOGOUT':
                    setUser(null);
                    setProfile(null);
                    break;
            }
        };

    const t = translations[language] || translations['en'];
    const theme = getTheme(darkMode, lowBatteryMode);
    const value = { user, profile, language, darkMode, lowBatteryMode, destinations, loading, dispatch, fetchDestinations, logout, t, theme, };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}