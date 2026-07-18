import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { en } from './en'
import { fr } from './fr'
import { pagesEn, pagesFr } from './pages'
import { appSpaceEn, appSpaceFr } from './app-space'
import { caregiverEn, caregiverFr } from './caregiver'
import { detectLocale, LOCALE_STORAGE_KEY, type Locale } from './locales'

const frAll = { ...fr, ...pagesFr, ...appSpaceFr, ...caregiverFr }
const enAll = { ...en, ...pagesEn, ...appSpaceEn, ...caregiverEn }

export type TranslationDict = typeof frAll

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : Prefix extends ''
          ? K
          : `${Prefix}.${K}`
    }[keyof T & string]
  : never

export type TranslationKey = NestedKeyOf<TranslationDict>

const dictionaries: Record<Locale, TranslationDict> = { fr: frAll, en: enAll }

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getByPath(dict: TranslationDict, key: string): string | undefined {
  const parts = key.split('.')
  let cur: unknown = dict
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = getByPath(dictionaries[locale], key) ?? getByPath(dictionaries.fr, key) ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v))
        }
      }
      return text
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
