import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../../server/lib/supabase-admin.js'
import { sendEmail, escapeHtml } from '../../server/lib/emergency-notify.js'

const ALLOWED_ROLES = new Set(['owner', 'petsitter', 'foster_family', 'volunteer'])

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function loginPathForRole(role: string): string {
  if (role === 'petsitter') return '/pet-sitter/connexion'
  if (role === 'foster_family') return '/famille-accueil/connexion'
  if (role === 'volunteer') return '/benevole/connexion'
  return '/connexion'
}

function roleLabel(role: string): string {
  if (role === 'petsitter') return 'Pet-Sitter'
  if (role === 'foster_family') return 'famille d’accueil'
  if (role === 'volunteer') return 'bénévole'
  return 'propriétaire'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const action = str(req.body?.action)
  const email = str(req.body?.email).toLowerCase()

  // Renvoi email de bienvenue (même fonction pour rester sous la limite Hobby Vercel)
  if (action === 'resend-welcome') {
    if (!email) return res.status(400).json({ error: 'Email requis' })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Service non configuré' })

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, role, email')
      .eq('email', email)
      .maybeSingle()

    if (!profile) return res.status(404).json({ error: 'Compte introuvable' })

    const appUrl = (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
    const role = String(profile.role || 'owner')
    const loginUrl = `${appUrl}${loginPathForRole(role)}`
    const firstName = String(profile.first_name || '')

    const result = await sendEmail(
      email,
      'Bienvenue sur SécurPats — votre compte est prêt',
      `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto">
          <h1 style="font-size:20px;color:#0f766e">Bienvenue sur SécurPats</h1>
          <p>Bonjour ${escapeHtml(firstName)},</p>
          <p>Votre compte <strong>${escapeHtml(roleLabel(role))}</strong> est prêt.</p>
          <p style="margin:24px 0">
            <a href="${escapeHtml(loginUrl)}"
               style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">
              Se connecter
            </a>
          </p>
          <p style="font-size:13px;color:#64748b">— L’équipe SécurPats</p>
        </div>
      `,
    )

    if (!result.sent) {
      console.error('[auth/register] resend-welcome failed:', result.error)
      return res.status(502).json({ error: result.error || 'Échec envoi email' })
    }
    return res.status(200).json({ ok: true, emailSent: true })
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const firstName = str(req.body?.firstName)
  const lastName = str(req.body?.lastName)
  const phone = str(req.body?.phone)
  const role = str(req.body?.role) || 'owner'
  const consentAt = str(req.body?.consentAt) || new Date().toISOString()
  const consentVersion = str(req.body?.consentVersion)
  const marketingOptIn = Boolean(req.body?.marketingOptIn)

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Email, mot de passe, prénom et nom sont requis.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' })
  }
  if (!ALLOWED_ROLES.has(role)) {
    return res.status(400).json({ error: 'Rôle non autorisé.' })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return res.status(503).json({
      error: 'Inscription serveur indisponible (SUPABASE_SERVICE_ROLE_KEY manquante).',
      fallback: true,
    })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
      consent_accepted_at: consentAt,
      consent_version: consentVersion,
      marketing_opt_in: marketingOptIn,
    },
  })

  let userId = data.user?.id as string | undefined

  if (error || !userId) {
    const msg = error?.message || 'Inscription échouée'
    if (/already|registered|exists/i.test(msg)) {
      // Compte déjà créé (souvent non confirmé) → confirmer + MAJ MDP pour permettre la connexion
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id, role')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile?.id) {
        const { error: updateErr } = await admin.auth.admin.updateUserById(existingProfile.id, {
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone,
            role: existingProfile.role || role,
            consent_accepted_at: consentAt,
            consent_version: consentVersion,
            marketing_opt_in: marketingOptIn,
          },
        })
        if (updateErr) {
          return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' })
        }
        userId = existingProfile.id
      } else {
        return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' })
      }
    } else {
      return res.status(400).json({ error: msg })
    }
  }

  // S’assurer que le rôle profil est correct (trigger + secours)
  await admin.from('profiles').upsert({
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    role,
    consent_accepted_at: consentAt,
    consent_version: consentVersion,
    marketing_opt_in: marketingOptIn,
  }, { onConflict: 'id' })

  const appUrl = (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
  const loginUrl = `${appUrl}${loginPathForRole(role)}`

  // Await obligatoire sur Vercel : sinon la fonction se coupe avant l’envoi Resend
  const welcome = await sendEmail(
    email,
    'Bienvenue sur SécurPats — votre compte est prêt',
    `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto">
        <h1 style="font-size:20px;color:#0f766e">Bienvenue sur SécurPats</h1>
        <p>Bonjour ${escapeHtml(firstName)},</p>
        <p>Votre compte <strong>${escapeHtml(roleLabel(role))}</strong> a bien été créé.</p>
        <p>Vous pouvez vous connecter dès maintenant :</p>
        <p style="margin:24px 0">
          <a href="${escapeHtml(loginUrl)}"
             style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">
            Se connecter
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">Lien direct : ${escapeHtml(loginUrl)}</p>
        <p style="font-size:13px;color:#64748b">— L’équipe SécurPats</p>
      </div>
    `,
  )

  if (!welcome.sent) {
    console.error('[auth/register] welcome email failed:', welcome.error)
  }

  return res.status(200).json({
    ok: true,
    userId,
    email,
    role,
    emailSent: welcome.sent,
    emailError: welcome.sent ? undefined : welcome.error,
  })
}
