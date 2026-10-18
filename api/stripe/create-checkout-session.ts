import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../server/lib/cors.js'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import { stripePostForm } from '../../server/lib/stripe-api.js'
import { arePaymentsBlockedOnServer } from '../../server/lib/site-settings.js'
import { resolveShopLinePrices, shippingCentsForParcel } from '../../server/lib/shop-prices.js'
import { saveShopCheckoutIntent } from '../../server/lib/shop-stock.js'
import {
  getParcelSize,
  isRelaySearchConfigured,
  isValidParcelSizeId,
  searchRelayPoints,
  type ParcelSizeId,
  type RelayPoint,
} from '../../server/lib/mondial-relay.js'

type CheckoutSessionResponse = {
  id: string
  url: string | null
}

type CartLine = { productId: string; quantity: number; size?: string }

async function handleRelayPointsSearch(req: VercelRequest, res: VercelResponse) {
  const postalCode = typeof req.body?.postalCode === 'string' ? req.body.postalCode : ''
  const country = typeof req.body?.country === 'string' ? req.body.country : 'FR'
  const parcelSizeId = isValidParcelSizeId(req.body?.parcelSize) ? req.body.parcelSize : 'moyen'

  const result = await searchRelayPoints({ postalCode, country, parcelSizeId })
  if (!result.ok) {
    return res.status(400).json({ error: result.error })
  }
  if (!result.configured) {
    return res.status(200).json({
      configured: false,
      points: [],
      message: result.message,
    })
  }
  return res.status(200).json({ configured: true, points: result.points })
}

