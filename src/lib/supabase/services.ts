import { getSupabase } from './client'
import { fetchAllProfiles } from './auth'
import {
  petFromRow, petToInsert, petToUpdate,
  referentFromRow, referentToInsert,
  documentFromRow,
  subscriptionFromRow, invoiceFromRow, dedupeInvoices, dedupeSubscriptions,
  missionFromRow,
  petsitterFromRow,
  activityFromRow,
  siteSettingsFromJson,
  siteSettingsToJson,
  profileToUser,
  userToProfileUpdate,
} from './mappers'
import type { Pet, Referent, PetDocument, Subscription, Invoice, Mission, PetSitterProfile, Activity, SiteSettings, User } from '@/types'
import type { Tables, TablesUpdate } from './database.types'
import { defaultSiteSettings } from '@/lib/mock/data'
import { generateQrToken } from '@/lib/utils'

// ─── Profiles ───────────────────────────────────────────────

export type OwnerProfilePatch = Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address' | 'birthDate'>>

export async function patchProfile(userId: string, updates: OwnerProfilePatch) {
  const patch = userToProfileUpdate(updates)
  if (Object.keys(patch).length === 0) {
    const { data, error } = await getSupabase().from('profiles').select('*').eq('id', userId).single()
    if (error) return { user: null as User | null, error: error.message }
    return { user: profileToUser(data), error: null }
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()
  if (error) return { user: null as User | null, error: error.message }
  return { user: profileToUser(data), error: null }
}

// ─── Pets ───────────────────────────────────────────────────

export async function fetchPetsByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('pets').select('*').eq('owner_id', ownerId).order('created_at')
  if (error) return { pets: [] as Pet[], error: error.message }
  return { pets: data.map(petFromRow), error: null }
}

export async function fetchReferentsByQrToken(token: string) {
  const { data, error } = await getSupabase().rpc('get_referents_by_qr_token', { token })
  if (error) return { referents: [] as Referent[], error: error.message }
  return { referents: (data ?? []).map(referentFromRow), error: null }
}

export async function fetchPetByQrToken(token: string) {
  const { data, error } = await getSupabase().rpc('get_pet_by_qr_token', { token })
  if (error) return { pet: null as Pet | null, error: error.message }
  const row = data?.[0]
  return { pet: row ? petFromRow(row) : null, error: null }
}

export async function fetchAllPets() {
  const { data, error } = await getSupabase().from('pets').select('*').order('created_at', { ascending: false })
  if (error) return { pets: [] as Pet[], error: error.message }
  return { pets: data.map(petFromRow), error: null }
}

export async function createPet(ownerId: string, pet: Omit<Pet, 'id' | 'ownerId' | 'qrToken' | 'createdAt'>) {
  const qrToken = generateQrToken(pet.name)
  const { data, error } = await getSupabase().from('pets').insert({
    ...petToInsert({ ...pet, qrToken, ownerId, id: '', createdAt: '' } as Pet, ownerId),
    qr_token: qrToken,
  }).select().single()
  if (error) return { pet: null as Pet | null, error: error.message }
  return { pet: petFromRow(data), error: null }
}

export async function updatePet(id: string, updates: Partial<Pet>) {
  const { data, error } = await getSupabase().from('pets').update(petToUpdate(updates)).eq('id', id).select().single()
  if (error) return { pet: null as Pet | null, error: error.message }
  return { pet: petFromRow(data), error: null }
}

export async function deletePet(id: string) {
  const { error } = await getSupabase().from('pets').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Referents ──────────────────────────────────────────────

export async function fetchReferentsByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('referents').select('*').eq('owner_id', ownerId).order('priority')
  if (error) return { referents: [] as Referent[], error: error.message }
  return { referents: data.map(referentFromRow), error: null }
}

export async function fetchAllReferents() {
  const { data, error } = await getSupabase().from('referents').select('*').order('priority')
  if (error) return { referents: [] as Referent[], error: error.message }
  return { referents: data.map(referentFromRow), error: null }
}

export async function createReferent(ownerId: string, ref: Omit<Referent, 'id' | 'ownerId'>) {
  const { data, error } = await getSupabase().from('referents').insert(referentToInsert(ref as Referent, ownerId)).select().single()
  if (error) return { referent: null as Referent | null, error: error.message }
  return { referent: referentFromRow(data), error: null }
}

