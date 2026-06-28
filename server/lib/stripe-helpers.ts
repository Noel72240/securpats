import type Stripe from 'stripe'

/** Stripe API 2025+ : current_period_end est sur le premier subscription item. */
export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number {
  const itemEnd = subscription.items?.data?.[0]?.current_period_end
  if (itemEnd) return itemEnd
  return subscription.billing_cycle_anchor
}

export function getInvoiceSubscriptionDetails(invoice: Stripe.Invoice) {
  return invoice.parent?.subscription_details ?? null
}

export function getInvoiceUserId(invoice: Stripe.Invoice): string | undefined {
  const details = getInvoiceSubscriptionDetails(invoice)
  return details?.metadata?.userId || invoice.metadata?.userId
}

export function getInvoicePlanMetadata(invoice: Stripe.Invoice): Stripe.Metadata | null | undefined {
  const details = getInvoiceSubscriptionDetails(invoice)
  return details?.metadata || invoice.metadata
}
