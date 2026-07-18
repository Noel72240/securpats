import { useState, useEffect, useRef } from 'react'
import { CreditCard, Check, Star, Receipt, Shield, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, CardHeader, EmptyState } from '@/components/ui/Card'
import { useApp, useHasPetsitterVip } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { PETSITTER_VIP_PLAN, isPetsitterVipStripeConfigured } from '@/lib/stripe/petsitter-vip'
import { createPetsitterVipCheckout, openCustomerPortal, reconcilePetsitterVipAccess, stripeConfig } from '@/lib/stripe/client'
import { arePaymentsBlocked } from '@/lib/maintenance'
import { formatDate } from '@/lib/utils'

export default function PetSitterSubscriptionPage() {
  const { t } = useI18n()
  const { subscription, invoices, currentUser, siteSettings } = useApp()
  const [searchParams] = useSearchParams()
  const canceled = searchParams.get('canceled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const stripeReady = isPetsitterVipStripeConfigured()
  const hasVip = useHasPetsitterVip()
  const paymentsBlocked = arePaymentsBlocked(siteSettings)
  const needsPayment = stripeReady && !hasVip
  const reconciled = useRef(false)

  useEffect(() => {
    if (!currentUser || hasVip || reconciled.current) return
    if (!invoices.some(i => i.status === 'paid' && i.plan === 'petsitter_vip')) return

    reconciled.current = true
    void reconcilePetsitterVipAccess(currentUser.id).then(result => {
      if (result.activated) window.location.reload()
    })
  }, [currentUser, hasVip, invoices])

  const handleSubscribe = async () => {
    if (!currentUser) return
    if (paymentsBlocked) {
      setError('Les paiements sont temporairement suspendus. Réessayez ultérieurement.')
      return
    }
    if (!stripeReady) {
      setError('Stripe n\'est pas encore configuré pour l\'abonnement VIP pet-sitter.')
      return
    }
    setLoading(true)
    setError('')
    const result = await createPetsitterVipCheckout({
      userId: currentUser.id,
      email: currentUser.email,
    })
    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleManage = async () => {
    if (!subscription?.stripeCustomerId) {
      setError('Aucun compte Stripe associé. Contactez le support.')
      return
    }
    setError('')
    const result = await openCustomerPortal(
      subscription.stripeCustomerId,
      `${stripeConfig.appUrl}/pet-sitter/abonnement`,
    )
    if (result.error) setError(result.error)
  }

  const vipPriceLabel = `${PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')} €/mois`

  return (
    <DashboardLayout variant="petsitter" title={t('petsitterSub.title')}>
      <div className="space-y-8 max-w-2xl">
        {paymentsBlocked && needsPayment && (
          <Card className="bg-orange-50 border-orange-200 !p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">{t('ownerSub.paymentsBlocked')}</p>
              <p className="text-sm text-orange-800 mt-1">
                {siteSettings.maintenance.message || 'Le site est en maintenance. Les abonnements reprendront très bientôt.'}
              </p>
            </div>
          </Card>
        )}

        {needsPayment && (
          <Card className="bg-blue-50 border-blue-200 !p-4">
            <p className="font-semibold text-slate-900">{t('petsitterSub.become')}</p>
            <p className="text-sm text-slate-600 mt-1">
              Votre pièce d&apos;identité est enregistrée. Activez l&apos;abonnement VIP à {vipPriceLabel} pour recevoir des missions et gérer votre profil.
            </p>
          </Card>
        )}

        {canceled && (
          <Card className="bg-amber-50 border-amber-200 !p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">{t('petsitterSub.cancelled')}</p>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200 !p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </Card>
        )}

        {!stripeReady && (
          <Card className="bg-slate-50 border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-slate-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Paiement Stripe — configuration requise</p>
                <p className="text-sm text-slate-600 mt-1">
                  L&apos;abonnement VIP pet-sitter sera activé une fois Stripe connecté (VITE_STRIPE_PRICE_PETSITTER_VIP).
                </p>
              </div>
            </div>
          </Card>
        )}

        {subscription?.plan === 'petsitter_vip' && subscription.ownerId === currentUser?.id && (
          <Card className="bg-blue-50 border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-500" />
                  Pet-Sitter VIP — {subscription.price.toFixed(2).replace('.', ',')} €/mois
                </h3>
                <p className="text-sm text-slate-600 mt-1">Actif depuis le {formatDate(subscription.startDate)}</p>
                <p className="text-sm text-slate-600">
                  Prochain renouvellement : {formatDate(subscription.renewalDate)}
                  {subscription.autoRenew ? ' (automatique via Stripe)' : ' (résiliation programmée)'}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                {subscription.status === 'active' ? t('petsitterSub.vipActive') : subscription.status}
              </Badge>
            </div>
            {subscription.stripeCustomerId && stripeReady && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Button variant="outline" size="sm" icon={ExternalLink} onClick={handleManage}>
                  {t('petsitterSub.manage')}
                </Button>
              </div>
            )}
          </Card>
        )}

        {needsPayment && (
          <Card padding="lg" className="border-2 border-blue-500 relative">
            <span className="absolute -top-3 left-4 px-3 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Pet-Sitter VIP
            </span>
            <h3 className="text-lg font-bold text-slate-900">{PETSITTER_VIP_PLAN.name}</h3>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')} €
              <span className="text-sm font-normal text-slate-500">{PETSITTER_VIP_PLAN.intervalLabel}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">{PETSITTER_VIP_PLAN.description}</p>
            <ul className="mt-4 space-y-2">
              {[
                'Accès complet à l\'espace pet-sitter',
                'Réception des missions d\'urgence',
                'Profil vérifié visible par les propriétaires',
                'Gestion des disponibilités',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-blue-500" />{f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-6"
              variant="blue"
              icon={loading ? Loader2 : CreditCard}
              disabled={loading || !stripeReady || paymentsBlocked}
              onClick={handleSubscribe}
            >
              {loading
                ? t('ownerSub.redirecting')
                : paymentsBlocked
                  ? t('ownerSub.paymentsSuspended')
                  : t('petsitterSub.becomeCta', { price: vipPriceLabel })}
            </Button>
          </Card>
        )}

        <Card>
          <CardHeader title={t('petsitterSub.history')} subtitle="Factures VIP pet-sitter" />
          {invoices.filter(i => i.plan === 'petsitter_vip').length === 0 ? (
            <EmptyState icon={Receipt} title={t('petsitterSub.noPayments')} description="Vos factures apparaîtront ici après votre abonnement VIP." />
          ) : (
            <div className="space-y-2">
              {invoices.filter(i => i.plan === 'petsitter_vip').map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{inv.amount.toFixed(2).replace('.', ',')} € — VIP</p>
                      <p className="text-xs text-slate-500">{formatDate(inv.date)}</p>
                    </div>
                  </div>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                    {inv.status === 'paid' ? t('petsitterSub.paid') : inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
