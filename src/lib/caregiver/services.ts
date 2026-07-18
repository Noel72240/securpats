import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Tables, TablesUpdate } from '@/lib/supabase/database.types'
import type { CaregiverKind, CaregiverProfile } from '@/types'

function fromRow(row: Tables<'caregiver_profiles'>): CaregiverProfile {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    photo: row.photo ?? undefined,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
    address: row.address,
    departmentCode: row.department_code ?? undefined,
    availableDays: row.available_days,
    availableHours: row.available_hours,
    serviceArea: row.service_area,
    verified: row.verified,
  }
}

export async function fetchCaregiverProfile(userId: string) {
  if (!isSupabaseConfigured()) return { profile: null as CaregiverProfile | null, error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('caregiver_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return { profile: null as CaregiverProfile | null, error: error.message }
  return { profile: data ? fromRow(data) : null, error: null }
}

export async function upsertCaregiverProfile(
  userId: string,
  kind: CaregiverKind,
  profile: Partial<CaregiverProfile>,
) {
  const { data, error } = await getSupabase().from('caregiver_profiles').upsert({
    user_id: userId,
    kind,
    photo: profile.photo ?? null,
    bio: profile.bio ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
    department_code: profile.departmentCode ?? null,
    available_days: profile.availableDays ?? [],
    available_hours: profile.availableHours ?? '',
    service_area: profile.serviceArea ?? '',
    verified: profile.verified ?? false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select().single()

  if (error) return { profile: null as CaregiverProfile | null, error: error.message }
  return { profile: fromRow(data), error: null }
}

export async function patchCaregiverProfile(userId: string, profile: Partial<CaregiverProfile>) {
  const patch: TablesUpdate<'caregiver_profiles'> = { updated_at: new Date().toISOString() }
  if (profile.photo !== undefined) patch.photo = profile.photo ?? null
  if (profile.bio !== undefined) patch.bio = profile.bio
  if (profile.phone !== undefined) patch.phone = profile.phone
  if (profile.email !== undefined) patch.email = profile.email
  if (profile.address !== undefined) patch.address = profile.address
  if (profile.departmentCode !== undefined) patch.department_code = profile.departmentCode || null
  if (profile.availableDays !== undefined) patch.available_days = profile.availableDays
  if (profile.availableHours !== undefined) patch.available_hours = profile.availableHours
  if (profile.serviceArea !== undefined) patch.service_area = profile.serviceArea
  if (profile.verified !== undefined) patch.verified = profile.verified

  const { data, error } = await getSupabase()
    .from('caregiver_profiles')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .maybeSingle()

  if (error) return { profile: null as CaregiverProfile | null, error: error.message }
  if (!data) return fetchCaregiverProfile(userId)
  return { profile: fromRow(data), error: null }
}
