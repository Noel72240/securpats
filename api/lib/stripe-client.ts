import Stripe from 'stripe'

/** Client Stripe compatible Vercel (fetch HTTP au lieu du client Node par défaut). */
export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY non configurée')
  }
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}
