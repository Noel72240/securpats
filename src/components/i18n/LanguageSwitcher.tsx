import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import { LOCALES, type Locale } from '@/i18n/locales'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5',
        className,
      )}
      role="group"
      aria-label={t('lang.switchTo')}
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code as Locale)}
          className={cn(
            'px-2.5 py-1 text-xs font-bold rounded-md transition-colors',
            locale === code
              ? 'bg-brand-600 text-white'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
          )}
          aria-pressed={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
