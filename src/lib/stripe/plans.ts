import type { SubscriptionPlan } from '@/types'
import { PLAN_PRICES } from '@/types'

export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly' as const,
    name: 'Mensuel',
    price: PLAN_PRICES.monthly,
    priceCents: 399,
    currency: 'eur',
    interval: 'month' as const,
    intervalLabel: '/mois',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
    description: '3,99 € débités automatiquement chaque mois',
  },
  yearly: {
    id: 'yearly' as const,
    name: 'Annuel',
    price: PLAN_PRICES.yearly,
    priceCents: 4788,
    currency: 'eur',
    interval: 'year' as const,
    intervalLabel: '/an',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
    description: '47,88 € débités automatiquement chaque année',
    savings: PLAN_PRICES.monthly * 12 - PLAN_PRICES.yearly,
  },
} satisfies Record<SubscriptionPlan, {
  id: SubscriptionPlan
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

export function getPlanConfig(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan]
}
