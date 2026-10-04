import { Capacitor } from '@capacitor/core'

/** True quand l’app tourne dans Capacitor (Android / iOS). */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

export function nativePlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}

/** Origine web publique (liens emails, QR, Stripe return). */
export function publicAppOrigin(): string {
  const fromEnv = (import.meta.env.VITE_APP_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && !isNativeApp()) return window.location.origin
  return 'https://www.securpats.fr'
}

/**
 * URL absolue des routes API Vercel.
 * Sur le web : chemin relatif. Sur Android/iOS : https://www.securpats.fr/api/...
 */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (isNativeApp()) return `${publicAppOrigin()}${p}`
  return p
}
