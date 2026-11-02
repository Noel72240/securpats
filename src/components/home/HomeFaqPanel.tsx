import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import { getFaqCopy } from '@/lib/faq/content'

/** FAQ compacte pour l’accueil — panneau à droite avec une expression par thème. */
export function HomeFaqPanel() {
  const { locale } = useI18n()
  const copy = useMemo(() => getFaqCopy(locale === 'en' ? 'en' : 'fr'), [locale])
  const [activeId, setActiveId] = useState(copy.themes[0]?.id ?? '')
  const [openQ, setOpenQ] = useState(0)

  const theme = copy.themes.find(t => t.id === activeId) ?? copy.themes[0]
  if (!theme) return null

  return (
    <aside className="rounded-3xl border border-brand-100 bg-white/95 p-4 shadow-lg shadow-brand-900/5 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">FAQ</p>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {locale === 'en' ? 'Quick answers' : 'Réponses rapides'}
          </h2>
        </div>
        <img
          src={theme.sticker}
          alt=""
          className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          width={112}
          height={112}
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {copy.themes.map(t => {
          const on = t.id === theme.id
          return (
            <button
              key={t.id}
              type="button"
              title={t.title}
              onClick={() => {
                setActiveId(t.id)
                setOpenQ(0)
              }}
              className={cn(
                'flex flex-col items-center rounded-2xl border px-1.5 py-2.5 transition-colors',
                on
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-100 bg-slate-50/80 hover:border-brand-200',
              )}
            >
              <img src={t.sticker} alt="" className="h-16 w-16 object-contain sm:h-[4.5rem] sm:w-[4.5rem]" width={72} height={72} loading="lazy" />
              <span
                className={cn(
                  'mt-1.5 line-clamp-2 text-center text-[10px] font-semibold leading-tight sm:text-[11px]',
                  on ? 'text-brand-800' : 'text-slate-600',
                )}
              >
                {t.title}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-slate-600">{theme.intro}</p>

      <div className="space-y-2">
        {theme.items.slice(0, 3).map((item, i) => {
          const open = openQ === i
          return (
            <div key={item.question} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left"
                onClick={() => setOpenQ(open ? -1 : i)}
              >
                <span className="text-sm font-semibold text-slate-900">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 text-brand-600 transition-transform',
                    open && 'rotate-180',
                  )}
                />
              </button>
              {open && (
                <p className="border-t border-slate-100 px-3 pb-3 pt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {item.answer}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Link
        to="/faq"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        {locale === 'en' ? 'See full FAQ' : 'Voir toute la FAQ'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  )
}
