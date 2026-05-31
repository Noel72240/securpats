import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../lib/verify-auth.js'

type ReferentPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return { sent: false, error: 'Twilio non configuré' }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64')
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })

  if (!res.ok) {
    const errBody = await res.text()
    return { sent: false, error: errBody || res.statusText }
  }
  return { sent: true, error: null }
}
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'contact@securpats.fr'
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY non configurée' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `SécurPats <${from}>`,
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    return { sent: false, error: body || res.statusText }
  }
  return { sent: true, error: null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, ownerEmail, petName, description, referents } = req.body as {
    userId?: string
    ownerEmail?: string
    petName?: string
    description?: string
    referents?: ReferentPayload[]
  }

  if (!userId || !ownerEmail || !petName || !description || !referents?.length) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  const auth = await verifyRequestUser(req.headers.authorization, userId, ownerEmail)
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')
  const subject = `🚨 Urgence animale — ${petName}`
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#dc2626">Alerte urgence SécurPats</h2>
      <p>Bonjour,</p>
      <p><strong>${petName}</strong> nécessite une prise en charge urgente.</p>
      <p><strong>Situation :</strong></p>
      <p style="background:#f8fafc;padding:12px;border-radius:8px">${description.replace(/</g, '&lt;')}</p>
      <p>Merci de contacter le propriétaire ou un vétérinaire dans les plus brefs délais.</p>
      <p style="font-size:12px;color:#64748b">SécurPats — ${appUrl}</p>
    </div>
  `

  const smsBody = `URGENCE SécurPats — ${petName} : ${description.slice(0, 140)}. Contactez le propriétaire rapidement.`

  const results: { email: string; sent: boolean; error?: string; smsSent?: boolean; smsError?: string }[] = []
  let emailsSent = 0
  let smsSent = 0

  for (const ref of referents) {
    let emailSent = false
    let emailError: string | undefined
    if (ref.email) {
      const { sent, error } = await sendEmail(ref.email, subject, html.replace('Bonjour,', `Bonjour ${ref.firstName},`))
      emailSent = sent
      emailError = error ?? undefined
      if (sent) emailsSent++
    } else {
      emailError = 'Email manquant'
    }

    let refSmsSent = false
    let smsError: string | undefined
    if (ref.phone) {
      const { sent, error } = await sendSms(ref.phone, `${ref.firstName}, ${smsBody}`)
      refSmsSent = sent
      smsError = error ?? undefined
      if (sent) smsSent++
    }

    results.push({
      email: ref.email,
      sent: emailSent,
      error: emailError,
      smsSent: refSmsSent,
      smsError,
    })
  }

  return res.status(200).json({
    emailsSent,
    smsSent,
    results,
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    smsConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
    error: emailsSent === 0
      ? results.map(r => r.error ? `${r.email || 'référent'} : ${r.error}` : null).filter(Boolean).join(' | ')
        || 'Aucun email envoyé'
      : undefined,
  })
}
