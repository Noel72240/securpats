import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

/** Client safe — retourne null si non configuré */
export function getSupabaseSafe(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null
  return getSupabase()
}

export const supabaseConfig = { url: supabaseUrl, anonKey: supabaseAnonKey }
