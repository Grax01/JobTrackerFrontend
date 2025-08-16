import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yxrjqcvlqverhfbrfeji.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmpxY3ZscXZlcmhmYnJmZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzI4MDgsImV4cCI6MjA3MDEwODgwOH0.ut1IpTFLVBa-_IIXNlrNZgnRQk4A0B9Fr47wCijqkSs'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Use default storage to avoid conflicts with our cookie system
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
