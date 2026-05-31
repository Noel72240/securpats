import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSubscriptionPeriodEnd } from '../lib/stripe-helpers.js'
import { stripeGet } from '../lib/stripe-api.js'
import { upsertOwnerSubscription, PLAN_PRICES } from '../lib/supabase-admin.js'

type Plan = keyof typeof PLAN_PRICES

function planFromMetadata(plan?: string): Plan {
  if (plan === 'yearly') return 'yearly'
  if (plan === 'petsitter_vip') return 'petsitter_vip'
  return 'monthly'
}

function renewalDaysForPlan(plan: Plan): number {
  return plan === 'yearly' ? 365 : 30
}

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

    const plan = planFromMetadata(session.metadata?.plan)
    const userId = session.metadata?.userId || ''
    const subscription = typeof session.subscription === 'object' ? session.subscription : null

    const renewalDate = subscription
      ? new Date(getSubscriptionPeriodEnd(subscription as Parameters<typeof getSubscriptionPeriodEnd>[0]) * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + renewalDaysForPlan(plan) * 86400000).toISOString().split('T')[0]

    const startDate = new Date().toISOString().split('T')[0]

    if (userId) {
      await upsertOwnerSubscription({
        ownerId: userId,
        plan,
        status: 'active',
        startDate,
        renewalDate,
        autoRenew: subscription?.cancel_at_period_end !== true,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
        stripeSubscriptionId: typeof session.subscription === 'string'
          ? session.subscription
          : subscription?.id ?? null,
      })
    }

    return res.status(200).json({
      userId,
      plan,
      status: 'active',
      price: PLAN_PRICES[plan],
      startDate,
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
