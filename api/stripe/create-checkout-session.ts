import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../../server/lib/verify-auth.js'
import { stripePostForm } from '../../server/lib/stripe-api.js'
import { arePaymentsBlockedOnServer } from '../../server/lib/site-settings.js'
import {
  SHOP_PRODUCT_PRICES,
  shippingCentsForSubtotal,
} from '../../server/lib/shop-catalog.js'

type CheckoutSessionResponse = {
  id: string
  url: string | null
}

type CartLine = { productId: string; quantity: number }

async function createShopSession(
  req: VercelRequest,
  res: VercelResponse,
  appUrl: string,
) {
  const items = (req.body?.items ?? []) as CartLine[]
  const customerEmail = typeof req.body?.customerEmail === 'string' ? req.body.customerEmail.trim() : ''

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Panier vide' })
  }

  const fields: Record<string, string> = {
    mode: 'payment',
    'payment_method_types[0]': 'card',
    success_url: `${appUrl}/boutique/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/boutique/panier?canceled=1`,
    'metadata[source]': 'shop',
    allow_promotion_codes: 'true',
    billing_address_collection: 'required',
    'shipping_address_collection[allowed_countries][0]': 'FR',
    'shipping_address_collection[allowed_countries][1]': 'BE',
    'shipping_address_collection[allowed_countries][2]': 'LU',
    'shipping_address_collection[allowed_countries][3]': 'CH',
    locale: 'fr',
  }

  if (customerEmail) fields.customer_email = customerEmail

  let lineIndex = 0
  let subtotal = 0

  for (const line of items) {
    const qty = Math.min(Math.max(Number(line.quantity) || 0, 0), 20)
    if (!qty || !line.productId) continue
    const product = SHOP_PRODUCT_PRICES[line.productId]
    if (!product) {
      return res.status(400).json({ error: `Produit inconnu : ${line.productId}` })
    }
    subtotal += product.priceCents * qty
    fields[`line_items[${lineIndex}][price_data][currency]`] = 'eur'
    fields[`line_items[${lineIndex}][price_data][unit_amount]`] = String(product.priceCents)
    fields[`line_items[${lineIndex}][price_data][product_data][name]`] = product.name
    fields[`line_items[${lineIndex}][quantity]`] = String(qty)
    lineIndex++
  }

  if (lineIndex === 0) {
    return res.status(400).json({ error: 'Aucun article valide' })
  }

  const shipping = shippingCentsForSubtotal(subtotal)
  if (shipping > 0) {
    fields[`line_items[${lineIndex}][price_data][currency]`] = 'eur'
    fields[`line_items[${lineIndex}][price_data][unit_amount]`] = String(shipping)
    fields[`line_items[${lineIndex}][price_data][product_data][name]`] = 'Livraison France / Benelux / Suisse'
    fields[`line_items[${lineIndex}][quantity]`] = '1'
  }

  const session = await stripePostForm<CheckoutSessionResponse>('/checkout/sessions', fields)
  return res.status(200).json({ sessionId: session.id, url: session.url })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
