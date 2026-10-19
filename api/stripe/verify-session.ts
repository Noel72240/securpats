import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../server/lib/cors.js'
import { getSubscriptionPeriodEnd } from '../../server/lib/stripe-helpers.js'
import { stripeGet } from '../../server/lib/stripe-api.js'
import { upsertOwnerSubscription, PLAN_PRICES } from '../../server/lib/supabase-admin.js'
import { applyShopStockForPaidSession } from '../../server/lib/shop-stock.js'
import {
  createDigitalSignedDownloadUrl,
  fulfillShopDigitalPurchases,
  getDigitalDownloadMeta,
  listDigitalDownloadsForSession,
} from '../../server/lib/shop-digital.js'

type Plan = keyof typeof PLAN_PRICES

function planFromMetadata(plan?: string): Plan {
  if (plan === 'yearly') return 'yearly'
  if (plan === 'petsitter_vip') return 'petsitter_vip'
  return 'monthly'
}

function renewalDaysForPlan(plan: Plan): number {
  return plan === 'yearly' ? 365 : 30
}

type StripeSubscription = {
  id: string
  cancel_at_period_end: boolean
  start_date: number
  current_period_end?: number
  items?: { data?: Array<{ current_period_end?: number }> }
}

type CheckoutSessionResponse = {
  payment_status: string
  status: string | null
  metadata?: { plan?: string; userId?: string; source?: string }
  customer: string | { id?: string } | null
  customer_email?: string | null
  customer_details?: { email?: string | null } | null
  subscription: string | StripeSubscription | null
}

function readToken(req: VercelRequest): string {
  if (typeof req.query.token === 'string') return req.query.token
  if (typeof req.body?.token === 'string') return req.body.token
  return ''
}

/** Ebook : métadonnées + URL signée (même fonction Vercel que verify-session). */
async function handleDigitalDownload(req: VercelRequest, res: VercelResponse) {
  const token = readToken(req)
  if (!token) {
    return res.status(400).json({ error: 'token requis' })
  }

  if (req.method === 'GET' && req.query.meta === '1') {
    const meta = await getDigitalDownloadMeta(token)
    if (meta.error && !meta.productName) {
      return res.status(404).json({ error: meta.error })
    }
    return res.status(200).json(meta)
  }

  if (req.method === 'GET' || req.method === 'POST') {
    const result = await createDigitalSignedDownloadUrl(token)
    if (!result.url) {
      return res.status(400).json({ error: result.error || 'Téléchargement impossible' })
    }
    if (req.query.redirect === '1') {
      res.setHeader('Location', result.url)
      return res.status(302).end()
    }
    return res.status(200).json({
      url: result.url,
      fileName: result.fileName,
      productName: result.productName,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  const isDigital =
    req.query.action === 'digital-download' ||
    req.body?.action === 'digital-download' ||
    !!readToken(req)

  if (isDigital) {
    return handleDigitalDownload(req, res)
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  const { sessionId } = req.body
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requis' })
  }

  try {
    const session = await stripeGet<CheckoutSessionResponse>(`/checkout/sessions/${sessionId}`, {
      'expand[0]': 'subscription',
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Paiement non confirmé' })
    }

    // Boutique : stock + ebooks (filet si le webhook n’a pas encore tourné)
    if (session.metadata?.source === 'shop') {
      await applyShopStockForPaidSession(sessionId)
      const email = session.customer_details?.email || session.customer_email || null
      const digital = await fulfillShopDigitalPurchases({
        stripeSessionId: sessionId,
        customerEmail: email,
      })
      const { downloads } = await listDigitalDownloadsForSession(sessionId)
      return res.status(200).json({
        ok: true,
        source: 'shop',
        downloads,
        digitalError: digital.error || null,
      })
    }

    const plan = planFromMetadata(session.metadata?.plan)
    const userId = session.metadata?.userId || ''
    const subscription = typeof session.subscription === 'object' ? session.subscription : null

    const renewalDate = subscription
      ? new Date(getSubscriptionPeriodEnd(subscription as Parameters<typeof getSubscriptionPeriodEnd>[0]) * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + renewalDaysForPlan(plan) * 86400000).toISOString().split('T')[0]

    const startDate = new Date().toISOString().split('T')[0]

    if (userId) {
      await upsertOwnerSubscription({
        ownerId: userId,
        plan,
        status: 'active',
        startDate,
        renewalDate,
        autoRenew: subscription?.cancel_at_period_end !== true,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
        stripeSubscriptionId: typeof session.subscription === 'string'
          ? session.subscription
          : subscription?.id ?? null,
      })
    }

    return res.status(200).json({
      userId,
      plan,
      status: 'active',
      price: PLAN_PRICES[plan],
      startDate,
      renewalDate,
      autoRenew: subscription?.cancel_at_period_end === false,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripeSubscriptionId: typeof session.subscription === 'string'
        ? session.subscription
        : subscription?.id ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur vérification session'
    return res.status(500).json({ error: message })
  }
}
