import { getSupabaseSafe } from '@/lib/supabase/client'

export type ReferentNotify = {
  firstName: string
  lastName: string
  email: string
  phone: string
  priority: number
}

export type NotifyReferentResult = {
  name: string
  email: string
  phone: string
  emailSent: boolean
  smsSent: boolean
  emailError?: string
  smsError?: string
}

export type EmergencyNotifyResponse = {
  emailsSent: number
  smsSent: number
  error?: string
  emailConfigured?: boolean
  smsConfigured?: boolean
  results?: NotifyReferentResult[]
}

export async function notifyReferentsEmergency(data: {
  userId: string
  ownerEmail: string
  ownerName: string
  ownerPhone?: string
  petName: string
  petSpecies?: string
  petAllergies?: string
  vetLine?: string
  description: string
  rescueUrl?: string
  referents: ReferentNotify[]
}): Promise<EmergencyNotifyResponse> {
  const supabase = getSupabaseSafe()
  if (!supabase) {
    return { emailsSent: 0, smsSent: 0, error: 'Supabase non configuré', emailConfigured: false, smsConfigured: false }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    return { emailsSent: 0, smsSent: 0, error: 'Session expirée — reconnectez-vous', emailConfigured: false, smsConfigured: false }
  }

  try {
    const response = await fetch('/api/emergency/notify-referents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const text = await response.text()
    let body: Record<string, unknown>
    try {
      body = JSON.parse(text)
    } catch {
      return {
        emailsSent: 0,
        smsSent: 0,
        error: `Réponse serveur invalide (${response.status}). Redéployez le projet Vercel.`,
        emailConfigured: false,
        smsConfigured: false,
      }
    }
    if (!response.ok) {
      return {
        emailsSent: 0,
        smsSent: 0,
        error: (body.error as string) || 'Échec envoi notifications',
        emailConfigured: false,
        smsConfigured: false,
      }
    }

    const emailsSent = (body.emailsSent as number) ?? 0
    const smsSent = (body.smsSent as number) ?? 0

    return {
      emailsSent,
      smsSent,
      error: (body.error as string) || undefined,
      emailConfigured: Boolean(body.emailConfigured),
      smsConfigured: Boolean(body.smsConfigured),
      results: body.results as NotifyReferentResult[] | undefined,
    }
  } catch {
    return {
      emailsSent: 0,
      smsSent: 0,
      error: 'Impossible de contacter le serveur de notification',
      emailConfigured: false,
      smsConfigured: false,
    }
  }
}