export async function updateReferent(id: string, updates: Partial<Referent>) {
  const map: TablesUpdate<'referents'> = {}
  if (updates.firstName !== undefined) map.first_name = updates.firstName
  if (updates.lastName !== undefined) map.last_name = updates.lastName
  if (updates.phone !== undefined) map.phone = updates.phone
  if (updates.email !== undefined) map.email = updates.email
  if (updates.address !== undefined) map.address = updates.address
  if (updates.priority !== undefined) map.priority = updates.priority
  const { data, error } = await getSupabase().from('referents').update(map).eq('id', id).select().single()
  if (error) return { referent: null as Referent | null, error: error.message }
  return { referent: referentFromRow(data), error: null }
}

export async function deleteReferent(id: string) {
  const { error } = await getSupabase().from('referents').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function reorderReferents(ids: string[]) {
  const updates = ids.map((id, index) =>
    getSupabase().from('referents').update({ priority: index + 1 }).eq('id', id)
  )
  await Promise.all(updates)
  return { error: null }
}

// ─── Documents ──────────────────────────────────────────────

export async function fetchDocumentsByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('documents').select('*').eq('owner_id', ownerId).order('uploaded_at', { ascending: false })
  if (error) return { documents: [] as PetDocument[], error: error.message }
  return { documents: data.map(documentFromRow), error: null }
}

export async function fetchAllDocuments() {
  const { data, error } = await getSupabase().from('documents').select('*').order('uploaded_at', { ascending: false })
  if (error) return { documents: [] as PetDocument[], error: error.message }
  return { documents: data.map(documentFromRow), error: null }
}

export async function createDocument(ownerId: string, doc: Omit<PetDocument, 'id' | 'ownerId' | 'uploadedAt'>, storagePath?: string) {
  const { data, error } = await getSupabase().from('documents').insert({
    owner_id: ownerId,
    pet_id: doc.petId ?? null,
    name: doc.name,
    category: doc.category,
    file_name: doc.fileName,
    file_size: doc.fileSize,
    storage_path: storagePath ?? null,
  }).select().single()
  if (error) return { document: null as PetDocument | null, error: error.message }
  return { document: documentFromRow(data), error: null }
}

export async function deleteDocument(id: string) {
  const { data } = await getSupabase().from('documents').select('storage_path').eq('id', id).maybeSingle()
  if (data?.storage_path) {
    await getSupabase().storage.from('documents').remove([data.storage_path])
  }
  const { error } = await getSupabase().from('documents').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Subscriptions ──────────────────────────────────────────

export async function fetchSubscriptionByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('subscriptions').select('*').eq('owner_id', ownerId).order('start_date', { ascending: false })
  if (error) return { subscription: null as Subscription | null, error: error.message }
  const deduped = dedupeSubscriptions(data.map(subscriptionFromRow))
  return { subscription: deduped[0] ?? null, error: null }
}

async function findSubscriptionRowId(
  userId: string,
  plan: Subscription['plan'],
  stripeSubscriptionId?: string | null,
) {
  if (stripeSubscriptionId) {
    const { data } = await getSupabase()
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()
    if (data?.id) return data.id
  }

  const { data } = await getSupabase()
    .from('subscriptions')
    .select('id')
    .eq('owner_id', userId)
    .eq('plan', plan)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

export async function upsertSubscription(sub: Omit<Subscription, 'id'> & { id?: string }) {
  const row = {
    owner_id: sub.ownerId,
    plan: sub.plan,
    status: sub.status,
    price: sub.price,
    start_date: sub.startDate,
    renewal_date: sub.renewalDate,
    auto_renew: sub.autoRenew,
    stripe_customer_id: sub.stripeCustomerId ?? null,
    stripe_subscription_id: sub.stripeSubscriptionId ?? null,
  }

  const existingId = await findSubscriptionRowId(sub.ownerId, sub.plan, sub.stripeSubscriptionId)

  if (existingId) {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .update(row)
      .eq('id', existingId)
      .select()
      .single()
    if (error) return { subscription: null as Subscription | null, error: error.message }
    return { subscription: subscriptionFromRow(data), error: null }
  }

  const { data, error } = await getSupabase()
    .from('subscriptions')
    .insert(row)
    .select()
    .single()
  if (error) return { subscription: null as Subscription | null, error: error.message }
  return { subscription: subscriptionFromRow(data), error: null }
}

export async function fetchAllInvoices() {
  const { data, error } = await getSupabase()
    .from('invoices')
    .select('*')
    .order('date', { ascending: false })
  if (error) return { invoices: [] as Invoice[], error: error.message }
  return { invoices: dedupeInvoices(data.map(invoiceFromRow)), error: null }
}

export async function fetchAllSubscriptions() {
  const { data, error } = await getSupabase()
    .from('subscriptions')
    .select('*')
    .order('start_date', { ascending: false })
  if (error) return { subscriptions: [] as Subscription[], error: error.message }
  return { subscriptions: dedupeSubscriptions(data.map(subscriptionFromRow)), error: null }
}

export async function fetchInvoicesByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('invoices').select('*').eq('owner_id', ownerId).order('date', { ascending: false })
  if (error) return { invoices: [] as Invoice[], error: error.message }
  return { invoices: dedupeInvoices(data.map(invoiceFromRow)), error: null }
}

