import { getSupabaseAdmin } from './supabase-admin.js'
import {
  buildConfirmRequestEmailHtml,
  normalizeFrenchPhone,
  notifyReferentsFullEmergency,
  sendEmail,
  sendSms,
  type ReferentContact,
} from './emergency-notify.js'

export type EmergencyContext = {
  ownerId: string
  ownerName: string
  ownerPhone?: string
  ownerEmail?: string
  ownerQrToken?: string
  petId: string
  petName: string
  petSpecies?: string
  petAllergies?: string
  vetLine?: string
  rescueUrl?: string
  address: string
  referents: Array<ReferentContact & { id: string; address?: string }>
}

function appBaseUrl(): string {
  return (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
}

function familyRescueUrl(qrToken?: string): string | undefined {
  if (!qrToken) return undefined
  return `${appBaseUrl()}/famille/${encodeURIComponent(qrToken)}`
}

async function loadReferentsForOwner(ownerId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const { data } = await supabase
    .from('referents')
    .select('id, first_name, last_name, email, phone, priority, address')
    .eq('owner_id', ownerId)
    .order('priority')

  return (data ?? []).map(r => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email ?? '',
    phone: r.phone ?? '',
    priority: r.priority,
    address: r.address ?? '',
  }))
}

export async function loadEmergencyContextFromOwnerToken(token: string): Promise<EmergencyContext | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, qr_token')
    .eq('qr_token', token)
    .eq('role', 'owner')
    .maybeSingle()

  if (!profile) return null

  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed, allergies, vet_name, vet_phone')
    .eq('owner_id', profile.id)
    .order('name')
    .limit(1)

  const pet = pets?.[0]
  if (!pet) return null

  const referents = await loadReferentsForOwner(profile.id)
  if (referents.length === 0) return null

  const vetParts = [pet.vet_name?.trim(), pet.vet_phone?.trim()].filter(Boolean)
  const allergies = pet.allergies && pet.allergies !== 'Aucune connue' ? pet.allergies : undefined

  return {
    ownerId: profile.id,
    ownerName: `${profile.first_name} ${profile.last_name}`.trim(),
    ownerPhone: profile.phone || undefined,
    ownerEmail: profile.email || undefined,
    ownerQrToken: profile.qr_token || undefined,
    petId: pet.id,
    petName: pet.name,
    petSpecies: [pet.species, pet.breed].filter(Boolean).join(' · ') || undefined,
    petAllergies: allergies,
    vetLine: vetParts.length > 0 ? vetParts.join(' — ') : undefined,
    rescueUrl: familyRescueUrl(profile.qr_token ?? undefined),
    address: referents.find(r => r.priority === 1)?.address || '',
    referents,
  }
}

export async function loadEmergencyContextFromPetToken(token: string): Promise<EmergencyContext | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data: pet } = await supabase
    .from('pets')
    .select('id, name, species, breed, allergies, vet_name, vet_phone, owner_id')
    .eq('qr_token', token)
    .maybeSingle()

  if (!pet) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, qr_token')
    .eq('id', pet.owner_id)
    .maybeSingle()

  if (!profile) return null

  const referents = await loadReferentsForOwner(profile.id)
  if (referents.length === 0) return null

  const vetParts = [pet.vet_name?.trim(), pet.vet_phone?.trim()].filter(Boolean)
  const allergies = pet.allergies && pet.allergies !== 'Aucune connue' ? pet.allergies : undefined

  return {
    ownerId: profile.id,
    ownerName: `${profile.first_name} ${profile.last_name}`.trim(),
    ownerPhone: profile.phone || undefined,
    ownerEmail: profile.email || undefined,
    ownerQrToken: profile.qr_token || undefined,
    petId: pet.id,
    petName: pet.name,
    petSpecies: [pet.species, pet.breed].filter(Boolean).join(' · ') || undefined,
    petAllergies: allergies,
    vetLine: vetParts.length > 0 ? vetParts.join(' — ') : undefined,
    rescueUrl: `${appBaseUrl()}/secours/${encodeURIComponent(token)}`,
    address: referents.find(r => r.priority === 1)?.address || '',
    referents,
  }
}

