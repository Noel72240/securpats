import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import { getSupabaseAdmin, upsertOwnerSubscription, PLAN_PRICES } from '../../server/lib/supabase-admin.js'

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

  const { userId, planType } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' })
  }

  const expectedPlan = planType === 'petsitter_vip' ? 'petsitter_vip' : null

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

  const latest = expectedPlan
    ? paidInvoices?.find(i => i.plan === expectedPlan)
    : paidInvoices?.[0]
  if (!latest) {
    return res.status(404).json({ error: 'Aucune facture payée trouvée' })
  }

  const plan = latest.plan === 'yearly' ? 'yearly' : latest.plan === 'petsitter_vip' ? 'petsitter_vip' : 'monthly'
  const startDate = latest.date
  const renewalDate = plan === 'yearly' ? addYears(startDate, 1) : addMonths(startDate, 1)

  const upsert = await upsertOwnerSubscription({
    ownerId: userId,
    plan,
    status: 'active',
    startDate,
    renewalDate,
    autoRenew: true,
    stripeCustomerId: existingSub?.stripe_customer_id ?? null,
    stripeSubscriptionId: existingSub?.stripe_subscription_id ?? null,
  })

  if (!upsert.ok) {
    return res.status(500).json({ error: upsert.error || 'Impossible d\'activer l\'abonnement' })
  }

  return res.status(200).json({
    activated: true,
    plan,
    status: 'active',
    price: PLAN_PRICES[plan],
    startDate,
    renewalDate,
  })
}
