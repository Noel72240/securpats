import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { emptyAdvanceDirectives, type AdvanceDirectives } from './types'

type Row = {
  id: string
  owner_id: string
  pet_ids: string[] | null
  priority_name: string
  priority_phone: string
  priority_relation: string
  backup_name: string
  backup_phone: string
  backup_relation: string
  tertiary_name: string
  tertiary_phone: string
  tertiary_relation: string
  allow_partner_shelter: boolean
  allow_foster_family: boolean
  people_to_notify: string
  special_instructions: string
  medication: string
  feeding_habits: string
  daily_habits: string
  veterinarian_info: string
  signed_full_name: string
  signature_data: string
  consent_accepted: boolean
  consent_version: string
  signed_at: string | null
  created_at: string
  updated_at: string
}

function fromRow(row: Row): AdvanceDirectives {
  return {
    id: row.id,
    ownerId: row.owner_id,
    petIds: row.pet_ids ?? [],
    priorityName: row.priority_name,
    priorityPhone: row.priority_phone,
    priorityRelation: row.priority_relation,
    backupName: row.backup_name,
    backupPhone: row.backup_phone,
    backupRelation: row.backup_relation,
    tertiaryName: row.tertiary_name,
    tertiaryPhone: row.tertiary_phone,
    tertiaryRelation: row.tertiary_relation,
    allowPartnerShelter: row.allow_partner_shelter,
    allowFosterFamily: row.allow_foster_family,
    peopleToNotify: row.people_to_notify,
    specialInstructions: row.special_instructions,
    medication: row.medication,
    feedingHabits: row.feeding_habits,
    dailyHabits: row.daily_habits,
    veterinarianInfo: row.veterinarian_info,
    signedFullName: row.signed_full_name,
    signatureData: row.signature_data,
    consentAccepted: row.consent_accepted,
    consentVersion: row.consent_version,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(data: Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    owner_id: data.ownerId,
    pet_ids: data.petIds,
    priority_name: data.priorityName,
    priority_phone: data.priorityPhone,
    priority_relation: data.priorityRelation,
    backup_name: data.backupName,
    backup_phone: data.backupPhone,
    backup_relation: data.backupRelation,
    tertiary_name: data.tertiaryName,
    tertiary_phone: data.tertiaryPhone,
    tertiary_relation: data.tertiaryRelation,
    allow_partner_shelter: data.allowPartnerShelter,
    allow_foster_family: data.allowFosterFamily,
    people_to_notify: data.peopleToNotify,
    special_instructions: data.specialInstructions,
    medication: data.medication,
    feeding_habits: data.feedingHabits,
    daily_habits: data.dailyHabits,
    veterinarian_info: data.veterinarianInfo,
    signed_full_name: data.signedFullName,
    signature_data: data.signatureData,
    consent_accepted: data.consentAccepted,
    consent_version: data.consentVersion,
    signed_at: data.signedAt,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchAdvanceDirectives(ownerId: string): Promise<{
  directives: AdvanceDirectives | null
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { directives: null, error: null }
  const { data, error } = await getSupabase()
    .from('advance_directives')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (error) {
    const msg = error.message || ''
    const missing =
      msg.includes('advance_directives') ||
      error.code === 'PGRST205' ||
      error.code === '42P01'
    if (missing) {
      return {
        directives: null,
        error: 'Table absente : exécutez supabase/migrations/018_advance_directives.sql dans Supabase.',
      }
    }
    return { directives: null, error: msg }
  }
  if (!data) return { directives: null, error: null }
  return { directives: fromRow(data as Row), error: null }
}

export async function upsertAdvanceDirectives(
  data: Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<{ directives: AdvanceDirectives | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { directives: null, error: 'Supabase non configuré' }
  }
  const row = toRow(data)
  const { data: saved, error } = await getSupabase()
    .from('advance_directives')
    .upsert(row, { onConflict: 'owner_id' })
    .select()
    .single()
  if (error) return { directives: null, error: error.message }
  return { directives: fromRow(saved as Row), error: null }
}

export { emptyAdvanceDirectives }