export async function loadEmergencyContextForOwnerPet(ownerId: string, petId: string): Promise<EmergencyContext | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data: pet } = await supabase
    .from('pets')
    .select('id, name, species, breed, allergies, vet_name, vet_phone')
    .eq('id', petId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (!pet) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, qr_token')
    .eq('id', ownerId)
    .maybeSingle()

  if (!profile) return null

  const referents = await loadReferentsForOwner(ownerId)
  if (referents.length === 0) return null

  const vetParts = [pet.vet_name?.trim(), pet.vet_phone?.trim()].filter(Boolean)
  const allergies = pet.allergies && pet.allergies !== 'Aucune connue' ? pet.allergies : undefined

  return {
    ownerId: profile.id,
    ownerName: `${profile.first_name} ${profile.last_name}`.trim(),
    ownerPhone: profile.phone || undefined,
    ownerEmail: profile.email || undefined,
    ownerQrToken: profile.qr_token || undefined,
    petId: pet.id,
    petName: pet.name,
    petSpecies: [pet.species, pet.breed].filter(Boolean).join(' · ') || undefined,
    petAllergies: allergies,
    vetLine: vetParts.length > 0 ? vetParts.join(' — ') : undefined,
    rescueUrl: familyRescueUrl(profile.qr_token ?? undefined),
    address: referents.find(r => r.priority === 1)?.address || '',
    referents,
  }
}

async function sendConfirmationRequests(
  ctx: EmergencyContext,
  description: string,
  confirmations: Array<{ referentId: string; confirmToken: string; firstName: string; lastName: string; email: string; phone: string }>,
) {
  const appUrl = appBaseUrl()
  let emailsSent = 0
  let smsSent = 0

  for (const c of confirmations) {
    const confirmUrl = `${appUrl}/urgence/confirmer/${c.confirmToken}`
    const subject = `🚨 SécurPats — Confirmez votre disponibilité (${ctx.petName})`

    if (c.email?.trim()) {
      const html = buildConfirmRequestEmailHtml({
        referentFirstName: c.firstName,
        petName: ctx.petName,
        ownerName: ctx.ownerName,
        description,
        confirmUrl,
        appUrl,
      })
      const { sent } = await sendEmail(c.email.trim(), subject, html)
      if (sent) emailsSent++
    }

    const phoneE164 = c.phone ? normalizeFrenchPhone(c.phone) : null
    if (phoneE164) {
      const sms = `SécurPats — Urgence pour ${ctx.petName}. Confirmez votre disponibilité : ${confirmUrl}`
      const { sent } = await sendSms(phoneE164, sms)
      if (sent) smsSent++
    }
  }

  return { emailsSent, smsSent }
}

async function activateEmergencyProcedure(
  alertId: string,
  ctx: EmergencyContext,
  description: string,
  confirmedReferentId: string,
  confirmedReferentName: string,
) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase admin non configuré')

  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .insert({
      pet_id: ctx.petId,
      pet_name: ctx.petName,
      owner_id: ctx.ownerId,
      owner_name: ctx.ownerName,
      type: 'urgence',
      status: 'pending',
      description,
      address: ctx.address,
    })
    .select('id')
    .single()

  if (missionError) throw new Error(missionError.message)

  await supabase
    .from('emergency_alerts')
    .update({
      confirmed_referent_id: confirmedReferentId,
      confirmed_referent_name: confirmedReferentName,
      mission_id: mission.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', alertId)

  await supabase.from('activities').insert({
    owner_id: ctx.ownerId,
    type: 'urgence',
    message: `Urgence confirmée par ${confirmedReferentName} pour ${ctx.petName}`,
  })

  const notify = await notifyReferentsFullEmergency(ctx.referents, {
    ownerName: ctx.ownerName,
    ownerPhone: ctx.ownerPhone,
    petName: ctx.petName,
    petSpecies: ctx.petSpecies,
    petAllergies: ctx.petAllergies,
    vetLine: ctx.vetLine,
    description: `Urgence confirmée par ${confirmedReferentName}. ${description}`,
    rescueUrl: ctx.rescueUrl,
    appUrl: appBaseUrl(),
  })

  return { missionId: mission.id, ...notify }
}

export async function triggerEmergencyAlert(params: {
  ctx: EmergencyContext
  description: string
  triggeredBy: 'owner' | 'public'
  sourceToken?: string
}) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false as const, error: 'Supabase admin non configuré' }

  const { ctx, description, triggeredBy, sourceToken } = params
  const desc = description.trim() || 'Urgence signalée — intervention requise pour l\'animal.'

  const { data: alert, error: alertError } = await supabase
    .from('emergency_alerts')
    .insert({
      owner_id: ctx.ownerId,
      pet_id: ctx.petId,
      pet_name: ctx.petName,
      description: desc,
      triggered_by: triggeredBy,
      source_token: sourceToken ?? null,
      status: 'pending_confirmation',
    })
    .select('id')
    .single()

  if (alertError || !alert) {
    return { ok: false as const, error: alertError?.message || 'Création alerte impossible' }
  }

  const confirmationRows = ctx.referents.map(r => ({
    alert_id: alert.id,
    referent_id: r.id,
  }))

  const { data: confirmations, error: confError } = await supabase
    .from('emergency_alert_confirmations')
    .insert(confirmationRows)
    .select('id, referent_id, confirm_token')

  if (confError || !confirmations?.length) {
    return { ok: false as const, error: confError?.message || 'Création confirmations impossible' }
  }

  const confirmPayload = confirmations.map(c => {
    const ref = ctx.referents.find(r => r.id === c.referent_id)!
    return {
      referentId: c.referent_id,
      confirmToken: c.confirm_token,
      firstName: ref.firstName,
      lastName: ref.lastName,
      email: ref.email,
      phone: ref.phone,
    }
  })

  const notified = await sendConfirmationRequests(ctx, desc, confirmPayload)

  await supabase
    .from('emergency_alert_confirmations')
    .update({ notified_at: new Date().toISOString() })
    .eq('alert_id', alert.id)

  return {
    ok: true as const,
    alertId: alert.id,
    referentsCount: ctx.referents.length,
    emailsSent: notified.emailsSent,
    smsSent: notified.smsSent,
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    smsConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID),
  }
}

