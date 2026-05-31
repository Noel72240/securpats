import { createClient } from '@supabase/supabase-js'

export async function verifyRequestUser(
  authHeader: string | undefined,
  expectedUserId: string,
  expectedEmail: string
): Promise<{ valid: true; userId: string } | { valid: false; error: string }> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return { valid: false, error: 'Authentification serveur non configurée (Supabase requis pour les paiements)' }
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Token d\'authentification manquant' }
  }

  const token = authHeader.slice(7)
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return { valid: false, error: 'Session invalide ou expirée' }
  }

  if (user.id !== expectedUserId) {
    return { valid: false, error: 'Identifiant utilisateur non autorisé' }
  }

  if (user.email?.toLowerCase() !== expectedEmail.toLowerCase()) {
    return { valid: false, error: 'Email non autorisé' }
  }

  return { valid: true, userId: user.id }
}
