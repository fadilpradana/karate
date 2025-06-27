// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unkauvoourtaoxdpdlst.supabase.co'; // Ganti dengan URL project kamu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua2F1dm9vdXJ0YW94ZHBkbHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzYyNjEsImV4cCI6MjA2NjUxMjI2MX0.1Tw7yPOERAsLlz8J3h-6xs2k9EZ0p4bs45lWnigO6lg'; // Ganti dengan anon public key dari Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
