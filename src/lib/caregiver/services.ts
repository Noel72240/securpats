import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Tables, TablesUpdate, Json } from '@/lib/supabase/database.types'
import type { CaregiverKind, CaregiverProfile } from '@/types'
import { emptyQuestionnaire, type CaregiverQuestionnaire } from '@/lib/caregiver/form'

function parseQuestionnaire(raw: unknown): CaregiverQuestionnaire {
  const base = emptyQuestionnaire()
  if (!raw || typeof raw !== 'object') return base
  return { ...base, ...(raw as Partial<CaregiverQuestionnaire>) }
}

function fromRow(row: Tables<'caregiver_profiles'>): CaregiverProfile {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as CaregiverKind,
    photo: row.photo ?? undefined,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
    address: row.address,
    departmentCode: row.department_code ?? undefined,
    birthDate: row.birth_date ?? undefined,
    postalCode: row.postal_code ?? '',
    city: row.city ?? '',
    engagementTypes: row.engagement_types ?? [],
    interventionRadiusKm: row.intervention_radius_km ?? undefined,
    canTravel: row.can_travel ?? null,
    hasVehicle: row.has_vehicle ?? null,
    questionnaire: parseQuestionnaire(row.questionnaire),
    idDocument: row.id_document_path ?? undefined,
    proofOfAddress: row.proof_of_address_path ?? undefined,
    criminalRecord: row.criminal_record_path ?? undefined,
    insurance: row.insurance_path ?? undefined,
    housingPhotos: row.housing_photo_paths ?? [],
    outdoorPhotos: row.outdoor_photo_paths ?? [],
    ownAnimalsPhotos: row.own_animals_photo_paths ?? [],
    aboutMe: row.about_me ?? '',
    motivation: row.motivation ?? '',
    importantNotes: row.important_notes ?? '',
    infoAccuracyAt: row.info_accuracy_at ?? undefined,
    charterAcceptedAt: row.charter_accepted_at ?? undefined,
    contactAuthorizedAt: row.contact_authorized_at ?? undefined,
    confidentialityAcceptedAt: row.confidentiality_accepted_at ?? undefined,
    availableDays: row.available_days,
    availableHours: row.available_hours,
    serviceArea: row.service_area,
    verified: row.verified,
    verifiedAt: row.verified_at ?? undefined,
    verificationNotes: row.verification_notes ?? '',
  }
}

