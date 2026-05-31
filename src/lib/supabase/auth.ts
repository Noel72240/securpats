import { getSupabase, isSupabaseConfigured } from './client'
import { profileToUser, userToProfileInsert } from './mappers'
import type { User, UserRole } from '@/types'

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@securpats.fr').toLowerCase()

function resolveRole(email: string): UserRole {
  return email.toLowerCase() === adminEmail ? 'admin' : 'owner'
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
  const supabase = getSupabase()
  const role = data.role ?? resolveRole(data.email)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
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

  // Confirmation email activée → pas de session : le trigger DB crée déjà le profil
  if (!authData.session) {
    return { user: null, error: null, needsEmailConfirmation: true }
  }

  // Session active : lire le profil créé par le trigger
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profile) {
    return { user: profileToUser(profile), error: null, needsEmailConfirmation: false }
  }

  // Secours uniquement avec session (sinon RLS bloque l'insert)
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
