import { getSupabase, isSupabaseConfigured } from './client'
import { profileToUser, userToProfileInsert } from './mappers'
import type { User, UserRole } from '@/types'

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@securpats.fr').toLowerCase()

function resolveRole(email: string): UserRole {
  return email.toLowerCase() === adminEmail ? 'admin' : 'owner'
}

function appOrigin(): string {
  const fromEnv = (import.meta.env.VITE_APP_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://www.securpats.fr'
}

function loginPathForRole(role: UserRole): string {
  if (role === 'petsitter') return '/pet-sitter/connexion'
  if (role === 'foster_family') return '/famille-accueil/connexion'
  if (role === 'volunteer') return '/benevole/connexion'
  if (role === 'admin') return '/admin/connexion'
  return '/connexion'
}

export async function signUp(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  role?: UserRole
  consentAt?: string
  consentVersion?: string
  marketingOptIn?: boolean
}) {
  const role = data.role ?? resolveRole(data.email)

  // Inscription via API admin : compte déjà confirmé (plus d’attente d’email Supabase)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role,
          consentAt: data.consentAt,
          consentVersion: data.consentVersion,
          marketingOptIn: data.marketingOptIn ?? false,
        }),
      })
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string
        fallback?: boolean
        userId?: string
      }

      if (res.ok) {
        const userId = typeof payload.userId === 'string' ? payload.userId : ''
        const signedIn = await signIn(data.email, data.password)
        if (signedIn.user) {
          return { user: signedIn.user, error: null, needsEmailConfirmation: false }
        }
        return {
          user: null,
          error: null,
          needsEmailConfirmation: false,
          readyToLogin: true as const,
          userId: userId || undefined,
        }
      }

      // Pas de service role / API absente → fallback client Supabase
      if (res.status !== 503 && !payload.fallback) {
        return {
          user: null,
          error: payload.error || 'Inscription échouée',
          needsEmailConfirmation: false,
        }
      }
    } catch {
      // Fallback ci-dessous
    }
  }

  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase non configuré', needsEmailConfirmation: false }
  }

  const supabase = getSupabase()
  const emailRedirectTo = `${appOrigin()}${loginPathForRole(role)}?confirmed=1`

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo,
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role,
        consent_accepted_at: data.consentAt,
        consent_version: data.consentVersion,
        marketing_opt_in: data.marketingOptIn ?? false,
      },
    },
  })

  if (authError) return { user: null, error: authError.message, needsEmailConfirmation: false }
  if (!authData.user) return { user: null, error: 'Inscription échouée', needsEmailConfirmation: false }

  if (!authData.session) {
    return { user: null, error: null, needsEmailConfirmation: true }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profile) {
    return { user: profileToUser(profile), error: null, needsEmailConfirmation: false }
  }

  const { error: upsertError } = await supabase.from('profiles').upsert(
    userToProfileInsert({
      id: authData.user.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role,
      consentAcceptedAt: data.consentAt,
      consentVersion: data.consentVersion,
      marketingOptIn: data.marketingOptIn,
    })
  )

  if (upsertError) {
    return {
      user: null,
      error: upsertError.message.includes('row-level security')
        ? 'Profil non créé. Exécutez supabase/migrations/005_fix_signup_trigger.sql dans Supabase SQL Editor.'
        : profileError?.message || upsertError.message || 'Profil introuvable après inscription',
      needsEmailConfirmation: false,
    }
  }

  const { data: profileAfterUpsert } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (!profileAfterUpsert) {
    return { user: null, error: 'Profil introuvable après inscription', needsEmailConfirmation: false }
  }

  return { user: profileToUser(profileAfterUpsert), error: null, needsEmailConfirmation: false }
}

/** Renvoie l’email de confirmation Supabase Auth. */
export async function resendSignupConfirmation(
  email: string,
  loginPath = '/connexion',
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase non configuré' }
  const trimmed = email.trim()
  if (!trimmed) return { error: 'Email manquant' }

  const { error } = await getSupabase().auth.resend({
    type: 'signup',
    email: trimmed,
    options: {
      emailRedirectTo: `${appOrigin()}${loginPath}?confirmed=1`,
    },
  })
  if (error) return { error: error.message }
  return { error: null }
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  if (!data.user) return { user: null, error: 'Connexion échouée' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) return { user: null, error: profileError?.message || 'Profil introuvable' }

  return { user: profileToUser(profile), error: null }
}

export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  return { error: error?.message ?? null }
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return { user: null, error: null }

  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { user: null, error: null }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) return { user: null, error: error?.message ?? 'Profil introuvable' }

  return { user: profileToUser(profile), error: null }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured()) return () => {}

  const supabase = getSupabase()
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    // Ne pas utiliser async ici : deadlock avec getSession() (doc Supabase)
    setTimeout(async () => {
      if (!session?.user) {
        callback(null)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      callback(profile ? profileToUser(profile) : null)
    }, 0)
  })

  return () => subscription.unsubscribe()
}

export async function fetchProfile(userId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) return { user: null, error: error?.message ?? 'Profil introuvable' }
  return { user: profileToUser(data), error: null }
}

export async function fetchAllProfiles() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) return { users: [], error: error.message }
  return { users: data.map(profileToUser), error: null }
}
