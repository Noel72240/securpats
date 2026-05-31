import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../lib/verify-auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { priceId, plan, userId, customerEmail, successUrl, cancelUrl } = req.body

  if (!priceId || !plan || !userId || !customerEmail) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  const auth = await verifyRequestUser(req.headers.authorization, userId, customerEmail)
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.VITE_APP_URL}/app/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.VITE_APP_URL}/app/abonnement?canceled=1`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    return res.status(500).json({ error: message })
  }
}
