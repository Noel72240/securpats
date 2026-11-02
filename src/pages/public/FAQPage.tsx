import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import { allFaqFlat, getFaqCopy } from '@/lib/faq/content'

export default function FAQPage() {
  const { locale } = useI18n()
  const copy = useMemo(() => getFaqCopy(locale === 'en' ? 'en' : 'fr'), [locale])
  const [activeTheme, setActiveTheme] = useState(copy.themes[0]?.id ?? '')
  const [openKey, setOpenKey] = useState<string | null>(null)

  useEffect(() => {
    setActiveTheme(copy.themes[0]?.id ?? '')
    setOpenKey(null)
  }, [copy])

  const theme = copy.themes.find(t => t.id === activeTheme) ?? copy.themes[0]
  const seoFaqs = useMemo(() => allFaqFlat(locale === 'en' ? 'en' : 'fr'), [locale])

  return (
    <PublicLayout>
      <PageSEO
        title={copy.title}
        description={copy.subtitle}
        path="/faq"
        keywords={[
          'FAQ SécurPats',
          'bien-être animal',
          'abonnement SécurPats',
          'QR Code urgence animal',
          'hospitalisation animal',
        ]}
        faqs={seoFaqs}
      />

      <section className="relative overflow-hidden border-b border-brand-100/80 bg-gradient-to-br from-brand-50 via-white to-emerald-50/70">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                FAQ
              </p>
              <h1 className="font-[family-name:var(--font-shop)] text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src="/faq/questions-v2.png"
                alt=""
                className="h-40 w-40 object-contain drop-shadow-md sm:h-48 sm:w-48"
                width={192}
                height={192}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {copy.themesNav}
          </p>
          <div className="mb-10 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {copy.themes.map(t => {
              const selected = t.id === theme?.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveTheme(t.id)
                    setOpenKey(null)
                  }}
                  className={cn(
                    'flex shrink-0 max-w-[11rem] flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-2.5 text-center transition-colors sm:max-w-[12.5rem]',
                    selected
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/60',
                  )}
                >
                  <img
                    src={t.sticker}
                    alt=""
                    className="h-14 w-14 object-contain"
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                  <span
                    className={cn(
                      'text-[11px] font-semibold leading-snug sm:text-xs',
                      selected ? 'text-brand-900' : 'text-slate-700',
                    )}
                  >
                    {t.title}
                  </span>
                </button>
              )
            })}
          </div>

          {theme && (
            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
              <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-3xl border border-slate-100 bg-white/80 p-5 text-center shadow-sm backdrop-blur">
                  <img
                    src={theme.sticker}
                    alt=""
                    className="mx-auto h-36 w-36 object-contain"
                    width={144}
                    height={144}
                  />
                  <p className="mt-3 text-sm font-bold text-slate-900">{theme.title}</p>
                </div>
              </aside>

              <div>
                <div className="mb-6 flex items-start gap-4 lg:hidden">
                  <img
                    src={theme.sticker}
                    alt=""
                    className="h-20 w-20 shrink-0 object-contain"
                    width={80}
                    height={80}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{theme.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{theme.intro}</p>
                  </div>
                </div>

                <div className="mb-6 hidden lg:block">
                  <h2 className="text-3xl font-bold text-slate-900">{theme.title}</h2>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
                    {theme.intro}
                  </p>
                </div>

                <div className="space-y-3">
                  {theme.items.map((item, i) => {
                    const key = `${theme.id}-${i}`
                    const open = openKey === key
                    return (
                      <div
                        key={key}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                          onClick={() => setOpenKey(open ? null : key)}
                          aria-expanded={open}
                        >
                          <span className="pr-2 font-semibold text-slate-900">{item.question}</span>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200',
                              open && 'rotate-180',
                            )}
                          />
                        </button>
                        {open && (
                          <div className="border-t border-slate-50 px-5 pb-5 pt-3 sm:px-6">
                            <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-brand-100 bg-gradient-to-r from-brand-700 to-emerald-700 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src="/faq/celebrate-v2.png"
              alt=""
              className="hidden h-24 w-24 object-contain sm:block"
              width={96}
              height={96}
            />
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{copy.ctaTitle}</h2>
              <p className="mt-2 max-w-xl text-sm text-brand-50/95 sm:text-base">{copy.ctaBody}</p>
            </div>
          </div>
          <Link to="/tarifs">
            <Button
              size="lg"
              className="bg-white text-brand-800 hover:bg-brand-50"
              icon={ArrowRight}
            >
              {copy.ctaButton}
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
