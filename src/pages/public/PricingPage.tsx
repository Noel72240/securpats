import { Link } from 'react-router-dom'
import { Check, Star, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PLAN_PRICES } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { arePaymentsBlocked } from '@/lib/maintenance'
import { PETSITTER_VIP_PLAN } from '@/lib/stripe/petsitter-vip'
import { PageSEO } from '@/components/seo/PageSEO'
import { useI18n } from '@/i18n/LanguageContext'

export default function PricingPage() {
  const { siteSettings } = useApp()
  const { t } = useI18n()
  const paymentsBlocked = arePaymentsBlocked(siteSettings)

  const ownerFeatures = [
    t('pricing.featUnlimited'),
    t('pricing.featReferents'),
    t('pricing.featQr'),
    t('pricing.featDocs'),
    t('pricing.featAlerts'),
    t('pricing.featPublic'),
    t('pricing.featSupport'),
  ]

  const petsitterFeatures = [
    t('pricing.featSpace'),
    t('pricing.featMissions'),
    t('pricing.featVerified'),
    t('pricing.featAvailability'),
    t('pricing.featId'),
  ]

  return (
    <PublicLayout>
      <PageSEO
        title="Tarifs — propriétaires et pet-sitters"
        description="Abonnements SécurPats : 4,99 €/mois ou 49,99 €/an pour les propriétaires. Pet-Sitter VIP à 9,90 €/mois."
        path="/tarifs"
      />
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {paymentsBlocked && (
            <div className="mb-8 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                {siteSettings.maintenance.message || 'Les inscriptions restent possibles, mais les paiements sont temporairement suspendus.'}
              </p>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('pricing.title')}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            <Card padding="lg" className="relative flex flex-col h-full">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">{t('pricing.owner')}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('pricing.monthly')}</h3>
              <p className="text-sm text-slate-500 mb-4">{t('pricing.monthlyDesc')}</p>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{PLAN_PRICES.monthly.toFixed(2).replace('.', ',')}</span>
                <span className="text-slate-500 ml-1">{t('pricing.perMonth')}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {ownerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button variant="outline" className="w-full mt-auto" disabled>{t('pricing.paymentsSuspended')}</Button>
              ) : (
                <Link to="/inscription" className="mt-auto">
                  <Button variant="outline" className="w-full">{t('pricing.chooseMonthly')}</Button>
                </Link>
              )}
            </Card>

            <Card padding="lg" className="relative flex flex-col h-full border-2 border-brand-500 shadow-lg shadow-brand-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-500 text-white text-xs font-bold whitespace-nowrap">
                  <Star className="w-3 h-3" /> {t('pricing.bestOffer')}
                </span>
              </div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2 mt-2">{t('pricing.owner')}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('pricing.yearly')}</h3>
              <p className="text-sm text-slate-500 mb-4">{t('pricing.yearlyDesc')}</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-brand-600">{PLAN_PRICES.yearly.toFixed(2).replace('.', ',')}</span>
                <span className="text-slate-500 ml-1">{t('pricing.perYear')}</span>
              </div>
              <p className="text-xs text-brand-600 font-semibold mb-4">
                {t('pricing.equivMonth', { price: (PLAN_PRICES.yearly / 12).toFixed(2).replace('.', ',') })}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {ownerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button className="w-full mt-auto" icon={ArrowRight} disabled>{t('pricing.paymentsSuspended')}</Button>
              ) : (
                <Link to="/inscription" className="mt-auto">
                  <Button className="w-full" icon={ArrowRight}>{t('pricing.chooseYearly')}</Button>
                </Link>
              )}
            </Card>

            <Card
              id="pet-sitter"
              padding="lg"
              className="relative flex flex-col h-full border-2 border-blue-500 shadow-lg shadow-blue-500/10 scroll-mt-24"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold whitespace-nowrap">
                  <Shield className="w-3 h-3" /> {t('pricing.vipBadge')}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 mt-2">{t('pricing.petsitter')}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{PETSITTER_VIP_PLAN.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{t('pricing.vipDesc')}</p>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-blue-600">
                  {PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-slate-500 ml-1">{t('pricing.perMonth')}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {petsitterFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button className="w-full" variant="blue" icon={ArrowRight} disabled>
                  {t('pricing.paymentsSuspended')}
                </Button>
              ) : (
                <Link to="/pet-sitter/inscription" className="mt-auto">
                  <Button variant="blue" className="w-full" icon={ArrowRight}>
                    {t('pricing.becomeVip')}
                  </Button>
                </Link>
              )}
            </Card>
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            <strong className="text-slate-700">{t('pricing.footerOwner')}</strong> :{' '}
            <Link to="/connexion" className="text-brand-600 font-semibold hover:underline">{t('pricing.login')}</Link>
            {' · '}
            <Link to="/inscription" className="text-brand-600 font-semibold hover:underline">{t('pricing.register')}</Link>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> — </span>
            <strong className="text-slate-700">{t('pricing.footerPetsitter')}</strong> :{' '}
            <Link to="/pet-sitter/connexion" className="text-blue-600 font-semibold hover:underline">{t('pricing.login')}</Link>
            {' · '}
            <Link to="/pet-sitter/inscription" className="text-blue-600 font-semibold hover:underline">{t('pricing.registerVip')}</Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