function toUpsertPayload(userId: string, kind: CaregiverKind, profile: Partial<CaregiverProfile>) {
  return {
    user_id: userId,
    kind,
    photo: profile.photo ?? null,
    bio: profile.bio ?? profile.aboutMe ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
    department_code: profile.departmentCode ?? null,
    birth_date: profile.birthDate || null,
    postal_code: profile.postalCode ?? '',
    city: profile.city ?? '',
    engagement_types: profile.engagementTypes ?? [],
    intervention_radius_km: profile.interventionRadiusKm ?? null,
    can_travel: profile.canTravel ?? null,
    has_vehicle: profile.hasVehicle ?? null,
    questionnaire: (profile.questionnaire ?? emptyQuestionnaire()) as unknown as Json,
    id_document_path: profile.idDocument ?? null,
    proof_of_address_path: profile.proofOfAddress ?? null,
    criminal_record_path: profile.criminalRecord ?? null,
    insurance_path: profile.insurance ?? null,
    housing_photo_paths: profile.housingPhotos ?? [],
    outdoor_photo_paths: profile.outdoorPhotos ?? [],
    own_animals_photo_paths: profile.ownAnimalsPhotos ?? [],
    about_me: profile.aboutMe ?? '',
    motivation: profile.motivation ?? '',
    important_notes: profile.importantNotes ?? '',
    info_accuracy_at: profile.infoAccuracyAt ?? null,
    charter_accepted_at: profile.charterAcceptedAt ?? null,
    contact_authorized_at: profile.contactAuthorizedAt ?? null,
    confidentiality_accepted_at: profile.confidentialityAcceptedAt ?? null,
    available_days: profile.availableDays ?? profile.questionnaire?.availabilityTypes ?? [],
    available_hours: profile.availableHours ?? '',
    service_area: profile.serviceArea ?? '',
    verified: profile.verified ?? false,
    verification_notes: profile.verificationNotes ?? '',
    updated_at: new Date().toISOString(),
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

/** Liste complète — RLS : admin uniquement (ou son propre profil). */
export async function fetchAllCaregiverProfiles() {
  if (!isSupabaseConfigured()) return { profiles: [] as CaregiverProfile[], error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('caregiver_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { profiles: [] as CaregiverProfile[], error: error.message }
  return { profiles: (data || []).map(fromRow), error: null }
}

export async function setCaregiverVerified(userId: string, verified: boolean) {
  return patchCaregiverProfile(userId, { verified })
}

export async function upsertCaregiverProfile(
  userId: string,
  kind: CaregiverKind,
  profile: Partial<CaregiverProfile>,
) {
  const { data, error } = await getSupabase()
    .from('caregiver_profiles')
    .upsert(toUpsertPayload(userId, kind, profile), { onConflict: 'user_id' })
    .select()
    .single()

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
  if (profile.birthDate !== undefined) patch.birth_date = profile.birthDate || null
  if (profile.postalCode !== undefined) patch.postal_code = profile.postalCode
  if (profile.city !== undefined) patch.city = profile.city
  if (profile.engagementTypes !== undefined) patch.engagement_types = profile.engagementTypes
  if (profile.kind !== undefined) patch.kind = profile.kind
  if (profile.interventionRadiusKm !== undefined) patch.intervention_radius_km = profile.interventionRadiusKm ?? null
  if (profile.canTravel !== undefined) patch.can_travel = profile.canTravel
  if (profile.hasVehicle !== undefined) patch.has_vehicle = profile.hasVehicle
  if (profile.questionnaire !== undefined) patch.questionnaire = profile.questionnaire as unknown as Json
  if (profile.idDocument !== undefined) patch.id_document_path = profile.idDocument ?? null
  if (profile.proofOfAddress !== undefined) patch.proof_of_address_path = profile.proofOfAddress ?? null
  if (profile.criminalRecord !== undefined) patch.criminal_record_path = profile.criminalRecord ?? null
  if (profile.insurance !== undefined) patch.insurance_path = profile.insurance ?? null
  if (profile.housingPhotos !== undefined) patch.housing_photo_paths = profile.housingPhotos
  if (profile.outdoorPhotos !== undefined) patch.outdoor_photo_paths = profile.outdoorPhotos
  if (profile.ownAnimalsPhotos !== undefined) patch.own_animals_photo_paths = profile.ownAnimalsPhotos
  if (profile.aboutMe !== undefined) patch.about_me = profile.aboutMe
  if (profile.motivation !== undefined) patch.motivation = profile.motivation
  if (profile.importantNotes !== undefined) patch.important_notes = profile.importantNotes
  if (profile.infoAccuracyAt !== undefined) patch.info_accuracy_at = profile.infoAccuracyAt ?? null
  if (profile.charterAcceptedAt !== undefined) patch.charter_accepted_at = profile.charterAcceptedAt ?? null
  if (profile.contactAuthorizedAt !== undefined) patch.contact_authorized_at = profile.contactAuthorizedAt ?? null
  if (profile.confidentialityAcceptedAt !== undefined) patch.confidentiality_accepted_at = profile.confidentialityAcceptedAt ?? null
  if (profile.availableDays !== undefined) patch.available_days = profile.availableDays
  if (profile.availableHours !== undefined) patch.available_hours = profile.availableHours
  if (profile.serviceArea !== undefined) patch.service_area = profile.serviceArea
  if (profile.verified !== undefined) patch.verified = profile.verified
  if (profile.verificationNotes !== undefined) patch.verification_notes = profile.verificationNotes

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
