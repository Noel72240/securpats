/** Messages lisibles pour erreurs Supabase courantes à l'inscription pet-sitter */
export function formatPetsitterDbError(message: string): string {
  if (message.includes('id_consent_at') || message.includes('id_consent_version')) {
    return 'Base de données à mettre à jour : exécutez le fichier supabase/scripts/fix-petsitter-inscription.sql dans Supabase (menu SQL Editor), puis réessayez.'
  }
  if (message.includes('petsitter_vip') && message.includes('subscription_plan')) {
    return 'Base de données à mettre à jour : exécutez supabase/scripts/fix-petsitter-inscription.sql dans Supabase (SQL Editor), puis réessayez.'
  }
  return message
}
