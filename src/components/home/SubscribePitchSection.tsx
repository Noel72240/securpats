import { Link } from 'react-router-dom'
import { ArrowRight, Bell, Check, PawPrint, QrCode, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n/LanguageContext'
import { PLAN_PRICES } from '@/types'

type Props = {
  /** Variante compacte pour l’accueil app mobile */
  compact?: boolean
}

export function SubscribePitchSection({ compact = false }: Props) {
  const { t } = useI18n()

  const benefits = [
    { icon: PawPrint, text: t('home.subBenefitPets') },
    { icon: Users, text: t('home.subBenefitReferents') },
    { icon: Bell, text: t('home.subBenefitAlerts') },
    { icon: QrCode, text: t('home.subBenefitQr') },
  ]

  if (compact) {
    return (
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white p-5 shadow-lg shadow-brand-900/20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100/90 mb-2">
          {t('home.subBadge')}
        </p>
        <h2 className="text-xl font-bold leading-snug mb-2">{t('home.subTitle')}</h2>
        <p className="text-sm text-brand-50/90 leading-relaxed mb-4">{t('home.subSubtitle')}</p>
        <ul className="space-y-2 mb-5">
          {benefits.map(b => (
            <li key={b.text} className="flex items-start gap-2.5 text-sm text-brand-50">
              <span className="mt-0.5 w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <b.icon className="w-3.5 h-3.5" />
              </span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm font-semibold mb-3">
          {t('home.subFromPrice').replace('{price}', String(PLAN_PRICES.monthly).replace('.', ','))}
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to="/inscription"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-slate-900 font-semibold text-sm py-3 px-4 transition-colors"
          >
            {t('home.subCta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/tarifs" className="text-center text-xs text-brand-100 underline underline-offset-2">
            {t('home.seePricing')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-4">
              {t('home.subBadge')}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('home.subTitle')}</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">{t('home.subSubtitle')}</p>
            <p className="text-base text-slate-700 leading-relaxed mb-8">{t('home.subWhy')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/inscription">
                <Button size="lg" icon={ArrowRight}>{t('home.subCta')}</Button>
              </Link>
              <Link to="/tarifs">
                <Button size="lg" variant="outline">{t('home.seePricing')}</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50/60 p-6 sm:p-8 shadow-sm">
            <p className="text-sm font-semibold text-brand-800 mb-1">{t('home.subIncluded')}</p>
            <p className="text-3xl font-extrabold text-slate-900 mb-6">
              {String(PLAN_PRICES.monthly).replace('.', ',')} €
              <span className="text-base font-semibold text-slate-500">/{t('home.subPerMonth')}</span>
            </p>
            <ul className="space-y-3.5 mb-6">
              {benefits.map(b => (
                <li key={b.text} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <b.icon className="w-4 h-4" />
                  </span>
                  <span className="pt-1.5">{b.text}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </span>
                <span className="pt-1.5">{t('home.noCommitment')}</span>
              </li>
            </ul>
            <p className="text-xs text-slate-500 leading-relaxed">{t('home.subFootnote')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
