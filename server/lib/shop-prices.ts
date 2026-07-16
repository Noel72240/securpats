import { getSupabaseAdmin } from './supabase-admin.js'
import { SHOP_FREE_SHIPPING_FROM_CENTS, SHOP_SHIPPING_CENTS } from './shop-catalog.js'

export type ShopPriceRow = {
  id: string
  name: string
  price_cents: number
  active: boolean
  sizes_enabled: boolean
  sizes: string[] | null
}

export function shippingCentsForSubtotal(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  if (subtotalCents >= SHOP_FREE_SHIPPING_FROM_CENTS) return 0
  return SHOP_SHIPPING_CENTS
}

/** Prix boutique depuis la base (source de vérité). Fallback catalogue statique si table absente. */
export async function resolveShopLinePrices(
  items: { productId: string; quantity: number; size?: string }[],
): Promise<
  | { ok: true; lines: { productId: string; name: string; priceCents: number; quantity: number; size?: string }[] }
  | { ok: false; error: string }
> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { ok: false, error: 'Base boutique non configurée' }
  }

  const ids = [...new Set(items.map(i => i.productId).filter(Boolean))]
  if (ids.length === 0) return { ok: false, error: 'Panier vide' }

  const { data, error } = await supabase
    .from('shop_products')
    .select('id, name, price_cents, active, sizes_enabled, sizes')
    .in('id', ids)

  if (error) {
    // Table pas encore créée → fallback static map
    const { SHOP_PRODUCT_PRICES } = await import('./shop-catalog.js')
    const lines = []
    for (const item of items) {
      const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
      if (!qty) continue
      const p = SHOP_PRODUCT_PRICES[item.productId]
      if (!p) return { ok: false, error: `Produit inconnu : ${item.productId}` }
      lines.push({
        productId: item.productId,
        name: item.size ? `${p.name} — Taille ${item.size}` : p.name,
        priceCents: p.priceCents,
        quantity: qty,
        size: item.size,
      })
    }
    if (lines.length === 0) return { ok: false, error: 'Aucun article valide' }
    return { ok: true, lines }
  }

  const byId = new Map((data as ShopPriceRow[]).map(r => [r.id, r]))
  const lines = []

  for (const item of items) {
    const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
    if (!qty || !item.productId) continue
    const product = byId.get(item.productId)
    if (!product || !product.active) {
      return { ok: false, error: `Produit indisponible : ${item.productId}` }
    }
    if (product.sizes_enabled) {
      const allowed = product.sizes ?? []
      if (!item.size || !allowed.includes(item.size)) {
        return { ok: false, error: `Taille requise pour ${product.name}` }
      }
    }
    lines.push({
      productId: product.id,
      name: item.size && product.sizes_enabled ? `${product.name} — Taille ${item.size}` : product.name,
      priceCents: product.price_cents,
      quantity: qty,
      size: item.size,
    })
  }

  if (lines.length === 0) return { ok: false, error: 'Aucun article valide' }
  return { ok: true, lines }
}
