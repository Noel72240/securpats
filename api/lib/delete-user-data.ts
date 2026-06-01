import type { SupabaseClient } from '@supabase/supabase-js'

/** Supprime toutes les données liées à un utilisateur puis le compte Auth. */
export async function deleteUserData(admin: SupabaseClient, userId: string) {
  await admin.from('activities').delete().eq('owner_id', userId)
  await admin.from('documents').delete().eq('owner_id', userId)
  await admin.from('referents').delete().eq('owner_id', userId)
  await admin.from('pets').delete().eq('owner_id', userId)
  await admin.from('invoices').delete().eq('owner_id', userId)
  await admin.from('subscriptions').delete().eq('owner_id', userId)
  await admin.from('missions').delete().eq('owner_id', userId)
  await admin.from('missions').update({ petsitter_id: null }).eq('petsitter_id', userId)
  await admin.from('petsitter_profiles').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
}
