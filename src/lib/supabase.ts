import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // In development without Supabase, fall back to localStorage mode
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars not set. Running in localStorage-only mode.'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = supabase !== null
