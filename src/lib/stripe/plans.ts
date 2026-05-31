import { PLAN_PRICES } from '@/types'

export type OwnerSubscriptionPlan = 'monthly' | 'yearly'

export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly' as const,
    name: 'Mensuel',
    price: PLAN_PRICES.monthly,
    priceCents: 499,
    currency: 'eur',
    interval: 'month' as const,
    intervalLabel: '/mois',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
    description: '4,99 € débités automatiquement chaque mois',
  },
  yearly: {
    id: 'yearly' as const,
    name: 'Annuel',
    price: PLAN_PRICES.yearly,
    priceCents: 4999,
    currency: 'eur',
    interval: 'year' as const,
    intervalLabel: '/an',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
    description: '49,99 € débités automatiquement chaque année',
    savings: PLAN_PRICES.monthly * 12 - PLAN_PRICES.yearly,
  },
} satisfies Record<OwnerSubscriptionPlan, {
  id: OwnerSubscriptionPlan
  name: string
  price: number
  priceCents: number
  currency: string
  interval: 'month' | 'year'
  intervalLabel: string
  stripePriceId: string
  description: string
  savings?: number
}>

export function getPlanConfig(plan: OwnerSubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan]
}
