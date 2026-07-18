import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { verifyAdmin } from '../../server/lib/verify-admin.js'

function generateTempPassword(): string {
  // 12 caractères lisibles, sans ambiguïté (pas 0/O/l/1)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = randomBytes(12)
  let out = ''
  for (let i = 0; i < 12; i++) out += alphabet[bytes[i]! % alphabet.length]
  return out
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req.headers.authorization)
  if (auth.valid === false) {
    return res.status(403).json({ error: auth.error })
  }

  const targetUserId = typeof req.body?.targetUserId === 'string' ? req.body.targetUserId : ''
  const customPassword = typeof req.body?.password === 'string' ? req.body.password.trim() : ''

  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId requis' })
  }

  if (customPassword && customPassword.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' })
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Réinitialisation serveur non configurée (SERVICE_ROLE_KEY)' })
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: target, error: profileErr } = await admin
    .from('profiles')
    .select('id, email, role, first_name, last_name')
    .eq('id', targetUserId)
    .maybeSingle()

  if (profileErr || !target) {
    return res.status(404).json({ error: 'Utilisateur introuvable' })
  }

  if (target.role === 'admin') {
    return res.status(403).json({ error: 'Impossible de réinitialiser un compte administrateur ici.' })
  }

  if (target.role !== 'owner' && target.role !== 'petsitter' && target.role !== 'foster_family' && target.role !== 'volunteer') {
    return res.status(400).json({ error: 'Rôle non supporté' })
  }

  const newPassword = customPassword || generateTempPassword()

  const { error: updateErr } = await admin.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  })

  if (updateErr) {
    return res.status(500).json({ error: updateErr.message || 'Échec de la réinitialisation' })
  }

  await admin
    .from('profiles')
    .update({ must_change_password: true })
    .eq('id', targetUserId)

  return res.status(200).json({
    success: true,
    email: target.email,
    role: target.role,
    name: `${target.first_name || ''} ${target.last_name || ''}`.trim(),
    temporaryPassword: newPassword,
    note: 'Le mot de passe précédent ne peut pas être récupéré (il est chiffré). Notez ce mot de passe temporaire puis communiquez-le au client de façon sécurisée. À la connexion, un changement de mot de passe sera exigé.',
  })
}
