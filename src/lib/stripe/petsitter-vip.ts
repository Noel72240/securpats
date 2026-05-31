import { PLAN_PRICES } from '@/types'

export const PETSITTER_VIP_PLAN = {
  id: 'petsitter_vip' as const,
  name: 'Pet-Sitter VIP',
  price: PLAN_PRICES.petsitter_vip,
  priceCents: 990,
  currency: 'eur',
  interval: 'month' as const,
  intervalLabel: '/mois',
  stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PETSITTER_VIP || '',
  description: '9,90 € débités automatiquement chaque mois — statut VIP vérifié',
}

export function isPetsitterVipStripeConfigured() {
  return Boolean(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
    PETSITTER_VIP_PLAN.stripePriceId,
  )
}
