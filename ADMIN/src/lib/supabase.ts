import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ledjnqvcyzqledcibjpd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZGpucXZjeXpxbGVkY2lianBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMDIyNjUsImV4cCI6MjEwNjY3ODI2NX0.42aIIeQexSnm-dRnUE7vICv882jwl5tw70wyL3OSbhw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
