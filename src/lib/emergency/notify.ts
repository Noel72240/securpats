import { getSupabaseSafe } from '@/lib/supabase/client'

type ReferentNotify = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export async function notifyReferentsEmergency(data: {
  userId: string
  ownerEmail: string
  petName: string
  description: string
  referents: ReferentNotify[]
}) {
  const supabase = getSupabaseSafe()
  if (!supabase) {
    return { emailsSent: 0, error: 'Supabase non configuré', emailConfigured: false }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    return { emailsSent: 0, error: 'Session expirée — reconnectez-vous', emailConfigured: false }
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

    const body = await response.json()
    if (!response.ok) {
      return { emailsSent: 0, error: body.error || 'Échec envoi notifications', emailConfigured: false }
    }

    return {
      emailsSent: body.emailsSent as number,
      smsSent: (body.smsSent as number) ?? 0,
      error: null as string | null,
      emailConfigured: body.emailConfigured as boolean,
      smsConfigured: body.smsConfigured as boolean,
      results: body.results as { email: string; sent: boolean; error?: string; smsSent?: boolean }[],
    }
  } catch {
    return { emailsSent: 0, error: 'Impossible de contacter le serveur de notification', emailConfigured: false }
  }
}
