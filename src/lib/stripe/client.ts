/**
 * Stripe Checkout — abonnements récurrents automatiques
 * Mensuel : 4,99 €/mois | Annuel : 49,99 €/an
 *
 * Nécessite les routes API Vercel (/api/stripe/*) et les variables d'environnement.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'
import type { SubscriptionPlan } from '@/types'
import { getPlanConfig } from './plans'
import { getSupabaseSafe } from '@/lib/supabase/client'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const supabase = getSupabaseSafe()
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }
  return headers
}

export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
}

export const isStripeConfigured = () =>
  Boolean(
    stripeConfig.publishableKey &&
    getPlanConfig('monthly').stripePriceId &&
    getPlanConfig('yearly').stripePriceId
  )

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe() {
  if (!stripeConfig.publishableKey) return Promise.resolve(null)
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey)
  }
  return stripePromise
}

export async function createSubscriptionCheckout(
  plan: SubscriptionPlan,
  options: { userId: string; email: string }
): Promise<{ error?: string }> {
  const planConfig = getPlanConfig(plan)

  if (!planConfig.stripePriceId) {
    return { error: 'Price ID Stripe manquant. Configurez VITE_STRIPE_PRICE_MONTHLY et VITE_STRIPE_PRICE_YEARLY.' }
  }

  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        priceId: planConfig.stripePriceId,
        plan,
        userId: options.userId,
        customerEmail: options.email,
        successUrl: `${stripeConfig.appUrl}/app/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${stripeConfig.appUrl}/app/abonnement?canceled=1`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Erreur lors de la création de la session de paiement' }
    }

    if (data.url) {
      window.location.href = data.url
    } else {
      return { error: 'Réponse Stripe invalide' }
    }

    return {}
  } catch {
    return { error: 'Impossible de contacter le serveur de paiement. Vérifiez que les routes API sont déployées.' }
  }
}

export async function reconcileSubscriptionAccess(userId: string): Promise<{ activated?: boolean; error?: string }> {
  try {
    const response = await fetch('/api/stripe/reconcile-subscription', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.error || 'Synchronisation impossible' }
    return { activated: data.activated }
  } catch {
    return { error: 'Impossible de synchroniser l\'abonnement' }
  }
}

export async function openCustomerPortal(customerId: string): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        returnUrl: `${stripeConfig.appUrl}/app/abonnement`,
      }),
    })

    const data = await response.json()
    if (!response.ok) return { error: data.error || 'Erreur portail client' }

    if (data.url) window.location.href = data.url
    return {}
  } catch {
    return { error: 'Impossible d\'ouvrir le portail de gestion Stripe' }
  }
}
