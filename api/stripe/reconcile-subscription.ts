import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../lib/verify-auth.js'
import { getSupabaseAdmin, upsertOwnerSubscription, PLAN_PRICES } from '../lib/supabase-admin.js'

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().split('T')[0]
}

/** Active l'abonnement si des factures payées existent sans subscription active (rattrapage). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' })
  }

  const auth = await verifyRequestUser(req.headers.authorization, userId, '')
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase admin non configuré' })
  }

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', userId)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingSub?.status === 'active' || existingSub?.status === 'trialing') {
    return res.status(200).json({ activated: true, alreadyActive: true })
  }

  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('owner_id', userId)
    .eq('status', 'paid')
    .order('date', { ascending: false })
    .limit(1)

  const latest = paidInvoices?.[0]
  if (!latest) {
    return res.status(404).json({ error: 'Aucune facture payée trouvée' })
  }

  const plan = latest.plan === 'yearly' ? 'yearly' : 'monthly'
  const startDate = latest.date
  const renewalDate = plan === 'yearly' ? addYears(startDate, 1) : addMonths(startDate, 1)

  await upsertOwnerSubscription({
    ownerId: userId,
    plan,
    status: 'active',
    startDate,
    renewalDate,
    autoRenew: true,
    stripeCustomerId: existingSub?.stripe_customer_id ?? null,
    stripeSubscriptionId: existingSub?.stripe_subscription_id ?? null,
  })

  return res.status(200).json({
    activated: true,
    plan,
    status: 'active',
    price: PLAN_PRICES[plan],
    startDate,
    renewalDate,
  })
}
