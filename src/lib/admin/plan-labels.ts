import type { SubscriptionPlan } from '@/types'

export function subscriptionPlanLabel(plan: SubscriptionPlan): string {
  if (plan === 'petsitter_vip') return 'Pet-Sitter VIP'
  if (plan === 'yearly') return 'Propriétaire annuel'
  return 'Propriétaire mensuel'
}

export function subscriptionPlanVariant(plan: SubscriptionPlan): 'info' | 'success' | 'default' {
  if (plan === 'petsitter_vip') return 'info'
  if (plan === 'yearly') return 'success'
  return 'default'
}

export function userRoleLabel(role: string): string {
  if (role === 'petsitter') return 'Pet-sitter'
  if (role === 'admin') return 'Admin'
  if (role === 'foster_family') return 'Famille d’accueil'
  if (role === 'volunteer') return 'Bénévole'
  return 'Propriétaire'
}
