import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../server/lib/cors.js'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import {
  confirmEmergencyReferent,
  getConfirmPreview,
  loadEmergencyContextForOwnerPet,
  loadEmergencyContextFromOwnerToken,
  loadEmergencyContextFromPetToken,
  triggerEmergencyAlert,
} from '../../server/lib/emergency-alert.js'
import { notifyReferentsFullEmergency, type ReferentContact } from '../../server/lib/emergency-notify.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = (req.body || {}) as Record<string, unknown>
  const action = body.action as string

  // Ancien endpoint /api/emergency/notify-referents (fusionné — limite Hobby Vercel)
  if (action === 'notify-referents' || (!action && Array.isArray(body.referents))) {
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
    } = body as {
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

  if (action === 'status') {
    const confirmToken = body.confirmToken as string | undefined
    if (!confirmToken) return res.status(400).json({ error: 'Token manquant' })
    const preview = await getConfirmPreview(confirmToken)
    if (!preview) return res.status(404).json({ error: 'Lien invalide' })
    return res.status(200).json({ preview })
  }

  if (action === 'confirm') {
    const confirmToken = body.confirmToken as string | undefined
    if (!confirmToken) return res.status(400).json({ error: 'Token manquant' })
    const result = await confirmEmergencyReferent(confirmToken)
    if (!result.ok) return res.status(400).json({ error: result.error })
    return res.status(200).json(result)
  }

  if (action === 'trigger') {
    const description = (body.description as string) || ''
    const source = body.source as string

    if (source === 'owner') {
      const userId = body.userId as string | undefined
      const ownerEmail = body.ownerEmail as string | undefined
      const petId = body.petId as string | undefined

      if (!userId || !ownerEmail || !petId) {
        return res.status(400).json({ error: 'Paramètres manquants' })
      }

      const auth = await verifyRequestUser(req.headers.authorization, userId, ownerEmail)
      if (!auth.valid) return res.status(401).json({ error: auth.error })

      const ctx = await loadEmergencyContextForOwnerPet(userId, petId)
      if (!ctx) return res.status(404).json({ error: 'Animal ou référents introuvables' })

      const result = await triggerEmergencyAlert({
        ctx,
        description,
        triggeredBy: 'owner',
      })

      if (!result.ok) return res.status(500).json({ error: result.error })
      return res.status(200).json(result)
    }

    if (source === 'public') {
      const tokenType = body.tokenType as 'owner' | 'pet' | undefined
      const token = body.token as string | undefined
      const petQrToken = body.petQrToken as string | undefined

      if (!token) return res.status(400).json({ error: 'Token QR manquant' })

      let ctx = null
      if (tokenType === 'pet') {
        ctx = await loadEmergencyContextFromPetToken(token)
      } else {
        ctx = await loadEmergencyContextFromOwnerToken(token)
        if (ctx && petQrToken) {
          const petCtx = await loadEmergencyContextFromPetToken(petQrToken)
          if (petCtx && petCtx.ownerId === ctx.ownerId) ctx = petCtx
        }
      }

      if (!ctx) return res.status(404).json({ error: 'Fiche introuvable ou sans référent' })

      const result = await triggerEmergencyAlert({
        ctx,
        description,
        triggeredBy: 'public',
        sourceToken: token,
      })

      if (!result.ok) return res.status(500).json({ error: result.error })
      return res.status(200).json(result)
    }

    return res.status(400).json({ error: 'Source invalide' })
  }

  return res.status(400).json({ error: 'Action invalide' })
}
