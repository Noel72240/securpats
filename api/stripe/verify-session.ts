import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSubscriptionPeriodEnd } from '../lib/stripe-helpers.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

const PLAN_PRICES = { monthly: 4.99, yearly: 49.99 } as const

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { sessionId } = req.body
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requis' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Paiement non confirmé' })
    }

    const plan = (session.metadata?.plan || 'monthly') as 'monthly' | 'yearly'
    const userId = session.metadata?.userId || ''
    const subscription = session.subscription as Stripe.Subscription | null

    const renewalDate = subscription
      ? new Date(getSubscriptionPeriodEnd(subscription) * 1000).toISOString().split('T')[0]
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
      stripeSubscriptionId: typeof subscription === 'string'
        ? subscription
        : subscription?.id ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur vérification session'
    return res.status(500).json({ error: message })
  }
}
