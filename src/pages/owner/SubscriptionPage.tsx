import { useState, useEffect, useRef } from 'react'
import { CreditCard, Check, Star, Receipt, Shield, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { useSearchParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, CardHeader, EmptyState } from '@/components/ui/Card'
import { useApp, useHasActiveSubscription } from '@/contexts/AppContext'
import { SUBSCRIPTION_PLANS, type OwnerSubscriptionPlan } from '@/lib/stripe/plans'
import { createSubscriptionCheckout, openCustomerPortal, isStripeConfigured, reconcileSubscriptionAccess } from '@/lib/stripe/client'
import { arePaymentsBlocked } from '@/lib/maintenance'
import { formatDate } from '@/lib/utils'
import { PETSITTER_VIP_PLAN } from '@/lib/stripe/petsitter-vip'

export default function SubscriptionPage() {
  const { subscription, invoices, currentUser, siteSettings } = useApp()
  const [searchParams] = useSearchParams()
  const canceled = searchParams.get('canceled')
  const [loading, setLoading] = useState<OwnerSubscriptionPlan | null>(null)
  const [error, setError] = useState('')

  const stripeReady = isStripeConfigured()
  const hasAccess = useHasActiveSubscription()
  const paymentsBlocked = arePaymentsBlocked(siteSettings)
  const needsPayment = stripeReady && !hasAccess
  const reconciled = useRef(false)

  useEffect(() => {
    if (!currentUser || hasAccess || reconciled.current) return
    if (!invoices.some(i => i.status === 'paid')) return

    reconciled.current = true
    void reconcileSubscriptionAccess(currentUser.id).then(result => {
      if (result.activated) window.location.reload()
    })
  }, [currentUser, hasAccess, invoices])

  const handleSubscribe = async (plan: OwnerSubscriptionPlan) => {
    if (!currentUser) return
    if (paymentsBlocked) {
      setError('Les paiements sont temporairement suspendus. Réessayez ultérieurement.')
      return
    }
    if (!stripeReady) {
      setError('Stripe n\'est pas encore configuré. Ajoutez les clés dans votre fichier .env et déployez sur Vercel.')
      return
    }
    setLoading(plan)
    setError('')
    const result = await createSubscriptionCheckout(plan, {
      userId: currentUser.id,
      email: currentUser.email,
    })
    if (result.error) {
      setError(result.error)
      setLoading(null)
    }
  }

  const handleManage = async () => {
    if (!subscription?.stripeCustomerId) {
      setError('Aucun compte Stripe associé. Contactez le support.')
      return
    }
    setError('')
    const result = await openCustomerPortal(subscription.stripeCustomerId)
    if (result.error) setError(result.error)
  }

  return (
    <DashboardLayout variant="owner" title="Abonnement">
      <div className="space-y-8 max-w-4xl">
        {paymentsBlocked && needsPayment && (
          <Card className="bg-orange-50 border-orange-200 !p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Paiements temporairement suspendus</p>
              <p className="text-sm text-orange-800 mt-1">
                {siteSettings.maintenance.message || 'Le site est en maintenance. Les abonnements reprendront très bientôt.'}
              </p>
            </div>
          </Card>
        )}

        {needsPayment && (
          <Card className="bg-brand-50 border-brand-200 !p-4">
            <p className="font-semibold text-slate-900">Activez votre abonnement pour accéder à SécurPats</p>
            <p className="text-sm text-slate-600 mt-1">
              Choisissez une formule ci-dessous pour débloquer vos animaux, QR codes, documents et alertes urgence.
            </p>
          </Card>
        )}

        {canceled && (
          <Card className="bg-amber-50 border-amber-200 !p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.</p>
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
                  Les abonnements récurrents (4,99 €/mois ou 49,99 €/an) seront activés une fois Stripe connecté.
                  Consultez le fichier <code className="text-xs bg-slate-200 px-1 rounded">.env.example</code> et le README.
                </p>
              </div>
            </div>
          </Card>
        )}

        {subscription && subscription.ownerId === currentUser?.id && (
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Abonnement {subscription.plan === 'yearly' ? 'annuel' : 'mensuel'} — {subscription.price.toFixed(2).replace('.', ',')} €
                </h3>
                <p className="text-sm text-slate-600 mt-1">Actif depuis le {formatDate(subscription.startDate)}</p>
                <p className="text-sm text-slate-600">
                  Prochain renouvellement : {formatDate(subscription.renewalDate)}
                  {subscription.autoRenew ? ' (automatique via Stripe)' : ' (résiliation programmée)'}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                {subscription.status === 'active' ? 'Actif' : subscription.status}
              </Badge>
            </div>
            {subscription.stripeCustomerId && stripeReady && (
              <div className="mt-4 pt-4 border-t border-brand-200">
                <Button variant="outline" size="sm" icon={ExternalLink} onClick={handleManage}>
                  Gérer / Résilier via Stripe
                </Button>
              </div>
            )}
          </Card>
        )}

        {!subscription && hasAccess && (
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Abonnement actif</h3>
                <p className="text-sm text-slate-600 mt-1">Paiement confirmé via Stripe</p>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {(['monthly', 'yearly'] as const).map(plan => {
            const config = SUBSCRIPTION_PLANS[plan]
            const isCurrent = subscription?.plan === plan && subscription.status === 'active'
            return (
              <Card key={plan} padding="lg" className={plan === 'yearly' ? 'border-2 border-brand-500 relative' : ''}>
                {plan === 'yearly' && (
                  <span className="absolute -top-3 left-4 px-3 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recommandé
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{config.name}</h3>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">
                  {config.price.toFixed(2).replace('.', ',')} €
                  <span className="text-sm font-normal text-slate-500">{config.intervalLabel}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{config.description}</p>
                {plan === 'yearly' && (
                  <p className="text-sm text-brand-600 font-medium mt-2">
                    Économie de {SUBSCRIPTION_PLANS.yearly.savings!.toFixed(2).replace('.', ',')} €/an
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {['Renouvellement automatique', 'Animaux illimités', '5 référents', 'QR Code & documents'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-brand-500" />{f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan === 'yearly' ? 'primary' : 'outline'}
                  icon={loading === plan ? Loader2 : CreditCard}
                  disabled={!!loading || isCurrent || !stripeReady || paymentsBlocked}
                  onClick={() => handleSubscribe(plan)}
                >
                  {loading === plan ? 'Redirection Stripe...' : paymentsBlocked && !isCurrent ? 'Paiements suspendus' : isCurrent ? 'Plan actuel' : `S'abonner — ${config.price.toFixed(2).replace('.', ',')} €${config.intervalLabel}`}
                </Button>
              </Card>
            )
          })}
        </div>

        <Card className="bg-blue-50 border-blue-200 !p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Vous êtes pet-sitter ?</p>
              <p className="text-sm text-slate-600 mt-1">
                L&apos;abonnement propriétaire (4,99 € / 49,99 €) ne concerne pas les pet-sitters.
                L&apos;offre dédiée est <strong>Pet-Sitter VIP à {PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')} €/mois</strong>.
              </p>
            </div>
            <Link to="/tarifs#pet-sitter" className="flex-shrink-0">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Voir l&apos;offre pet-sitter
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader title="Historique des paiements" subtitle="Factures et transactions Stripe" />
          {invoices.length === 0 ? (
            <EmptyState icon={Receipt} title="Aucun paiement" description="Vos factures apparaîtront ici après votre premier abonnement." />
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{inv.amount.toFixed(2).replace('.', ',')} € — {inv.plan === 'yearly' ? 'Annuel' : 'Mensuel'}</p>
                      <p className="text-xs text-slate-500">{formatDate(inv.date)}</p>
                    </div>
                  </div>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status === 'paid' ? 'Payé' : inv.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
