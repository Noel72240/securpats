import type { Invoice, Subscription } from '@/types'
import { isStripeConfigured } from '@/lib/stripe/client'

export function isOwnerSubscriptionActive(
  subscription: Subscription | null | undefined,
  ownerId: string | undefined,
  invoices: Invoice[] = [],
): boolean {
  if (!ownerId) return false
  if (!isStripeConfigured()) return true

  if (subscription?.ownerId === ownerId) {
    if (subscription.status === 'active' || subscription.status === 'trialing') return true
  }

  // Facture payée en base = paiement Stripe confirmé
  return invoices.some(i => i.ownerId === ownerId && i.status === 'paid')
}
