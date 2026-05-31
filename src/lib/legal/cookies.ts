import { COOKIE_CONSENT_KEY } from './constants'

export type CookiePreferences = {
  essential: true
  analytics: boolean
  updatedAt: string
}

export function getCookiePreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookiePreferences
  } catch {
    return null
  }
}

export function saveCookiePreferences(prefs: Omit<CookiePreferences, 'essential' | 'updatedAt'> & { analytics: boolean }) {
  const stored: CookiePreferences = {
    essential: true,
    analytics: prefs.analytics,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored))
  window.dispatchEvent(new CustomEvent('securpats:cookie-consent', { detail: stored }))
  return stored
}

export function hasCookieConsent(): boolean {
  return getCookiePreferences() !== null
}

export function acceptAllCookies() {
  return saveCookiePreferences({ analytics: false })
}

export function rejectOptionalCookies() {
  return saveCookiePreferences({ analytics: false })
}
