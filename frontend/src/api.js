import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase client purely for REALTIME subscriptions on the frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Axios instance for backend REST API calls
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005',
});
