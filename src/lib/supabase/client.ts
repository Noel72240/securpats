import { Capacitor } from '@capacitor/core'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import {
  getSupabaseAuthStorage,
  migrateNativeAuthSessionFromLocalStorage,
} from './auth-storage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient<Database> | null = null
let migratePromise: Promise<void> | null = null

function ensureNativeSessionMigrated(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve()
  if (!migratePromise) {
    migratePromise = migrateNativeAuthSessionFromLocalStorage().catch(err => {
      console.warn('[Supabase] migration session native:', err)
    })
  }
  return migratePromise
}

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) {
    void ensureNativeSessionMigrated()
    const storage = getSupabaseAuthStorage()
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        // Sur natif : pas de tokens dans l’URL (évite de casser la session au démarrage)
        detectSessionInUrl: !Capacitor.isNativePlatform(),
      },
    })
  }
  return client
}

/** Attend la migration Preferences puis renvoie le client (démarrage app). */
export async function getSupabaseReady(): Promise<SupabaseClient<Database>> {
  await ensureNativeSessionMigrated()
  return getSupabase()
}

/** Client safe — retourne null si non configuré */
export function getSupabaseSafe(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null
  return getSupabase()
}

export const supabaseConfig = { url: supabaseUrl, anonKey: supabaseAnonKey }
