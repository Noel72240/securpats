import type Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { insertOwnerInvoice, upsertOwnerSubscription, PLAN_PRICES } from '../../server/lib/supabase-admin.js'
import { getInvoicePlanMetadata, getInvoiceUserId, getSubscriptionPeriodEnd } from '../../server/lib/stripe-helpers.js'
import { getStripeClient } from '../../server/lib/stripe-client.js'
import { stripeGet } from '../../server/lib/stripe-api.js'

export const config = {
  api: { bodyParser: false },
}

function getStripe() {
  return getStripeClient()
}

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function planFromMetadata(metadata: Stripe.Metadata | null | undefined): keyof typeof PLAN_PRICES {
  if (metadata?.plan === 'yearly') return 'yearly'
  if (metadata?.plan === 'petsitter_vip') return 'petsitter_vip'
  return 'monthly'
}

function renewalDaysForPlan(plan: keyof typeof PLAN_PRICES): number {
  return plan === 'yearly' ? 365 : 30
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toISOString().split('T')[0]
}

async function syncCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const plan = planFromMetadata(session.metadata)
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
  let renewalDate = new Date(Date.now() + renewalDaysForPlan(plan) * 86400000).toISOString().split('T')[0]
  let autoRenew = true

  if (subscriptionId) {
    const sub = await stripeGet<Stripe.Subscription>(`/subscriptions/${subscriptionId}`)
    renewalDate = formatDate(getSubscriptionPeriodEnd(sub))
    autoRenew = !sub.cancel_at_period_end
  }

  await upsertOwnerSubscription({
    ownerId: userId,
    plan,
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate,
    autoRenew,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
    stripeSubscriptionId: subscriptionId,
  })
}

async function syncSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  const plan = planFromMetadata(subscription.metadata)
  const statusMap: Record<string, 'active' | 'cancelled' | 'past_due' | 'trialing'> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
  }
  const status = statusMap[subscription.status] ?? 'active'

  await upsertOwnerSubscription({
    ownerId: userId,
    plan,
    status,
    startDate: formatDate(subscription.start_date),
    renewalDate: formatDate(getSubscriptionPeriodEnd(subscription)),
    autoRenew: !subscription.cancel_at_period_end && status === 'active',
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
  })
}

async function syncInvoice(invoice: Stripe.Invoice, status: 'paid' | 'failed') {
  const userId = getInvoiceUserId(invoice)

  if (!userId) return

  const plan = planFromMetadata(getInvoicePlanMetadata(invoice))

  await insertOwnerInvoice({
    ownerId: userId,
    amount: (invoice.amount_paid || invoice.amount_due) / 100,
    date: formatDate(invoice.created),
    status,
    plan,
    stripeInvoiceId: invoice.id,
  })

  if (status === 'paid') {
    const invoiceSub = (invoice as Stripe.Invoice & { subscription?: string | { id?: string } | null }).subscription
    const subscriptionId = typeof invoiceSub === 'string' ? invoiceSub : invoiceSub?.id

    let renewalDate = formatDate(invoice.created + renewalDaysForPlan(plan) * 86400)
    let stripeCustomerId: string | null | undefined = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id

    if (subscriptionId) {
      try {
        const sub = await stripeGet<Stripe.Subscription>(`/subscriptions/${subscriptionId}`)
        renewalDate = formatDate(getSubscriptionPeriodEnd(sub))
        stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
      } catch {
        // fallback renewalDate above
      }
    }

    await upsertOwnerSubscription({
      ownerId: userId,
      plan,
      status: 'active',
      startDate: formatDate(invoice.created),
      renewalDate,
      autoRenew: true,
      stripeCustomerId,
      stripeSubscriptionId: subscriptionId ?? null,
    })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Webhook Stripe non configuré' })
  }

  const sig = req.headers['stripe-signature']
  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Signature manquante' })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature invalide'
    return res.status(400).json({ error: message })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await syncCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await syncSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await syncSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      case 'invoice.paid':
        await syncInvoice(event.data.object as Stripe.Invoice, 'paid')
        break
      case 'invoice.payment_failed':
        await syncInvoice(event.data.object as Stripe.Invoice, 'failed')
        break
      default:
        break
    }
  } catch (err) {
    console.error('[Stripe webhook]', event.type, err)
  }

  return res.status(200).json({ received: true })
}
