import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyRequestUser } from '../lib/verify-auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyRequestUser(
    req.headers.authorization,
    req.body?.userId,
    req.body?.email
  )

  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
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
    const userId = auth.userId

    await admin.from('activities').delete().eq('owner_id', userId)
    await admin.from('documents').delete().eq('owner_id', userId)
    await admin.from('referents').delete().eq('owner_id', userId)
    await admin.from('pets').delete().eq('owner_id', userId)
    await admin.from('invoices').delete().eq('owner_id', userId)
    await admin.from('subscriptions').delete().eq('owner_id', userId)
    await admin.from('missions').delete().eq('owner_id', userId)
    await admin.from('petsitter_profiles').delete().eq('user_id', userId)
    await admin.from('profiles').delete().eq('id', userId)

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur suppression'
    return res.status(500).json({ error: message })
  }
}
