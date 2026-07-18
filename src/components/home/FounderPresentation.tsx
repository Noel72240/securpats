import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'

const FOUNDER_PHOTO = '/founder-johanna-hayer.png'

const paragraphKeys: TranslationKey[] = [
  'founder.p1',
  'founder.p2',
  'founder.p3',
  'founder.p4',
  'founder.p5',
  'founder.p6',
  'founder.p7',
]

export function FounderPresentation() {
  const { t } = useI18n()

  return (
    <section className="founder-presentation py-12 sm:py-16 lg:py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <p className="text-sm sm:text-base font-semibold tracking-[0.14em] uppercase text-brand-600 mb-3">
            {t('founder.eyebrow')}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            {t('founder.title')}
          </h2>
        </div>

        <div className="grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
          <div className="mx-auto lg:mx-0 w-full max-w-sm lg:max-w-none">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50">
              <img
                src={FOUNDER_PHOTO}
                alt={t('founder.photoAlt')}
                className="w-full h-auto object-cover aspect-[3/4]"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-center lg:text-left">
              <span className="block font-bold text-slate-900 text-xl sm:text-2xl tracking-tight">Johanna Hayer</span>
              <span className="block font-medium text-brand-700 text-sm sm:text-base mt-1">
                {t('founder.role')}
              </span>
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6 text-slate-700 text-base sm:text-lg leading-relaxed">
            {paragraphKeys.map(key => (
              <p key={key}>{t(key)}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
