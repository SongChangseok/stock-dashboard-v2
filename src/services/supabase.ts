import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Auth helpers
export const auth = supabase.auth

// Database helpers
export const db = supabase.from

// Real-time helpers
export const realtime = supabase.channel

// Storage helpers
export const storage = supabase.storage