export async function createInvoice(invoice: Omit<Invoice, 'id'>) {
  const { data: existing } = await getSupabase()
    .from('invoices')
    .select('id')
    .eq('owner_id', invoice.ownerId)
    .eq('date', invoice.date)
    .eq('amount', invoice.amount)
    .eq('plan', invoice.plan)
    .eq('status', invoice.status)
    .maybeSingle()

  if (existing) {
    return { invoice: null as Invoice | null, error: null }
  }

  const { data, error } = await getSupabase().from('invoices').insert({
    owner_id: invoice.ownerId,
    amount: invoice.amount,
    date: invoice.date,
    status: invoice.status,
    plan: invoice.plan,
    stripe_invoice_id: invoice.stripeInvoiceId ?? null,
  }).select().single()
  if (error) return { invoice: null as Invoice | null, error: error.message }
  return { invoice: invoiceFromRow(data), error: null }
}

// ─── Missions ───────────────────────────────────────────────

export async function fetchAllMissions() {
  const { data, error } = await getSupabase().from('missions').select('*').order('created_at', { ascending: false })
  if (error) return { missions: [] as Mission[], error: error.message }
  return { missions: data.map(missionFromRow), error: null }
}

export async function fetchMissionsByOwner(ownerId: string) {
  const { data, error } = await getSupabase()
    .from('missions')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) return { missions: [] as Mission[], error: error.message }
  return { missions: data.map(missionFromRow), error: null }
}

