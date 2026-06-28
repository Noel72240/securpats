import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import { stripePostForm } from '../../server/lib/stripe-api.js'
import { arePaymentsBlockedOnServer } from '../../server/lib/site-settings.js'

type CheckoutSessionResponse = {
  id: string
  url: string | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
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

  if (await arePaymentsBlockedOnServer()) {
    return res.status(503).json({
      error: 'Les paiements sont temporairement suspendus (maintenance). Réessayez ultérieurement.',
    })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')

  try {
    const session = await stripePostForm<CheckoutSessionResponse>('/checkout/sessions', {
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      customer_email: customerEmail,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl || `${appUrl}/app/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${appUrl}/app/abonnement?canceled=1`,
      'metadata[userId]': userId,
      'metadata[plan]': plan,
      'subscription_data[metadata][userId]': userId,
      'subscription_data[metadata][plan]': plan,
      allow_promotion_codes: 'true',
      billing_address_collection: 'auto',
    })

    return res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    console.error('[Stripe checkout]', message)
    return res.status(500).json({ error: message })
  }
}
