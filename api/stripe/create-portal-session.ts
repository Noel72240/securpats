import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripePostForm } from '../lib/stripe-api.js'

type PortalSessionResponse = { url: string | null }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { customerId, returnUrl } = req.body

  if (!customerId) {
    return res.status(400).json({ error: 'customerId requis' })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')

  try {
    const session = await stripePostForm<PortalSessionResponse>('/billing_portal/sessions', {
      customer: customerId,
      return_url: returnUrl || `${appUrl}/app/abonnement`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    return res.status(500).json({ error: message })
  }
}
