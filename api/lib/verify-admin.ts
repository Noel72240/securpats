import { createClient } from '@supabase/supabase-js'

export async function verifyAdmin(
  authHeader: string | undefined,
): Promise<{ valid: true; userId: string } | { valid: false; error: string }> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return { valid: false, error: 'Authentification serveur non configurée' }
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

  const adminEmail = (process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@securpats.fr').toLowerCase()
  if (user.email?.toLowerCase() === adminEmail) {
    return { valid: true, userId: user.id }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'admin') {
    return { valid: true, userId: user.id }
  }

  return { valid: false, error: 'Accès administrateur requis' }
}
