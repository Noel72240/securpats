import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '../lib/verify-admin.js'
import { deleteUserData } from '../lib/delete-user-data.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req.headers.authorization)
  if (auth.valid === false) {
    return res.status(403).json({ error: auth.error })
  }

  const targetUserId = typeof req.body?.targetUserId === 'string' ? req.body.targetUserId : ''
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId requis' })
  }

  if (targetUserId === auth.userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte admin depuis cette page.' })
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Suppression serveur non configurée' })
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: target } = await admin.from('profiles').select('role').eq('id', targetUserId).maybeSingle()
    if (!target) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }
    if (target.role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un compte administrateur' })
    }

    await deleteUserData(admin, targetUserId)
    return res.status(200).json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur suppression'
    return res.status(500).json({ error: message })
  }
}
