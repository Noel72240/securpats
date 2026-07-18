export type ReferentContact = {
  firstName: string
  lastName: string
  email: string
  phone: string
  priority: number
}

export type NotifyResult = {
  name: string
  email: string
  phone: string
  emailSent: boolean
  smsSent: boolean
  emailError?: string
  smsError?: string
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function normalizeFrenchPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('33') && digits.length >= 11) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+33${digits.slice(1)}`
  if (digits.length >= 9) return `+${digits}`
  return null
}

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  const rawFrom = (process.env.RESEND_FROM_EMAIL || 'contact@securpats.fr').trim()
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY non configurée' }

  // Accepte "email@domaine.fr" ou "Nom <email@domaine.fr>"
  const from = rawFrom.includes('<') ? rawFrom : `SécurPats <${rawFrom}>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[sendEmail] Resend error:', res.status, body)
    return { sent: false, error: body || res.statusText }
  }
  return { sent: true, error: null as string | null }
}

export async function sendSms(to: string, body: string) {
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
  return { sent: true, error: null as string | null }
}

export function buildEmergencyEmailHtml(data: {
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
    `<p><strong>${escapeHtml(data.ownerName)}</strong> — <strong style="color:#dc2626">urgence animale</strong> concernant <strong>${escapeHtml(data.petName)}</strong>.</p>`,
    `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:8px;margin:16px 0">`,
    `<p style="margin:0 0 8px;font-weight:700;color:#991b1b">Situation</p>`,
    `<p style="margin:0;color:#1e293b">${escapeHtml(data.description)}</p>`,
    `</div>`,
  ]

  if (data.petSpecies) lines.push(`<p><strong>Animal :</strong> ${escapeHtml(data.petSpecies)}</p>`)
  if (data.petAllergies) lines.push(`<p><strong>⚠ Allergies :</strong> ${escapeHtml(data.petAllergies)}</p>`)
  if (data.vetLine) lines.push(`<p><strong>Vétérinaire :</strong> ${escapeHtml(data.vetLine)}</p>`)
  if (data.ownerPhone) {
    lines.push(`<p><strong>Joindre le propriétaire :</strong> <a href="tel:${escapeHtml(data.ownerPhone)}">${escapeHtml(data.ownerPhone)}</a></p>`)
  }
  if (data.rescueUrl) {
    lines.push(
      `<p style="margin:20px 0"><a href="${escapeHtml(data.rescueUrl)}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Voir la fiche secours</a></p>`,
    )
  }
  lines.push(
    `<p style="color:#64748b;font-size:13px">Merci de contacter le propriétaire ou un vétérinaire dans les plus brefs délais.</p>`,
    `<p style="color:#94a3b8;font-size:12px;margin-top:24px">SécurPats — ${escapeHtml(data.appUrl)}</p>`,
  )

  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">${lines.join('\n')}</div>`
}

export function buildConfirmRequestEmailHtml(data: {
  referentFirstName: string
  petName: string
  ownerName: string
  description: string
  confirmUrl: string
  appUrl: string
}): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <p>Bonjour <strong>${escapeHtml(data.referentFirstName)}</strong>,</p>
    <p>Une <strong style="color:#dc2626">urgence animale</strong> a été signalée pour <strong>${escapeHtml(data.petName)}</strong> (propriétaire : ${escapeHtml(data.ownerName)}).</p>
    <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:14px 16px;border-radius:8px;margin:16px 0">
      <p style="margin:0;font-weight:700;color:#9a3412">Confirmation requise</p>
      <p style="margin:8px 0 0;color:#1e293b">${escapeHtml(data.description || 'Situation d\'urgence — détails sur la fiche secours.')}</p>
    </div>
    <p>Pouvez-vous prendre en charge l&apos;animal ? Cliquez pour confirmer :</p>
    <p style="margin:20px 0">
      <a href="${escapeHtml(data.confirmUrl)}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:800">Je confirme — je prends en charge</a>
    </p>
    <p style="color:#64748b;font-size:13px">Dès votre confirmation, la procédure d&apos;urgence SécurPats sera activée et tous les référents seront alertés.</p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">SécurPats — ${escapeHtml(data.appUrl)}</p>
  </div>`
}

export async function notifyReferentsFullEmergency(
  referents: ReferentContact[],
  data: {
    ownerName: string
    ownerPhone?: string
    petName: string
    petSpecies?: string
    petAllergies?: string
    vetLine?: string
    description: string
    rescueUrl?: string
    appUrl: string
  },
): Promise<{ emailsSent: number; smsSent: number; results: NotifyResult[] }> {
  const subject = `🚨 Urgence confirmée — ${data.petName}`
  const smsBody = `SécurPats — Urgence CONFIRMÉE pour ${data.petName}. ${data.description.slice(0, 100)}${data.description.length > 100 ? '…' : ''}${data.ownerPhone ? ` Tel: ${data.ownerPhone}` : ''}${data.rescueUrl ? ` ${data.rescueUrl}` : ''}`

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
      const html = buildEmergencyEmailHtml({
        referentFirstName: ref.firstName,
        petName: data.petName,
        petSpecies: data.petSpecies,
        petAllergies: data.petAllergies,
        vetLine: data.vetLine,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        description: data.description,
        rescueUrl: data.rescueUrl,
        appUrl: data.appUrl,
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
      smsError = 'Numéro invalide'
    } else {
      smsError = 'Téléphone manquant'
    }

    results.push({ name, email: email || '', phone: ref.phone || '', emailSent, smsSent: smsSentForRef, emailError, smsError })
  }

  return { emailsSent, smsSent, results }
}