async function createShopSession(
  req: VercelRequest,
  res: VercelResponse,
  appUrl: string,
) {
  const items = (req.body?.items ?? []) as CartLine[]
  const customerEmail = typeof req.body?.customerEmail === 'string' ? req.body.customerEmail.trim() : ''
  const relayPoint = req.body?.relayPoint as Partial<RelayPoint> | undefined

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Panier vide' })
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    return res.status(400).json({ error: 'E-mail obligatoire pour recevoir la facture et vos téléchargements' })
  }

  const resolved = await resolveShopLinePrices(items)
  if (!resolved.ok) {
    return res.status(400).json({ error: resolved.error })
  }

  const requiresShipping = resolved.requiresShipping

  if (requiresShipping && isRelaySearchConfigured()) {
    const relayId = typeof relayPoint?.id === 'string' ? relayPoint.id.trim() : ''
    if (!relayId) {
      return res.status(400).json({ error: 'Sélectionnez un Point Relais Mondial Relay' })
    }
  }

  // Taille colis = max des produits physiques (admin) — jamais confiance au client
  const parcelSizeId: ParcelSizeId = resolved.parcelSize
  const parcel = getParcelSize(parcelSizeId)!

  const hasRelay = requiresShipping && typeof relayPoint?.id === 'string' && relayPoint.id.trim().length > 0

  const fields: Record<string, string> = {
    mode: 'payment',
    'payment_method_types[0]': 'card',
    success_url: `${appUrl}/boutique/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/boutique/panier?canceled=1`,
    'metadata[source]': 'shop',
    'metadata[delivery]': requiresShipping ? 'mondial_relay' : 'digital',
    allow_promotion_codes: 'true',
    billing_address_collection: 'required',
    locale: 'fr',
    customer_email: customerEmail,
    // Facture Stripe automatique + e-mail au client
    'invoice_creation[enabled]': 'true',
    'invoice_creation[invoice_data][description]': 'Commande boutique SécurPats',
    'invoice_creation[invoice_data][footer]': 'Merci pour votre commande — SécurPats',
    'invoice_creation[invoice_data][metadata][source]': 'shop',
    // Reçu de paiement (filet si la facture n’est pas encore envoyée)
    'payment_intent_data[receipt_email]': customerEmail,
  }
  if (requiresShipping) {
    fields['metadata[shipping_carrier]'] = 'mondial_relay'
    fields['metadata[parcel_size]'] = parcelSizeId
    fields['metadata[mr_action]'] = parcel.mrAction

    if (!hasRelay) {
      fields['shipping_address_collection[allowed_countries][0]'] = 'FR'
      fields['shipping_address_collection[allowed_countries][1]'] = 'BE'
      fields['shipping_address_collection[allowed_countries][2]'] = 'LU'
      fields['shipping_address_collection[allowed_countries][3]'] = 'CH'
    } else {
      fields['metadata[mr_relay_id]'] = relayPoint!.id!.trim()
      if (relayPoint?.name) fields['metadata[mr_relay_name]'] = String(relayPoint.name).slice(0, 80)
      if (relayPoint?.city) fields['metadata[mr_relay_city]'] = String(relayPoint.city).slice(0, 40)
      if (relayPoint?.postalCode) fields['metadata[mr_relay_cp]'] = String(relayPoint.postalCode).slice(0, 10)
      if (relayPoint?.address) fields['metadata[mr_relay_address]'] = String(relayPoint.address).slice(0, 120)
      if (relayPoint?.country) fields['metadata[mr_relay_country]'] = String(relayPoint.country).slice(0, 2)
    }
  }

  let lineIndex = 0
  let subtotal = 0

  for (const line of resolved.lines) {
    subtotal += line.priceCents * line.quantity
    fields[`line_items[${lineIndex}][price_data][currency]`] = 'eur'
    fields[`line_items[${lineIndex}][price_data][unit_amount]`] = String(line.priceCents)
    fields[`line_items[${lineIndex}][price_data][product_data][name]`] = line.name
    fields[`line_items[${lineIndex}][quantity]`] = String(line.quantity)
    lineIndex++
  }

  if (requiresShipping) {
    const shipping = shippingCentsForParcel(subtotal, parcelSizeId)
    if (shipping > 0) {
      const shippingLabel = hasRelay
        ? `Livraison Mondial Relay — ${parcel.label}`
        : `Livraison Mondial Relay — ${parcel.label} (Point Relais à confirmer)`
      fields[`line_items[${lineIndex}][price_data][currency]`] = 'eur'
      fields[`line_items[${lineIndex}][price_data][unit_amount]`] = String(shipping)
      fields[`line_items[${lineIndex}][price_data][product_data][name]`] = shippingLabel
      fields[`line_items[${lineIndex}][quantity]`] = '1'
    }
  }
  const session = await stripePostForm<CheckoutSessionResponse>('/checkout/sessions', fields)

  const intent = await saveShopCheckoutIntent({
    stripeSessionId: session.id,
    customerEmail: customerEmail || undefined,
    items: resolved.lines.map(line => ({
      id: line.productId,
      q: line.quantity,
      s: line.size || undefined,
    })),
  })
  if (!intent.ok) {
    console.error('[shop checkout intent]', intent.error)
  }

  return res.status(200).json({ sessionId: session.id, url: session.url })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Recherche Point Relais — pas besoin de Stripe
  if (req.body?.action === 'relay-points') {
    try {
      return await handleRelayPointsSearch(req, res)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur Mondial Relay'
      console.error('[Mondial Relay search]', message)
      return res.status(500).json({ error: message })
    }
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurée' })
  }

  if (await arePaymentsBlockedOnServer()) {
    return res.status(503).json({
      error: 'Les paiements sont temporairement suspendus (maintenance). Réessayez ultérieurement.',
    })
  }

  const appUrl = (process.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')

  try {
    if (req.body?.mode === 'shop') {
      return await createShopSession(req, res, appUrl)
    }

    const { priceId, plan, userId, customerEmail, successUrl, cancelUrl } = req.body

    if (!priceId || !plan || !userId || !customerEmail) {
      return res.status(400).json({ error: 'Paramètres manquants' })
    }

    const auth = await verifyRequestUser(req.headers.authorization, userId, customerEmail)
    if (auth.valid === false) {
      return res.status(401).json({ error: auth.error })
    }

    const session = await stripePostForm<CheckoutSessionResponse>('/checkout/sessions', {
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      customer_email: customerEmail,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl || `${appUrl}/app/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${appUrl}/app/abonnement?canceled=1`,
      'metadata[userId]': userId,
      'metadata[plan]': plan,
      'subscription_data[metadata][userId]': userId,
      'subscription_data[metadata][plan]': plan,
      allow_promotion_codes: 'true',
      billing_address_collection: 'auto',
    })

    return res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    console.error('[Stripe checkout]', message)
    return res.status(500).json({ error: message })
  }
}
