import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://btjultggcapacbvofoyx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0anVsdGdnY2FwYWNidm9mb3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzMzNzksImV4cCI6MjA5MjgwOTM3OX0.VmwZo66MiYdpZ-ZJSpqBF--GdIsVHsF6f7H7S9P9qAA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});