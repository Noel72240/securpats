import type { Subscription } from '@/types'
import { isStripeConfigured } from '@/lib/stripe/client'

export function isOwnerSubscriptionActive(
  subscription: Subscription | null | undefined,
  ownerId: string | undefined,
): boolean {
  if (!ownerId) return false
  if (!isStripeConfigured()) return true
  if (!subscription || subscription.ownerId !== ownerId) return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}
