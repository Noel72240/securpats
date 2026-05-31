import type { Invoice, Subscription } from '@/types'
import { isStripeConfigured } from '@/lib/stripe/client'
import { isPetsitterVipStripeConfigured } from '@/lib/stripe/petsitter-vip'

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

export function isPetsitterVipActive(
  subscription: Subscription | null | undefined,
  userId: string | undefined,
  invoices: Invoice[] = [],
): boolean {
  if (!userId) return false
  if (!isPetsitterVipStripeConfigured()) return true

  if (subscription?.ownerId === userId && subscription.plan === 'petsitter_vip') {
    if (subscription.status === 'active' || subscription.status === 'trialing') return true
  }

  return invoices.some(i => i.ownerId === userId && i.status === 'paid' && i.plan === 'petsitter_vip')
}
