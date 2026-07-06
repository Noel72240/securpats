import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'

type ReferentPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  priority: number
}

type NotifyResult = {
  name: string
  email: string
  phone: string
  emailSent: boolean
  smsSent: boolean
  emailError?: string
  smsError?: string
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function normalizeFrenchPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('33') && digits.length >= 11) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+33${digits.slice(1)}`
  if (digits.length >= 9) return `+${digits}`
  return null
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

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) {
    return { sent: false, error: 'SMS non configuré (Twilio)' }
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
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

function buildEmailHtml(data: {
  referentFirstName: string
  petName: string
  petSpecies?: string
  petAllergies?: string
  vetLine?: string
  ownerName: string
  ownerPhone?: string
  description: string
  rescueUrl?: string
  appUrl: string
}): string {
  const lines = [
    `<p>Bonjour <strong>${escapeHtml(data.referentFirstName)}</strong>,</p>`,
    `<p><strong>${escapeHtml(data.ownerName)}</strong> vient de déclarer une <strong style="color:#dc2626">urgence animale</strong> concernant <strong>${escapeHtml(data.petName)}</strong>.</p>`,
    `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:8px;margin:16px 0">`,
    `<p style="margin:0 0 8px;font-weight:700;color:#991b1b">Situation</p>`,
    `<p style="margin:0;color:#1e293b">${escapeHtml(data.description)}</p>`,
    `</div>`,
  ]

  if (data.petSpecies) {
    lines.push(`<p><strong>Animal :</strong> ${escapeHtml(data.petSpecies)}</p>`)
  }
  if (data.petAllergies) {
    lines.push(`<p><strong>⚠ Allergies :</strong> ${escapeHtml(data.petAllergies)}</p>`)
  }
  if (data.vetLine) {
    lines.push(`<p><strong>Vétérinaire :</strong> ${escapeHtml(data.vetLine)}</p>`)
  }
  if (data.ownerPhone) {
    lines.push(`<p><strong>Joindre le propriétaire :</strong> <a href="tel:${escapeHtml(data.ownerPhone)}">${escapeHtml(data.ownerPhone)}</a></p>`)
  }
  if (data.rescueUrl) {
    lines.push(
      `<p style="margin:20px 0">`,
      `<a href="${escapeHtml(data.rescueUrl)}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Voir la fiche secours complète</a>`,
      `</p>`,
    )
  }
  lines.push(
    `<p style="color:#64748b;font-size:13px">Merci de contacter le propriétaire ou un vétérinaire dans les plus brefs délais.</p>`,
    `<p style="color:#94a3b8;font-size:12px;margin-top:24px">SécurPats — ${escapeHtml(data.appUrl)}</p>`,
  )

  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">${lines.join('\n')}</div>`
}

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
    referents?: ReferentPayload[]
  }

  if (!userId || !ownerEmail || !petName || !description || !referents?.length) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  const auth = await verifyRequestUser(req.headers.authorization, userId, ownerEmail)
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
  const subject = `🚨 Urgence animale — ${petName}`
  const smsBody = `SécurPats — Urgence pour ${petName} (${ownerName || 'propriétaire'}). ${description.slice(0, 120)}${description.length > 120 ? '…' : ''}${ownerPhone ? ` Tel: ${ownerPhone}` : ''}${rescueUrl ? ` ${rescueUrl}` : ''}`

  const emailConfigured = Boolean(process.env.RESEND_API_KEY)
  const smsConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER,
  )

  const results: NotifyResult[] = []
  let emailsSent = 0
  let smsSent = 0

  for (const ref of referents) {
    const name = `${ref.firstName} ${ref.lastName}`.trim()
    let emailSent = false
    let smsSentForRef = false
    let emailError: string | undefined
    let smsError: string | undefined

    const email = ref.email?.trim()
    if (email) {
      const html = buildEmailHtml({
        referentFirstName: ref.firstName,
        petName,
        petSpecies,
        petAllergies,
        vetLine,
        ownerName: ownerName || 'Le propriétaire',
        ownerPhone,
        description,
        rescueUrl,
        appUrl,
      })
      const { sent, error } = await sendEmail(email, subject, html)
      emailSent = sent
      emailError = error ?? undefined
      if (sent) emailsSent++
    } else {
      emailError = 'Email manquant'
    }

    const phoneE164 = ref.phone ? normalizeFrenchPhone(ref.phone) : null
    if (phoneE164) {
      const { sent, error } = await sendSms(phoneE164, smsBody)
      smsSentForRef = sent
      smsError = error ?? undefined
      if (sent) smsSent++
    } else if (ref.phone?.trim()) {
      smsError = 'Numéro invalide pour SMS'
    } else {
      smsError = 'Téléphone manquant'
    }

    results.push({
      name,
      email: email || '',
      phone: ref.phone || '',
      emailSent,
      smsSent: smsSentForRef,
      emailError,
      smsError,
    })
  }

  const anyChannelConfigured = emailConfigured || smsConfigured
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
    emailConfigured,
    smsConfigured,
    error,
  })
}
