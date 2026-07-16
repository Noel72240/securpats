import type {
  User, Pet, Referent, PetDocument, Subscription, Invoice,
  Mission, PetSitterProfile, Activity, SiteSettings,
} from '@/types'
import { defaultSiteSettings } from '@/lib/mock/data'
import type {
  Tables, TablesUpdate, Json, UserRole, DocumentCategory, SubscriptionPlan,
  SubscriptionStatus, MissionStatus, MissionType, InvoiceStatus,
} from './database.types'

// ─── Profiles ───────────────────────────────────────────────

export function profileToUser(row: Tables<'profiles'>): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address ?? '',
    birthDate: row.birth_date ?? undefined,
    role: row.role,
    avatar: row.avatar_url ?? undefined,
    createdAt: row.created_at.split('T')[0],
    twoFactorEnabled: row.two_factor_enabled,
    consentAcceptedAt: row.consent_accepted_at ?? undefined,
    consentVersion: row.consent_version ?? undefined,
    marketingOptIn: row.marketing_opt_in ?? undefined,
    qrToken: row.qr_token ?? undefined,
  }
}

export function userToProfileInsert(
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'role'> & {
    consentAcceptedAt?: string
    consentVersion?: string
    marketingOptIn?: boolean
  }
) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phone,
    role: user.role,
    consent_accepted_at: user.consentAcceptedAt ?? null,
    consent_version: user.consentVersion ?? null,
    marketing_opt_in: user.marketingOptIn ?? false,
  }
}

export function userToProfileUpdate(updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address' | 'birthDate' | 'qrToken'>>): TablesUpdate<'profiles'> {
  const patch: TablesUpdate<'profiles'> = {}
  if (updates.firstName !== undefined) patch.first_name = updates.firstName
  if (updates.lastName !== undefined) patch.last_name = updates.lastName
  if (updates.phone !== undefined) patch.phone = updates.phone
  if (updates.address !== undefined) patch.address = updates.address
  if (updates.birthDate !== undefined) patch.birth_date = updates.birthDate || null
  if (updates.qrToken !== undefined) patch.qr_token = updates.qrToken || null
  return patch
}

// ─── Pets ───────────────────────────────────────────────────

export function petFromRow(row: Tables<'pets'>): Pet {
  return {
    id: row.id,
    ownerId: row.owner_id,
    photo: row.photo ?? undefined,
    name: row.name,
    species: row.species,
    breed: row.breed,
    sex: row.sex as Pet['sex'],
    birthDate: row.birth_date,
    weight: row.weight,
    color: row.color,
    identificationNumber: row.identification_number,
    treatments: row.treatments,
    allergies: row.allergies,
    diet: row.diet,
    specialInstructions: row.special_instructions,
    vetName: row.vet_name,
    vetPhone: row.vet_phone,
    vetAddress: row.vet_address,
    qrToken: row.qr_token,
    createdAt: row.created_at.split('T')[0],
  }
}

export function petToInsert(pet: Omit<Pet, 'id' | 'createdAt'>, ownerId: string) {
  return {
    owner_id: ownerId,
    photo: pet.photo ?? null,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    birth_date: pet.birthDate,
    weight: pet.weight,
    color: pet.color,
    identification_number: pet.identificationNumber,
    treatments: pet.treatments,
    allergies: pet.allergies,
    diet: pet.diet,
    special_instructions: pet.specialInstructions,
    vet_name: pet.vetName,
    vet_phone: pet.vetPhone,
    vet_address: pet.vetAddress,
    qr_token: pet.qrToken,
  }
}

export function petToUpdate(updates: Partial<Pet>): TablesUpdate<'pets'> {
  const map: TablesUpdate<'pets'> = {}
  if (updates.photo !== undefined) map.photo = updates.photo ?? null
  if (updates.name !== undefined) map.name = updates.name
  if (updates.species !== undefined) map.species = updates.species
  if (updates.breed !== undefined) map.breed = updates.breed
  if (updates.sex !== undefined) map.sex = updates.sex
  if (updates.birthDate !== undefined) map.birth_date = updates.birthDate
  if (updates.weight !== undefined) map.weight = updates.weight
  if (updates.color !== undefined) map.color = updates.color
  if (updates.identificationNumber !== undefined) map.identification_number = updates.identificationNumber
  if (updates.treatments !== undefined) map.treatments = updates.treatments
  if (updates.allergies !== undefined) map.allergies = updates.allergies
  if (updates.diet !== undefined) map.diet = updates.diet
  if (updates.specialInstructions !== undefined) map.special_instructions = updates.specialInstructions
  if (updates.vetName !== undefined) map.vet_name = updates.vetName
  if (updates.vetPhone !== undefined) map.vet_phone = updates.vetPhone
  if (updates.vetAddress !== undefined) map.vet_address = updates.vetAddress
  return map
}

// ─── Referents ──────────────────────────────────────────────

export function referentFromRow(row: Tables<'referents'>): Referent {
  return {
    id: row.id,
    ownerId: row.owner_id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    priority: row.priority,
  }
}

