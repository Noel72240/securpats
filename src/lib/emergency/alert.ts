import { getSupabaseSafe } from '@/lib/supabase/client'

export type TriggerEmergencyResult = {
  ok: boolean
  alertId?: string
  referentsCount?: number
  emailsSent?: number
  smsSent?: number
  emailConfigured?: boolean
  smsConfigured?: boolean
  error?: string
}

export type ConfirmPreview = {
  pet_name: string
  description: string
  status: string
  referent_first_name: string
  referent_last_name: string
  already_confirmed: boolean
  alert_confirmed: boolean
  confirmed_by?: string
}

async function postAlert(body: Record<string, unknown>, authToken?: string): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const response = await fetch('/api/emergency/alert', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const text = await response.text()
  let data: Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Réponse serveur invalide (${response.status})`)
  }

  if (!response.ok) {
    throw new Error((data.error as string) || 'Échec de la requête urgence')
  }
  return data
}

export async function triggerEmergencyFromOwner(data: {
  userId: string
  ownerEmail: string
  petId: string
  description: string
}): Promise<TriggerEmergencyResult> {
  const supabase = getSupabaseSafe()
  if (!supabase) return { ok: false, error: 'Supabase non configuré' }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) return { ok: false, error: 'Session expirée — reconnectez-vous' }

  try {
    const result = await postAlert({
      action: 'trigger',
      source: 'owner',
      userId: data.userId,
      ownerEmail: data.ownerEmail,
      petId: data.petId,
      description: data.description,
    }, token)

    return {
      ok: true,
      alertId: result.alertId as string,
      referentsCount: result.referentsCount as number,
      emailsSent: result.emailsSent as number,
      smsSent: result.smsSent as number,
      emailConfigured: result.emailConfigured as boolean,
      smsConfigured: result.smsConfigured as boolean,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

export async function triggerEmergencyFromQr(data: {
  tokenType: 'owner' | 'pet'
  token: string
  petQrToken?: string
  description?: string
}): Promise<TriggerEmergencyResult> {
  try {
    const result = await postAlert({
      action: 'trigger',
      source: 'public',
      tokenType: data.tokenType,
      token: data.token,
      petQrToken: data.petQrToken,
      description: data.description || '',
    })

    return {
      ok: true,
      alertId: result.alertId as string,
      referentsCount: result.referentsCount as number,
      emailsSent: result.emailsSent as number,
      smsSent: result.smsSent as number,
      emailConfigured: result.emailConfigured as boolean,
      smsConfigured: result.smsConfigured as boolean,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

export async function fetchConfirmPreview(confirmToken: string): Promise<ConfirmPreview | null> {
  try {
    const result = await postAlert({ action: 'status', confirmToken })
    return result.preview as ConfirmPreview
  } catch {
    return null
  }
}

export async function confirmEmergency(confirmToken: string) {
  try {
    return await postAlert({ action: 'confirm', confirmToken })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}
