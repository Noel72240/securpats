import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/plans'
import type { SubscriptionPlan } from '@/types'

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { syncSubscriptionFromStripe, currentUser } = useApp()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [plan, setPlan] = useState<SubscriptionPlan>('monthly')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMsg('Session de paiement introuvable.')
      return
    }

    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error')
          setErrorMsg(data.error)
          return
        }
        setPlan(data.plan)
        syncSubscriptionFromStripe({
          plan: data.plan,
          status: data.status,
          price: data.price,
          startDate: data.startDate,
          renewalDate: data.renewalDate,
          autoRenew: data.autoRenew,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          ownerId: data.userId || currentUser?.id,
        })
        setStatus('success')
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Impossible de vérifier le paiement. Contactez le support si vous avez été débité.')
      })
  }, [sessionId, syncSubscriptionFromStripe, currentUser?.id])

  const planConfig = SUBSCRIPTION_PLANS[plan]

  return (
    <DashboardLayout variant="owner" title="Abonnement activé">
      <div className="max-w-lg mx-auto">
        <Card padding="lg" className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-brand-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmation du paiement...</h2>
              <p className="text-slate-600 text-sm">Vérification de votre abonnement Stripe en cours.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Abonnement activé !</h2>
              <p className="text-slate-600 mb-4">
                Votre formule <strong>{planConfig.name}</strong> ({planConfig.price.toFixed(2).replace('.', ',')} €{planConfig.intervalLabel}) est active.
                Le renouvellement est <strong>automatique</strong>.
              </p>
              <Link to="/app">
                <Button icon={ArrowRight}>Accéder à mon espace</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur de confirmation</h2>
              <p className="text-slate-600 mb-4 text-sm">{errorMsg}</p>
              <Link to="/app/abonnement">
                <Button variant="outline">Retour aux abonnements</Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