export async function deleteMission(id: string) {
  const { error } = await getSupabase().from('missions').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** Annulation par le propriétaire (mission en attente ou acceptée). */
export async function cancelMission(id: string) {
  const { data, error } = await getSupabase()
    .from('missions')
    .update({ status: 'cancelled' as Mission['status'] })
    .eq('id', id)
    .in('status', ['pending', 'accepted'])
    .select()
    .maybeSingle()
  if (error) return { mission: null as Mission | null, error: error.message }
  if (!data) {
    return { mission: null, error: 'Cette mission ne peut plus être annulée.' }
  }
  return { mission: missionFromRow(data), error: null }
}

export async function createMission(mission: Omit<Mission, 'id' | 'createdAt'>) {
  const { data, error } = await getSupabase().from('missions').insert({
    pet_id: mission.petId,
    pet_name: mission.petName,
    owner_id: mission.ownerId,
    owner_name: mission.ownerName,
    petsitter_id: mission.petsitterId ?? null,
    type: mission.type,
    status: mission.status,
    description: mission.description,
    address: mission.address,
  }).select().single()
  if (error) return { mission: null as Mission | null, error: error.message }
  return { mission: missionFromRow(data), error: null }
}

/** Prise exclusive d'une mission (atomique côté base). */
export async function acceptMission(missionId: string) {
  const { data, error } = await getSupabase().rpc('accept_mission', { p_mission_id: missionId })
  if (error) {
    const msg = error.message.includes('déjà été acceptée')
      ? 'Cette mission a déjà été acceptée par un autre pet-sitter.'
      : error.message
    return { mission: null as Mission | null, error: msg }
  }
  if (!data) {
    return { mission: null as Mission | null, error: 'Cette mission a déjà été acceptée par un autre pet-sitter.' }
  }
  return { mission: missionFromRow(data as Tables<'missions'>), error: null }
}

export async function updateMissionStatus(
  id: string,
  status: Mission['status'],
  options?: { petsitterId?: string },
) {
  if (status === 'accepted' && options?.petsitterId) {
    return acceptMission(id)
  }

  const patch: { status: Mission['status']; petsitter_id?: string } = { status }
  let query = getSupabase().from('missions').update(patch).eq('id', id)

  if (status === 'declined') {
    query = query.eq('status', 'pending').is('petsitter_id', null)
  }
  if (status === 'completed' && options?.petsitterId) {
    query = query.eq('status', 'accepted').eq('petsitter_id', options.petsitterId)
  }

  const { data, error } = await query.select().maybeSingle()
  if (error) return { mission: null as Mission | null, error: error.message }
  if (!data) {
    if (status === 'declined') {
      return { mission: null, error: 'Cette mission n\'est plus disponible.' }
    }
    if (status === 'completed') {
      return { mission: null, error: 'Impossible de terminer cette mission.' }
    }
    return { mission: null, error: 'Mise à jour impossible.' }
  }
  return { mission: missionFromRow(data), error: null }
}

// ─── Pet-Sitter ─────────────────────────────────────────────

export async function fetchPetsitterProfile(userId: string) {
  const { data, error } = await getSupabase().from('petsitter_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) return { profile: null as PetSitterProfile | null, error: error.message }
  return { profile: data ? petsitterFromRow(data) : null, error: null }
}

export async function fetchAllPetsitterProfiles() {
  const { data, error } = await getSupabase().from('petsitter_profiles').select('*').order('email')
  if (error) return { profiles: [] as PetSitterProfile[], error: error.message }
  return { profiles: data.map(petsitterFromRow), error: null }
}

export async function setPetsitterVerified(userId: string, verified: boolean) {
  const { data, error } = await getSupabase()
    .from('petsitter_profiles')
    .update({ verified })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return { profile: null as PetSitterProfile | null, error: error.message }
  return { profile: petsitterFromRow(data), error: null }
}

export async function upsertPetsitterProfile(userId: string, profile: Partial<PetSitterProfile>) {
  const { data, error } = await getSupabase().from('petsitter_profiles').upsert({
    user_id: userId,
    photo: profile.photo ?? null,
    bio: profile.bio ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
    id_document_path: profile.idDocument ?? null,
    proof_of_address_path: profile.proofOfAddress ?? null,
    available_days: profile.availableDays ?? [],
    available_hours: profile.availableHours ?? '',
    service_area: profile.serviceArea ?? '',
    verified: profile.verified ?? false,
    id_consent_at: profile.idConsentAt ?? null,
    id_consent_version: profile.idConsentVersion ?? null,
  }, { onConflict: 'user_id' }).select().single()
  if (error) return { profile: null as PetSitterProfile | null, error: error.message }
  return { profile: petsitterFromRow(data), error: null }
}

/** Mise à jour partielle — ne touche pas aux champs non fournis (évite d'effacer la CNI). */
export async function patchPetsitterProfile(userId: string, profile: Partial<PetSitterProfile>) {
  const patch: TablesUpdate<'petsitter_profiles'> = {}
  if (profile.photo !== undefined) patch.photo = profile.photo ?? null
  if (profile.bio !== undefined) patch.bio = profile.bio
  if (profile.phone !== undefined) patch.phone = profile.phone
  if (profile.email !== undefined) patch.email = profile.email
  if (profile.address !== undefined) patch.address = profile.address
  if (profile.idDocument !== undefined) patch.id_document_path = profile.idDocument ?? null
  if (profile.proofOfAddress !== undefined) patch.proof_of_address_path = profile.proofOfAddress ?? null
  if (profile.availableDays !== undefined) patch.available_days = profile.availableDays
  if (profile.availableHours !== undefined) patch.available_hours = profile.availableHours
  if (profile.serviceArea !== undefined) patch.service_area = profile.serviceArea
  if (profile.verified !== undefined) patch.verified = profile.verified
  if (profile.idConsentAt !== undefined) patch.id_consent_at = profile.idConsentAt ?? null
  if (profile.idConsentVersion !== undefined) patch.id_consent_version = profile.idConsentVersion ?? null

  if (Object.keys(patch).length === 0) {
    return fetchPetsitterProfile(userId)
  }

  const { data, error } = await getSupabase()
    .from('petsitter_profiles')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return { profile: null as PetSitterProfile | null, error: error.message }
  return { profile: petsitterFromRow(data), error: null }
}

// ─── Activities ─────────────────────────────────────────────

export async function fetchActivitiesByOwner(ownerId: string) {
  const { data, error } = await getSupabase().from('activities').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(50)
  if (error) return { activities: [] as Activity[], error: error.message }
  return { activities: data.map(activityFromRow), error: null }
}

export async function createActivity(ownerId: string, type: string, message: string) {
  const { data, error } = await getSupabase().from('activities').insert({ owner_id: ownerId, type, message }).select().single()
  if (error) return { activity: null as Activity | null, error: error.message }
  return { activity: activityFromRow(data), error: null }
}

export async function deleteActivity(id: string) {
  const { error } = await getSupabase().from('activities').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Site Settings ──────────────────────────────────────────

const SITE_SETTINGS_ID = 'global'

export async function fetchSiteSettings() {
  const { data, error } = await getSupabase().from('site_settings').select('settings').eq('id', SITE_SETTINGS_ID).maybeSingle()
  if (error) return { settings: defaultSiteSettings, error: error.message }
  if (!data?.settings) return { settings: defaultSiteSettings, error: null }
  try {
    return { settings: siteSettingsFromJson(data.settings), error: null }
  } catch {
    return { settings: defaultSiteSettings, error: null }
  }
}

export async function updateSiteSettings(settings: SiteSettings) {
  const { error } = await getSupabase().from('site_settings').upsert({
    id: SITE_SETTINGS_ID,
    settings: siteSettingsToJson(settings),
    updated_at: new Date().toISOString(),
  })
  return { error: error?.message ?? null }
}

// ─── Contact ────────────────────────────────────────────────

export async function createContactMessage(msg: {
  name: string
  email: string
  subject: string
  message: string
  consentGiven?: boolean
}) {
  const { error } = await getSupabase().from('contact_messages').insert({
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    consent_given: msg.consentGiven ?? true,
    consent_at: new Date().toISOString(),
  })
  return { error: error?.message ?? null }
}

// ─── Load all data for user ─────────────────────────────────

export async function loadOwnerData(ownerId: string) {
  const [pets, referents, documents, subscription, invoices, activities, missions] = await Promise.all([
    fetchPetsByOwner(ownerId),
    fetchReferentsByOwner(ownerId),
    fetchDocumentsByOwner(ownerId),
    fetchSubscriptionByOwner(ownerId),
    fetchInvoicesByOwner(ownerId),
    fetchActivitiesByOwner(ownerId),
    fetchMissionsByOwner(ownerId),
  ])
  return {
    pets: pets.pets,
    referents: referents.referents,
    documents: documents.documents,
    subscription: subscription.subscription,
    invoices: invoices.invoices,
    activities: activities.activities,
    missions: missions.missions,
  }
}

export async function loadAdminData() {
  const [profiles, pets, referents, documents, missions, siteSettings, invoices, petsitters, subscriptions] = await Promise.all([
    fetchAllProfiles(),
    fetchAllPets(),
    fetchAllReferents(),
    fetchAllDocuments(),
    fetchAllMissions(),
    fetchSiteSettings(),
    fetchAllInvoices(),
    fetchAllPetsitterProfiles(),
    fetchAllSubscriptions(),
  ])
  return {
    allUsers: profiles.users,
    pets: pets.pets,
    referents: referents.referents,
    documents: documents.documents,
    missions: missions.missions,
    siteSettings: siteSettings.settings,
    invoices: invoices.invoices,
    petsitterProfiles: petsitters.profiles,
    subscriptions: subscriptions.subscriptions,
  }
}

export async function loadPublicData() {
  const { settings } = await fetchSiteSettings()
  return { siteSettings: settings }
}