export function referentToInsert(ref: Omit<Referent, 'id'>, ownerId: string) {
  return {
    owner_id: ownerId,
    first_name: ref.firstName,
    last_name: ref.lastName,
    phone: ref.phone,
    email: ref.email,
    address: ref.address,
    priority: ref.priority,
  }
}

// ─── Documents ──────────────────────────────────────────────

export function documentFromRow(row: Tables<'documents'>): PetDocument {
  return {
    id: row.id,
    ownerId: row.owner_id,
    petId: row.pet_id ?? undefined,
    name: row.name,
    category: row.category as DocumentCategory,
    fileName: row.file_name,
    fileSize: row.file_size,
    uploadedAt: row.uploaded_at.split('T')[0],
    storagePath: row.storage_path ?? undefined,
  }
}

// ─── Subscriptions & Invoices ───────────────────────────────

export function subscriptionFromRow(row: Tables<'subscriptions'>): Subscription {
  return {
    id: row.id,
    ownerId: row.owner_id,
    plan: row.plan as SubscriptionPlan,
    status: row.status as SubscriptionStatus,
    price: row.price,
    startDate: row.start_date,
    renewalDate: row.renewal_date,
    autoRenew: row.auto_renew,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
  }
}

export function invoiceFromRow(row: Tables<'invoices'>): Invoice {
  return {
    id: row.id,
    ownerId: row.owner_id,
    amount: row.amount,
    date: row.date,
    status: row.status as InvoiceStatus,
    plan: row.plan as SubscriptionPlan,
    stripeInvoiceId: row.stripe_invoice_id ?? undefined,
  }
}

export function dedupeInvoices(invoices: Invoice[]): Invoice[] {
  const seen = new Set<string>()
  return invoices.filter(inv => {
    const key = inv.stripeInvoiceId || `${inv.ownerId}|${inv.date}|${inv.amount}|${inv.plan}|${inv.status}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Un enregistrement par utilisateur et par plan (le plus récent / actif en priorité). */
export function dedupeSubscriptions(subs: Subscription[]): Subscription[] {
  const byKey = new Map<string, Subscription>()
  const rank = (s: Subscription) => {
    const statusScore = s.status === 'active' || s.status === 'trialing' ? 2 : 1
    return statusScore * 1_000_000 + new Date(s.startDate).getTime()
  }

  for (const sub of subs) {
    const key = `${sub.ownerId}|${sub.plan}`
    const prev = byKey.get(key)
    if (!prev || rank(sub) >= rank(prev)) {
      byKey.set(key, sub)
    }
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )
}

// ─── Missions ───────────────────────────────────────────────

export function missionFromRow(row: Tables<'missions'>): Mission {
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    petsitterId: row.petsitter_id ?? undefined,
    type: row.type as MissionType,
    status: row.status as MissionStatus,
    description: row.description,
    createdAt: row.created_at,
    address: row.address,
  }
}

// ─── Pet-Sitter ─────────────────────────────────────────────

export function petsitterFromRow(row: Tables<'petsitter_profiles'>): PetSitterProfile {
  return {
    id: row.id,
    userId: row.user_id,
    photo: row.photo ?? undefined,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
    address: row.address,
    idDocument: row.id_document_path ?? undefined,
    proofOfAddress: row.proof_of_address_path ?? undefined,
    availableDays: row.available_days,
    availableHours: row.available_hours,
    serviceArea: row.service_area,
    verified: row.verified,
    idConsentAt: row.id_consent_at ?? undefined,
    idConsentVersion: row.id_consent_version ?? undefined,
  }
}

// ─── Activities ─────────────────────────────────────────────

export function activityFromRow(row: Tables<'activities'>): Activity {
  return {
    id: row.id,
    ownerId: row.owner_id,
    type: row.type,
    message: row.message,
    date: row.created_at,
  }
}

// ─── Site Settings ──────────────────────────────────────────

/** Fusionne les réglages Supabase (souvent partiels ou `{}`) avec les valeurs par défaut. */
export function mergeSiteSettings(partial: unknown): SiteSettings {
  if (!partial || typeof partial !== 'object') return defaultSiteSettings
  const p = partial as Partial<SiteSettings>
  return {
    ...defaultSiteSettings,
    ...p,
    contact: { ...defaultSiteSettings.contact, ...p.contact },
    legal: { ...defaultSiteSettings.legal, ...p.legal },
    home: { ...defaultSiteSettings.home, ...p.home },
    footer: { ...defaultSiteSettings.footer, ...p.footer },
    maintenance: { ...defaultSiteSettings.maintenance, ...p.maintenance },
    testimonials: p.testimonials ?? defaultSiteSettings.testimonials,
    partners: {
      ...defaultSiteSettings.partners,
      ...p.partners,
      items: p.partners?.items ?? defaultSiteSettings.partners.items,
    },
  }
}

export function siteSettingsFromJson(json: unknown): SiteSettings {
  return mergeSiteSettings(json)
}

export function siteSettingsToJson(settings: SiteSettings): Json {
  return JSON.parse(JSON.stringify(settings)) as Json
}

export type { UserRole, DocumentCategory, SubscriptionPlan }
