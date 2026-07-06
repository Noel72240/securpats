import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import { notifyReferentsFullEmergency, type ReferentContact } from '../../server/lib/emergency-notify.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    userId,
    ownerEmail,
    ownerName,
    ownerPhone,
    petName,
    petSpecies,
    petAllergies,
    vetLine,
    description,
    rescueUrl,
    referents,
  } = req.body as {
    userId?: string
    ownerEmail?: string
    ownerName?: string
    ownerPhone?: string
    petName?: string
    petSpecies?: string
    petAllergies?: string
    vetLine?: string
    description?: string
    rescueUrl?: string
    referents?: ReferentContact[]
  }

  if (!userId || !ownerEmail || !petName || !description || !referents?.length) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  const auth = await verifyRequestUser(req.headers.authorization, userId, ownerEmail)
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')

  const { emailsSent, smsSent, results } = await notifyReferentsFullEmergency(referents, {
    ownerName: ownerName || 'Le propriétaire',
    ownerPhone,
    petName,
    petSpecies,
    petAllergies,
    vetLine,
    description,
    rescueUrl,
    appUrl,
  })

  const anyChannelConfigured = Boolean(process.env.RESEND_API_KEY)
    || Boolean(process.env.TWILIO_ACCOUNT_SID)
  const anyNotificationSent = emailsSent > 0 || smsSent > 0

  let error: string | undefined
  if (!anyChannelConfigured) {
    error = 'Aucun canal configuré — ajoutez RESEND_API_KEY (email) ou Twilio (SMS) sur Vercel.'
  } else if (!anyNotificationSent) {
    error = results
      .flatMap(r => [
        r.emailError && r.email ? `${r.name} (email) : ${r.emailError}` : null,
        r.smsError && r.phone ? `${r.name} (SMS) : ${r.smsError}` : null,
      ])
      .filter(Boolean)
      .join(' | ') || 'Aucune notification envoyée'
  }

  return res.status(200).json({
    emailsSent,
    smsSent,
    results,
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    smsConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID),
    error,
  })
}
