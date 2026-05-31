import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSubscriptionPeriodEnd } from '../lib/stripe-helpers.js'
import { stripeGet } from '../lib/stripe-api.js'

const PLAN_PRICES = { monthly: 4.99, yearly: 49.99 } as const

type StripeSubscription = {
  id: string
  cancel_at_period_end: boolean
  start_date: number
  current_period_end?: number
  items?: { data?: Array<{ current_period_end?: number }> }
}

type CheckoutSessionResponse = {
  payment_status: string
  status: string | null
  metadata?: { plan?: string; userId?: string }
  customer: string | { id?: string } | null
  subscription: string | StripeSubscription | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { sessionId } = req.body
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requis' })
  }

  try {
    const session = await stripeGet<CheckoutSessionResponse>(`/checkout/sessions/${sessionId}`, {
      'expand[0]': 'subscription',
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Paiement non confirmé' })
    }

    const plan = (session.metadata?.plan || 'monthly') as 'monthly' | 'yearly'
    const userId = session.metadata?.userId || ''
    const subscription = typeof session.subscription === 'object' ? session.subscription : null

    const renewalDate = subscription
      ? new Date(getSubscriptionPeriodEnd(subscription as Parameters<typeof getSubscriptionPeriodEnd>[0]) * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 86400000).toISOString().split('T')[0]

    return res.status(200).json({
      userId,
      plan,
      status: 'active',
      price: PLAN_PRICES[plan],
      startDate: new Date().toISOString().split('T')[0],
      renewalDate,
      autoRenew: subscription?.cancel_at_period_end === false,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripeSubscriptionId: typeof session.subscription === 'string'
        ? session.subscription
        : subscription?.id ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur vérification session'
    return res.status(500).json({ error: message })
  }
}
