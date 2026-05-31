import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}

export const PLAN_PRICES = { monthly: 4.99, yearly: 49.99 } as const

type Plan = keyof typeof PLAN_PRICES
type SubStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

export async function upsertOwnerSubscription(data: {
  ownerId: string
  plan: Plan
  status: SubStatus
  startDate: string
  renewalDate: string
  autoRenew: boolean
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase || !data.ownerId) {
    return { ok: false, error: 'Supabase admin non configuré' }
  }

  const row = {
    owner_id: data.ownerId,
    plan: data.plan,
    status: data.status,
    price: PLAN_PRICES[data.plan],
    start_date: data.startDate,
    renewal_date: data.renewalDate,
    auto_renew: data.autoRenew,
    stripe_customer_id: data.stripeCustomerId ?? null,
    stripe_subscription_id: data.stripeSubscriptionId ?? null,
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('owner_id', data.ownerId)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const write = async (payload: typeof row) => {
    if (existing?.id) {
      return supabase.from('subscriptions').update(payload).eq('id', existing.id)
    }
    return supabase.from('subscriptions').insert(payload)
  }

  let { error } = await write(row)

  if (error?.code === '23505' && row.stripe_subscription_id) {
    ;({ error } = await write({ ...row, stripe_subscription_id: null }))
  }

  if (error) {
    console.error('[upsertOwnerSubscription]', error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function insertOwnerInvoice(data: {
  ownerId: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'failed'
  plan: Plan
  stripeInvoiceId?: string | null
}) {
  const supabase = getSupabaseAdmin()
  if (!supabase || !data.ownerId) return

  if (data.stripeInvoiceId) {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', data.stripeInvoiceId)
      .maybeSingle()
    if (existing) return
  }

  await supabase.from('invoices').insert({
    owner_id: data.ownerId,
    amount: data.amount,
    date: data.date,
    status: data.status,
    plan: data.plan,
    stripe_invoice_id: data.stripeInvoiceId ?? null,
  })
}
