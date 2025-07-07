import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://atngqhvnzizufimblwmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bmdxaHZueml6dWZpbWJsd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDA2NDIsImV4cCI6MjA2NDQ3NjY0Mn0.zIvBpKufApxcrrBuc3CXKR8jdH6DonzXwtDanIaw6bU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});