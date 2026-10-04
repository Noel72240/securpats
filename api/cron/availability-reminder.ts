import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../../server/lib/supabase-admin.js'
import { sendEmail, escapeHtml } from '../../server/lib/emergency-notify.js'

const INTERVAL_MS = 15 * 24 * 60 * 60 * 1000
const BATCH_LIMIT = 40
const TARGET_ROLES = ['petsitter', 'foster_family', 'volunteer'] as const

function roleLabel(role: string): string {
  if (role === 'petsitter') return 'pet-sitter'
  if (role === 'foster_family') return 'famille d’accueil'
  if (role === 'volunteer') return 'bénévole'
  return 'aidant'
}

function availPath(role: string): string {
  if (role === 'petsitter') return '/pet-sitter/disponibilites'
  return '/aidant/disponibilites'
}

function buildHtml(firstName: string, role: string, availUrl: string, replyEmail: string) {
  const name = firstName.trim() || 'Bonjour'
  const greeting = firstName.trim() ? `Bonjour ${escapeHtml(firstName.trim())},` : 'Bonjour,'
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:560px;margin:0 auto">
      <h1 style="font-size:18px;color:#0f766e;margin:0 0 16px">Confirmation de vos disponibilités</h1>
      <p>${greeting}</p>
      <p>
        Dans le cadre du bon fonctionnement de SécurPats, nous vous remercions de bien vouloir
        confirmer vos disponibilités pour les deux semaines à venir
        (${escapeHtml(roleLabel(role))}).
      </p>
      <p>Merci de nous indiquer :</p>
      <ul>
        <li>Vos jours et horaires de disponibilité.</li>
        <li>Si vous êtes momentanément indisponible (vacances, déplacement, arrêt d’activité, etc.).</li>
        <li>Toute modification de vos coordonnées ou de votre secteur d’intervention.</li>
      </ul>
      <p>
        Même si votre disponibilité n’a pas changé, nous vous remercions de répondre à ce message
        en indiquant simplement <strong>« Je confirme mes disponibilités »</strong>. Cela nous permet
        de maintenir des informations à jour et d’assurer une prise en charge rapide des animaux
        en cas d’urgence.
      </p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(availUrl)}"
           style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">
          Mettre à jour mes disponibilités
        </a>
      </p>
      <p style="font-size:14px;color:#475569">
        Vous pouvez aussi répondre directement à cet email
        (${escapeHtml(replyEmail || 'contact@securpats.fr')}).
      </p>
      <p>
        Si nous ne recevons aucune réponse après plusieurs relances, votre profil pourra être
        temporairement désactivé jusqu’à la confirmation de vos disponibilités.
      </p>
      <p>
        Nous vous remercions pour votre engagement auprès de SécurPats et pour votre participation
        à la sécurité et au bien-être des animaux.
      </p>
      <p style="margin-top:24px">L’équipe SécurPats</p>
      <p style="font-size:12px;color:#94a3b8;margin-top:28px">
        Message automatique tous les 15 jours — ${escapeHtml(name)}
      </p>
    </div>
  `
}

function authorize(req: VercelRequest): boolean {
  // Appels planifiés Vercel
  if (req.headers['x-vercel-cron'] === '1') return true

  const cronSecret = process.env.CRON_SECRET?.trim()
  if (cronSecret) {
    const auth = req.headers.authorization || ''
    if (auth === `Bearer ${cronSecret}`) return true
    const header = req.headers['x-cron-secret']
    if (typeof header === 'string' && header === cronSecret) return true
  }

  // Manuel / local hors production
  return process.env.VERCEL_ENV !== 'production'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!authorize(req)) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return res.status(503).json({ error: 'Supabase admin non configuré' })
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'RESEND_API_KEY manquante' })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
  const replyTo = (process.env.RESEND_REPLY_TO || process.env.RESEND_FROM_EMAIL || 'contact@securpats.fr')
    .replace(/.*<([^>]+)>.*/, '$1')
    .trim()

  const cutoffMs = Date.now() - INTERVAL_MS

  const { data: rows, error } = await admin
    .from('profiles')
    .select('id, email, first_name, role, last_availability_reminder_at')
    .in('role', [...TARGET_ROLES])
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('[availability-reminder] fetch error', error)
    return res.status(500).json({ error: error.message })
  }

  const candidates = (rows || [])
    .filter(r => r.email && String(r.email).includes('@'))
    .filter(r => {
      const last = r.last_availability_reminder_at
      if (!last) return true
      const t = new Date(String(last)).getTime()
      return Number.isFinite(t) && t < cutoffMs
    })
    .slice(0, BATCH_LIMIT)
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const row of candidates) {
    const email = String(row.email).trim().toLowerCase()
    const role = String(row.role || 'volunteer')
    const firstName = String(row.first_name || '')
    const availUrl = `${appUrl}${availPath(role)}`
    const html = buildHtml(firstName, role, availUrl, replyTo)

    const result = await sendEmail(
      email,
      'SécurPats — confirmez vos disponibilités (15 jours)',
      html,
      { replyTo },
    )

    if (result.sent) {
      sent += 1
      const { error: updErr } = await admin
        .from('profiles')
        .update({ last_availability_reminder_at: new Date().toISOString() })
        .eq('id', row.id)
      if (updErr) {
        console.error('[availability-reminder] stamp failed', row.id, updErr.message)
      }
    } else {
      failed += 1
      if (errors.length < 5) errors.push(`${email}: ${result.error || 'échec'}`)
    }
  }

  console.info('[availability-reminder]', { candidates: candidates.length, sent, failed })

  return res.status(200).json({
    ok: true,
    intervalDays: 15,
    due: candidates.length,
    sent,
    failed,
    errors: errors.length ? errors : undefined,
  })
}