export async function confirmEmergencyReferent(confirmToken: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false as const, error: 'Supabase admin non configuré' }

  const { data: confirmation } = await supabase
    .from('emergency_alert_confirmations')
    .select('id, alert_id, referent_id, confirmed_at')
    .eq('confirm_token', confirmToken)
    .maybeSingle()

  if (!confirmation) return { ok: false as const, error: 'Lien de confirmation invalide ou expiré' }

  const { data: alert } = await supabase
    .from('emergency_alerts')
    .select('*')
    .eq('id', confirmation.alert_id)
    .maybeSingle()

  if (!alert) return { ok: false as const, error: 'Alerte introuvable' }

  const { data: referent } = await supabase
    .from('referents')
    .select('first_name, last_name')
    .eq('id', confirmation.referent_id)
    .maybeSingle()

  const referentName = referent
    ? `${referent.first_name} ${referent.last_name}`.trim()
    : 'Référent'

  if (alert.status === 'confirmed') {
    return {
      ok: true as const,
      alreadyConfirmed: true,
      petName: alert.pet_name,
      confirmedBy: alert.confirmed_referent_name || referentName,
    }
  }

  if (confirmation.confirmed_at) {
    return {
      ok: true as const,
      alreadyConfirmed: true,
      petName: alert.pet_name,
      confirmedBy: alert.confirmed_referent_name || referentName,
    }
  }

  await supabase
    .from('emergency_alert_confirmations')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', confirmation.id)

  if (alert.status === 'confirmed') {
    return {
      ok: true as const,
      alreadyConfirmed: true,
      petName: alert.pet_name,
      confirmedBy: alert.confirmed_referent_name || referentName,
    }
  }

  const { data: lockedAlert } = await supabase
    .from('emergency_alerts')
    .update({ status: 'confirmed' })
    .eq('id', alert.id)
    .eq('status', 'pending_confirmation')
    .select('id')
    .maybeSingle()

  if (!lockedAlert) {
    const { data: refreshed } = await supabase
      .from('emergency_alerts')
      .select('pet_name, confirmed_referent_name')
      .eq('id', alert.id)
      .maybeSingle()
    return {
      ok: true as const,
      alreadyConfirmed: true,
      petName: refreshed?.pet_name || alert.pet_name,
      confirmedBy: refreshed?.confirmed_referent_name || referentName,
    }
  }

  let ctx: EmergencyContext | null = null
  if (alert.pet_id) {
    ctx = await loadEmergencyContextForOwnerPet(alert.owner_id, alert.pet_id)
  }
  if (!ctx && alert.source_token) {
    ctx = await loadEmergencyContextFromOwnerToken(alert.source_token)
      ?? await loadEmergencyContextFromPetToken(alert.source_token)
  }

  if (!ctx) {
    return { ok: false as const, error: 'Impossible de charger le contexte urgence' }
  }

  const activation = await activateEmergencyProcedure(
    alert.id,
    ctx,
    alert.description,
    confirmation.referent_id,
    referentName,
  )

  return {
    ok: true as const,
    alreadyConfirmed: false,
    petName: alert.pet_name,
    confirmedBy: referentName,
    missionId: activation.missionId,
    emailsSent: activation.emailsSent,
    smsSent: activation.smsSent,
  }
}

export async function getConfirmPreview(confirmToken: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data } = await supabase.rpc('get_emergency_confirm_preview', { p_token: confirmToken })
  return data as Record<string, unknown> | null
}
