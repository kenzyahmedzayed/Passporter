import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './context/AppContext';

// Auth Screens
import SplashScreen from './screens/auth/SplashScreen';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignUpScreen from './screens/auth/SignUpScreen';

// Main Screens
import HomeScreen from './screens/main/HomeScreen';
import SearchScreen from './screens/main/SearchScreen';
import MapScreen from './screens/main/MapScreen';
import BookingScreen from './screens/main/BookingScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import DestinationDetailsScreen from './screens/main/DestinationDetailsScreen';

// Feature Screens
import ItineraryScreen from './screens/features/ItineraryScreen';
import WeatherScreen from './screens/features/WeatherScreen';
import CurrencyScreen from './screens/features/CurrencyScreen';
import JournalScreen from './screens/features/JournalScreen';
import PhotoAlbumScreen from './screens/features/PhotoAlbumScreen';
import DocumentVaultScreen from './screens/features/DocumentVaultScreen';
import ReviewsScreen from './screens/features/ReviewsScreen';
import SOSScreen from './screens/features/SOSScreen';
import BoardingPassScreen from './screens/features/BoardingPassScreen';
import BatteryModeScreen from './screens/features/BatteryModeScreen';
import ShareItineraryScreen from './screens/features/ShareItineraryScreen';
import LanguageScreen from './screens/features/LanguageScreen';
import ARFinderScreen from './screens/features/ARFinderScreen';
import OfflineMapsScreen from './screens/features/OfflineMapsScreen';
import TripPlannerScreen from './screens/features/TripPlannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A3C6E',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ffffff80',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          {/* Auth */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />

          {/* Main Tabs */}
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* Feature Screens */}
          <Stack.Screen name="Itinerary" component={ItineraryScreen} />
          <Stack.Screen name="Weather" component={WeatherScreen} />
          <Stack.Screen name="Currency" component={CurrencyScreen} />
          <Stack.Screen name="Journal" component={JournalScreen} />
          <Stack.Screen name="PhotoAlbum" component={PhotoAlbumScreen} />
          <Stack.Screen name="DocumentVault" component={DocumentVaultScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="SOS" component={SOSScreen} />
          <Stack.Screen name="BoardingPass" component={BoardingPassScreen} />
          <Stack.Screen name="BatteryMode" component={BatteryModeScreen} />
          <Stack.Screen name="ShareItinerary" component={ShareItineraryScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="ARFinder" component={ARFinderScreen} />
          <Stack.Screen name="OfflineMaps" component={OfflineMapsScreen} />
          <Stack.Screen name="DestinationDetails" component={DestinationDetailsScreen} />
          <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}