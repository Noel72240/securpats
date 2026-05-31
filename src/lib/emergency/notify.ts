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

    const text = await response.text()
    let body: Record<string, unknown>
    try {
      body = JSON.parse(text)
    } catch {
      return {
        emailsSent: 0,
        error: `Réponse serveur invalide (${response.status}). Redéployez le projet Vercel.`,
        emailConfigured: false,
      }
    }
    if (!response.ok) {
      return { emailsSent: 0, error: (body.error as string) || 'Échec envoi notifications', emailConfigured: false }
    }

    return {
      emailsSent: body.emailsSent as number,
      error: (body.error as string) || (
        (body.emailsSent as number) === 0 && Array.isArray(body.results) && body.results.length
          ? (body.results as { email: string; error?: string }[])
              .map(r => r.error ? `${r.email || 'référent'} : ${r.error}` : null)
              .filter(Boolean)
              .join(' | ') || null
          : null
      ),
      emailConfigured: body.emailConfigured as boolean,
      results: body.results as { email: string; sent: boolean; error?: string }[],
    }
  } catch {
    return { emailsSent: 0, error: 'Impossible de contacter le serveur de notification', emailConfigured: false }
  }
}
