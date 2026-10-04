import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../server/lib/cors.js'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '../../server/lib/verify-admin.js'
import { deleteUserData } from '../../server/lib/delete-user-data.js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAdmin(req.headers.authorization)
  if (auth.valid === false) {
    return res.status(403).json({ error: auth.error })
  }

  const action = typeof req.body?.action === 'string' ? req.body.action.trim() : 'delete'
  const admin = getAdminClient()
  if (!admin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante' })
  }

  // Liste complète des profils (service role → pas de filtre RLS)
  if (action === 'list') {
    try {
      const { data, error } = await admin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const users = (data || []).map((row) => ({
        id: row.id as string,
        email: String(row.email || ''),
        firstName: String(row.first_name || ''),
        lastName: String(row.last_name || ''),
        phone: String(row.phone || ''),
        address: String(row.address || ''),
        birthDate: (row.birth_date as string | null) || undefined,
        role: row.role as string,
        avatar: (row.avatar_url as string | null) || undefined,
        createdAt: String(row.created_at || '').split('T')[0],
        twoFactorEnabled: Boolean(row.two_factor_enabled),
        consentAcceptedAt: (row.consent_accepted_at as string | null) || undefined,
        consentVersion: (row.consent_version as string | null) || undefined,
        marketingOptIn: (row.marketing_opt_in as boolean | null) || undefined,
        qrToken: (row.qr_token as string | null) || undefined,
        mustChangePassword: Boolean(row.must_change_password),
        idDocument: (row.id_document_path as string | null) || undefined,
        proofOfAddress: (row.proof_of_address_path as string | null) || undefined,
        identityVerified: Boolean(row.identity_verified),
        identityVerifiedAt: (row.identity_verified_at as string | null) || undefined,
      }))

      const counts = {
        total: users.length,
        owner: users.filter(u => u.role === 'owner').length,
        petsitter: users.filter(u => u.role === 'petsitter').length,
        foster_family: users.filter(u => u.role === 'foster_family').length,
        volunteer: users.filter(u => u.role === 'volunteer').length,
        admin: users.filter(u => u.role === 'admin').length,
      }

      return res.status(200).json({ users, counts })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur liste utilisateurs'
      return res.status(500).json({ error: message })
    }
  }

  const targetUserId = typeof req.body?.targetUserId === 'string' ? req.body.targetUserId : ''
  if (!targetUserId) {
    return res.status(400).json({ error: 'targetUserId requis' })
  }

  if (targetUserId === auth.userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte admin depuis cette page.' })
  }

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
