export type Locale = 'fr' | 'en'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

export const LOCALE_STORAGE_KEY = 'securpats_locale'

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'fr' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'fr'
  return nav.startsWith('en') ? 'en' : 'fr'
}
