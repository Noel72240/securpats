import type { SupabaseClient } from '@supabase/supabase-js'
import { stripeCancelSubscription } from './stripe-api.js'

/** Résilie les abonnements Stripe liés à l’utilisateur (immédiat), sans bloquer la suppression locale. */
async function cancelStripeSubscriptionsForUser(admin: SupabaseClient, userId: string) {
  const { data: subs, error } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('owner_id', userId)

  if (error) {
    console.warn('[deleteUserData] lecture subscriptions:', error.message)
    return
  }

  const ids = [...new Set(
    (subs || [])
      .map(s => (typeof s.stripe_subscription_id === 'string' ? s.stripe_subscription_id.trim() : ''))
      .filter(Boolean),
  )]

  if (ids.length === 0) return

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    console.warn('[deleteUserData] STRIPE_SECRET_KEY absente — abonnements Stripe non résiliés:', ids)
    return
  }

  for (const subscriptionId of ids) {
    try {
      await stripeCancelSubscription(subscriptionId)
      console.info('[deleteUserData] Stripe subscription cancelled:', subscriptionId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Déjà annulé / introuvable → OK
      if (/No such subscription|resource_missing|already been canceled|canceled/i.test(message)) {
        console.info('[deleteUserData] Stripe déjà résilié ou absent:', subscriptionId)
        continue
      }
      console.error('[deleteUserData] échec résiliation Stripe', subscriptionId, message)
    }
  }
}

/** Supprime toutes les données liées à un utilisateur puis le compte Auth. */
export async function deleteUserData(admin: SupabaseClient, userId: string) {
  // 1) Résilier Stripe avant d’effacer les lignes locales
  await cancelStripeSubscriptionsForUser(admin, userId)

  // 2) Ordre : dépendances puis profil puis Auth
  const steps: Array<{ table: string; column: string }> = [
    { table: 'activities', column: 'owner_id' },
    { table: 'documents', column: 'owner_id' },
    { table: 'referents', column: 'owner_id' },
    { table: 'pets', column: 'owner_id' },
    { table: 'invoices', column: 'owner_id' },
    { table: 'subscriptions', column: 'owner_id' },
    { table: 'missions', column: 'owner_id' },
    { table: 'advance_directives', column: 'owner_id' },
    { table: 'emergency_alerts', column: 'owner_id' },
    { table: 'support_conversations', column: 'client_id' },
    { table: 'petsitter_profiles', column: 'user_id' },
    { table: 'caregiver_profiles', column: 'user_id' },
  ]

  for (const step of steps) {
    const { error } = await admin.from(step.table).delete().eq(step.column, userId)
    // Table absente / pas encore migrée → on continue
    if (error && !/does not exist|Could not find the table/i.test(error.message)) {
      console.warn(`[deleteUserData] ${step.table}:`, error.message)
    }
  }

  // Missions où l’utilisateur était pet-sitter
  await admin.from('missions').update({ petsitter_id: null }).eq('petsitter_id', userId)

  const { error: profileErr } = await admin.from('profiles').delete().eq('id', userId)
  if (profileErr) throw new Error(profileErr.message)

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
}
