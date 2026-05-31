import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { customerId, returnUrl } = req.body

  if (!customerId) {
    return res.status(400).json({ error: 'customerId requis' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.VITE_APP_URL}/app/abonnement`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    return res.status(500).json({ error: message })
  }
}
