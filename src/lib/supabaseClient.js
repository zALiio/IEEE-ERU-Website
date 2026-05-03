import { createClient } from '@supabase/supabase-js';

// Use env vars if available (production), otherwise use fallback for local dev
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxrsjhpoivenbfcjbfhy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cnNqaHBvaXZlbmJmY2piZmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTIwNTIsImV4cCI6MjA4OTMyODA1Mn0.snW57VGWBrZ4L9xBN-dDZpkub6fRpRKOLq5RkrW9Xiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
