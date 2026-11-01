import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

/**
 * Stockage session Supabase.
 * Sur natif : Capacitor Preferences (SharedPreferences / UserDefaults) —
 * localStorage WebView peut être purgé par l’OS → déconnexions aléatoires.
 */
const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key })
    return value
  },
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value })
  },
  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key })
  },
}

/** Migre une session déjà en localStorage vers Preferences (une fois). */
export async function migrateNativeAuthSessionFromLocalStorage(): Promise<void> {
  if (!Capacitor.isNativePlatform() || typeof localStorage === 'undefined') return

  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) keys.push(k)
  }

  for (const key of keys) {
    const old = localStorage.getItem(key)
    if (!old) continue
    const existing = await Preferences.get({ key })
    if (!existing.value) {
      await Preferences.set({ key, value: old })
    }
  }
}

export function getSupabaseAuthStorage():
  | typeof nativeStorage
  | typeof localStorage
  | undefined {
  if (typeof window === 'undefined') return undefined
  if (Capacitor.isNativePlatform()) return nativeStorage
  return localStorage
}
