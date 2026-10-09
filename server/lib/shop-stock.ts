import { getSupabaseAdmin } from './supabase-admin.js'

export type ShopStockCartItem = {
  id: string
  q: number
  s?: string
}

/** Enregistre le panier lié à une session Stripe (pour décrémenter le stock au paiement). */
export async function saveShopCheckoutIntent(input: {
  stripeSessionId: string
  items: ShopStockCartItem[]
  customerEmail?: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false, error: 'Supabase admin non configuré' }

  const { error } = await supabase.from('shop_checkout_intents').upsert({
    stripe_session_id: input.stripeSessionId,
    items: input.items,
    customer_email: input.customerEmail || null,
    stock_applied: false,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/**
 * Applique le décrément de stock une seule fois pour une session payée.
 * Idempotent via stock_applied.
 */
export async function applyShopStockForPaidSession(stripeSessionId: string): Promise<{
  ok: boolean
  applied: boolean
  error?: string
}> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false, applied: false, error: 'Supabase admin non configuré' }
  if (!stripeSessionId) return { ok: false, applied: false, error: 'sessionId manquant' }

  const { data: intent, error: readErr } = await supabase
    .from('shop_checkout_intents')
    .select('stripe_session_id, items, stock_applied')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle()

  if (readErr) return { ok: false, applied: false, error: readErr.message }
  if (!intent) return { ok: true, applied: false }
  if (intent.stock_applied) return { ok: true, applied: false }

  const items = Array.isArray(intent.items) ? (intent.items as ShopStockCartItem[]) : []

  // Agrège les quantités par produit (plusieurs tailles = même stock produit)
  const byProduct = new Map<string, number>()
  for (const item of items) {
    const id = typeof item?.id === 'string' ? item.id : ''
    const q = Math.min(Math.max(Number(item?.q) || 0, 0), 99)
    if (!id || !q) continue
    byProduct.set(id, (byProduct.get(id) || 0) + q)
  }

  const productIds = [...byProduct.keys()]
  const { data: productRows } = await supabase
    .from('shop_products')
    .select('id, category')
    .in('id', productIds)
  const categoryById = new Map(
    ((productRows ?? []) as { id: string; category?: string | null }[]).map(p => [p.id, p.category ?? '']),
  )

  for (const [productId, qty] of byProduct) {
    // Produits numériques : pas de décrément de stock
    if (categoryById.get(productId) === 'produits-numeriques') continue

    const { data: ok, error: rpcErr } = await supabase.rpc('decrement_shop_stock', {
      p_product_id: productId,
      p_qty: qty,
    })
    if (rpcErr) {
      console.error('[shop stock] decrement failed', productId, qty, rpcErr.message)
      // On continue pour les autres lignes, puis on marque quand même appliqué
      // pour éviter une double tentative agressive. L'admin pourra corriger à la main.
    } else if (ok === false) {
      console.warn('[shop stock] stock insuffisant au moment du paiement', productId, qty)
    }
  }

  const { error: markErr } = await supabase
    .from('shop_checkout_intents')
    .update({ stock_applied: true, stock_applied_at: new Date().toISOString() })
    .eq('stripe_session_id', stripeSessionId)
    .eq('stock_applied', false)

  if (markErr) return { ok: false, applied: false, error: markErr.message }
  return { ok: true, applied: true }
}
