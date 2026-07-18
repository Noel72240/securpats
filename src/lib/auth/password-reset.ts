import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/seo/constants'

/** URL de retour après clic dans l’email. */
function passwordResetRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    // Respecte le domaine réel (www ou non) pour coller aux Redirect URLs Supabase
    if (
      host === 'securpats.fr' ||
      host === 'www.securpats.fr' ||
      host.endsWith('.vercel.app')
    ) {
      return `${window.location.origin}/reinitialiser-mot-de-passe`
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.origin}/reinitialiser-mot-de-passe`
    }
  }
  return `${SITE_URL}/reinitialiser-mot-de-passe`
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase non configuré'
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return 'Email requis'

  const redirectTo = passwordResetRedirectUrl()
  const { error } = await getSupabase().auth.resetPasswordForEmail(trimmed, { redirectTo })
  if (error) {
    const msg = error.message || ''
    if (/rate limit/i.test(msg)) {
      return 'Trop de demandes d’email (limite Supabase). Attendez ~1 h, ou demandez à l’admin de générer un mot de passe temporaire (Utilisateurs → Mot de passe).'
    }
    return msg
  }
  return null
}

export async function updatePasswordWithRecovery(newPassword: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase non configuré'
  if (newPassword.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'

  const { error } = await getSupabase().auth.updateUser({ password: newPassword })
  if (error) return error.message
  return null
}

/** Change le mot de passe de la session courante et lève le flag must_change_password. */
export async function changeOwnPassword(newPassword: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase non configuré'
  if (newPassword.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'

  const supabase = getSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return 'Session expirée — reconnectez-vous puis réessayez.'

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    const msg = error.message || ''
    if (/recent|reauth|session/i.test(msg)) {
      return 'Pour changer le mot de passe, déconnectez-vous puis reconnectez-vous, et réessayez aussitôt.'
    }
    return msg
  }

  // Best-effort : ne pas faire échouer le changement si la colonne n’existe pas encore
  const { error: flagErr } = await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)

  if (flagErr) {
    const m = flagErr.message || ''
    if (
      m.includes('must_change_password') ||
      flagErr.code === 'PGRST204' ||
      flagErr.code === '42703'
    ) {
      return null
    }
    // Mot de passe déjà changé ; on ignore l’échec du flag
    console.warn('[changeOwnPassword] flag:', flagErr.message)
  }
  return null
}

export async function adminResetUserPassword(
  targetUserId: string,
  password?: string,
): Promise<{
  error: string | null
  email?: string
  temporaryPassword?: string
  name?: string
  role?: string
}> {
  const { getSupabase } = await import('@/lib/supabase/client')
  const { data: { session } } = await getSupabase().auth.getSession()
  if (!session?.access_token) return { error: 'Session expirée, reconnectez-vous' }

  const response = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      targetUserId,
      ...(password ? { password } : {}),
    }),
  })

  const body = await response.json().catch(() => ({})) as {
    error?: string
    email?: string
    temporaryPassword?: string
    name?: string
    role?: string
  }

  if (!response.ok) return { error: body.error || 'Réinitialisation échouée' }
  return {
    error: null,
    email: body.email,
    temporaryPassword: body.temporaryPassword,
    name: body.name,
    role: body.role,
  }
}
